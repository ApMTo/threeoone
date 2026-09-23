"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCategories, useCreateCategory } from "@/features/categories";
import { getErrorMessage } from "@/lib/api/errors";
import {
  createCategorySchema,
  type CreateCategoryFormValues,
} from "@/schemas/catalog.schema";

export function AdminCategoryForm() {
  const { data: roots = [], isLoading } = useCategories(true);
  const createCategory = useCreateCategory();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCategoryFormValues>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: "",
      description: "",
      parentId: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createCategory.mutateAsync({
        name: values.name,
        description: values.description || undefined,
        parentId: values.parentId || undefined,
      });
      reset({ name: "", description: "", parentId: values.parentId || "" });
    } catch {
      // surfaced via createCategory.error
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-brand-muted bg-white p-5 sm:p-6"
    >
      <h2 className="font-fraunces text-xl font-semibold text-zinc-900">
        Add category
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Leave parent empty for a top-level category. Pick a parent to create a
        subcategory like Hoodie.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Input
          label="Name"
          placeholder="Tops"
          error={errors.name?.message}
          {...register("name")}
        />

        <label className="flex w-full flex-col gap-1.5 text-sm">
          <span className="font-medium text-zinc-800">Parent category</span>
          <select
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:ring-2 focus:ring-brand/40"
            disabled={isLoading}
            {...register("parentId")}
          >
            <option value="">None (top-level)</option>
            {roots.map((root) => (
              <option key={root.id} value={root.id}>
                {root.name}
              </option>
            ))}
          </select>
        </label>

        <div className="sm:col-span-2">
          <Input
            label="Description (optional)"
            placeholder="Season essentials"
            error={errors.description?.message}
            {...register("description")}
          />
        </div>
      </div>

      {createCategory.isError ? (
        <p className="mt-3 text-sm text-red-600">
          {getErrorMessage(createCategory.error, "Could not create category")}
        </p>
      ) : null}

      {createCategory.isSuccess ? (
        <p className="mt-3 text-sm text-brand">Category created.</p>
      ) : null}

      <Button
        type="submit"
        className="mt-5"
        isLoading={createCategory.isPending}
      >
        Create category
      </Button>
    </form>
  );
}
