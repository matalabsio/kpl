import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type KplLogoProps = {
  href?: string;
  className?: string;
  /** Image height in pixels (width scales with square asset). */
  size?: number;
  priority?: boolean;
};

export function KplLogo({
  href = "/",
  className,
  size = 48,
  priority = false,
}: KplLogoProps) {
  const img = (
    <Image
      src="/brand/kpl-badge-logo.png"
      alt="Kurupam Premier League"
      width={Math.round(size * 1.5)}
      height={size}
      priority={priority}
      className={cn("object-contain", className)}
      style={{ width: "auto", height: size, maxHeight: size }}
    />
  );

  if (!href) return img;

  return (
    <Link
      href={href}
      className="inline-flex cursor-pointer items-center transition-opacity hover:opacity-90"
      aria-label="Kurupam Premier League home"
    >
      {img}
    </Link>
  );
}
