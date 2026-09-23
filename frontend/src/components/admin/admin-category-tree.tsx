"use client";

import { useCategories } from "@/features/categories";
import { Spinner } from "@/components/ui/spinner";

export function AdminCategoryTree() {
  const { data: roots = [], isLoading, isError } = useCategories(true);

  if (isLoading) {
    return <Spinner label="Loading categories…" />;
  }

  if (isError) {
    return <p className="text-sm text-red-600">Failed to load categories.</p>;
  }

  if (roots.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-brand-muted bg-white px-6 py-12 text-center">
        <p className="text-[15px] text-zinc-500">
          No categories yet. Create a top-level category first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {roots.map((root) => (
        <div
          key={root.id}
          className="rounded-2xl border border-brand-muted bg-white p-4"
        >
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-fraunces text-lg font-semibold text-zinc-900">
              {root.name}
            </h3>
            <span className="text-xs tracking-wide text-zinc-400 uppercase">
              Category
            </span>
          </div>

          {root.children && root.children.length > 0 ? (
            <ul className="mt-3 space-y-2 border-t border-brand-muted/70 pt-3">
              {root.children.map((child) => (
                <li
                  key={child.id}
                  className="flex items-center justify-between rounded-xl bg-brand-soft/50 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-zinc-800">{child.name}</span>
                  <span className="text-xs text-zinc-500">Subcategory</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-zinc-500">
              No subcategories yet.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
