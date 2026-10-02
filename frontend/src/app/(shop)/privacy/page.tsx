import type { Metadata } from "next";

import { ContentPage } from "@/components/content/content-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How THREE O ONE collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <ContentPage
      title="Privacy Policy"
      lastUpdated="September 29, 2026"
      intro={[
        "THREE O ONE respects your privacy and is committed to protecting the personal information you provide when using our website and purchasing our products.",
        "This Privacy Policy explains what information we collect, how we use it, when we may share it, and the choices available to you.",
      ]}
      sections={[
        {
          title: "Information We Collect",
          paragraphs: [
            "Depending on how you interact with our website, we may collect the following information:",
            "Information you provide directly",
            "This may include:",
          ],
          bullets: [
            "Name",
            "Email address",
            "Phone number",
            "Billing and shipping address",
            "Account login information",
            "Order and purchase information",
            "Customer service communications",
            "Information you provide when contacting us",
          ],
        },
        {
          title: "How We Use Your Information",
          paragraphs: ["We may use your information to:"],
          bullets: [
            "Process and deliver orders",
            "Process payments",
            "Provide customer support",
            "Manage accounts",
            "Improve our website and products",
            "Prevent fraud and protect website security",
            "Send marketing communications when permitted by law",
            "Comply with legal requirements",
          ],
        },
        {
          title: "Cookies",
          paragraphs: [
            "We may use cookies and similar technologies to remember preferences, analyze website traffic, improve our services, and support marketing. You can manage cookies through your browser or available cookie settings.",
          ],
        },
        {
          title: "Sharing Information",
          paragraphs: [
            "We may share information with trusted service providers that help us operate our business, including payment processors, shipping providers, website providers, analytics services, and marketing providers.",
            "We may also share information when required by law or when necessary to protect our rights, customers, or business.",
          ],
        },
        {
          title: "Marketing",
          paragraphs: [
            "If you subscribe to our emails, we may send you updates about THREE O ONE, including new products and promotions. You can unsubscribe at any time using the link in our emails.",
          ],
        },
        {
          title: "Data Security",
          paragraphs: [
            "We use reasonable measures to protect your personal information. However, no online system can be guaranteed to be completely secure.",
          ],
        },
        {
          title: "Your Privacy Rights",
          paragraphs: [
            "Depending on where you live, you may have rights to access, correct, delete, or request information about your personal data. To make a privacy request, contact us using the information below.",
          ],
        },
        {
          title: "Children's Privacy",
          paragraphs: [
            "Our website is not directed to children under 16, and we do not knowingly collect personal information from them. If you believe a child has provided us with personal information, contact us so we can delete it.",
          ],
        },
        {
          title: "Intellectual Property",
          paragraphs: [
            "All content available through this website, including but not limited to the THREE O ONE name, logos, trademarks, product designs, photographs, graphics, text, illustrations, videos, website design, and other materials, is owned by THREE O ONE or its licensors and is protected by applicable intellectual property laws.",
            "You may not copy, reproduce, modify, distribute, sell, publish, or otherwise use our content without prior written permission, except as permitted by applicable law.",
          ],
        },
        {
          title: "Changes to This Policy",
          paragraphs: [
            "We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated date.",
          ],
        },
        {
          title: "Contact",
          paragraphs: ["Questions about this Privacy Policy? Contact us"],
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
