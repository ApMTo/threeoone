import type { Metadata } from "next";

import { ContentPage } from "@/components/content/content-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for shopping with THREE O ONE.",
};

export default function TermsPage() {
  return (
    <ContentPage
      title="Terms of Service"
      lastUpdated="September 29, 2024"
      intro='These Terms of Service ("Terms") govern your use of the THREE O ONE online store and the purchase of products through this website. By accessing or using our website, creating an account, or placing an order, you agree to these Terms.'
      sections={[
        {
          title: "1. About THREE O ONE",
          paragraphs: [
            'THREE O ONE is a clothing and lifestyle brand inspired by Armenian heritage and the year 301. In these Terms, "THREE O ONE," "we," "us," or "our" refers to the business operating this website.',
          ],
        },
        {
          title: "2. Use of Our Website",
          paragraphs: [
            "You may use this website only for lawful purposes and in accordance with these Terms. You agree not to misuse the site, attempt to interfere with its operation, or access it using unauthorized means.",
          ],
        },
        {
          title: "3. Accounts",
          paragraphs: [
            "If you create an account, you are responsible for maintaining the confidentiality of your login details and for all activity under your account. You agree to provide accurate information and to update it as needed. We may suspend or terminate accounts that appear to be used fraudulently or in violation of these Terms.",
          ],
        },
        {
          title: "4. Products and Availability",
          paragraphs: [
            "We aim to display products as accurately as possible. However, colors, textures, and appearance may vary depending on your device and lighting. All products are subject to availability. We reserve the right to limit quantities, discontinue products, or update product details at any time.",
          ],
        },
        {
          title: "5. Orders and Pricing",
          paragraphs: [
            "All orders are subject to acceptance and availability. Prices are shown in the currency displayed at checkout and may change before an order is placed. We reserve the right to refuse or cancel an order if a product is unavailable, a pricing error occurs, payment cannot be processed, or we suspect fraudulent activity. If we cancel an order after payment has been collected, we will issue a refund.",
          ],
        },
        {
          title: "6. Payment",
          paragraphs: [
            "Payments are processed through third-party payment providers. By submitting a payment, you confirm that you are authorized to use the selected payment method. We do not intentionally store complete payment card information on our own systems.",
          ],
        },
        {
          title: "7. Shipping and Delivery",
          paragraphs: [
            "Shipping details, delivery estimates, and available methods are provided at checkout and on our Shipping page. Delivery times are estimates and not guarantees. You are responsible for providing accurate shipping information. Once an order is handed to the carrier, we are not responsible for delays caused by the carrier, customs, or incorrect address details, except where required by applicable law.",
          ],
        },
        {
          title: "8. Returns and Exchanges",
          paragraphs: [
            "Returns and exchanges are handled according to our Returns & Exchanges Policy. Items that do not meet the return conditions may be refused.",
          ],
        },
        {
          title: "9. Intellectual Property",
          paragraphs: [
            "All content on this website, including names, logos, designs, text, images, and product presentations, is owned by THREE O ONE or its licensors and is protected by intellectual property laws. You may not copy, reproduce, distribute, or use our content without prior written permission.",
          ],
        },
        {
          title: "10. Third-Party Services and Links",
          paragraphs: [
            "Our website may use or link to third-party services, including payment processors, shipping carriers, and analytics tools. We are not responsible for the content, policies, or practices of third-party websites or services.",
          ],
        },
        {
          title: "11. Disclaimer",
          paragraphs: [
            'The website and its content are provided on an "as is" and "as available" basis. To the fullest extent permitted by law, we do not guarantee that the website will be uninterrupted, error-free, or free of harmful components.',
          ],
        },
        {
          title: "12. Limitation of Liability",
          paragraphs: [
            "To the fullest extent permitted by law, THREE O ONE is not liable for any indirect, incidental, special, or consequential damages arising from your use of the website or purchase of products. Our total liability for any claim related to an order is limited to the amount you paid for that order.",
          ],
        },
        {
          title: "13. Changes to These Terms",
          paragraphs: [
            'We may update these Terms from time to time. The updated version will be posted on this page with a revised "Last updated" date. Continued use of the website after changes means you accept the updated Terms.',
          ],
        },
        {
          title: "14. Governing Law",
          paragraphs: [
            "These Terms are governed by the laws of the jurisdiction in which the business entity operating THREE O ONE is established, without regard to conflict of law principles.",
          ],
        },
        {
          title: "15. Contact",
          paragraphs: [
            "If you have questions about these Terms, contact us using the details below.",
          ],
        },
      ]}
      footer={
        <div className="space-y-1">
          <p className="font-medium text-zinc-900">THREE O ONE</p>
          <p>
            Email:{" "}
            <span className="italic text-zinc-500">will add our email later :D</span>
          </p>
          <p>
            Website:{" "}
            <span className="italic text-zinc-500">will add our Web later :D</span>
          </p>
        </div>
      }
    />
  );
}
