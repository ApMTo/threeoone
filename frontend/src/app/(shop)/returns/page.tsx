import type { Metadata } from "next";
import Link from "next/link";

import { ContentPage } from "@/components/content/content-page";
import { routes } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Returns and Exchanges",
  description: "AZAT MARD returns and exchanges policy.",
};

export default function ReturnsPage() {
  return (
    <ContentPage
      title="Returns and Exchanges"
      intro="We want you to be confident in every purchase. If something is not right, you can request a return or exchange within the timelines below."
      sections={[
        {
          title: "Return window",
          paragraphs: [
            "Unused items in original condition with tags attached may be returned within 14 days of delivery. The return request must be started within that window.",
          ],
        },
        {
          title: "Eligible items",
          paragraphs: ["Most full-price apparel and accessories are eligible for return or exchange."],
          bullets: [
            "Items must be unworn, unwashed, and free of perfume, makeup, or damage.",
            "All original tags, packaging, and authenticity labels must be included.",
            "Final sale, personalized, and intimate apparel items cannot be returned unless faulty.",
          ],
        },
        {
          title: "How to start a return",
          paragraphs: ["To begin a return or exchange:"],
          bullets: [
            "Sign in and open your Orders page.",
            "Note the order number and the item(s) you want to return.",
            "Email support@azatmard.com with your order number, reason for return, and whether you prefer a refund or exchange.",
            "We will reply with return instructions and a prepaid label when eligible.",
          ],
        },
        {
          title: "Exchanges",
          paragraphs: [
            "Exchanges are available for a different size or color of the same item when stock allows. If the requested variant is unavailable, we will offer a refund or store credit.",
          ],
        },
        {
          title: "Refunds",
          paragraphs: [
            "Once we receive and inspect the returned item, approved refunds are issued to the original payment method. Processing usually takes 5–10 business days after we confirm the return, depending on your bank or card issuer.",
            "Original shipping fees are non-refundable unless the item arrived damaged, defective, or incorrect.",
          ],
        },
        {
          title: "Damaged or incorrect items",
          paragraphs: [
            "If your order arrives damaged, defective, or incorrect, contact us within 7 days of delivery and include photos of the item and packaging. We will arrange a replacement or refund at no extra cost.",
          ],
        },
      ]}
      footer={
        <p>
          Need help with an order? Visit{" "}
          <Link
            href={routes.orders}
            className="font-medium text-zinc-900 underline-offset-4 hover:underline"
          >
            Orders
          </Link>{" "}
          or email{" "}
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
