import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductById } from "@/lib/db/products";
import { auth } from "@/lib/auth/auth";
import { hasRole } from "@/lib/utils/rbac";
import ProductEditor from "@/components/admin/ProductEditorForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!/^[a-f\d]{24}$/i.test(id)) return { title: "Not Found" };
  const product = await getProductById(id);
  return { title: product ? `Edit - ${product.title}` : "Not Found" };
}

export default async function EditProduct({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, session] = await Promise.all([getProductById(id), auth()]);
  if (!product) notFound();

  return (
    <ProductEditor
      mode="edit"
      product={product}
      canDelete={hasRole(session?.role, "admin")}
    />
  );
}
