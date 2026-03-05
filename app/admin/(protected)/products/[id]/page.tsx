import { notFound } from "next/navigation";
import { getProductById } from "@/lib/db/products";
import { auth } from "@/lib/auth/auth";
import { hasRole } from "@/lib/utils/rbac";
import ProductEditor from "@/components/admin/ProductEditorForm";

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
