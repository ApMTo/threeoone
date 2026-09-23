import Image from "next/image";

import { cn } from "@/lib/utils/cn";

type ImageBannerProps = {
  src: string;
  alt?: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
};

export function ImageBanner({
  src,
  alt = "",
  width,
  height,
  className,
  priority = false,
}: ImageBannerProps) {
  return (
    <section className={cn("relative w-full overflow-hidden", className)}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes="100vw"
        className="h-auto w-full object-cover sm:h-[700px]"
      />
    </section>
  );
}
