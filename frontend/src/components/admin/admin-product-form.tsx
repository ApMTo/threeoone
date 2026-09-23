"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
  type Control,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCategories } from "@/features/categories";
import { useCreateProduct } from "@/features/products";
import { getErrorMessage } from "@/lib/api/errors";
import {
  createProductSchema,
  type CreateProductFormValues,
} from "@/schemas/catalog.schema";

type AdminProductFormProps = {
  onCreated?: () => void;
};

const defaultSizes = [
  { label: "S", quantity: 0 },
  { label: "M", quantity: 1 },
  { label: "L", quantity: 0 },
];

function ColorSizeEditor({
  colorIndex,
  control,
}: {
  colorIndex: number;
  control: Control<CreateProductFormValues>;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext<CreateProductFormValues>();

  const sizes = useFieldArray({
    control,
    name: `colors.${colorIndex}.sizes`,
  });

  return (
    <div className="mt-3 space-y-2 border-t border-brand-muted/70 pt-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
          Sizes for this color
        </p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => sizes.append({ label: "", quantity: 0 })}
        >
          Add size
        </Button>
      </div>

      {sizes.fields.map((field, sizeIndex) => (
        <div
          key={field.id}
          className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        >
          <Input
            label={sizeIndex === 0 ? "Size" : undefined}
            placeholder="M"
            error={errors.colors?.[colorIndex]?.sizes?.[sizeIndex]?.label?.message}
            {...register(`colors.${colorIndex}.sizes.${sizeIndex}.label`)}
          />
          <Input
            label={sizeIndex === 0 ? "Qty" : undefined}
            type="number"
            min="0"
            error={
              errors.colors?.[colorIndex]?.sizes?.[sizeIndex]?.quantity?.message
            }
            {...register(`colors.${colorIndex}.sizes.${sizeIndex}.quantity`)}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-red-600 hover:bg-red-50"
            disabled={sizes.fields.length <= 1}
            onClick={() => sizes.remove(sizeIndex)}
          >
            Remove
          </Button>
        </div>
      ))}

      {errors.colors?.[colorIndex]?.sizes?.message ||
      errors.colors?.[colorIndex]?.sizes?.root?.message ? (
        <p className="text-xs text-red-600">
          {errors.colors[colorIndex]?.sizes?.message ||
            errors.colors[colorIndex]?.sizes?.root?.message}
        </p>
      ) : null}
    </div>
  );
}

export function AdminProductForm({ onCreated }: AdminProductFormProps) {
  const { data: roots = [], isLoading: categoriesLoading } = useCategories(true);
  const createProduct = useCreateProduct();

  const subcategories = roots.flatMap((root) =>
    (root.children ?? []).map((child) => ({
      id: child.id,
      label: `${root.name} / ${child.name}`,
    })),
  );

  const form = useForm<CreateProductFormValues>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      categoryId: "",
      colors: [{ hex: "#8D643D", name: "", sizes: defaultSizes }],
    },
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = form;

  const colors = useFieldArray({ control, name: "colors" });
  const watchedColors = watch("colors");

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createProduct.mutateAsync({
        name: values.name,
        description: values.description || undefined,
        price: values.price,
        imageUrl: values.imageUrl || undefined,
        categoryId: values.categoryId,
        colors: values.colors.map((color) => ({
          hex: color.hex,
          name: color.name || undefined,
          sizes: color.sizes.map((size) => ({
            label: size.label,
            quantity: size.quantity,
          })),
        })),
      });

      reset({
        name: "",
        description: "",
        price: 0,
        imageUrl: "",
        categoryId: "",
        colors: [{ hex: "#8D643D", name: "", sizes: defaultSizes }],
      });
      onCreated?.();
    } catch {
      // surfaced via createProduct.error
    }
  });

  return (
    <FormProvider {...form}>
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-brand-muted bg-white p-5 sm:p-6"
      >
        <h2 className="font-fraunces text-xl font-semibold text-zinc-900">
          New product
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Stock is per color and size. Red XL and green XL are separate.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Input
            label="Name"
            placeholder="Oversized Hoodie"
            error={errors.name?.message}
            {...register("name")}
          />

          <Input
            label="Price"
            type="number"
            step="0.01"
            min="0"
            placeholder="159.00"
            error={errors.price?.message}
            {...register("price")}
          />

          <label className="flex w-full flex-col gap-1.5 text-sm sm:col-span-2">
            <span className="font-medium text-zinc-800">Subcategory</span>
            <select
              className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none focus:ring-2 focus:ring-brand/40"
              disabled={categoriesLoading}
              {...register("categoryId")}
            >
              <option value="">Select subcategory</option>
              {subcategories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            {errors.categoryId ? (
              <span className="text-xs text-red-600">{errors.categoryId.message}</span>
            ) : null}
            {subcategories.length === 0 ? (
              <span className="text-xs text-zinc-500">
                Create a subcategory under Categories first.
              </span>
            ) : null}
          </label>

          <div className="sm:col-span-2">
            <Input
              label="Image URL (optional)"
              placeholder="https://..."
              error={errors.imageUrl?.message}
              {...register("imageUrl")}
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              label="Description (optional)"
              placeholder="Soft cotton fleece"
              error={errors.description?.message}
              {...register("description")}
            />
          </div>
        </div>

        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-medium text-zinc-900">Colors & sizes</h3>
              <p className="text-xs text-zinc-500">
                Add a color, then set size quantities only for that color.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                colors.append({ hex: "#111111", name: "", sizes: defaultSizes })
              }
            >
              Add color
            </Button>
          </div>

          <div className="space-y-4">
            {colors.fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-xl border border-brand-muted/80 bg-admin-surface/60 p-4"
              >
                <div className="grid gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-end">
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="font-medium text-zinc-800">Color</span>
                    <span className="inline-flex items-center gap-2">
                      <input
                        type="color"
                        className="size-10 cursor-pointer rounded-lg border border-zinc-300 bg-white p-1"
                        {...register(`colors.${index}.hex`)}
                      />
                      <span
                        className="inline-block size-8 rounded-full border border-zinc-200 shadow-inner"
                        style={{
                          backgroundColor: watchedColors?.[index]?.hex || "#ccc",
                        }}
                        aria-hidden
                      />
                    </span>
                  </label>

                  <Input
                    label="Label (optional)"
                    placeholder="Sand"
                    error={errors.colors?.[index]?.name?.message}
                    {...register(`colors.${index}.name`)}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                    disabled={colors.fields.length <= 1}
                    onClick={() => colors.remove(index)}
                  >
                    Remove color
                  </Button>
                </div>

                <p className="mt-2 text-xs text-zinc-500">
                  {watchedColors?.[index]?.hex?.toUpperCase()}
                </p>

                <ColorSizeEditor colorIndex={index} control={control} />
              </div>
            ))}
          </div>

          {errors.colors?.root || errors.colors?.message ? (
            <p className="mt-2 text-xs text-red-600">
              {errors.colors.root?.message || errors.colors.message}
            </p>
          ) : null}
        </section>

        {createProduct.isError ? (
          <p className="mt-4 text-sm text-red-600">
            {getErrorMessage(createProduct.error, "Could not create product")}
          </p>
        ) : null}

        {createProduct.isSuccess ? (
          <p className="mt-4 text-sm text-brand">Product created and published.</p>
        ) : null}

        <Button
          type="submit"
          className="mt-6"
          isLoading={createProduct.isPending}
          disabled={subcategories.length === 0}
        >
          Create product
        </Button>
      </form>
    </FormProvider>
  );
}
