import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default function AdminOrdersPage() {
  return (
    <>
      <AdminPageHeader
        title="Orders"
        description="Order management will live here."
      />
      <div className="rounded-2xl border border-dashed border-brand-muted bg-white px-6 py-16 text-center">
        <p className="text-[15px] text-zinc-500">
          No orders module yet. This page is ready for fulfillment tools.
        </p>
      </div>
    </>
  );
}
