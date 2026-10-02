import type { ReactNode } from "react";

import { Container } from "@/components/layout/container";

type ContentSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

type ContentPageProps = {
  title: string;
  intro: string | string[];
  lastUpdated?: string;
  sections: ContentSection[];
  footer?: ReactNode;
};

export function ContentPage({
  title,
  intro,
  lastUpdated = "September 28, 2026",
  sections,
  footer,
}: ContentPageProps) {
  const introParagraphs = Array.isArray(intro) ? intro : [intro];

  return (
    <Container className="max-w-3xl space-y-10 py-10 sm:py-14">
      <header className="space-y-3">
        <h1 className="font-fraunces text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          {title}
        </h1>
        {introParagraphs.map((paragraph) => (
          <p
            key={paragraph}
            className="text-[15px] leading-relaxed text-zinc-600"
          >
            {paragraph}
          </p>
        ))}
        <p className="text-xs text-zinc-400">Last updated: {lastUpdated}</p>
      </header>

      <div className="space-y-8">
        {sections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="font-fraunces text-xl font-semibold text-zinc-900">
              {section.title}
            </h2>
            {section.paragraphs.map((paragraph, index) => (
              <p
                key={`${section.title}-p-${index}`}
                className="text-[15px] leading-relaxed text-zinc-700"
              >
                {paragraph}
              </p>
            ))}
            {section.bullets && section.bullets.length > 0 ? (
              <ul className="list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-zinc-700">
                {section.bullets.map((bullet, index) => (
                  <li key={`${section.title}-b-${index}`}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>

      {footer ? (
        <div className="border-t border-zinc-200 pt-8 text-[15px] leading-relaxed text-zinc-600">
          {footer}
        </div>
      ) : null}
    </Container>
  );
}
