import type { Metadata } from "next";
import ProductEditor from "@/components/admin/ProductEditorForm";

export const metadata: Metadata = { title: "New Product" };

export default function NewProduct() {
  return <ProductEditor mode="create" />;
}
