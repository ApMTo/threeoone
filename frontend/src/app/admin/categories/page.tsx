import { AdminCategoryForm } from "@/components/admin/admin-category-form";
import { AdminCategoryTree } from "@/components/admin/admin-category-tree";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default function AdminCategoriesPage() {
  return (
    <>
      <AdminPageHeader
        title="Categories"
        description="Top-level categories and subcategories like Hoodie."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <AdminCategoryForm />
        <div>
          <h2 className="mb-3 font-fraunces text-xl font-semibold text-zinc-900">
            Taxonomy
          </h2>
          <AdminCategoryTree />
        </div>
      </div>
    </>
  );
}
