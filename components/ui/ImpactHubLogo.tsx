import React from "react";
import Link from "next/link";

interface ImpactHubLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  withText?: boolean;
  subtitle?: string;
  href?: string;
  className?: string;
}

export default function ImpactHubLogo({
  size = "md",
  withText = true,
  subtitle,
  href,
  className = "",
}: ImpactHubLogoProps) {
  const sizeMap = {
    sm: { icon: 24, text: "text-lg", sub: "text-[9px]" },
    md: { icon: 32, text: "text-xl", sub: "text-[10px]" },
    lg: { icon: 40, text: "text-2xl", sub: "text-[11px]" },
    xl: { icon: 54, text: "text-3xl", sub: "text-xs" },
  };

  const { icon: px, text: textClass, sub: subClass } = sizeMap[size];

  const content = (
    <div className={`inline-flex items-center gap-3 select-none group ${className}`}>
      {/* Artisanal Vector Emblem */}
      <div 
        className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
        style={{ width: px, height: px }}
      >
        <svg 
          viewBox="0 0 64 64" 
          width={px} 
          height={px} 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_0_12px_rgba(212,168,67,0.35)]"
        >
          <defs>
            <linearGradient id={`gold-gradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f5d77f" />
              <stop offset="50%" stopColor="#d4a843" />
              <stop offset="100%" stopColor="#a87c1f" />
            </linearGradient>
            <radialGradient id={`glow-${size}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f0c870" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#06061a" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Halo Glow */}
          <circle cx="32" cy="32" r="26" fill={`url(#glow-${size})`} />

          {/* Architectural Outer Frame */}
          <circle 
            cx="32" 
            cy="32" 
            r="25" 
            stroke={`url(#gold-gradient-${size})`} 
            strokeWidth="1.2" 
            strokeOpacity="0.45" 
            strokeDasharray="2 3" 
          />
          <circle 
            cx="32" 
            cy="32" 
            r="20.5" 
            stroke={`url(#gold-gradient-${size})`} 
            strokeWidth="1.8" 
            strokeOpacity="0.85" 
          />

          {/* Cardinal Points */}
          <line x1="32" y1="4" x2="32" y2="8" stroke={`url(#gold-gradient-${size})`} strokeWidth="2" strokeLinecap="round" />
          <line x1="32" y1="56" x2="32" y2="60" stroke={`url(#gold-gradient-${size})`} strokeWidth="2" strokeLinecap="round" />
          <line x1="4" y1="32" x2="8" y2="32" stroke={`url(#gold-gradient-${size})`} strokeWidth="2" strokeLinecap="round" />
          <line x1="56" y1="32" x2="60" y2="32" stroke={`url(#gold-gradient-${size})`} strokeWidth="2" strokeLinecap="round" />

          {/* Nexus Radiant Star (Impact) */}
          <path 
            d="M 32 15 Q 32 32 49 32 Q 32 32 32 49 Q 32 32 15 32 Q 32 32 32 15 Z" 
            fill={`url(#gold-gradient-${size})`}
            className="transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(245,215,127,0.7)]"
          />

          {/* Center Light */}
          <circle cx="32" cy="32" r="2.8" fill="#ffffff" />
        </svg>
      </div>

      {/* Brand Wordmark */}
      {withText && (
        <div className="flex flex-col text-left leading-none">
          <div className="flex items-baseline">
            <span 
              className={`font-semibold tracking-wider ${textClass}`}
              style={{ 
                fontFamily: "var(--font-heading)", 
                color: "var(--gold-light)",
                letterSpacing: "0.06em"
              }}
            >
              Impact<span className="font-normal text-[var(--text)]">Hub</span>
            </span>
          </div>
          {subtitle && (
            <span 
              className={`uppercase tracking-[0.2em] font-medium text-[var(--text-muted)] mt-0.5 ${subClass}`}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
}
