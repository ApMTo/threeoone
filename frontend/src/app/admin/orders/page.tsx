import { AdminOrderList } from "@/components/admin/admin-order-list";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default function AdminOrdersPage() {
  return (
    <>
      <AdminPageHeader
        title="Orders"
        description="Orders from checkout with product photos. Customers see a 7–14 day delivery estimate."
      />
      <AdminOrderList />
    </>
  );
}
