import Image from "next/image";
import Link from "next/link";

interface ImpactHubLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  withText?: boolean;
  subtitle?: string;
  href?: string;
  className?: string;
}

const sizes = {
  sm: { icon: 28, text: "text-lg", subtitle: "text-[9px]", gap: "gap-2" },
  md: { icon: 36, text: "text-[22px]", subtitle: "text-[9px]", gap: "gap-2.5" },
  lg: { icon: 48, text: "text-3xl", subtitle: "text-[10px]", gap: "gap-3" },
  xl: { icon: 64, text: "text-[40px]", subtitle: "text-xs", gap: "gap-4" },
} as const;

export default function ImpactHubLogo({
  size = "md",
  withText = true,
  subtitle,
  href,
  className = "",
}: ImpactHubLogoProps) {
  const dimensions = sizes[size];

  const content = (
    <span className={`inline-flex shrink-0 items-center ${dimensions.gap} ${className}`}>
      <Image
        src="/logo.svg"
        alt={withText ? "" : "ImpactHub"}
        width={dimensions.icon}
        height={dimensions.icon}
        unoptimized
        className="block shrink-0"
      />
      {withText && (
        <span className="flex flex-col text-left">
          <span
            className={`whitespace-nowrap font-sans font-semibold leading-none tracking-[-0.045em] ${dimensions.text}`}
          >
            <span className="text-[var(--text)]">Impact</span><span className="font-medium text-[var(--gold-light)]">Hub</span>
          </span>
          {subtitle && (
            <span
              className={`mt-1.5 whitespace-nowrap font-sans font-medium uppercase leading-none tracking-[0.14em] text-[var(--text-muted)] ${dimensions.subtitle}`}
            >
              {subtitle}
            </span>
          )}
        </span>
      )}
    </span>
  );

  return href ? (
    <Link
      href={href}
      className="inline-flex rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--gold)]"
    >
      {content}
    </Link>
  ) : content;
}
