import NextAuth, { type DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Resend from "next-auth/providers/resend";
import { prisma } from "@/lib/db/prismaClient";
import { sendEmail } from "@/lib/email/email";
import { buildMagicLinkEmail } from "@/lib/email/templates/auth";
import type { Role } from "@prisma/client";
import { config } from "@/lib/core/config";

// ---------------------------------------------------------------------------
// Module augmentation - adds `role` and `id` to the session user type
// ---------------------------------------------------------------------------
declare module "next-auth" {
  interface Session extends DefaultSession {
    role: Role;
    user: { id: string } & DefaultSession["user"];
  }
}

// ---------------------------------------------------------------------------

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },

  providers: [
    Resend({
      apiKey: config.resend.resendApiKey,
      from: config.resend.fromEmail,
      async sendVerificationRequest({ identifier: email, url }) {
        // Only send the magic link if the email belongs to an existing user.
        // Silently skip unknown addresses so we don't leak who is registered.
        const existing = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          select: { id: true },
        });
        if (!existing) return;
        // sendEmail (not sendEmailSafe): if delivery fails, NextAuth surfaces
        // an error so the user knows the magic link was never sent.
        await sendEmail({ to: email, ...buildMagicLinkEmail(url) });
      },
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      // Hard gate: reject sign-in for any email not already in the DB.
      // This guards against edge cases where a token was issued before the
      // user-existence check was in place, or direct API abuse.
      if (!user?.email) return false;
      const existing = await prisma.user.findUnique({
        where: { email: user.email.toLowerCase() },
        select: { id: true },
      });
      return !!existing;
    },

    async session({ session, user }) {
      // With database sessions NextAuth reads the user row on every request
      // so role / name / image are always live - no re-login needed after
      // profile or role changes.
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true, blocked: true },
      });

      // Blocked users: delete all their DB sessions immediately so every
      // subsequent request is also rejected without reaching this callback.
      if (dbUser?.blocked) {
        await prisma.session.deleteMany({ where: { userId: user.id } });
        // Return a session with no valid role so requireAuth rejects this request.
        session.role = "editor" as Role;
        session.user.id = "";
        return session;
      }

      session.role = dbUser?.role ?? "editor";
      session.user.id = user.id;
      return session;
    },
  },

  pages: { signIn: "/admin/login", error: "/admin/login" },
});
