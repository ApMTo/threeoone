import type { Metadata } from "next";
import Link from "next/link";

import { ContentPage } from "@/components/content/content-page";
import { routes } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Shipping",
  description: "AZAT MARD shipping methods, delivery estimates, and order tracking.",
};

export default function ShippingPage() {
  return (
    <ContentPage
      title="Shipping"
      intro="We ship AZAT MARD orders worldwide. Delivery options and estimates are confirmed at checkout based on your destination."
      sections={[
        {
          title: "Processing time",
          paragraphs: [
            "Orders are typically prepared within 1–3 business days after payment is confirmed. During peak periods or product restocks, processing may take slightly longer. You will receive an update once your order has shipped.",
          ],
        },
        {
          title: "Delivery estimates",
          paragraphs: [
            "After an order ships, standard delivery usually takes 7–14 days depending on destination and carrier. Faster options may be available at checkout when offered for your address.",
            "Estimates exclude weekends and public holidays and begin once the package leaves our warehouse.",
          ],
        },
        {
          title: "Shipping rates",
          paragraphs: [
            "Shipping costs are calculated at checkout from your country, postal code, and order subtotal. The available methods and prices for your cart are shown before you pay.",
          ],
        },
        {
          title: "Order tracking",
          paragraphs: [
            "Once your order is on the way, you can follow its status on the Orders page. Status moves from processing to shipped and then delivered as the package progresses.",
          ],
        },
        {
          title: "International orders",
          paragraphs: [
            "International customers are responsible for any customs duties, taxes, or import fees charged by the destination country. These charges are not included in the order total unless clearly stated at checkout.",
          ],
        },
        {
          title: "Address accuracy",
          paragraphs: [
            "Please double-check your shipping address before completing checkout. We cannot guarantee redirects or recovery for packages sent to an incorrect or incomplete address provided at checkout.",
          ],
        },
        {
          title: "Delays and issues",
          paragraphs: [
            "Carrier delays, weather, customs clearance, and local delivery constraints can affect transit time. If your order has not arrived within the estimated window, contact support with your order number and we will help investigate.",
          ],
        },
      ]}
      footer={
        <p>
          Track an existing order on{" "}
          <Link
            href={routes.orders}
            className="font-medium text-zinc-900 underline-offset-4 hover:underline"
          >
            Orders
          </Link>
          , or email{" "}
          <a
            href="mailto:support@azatmard.com"
            className="font-medium text-zinc-900 underline-offset-4 hover:underline"
          >
            support@azatmard.com
          </a>
          .
        </p>
      }
    />
  );
}
