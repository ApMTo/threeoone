import type { ReactNode } from "react";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { siteConfig } from "@/config/site";
import { FacebookIcon, InstagramIcon, TikTokIcon } from "@/icons";

const quickLinks = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
] as const;

const helpLinks = [
  { href: "/returns", label: "Returns and Exchanges" },
  { href: "/shipping", label: "Shipping" },
  { href: "/where-to-purchase", label: "Where to Purchase AZAT MARD" },
] as const;

const socialLinks = [
  {
    href: "https://instagram.com",
    label: "Instagram",
    icon: InstagramIcon,
  },
  {
    href: "https://facebook.com",
    label: "Facebook",
    icon: FacebookIcon,
  },
  {
    href: "https://tiktok.com",
    label: "TikTok",
    icon: TikTokIcon,
  },
] as const;

const paymentMethods = [
  { src: "/payments/am-ex.svg", label: "American Express" },
  { src: "/payments/apple-pay.svg", label: "Apple Pay" },
  { src: "/payments/dinners-club.svg", label: "Diners Club" },
  { src: "/payments/discover.svg", label: "Discover" },
  { src: "/payments/google-pay.svg", label: "Google Pay" },
  { src: "/payments/klarna.svg", label: "Klarna" },
  { src: "/payments/maestro.svg", label: "Maestro" },
  { src: "/payments/mastercard.svg", label: "Mastercard" },
  { src: "/payments/shop.svg", label: "Shop Pay" },
  { src: "/payments/unionpay.svg", label: "UnionPay" },
  { src: "/payments/visa.svg", label: "Visa" },
  { src: "/payments/bancontact.svg", label: "Bancontact" },
  { src: "/payments/wero.svg", label: "Wero" },
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-zinc-200 bg-white">
      <Container className="py-12 sm:py-16">
        <div className="flex flex-col items-center gap-10 sm:flex-row sm:justify-between sm:gap-8">
          <FooterColumn title="Quick links">
            <ul className="flex flex-col items-center space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-fraunces text-sm text-foreground transition-opacity hover:opacity-60"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterColumn>

          <FooterColumn title="Help">
            <ul className="flex flex-col items-center space-y-2">
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-fraunces text-sm text-foreground transition-opacity hover:opacity-60"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FooterColumn>

          <FooterColumn title="Our Socials">
            <ul className="flex items-center gap-4">
              {socialLinks.map(({ href, label, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="inline-flex text-foreground transition-opacity hover:opacity-60"
                  >
                    <Icon className="size-3" />
                  </a>
                </li>
              ))}
            </ul>
          </FooterColumn>
        </div>

        <div className="mt-12 border-t border-zinc-200 pt-8 sm:mt-16">
          <div className="flex items-center justify-between">
            <p className="font-fraunces text-[10px] text-foreground">United States ($)</p>
            <p className="font-fraunces text-[10px] text-foreground">
              © {year} {siteConfig.name.replace(/-/g, "").toUpperCase()}
            </p>
          </div>

          <ul className="mt-6 flex flex-wrap items-center justify-center gap-1.5">
            {paymentMethods.map((method) => (
              <li key={method.src}>
                <img
                  src={method.src}
                  alt={method.label}
                  width={38}
                  height={24}
                  className="h-6 w-auto"
                />
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="mb-4 font-fraunces text-xs text-zinc-500">{title}</h2>
      {children}
    </div>
  );
}
