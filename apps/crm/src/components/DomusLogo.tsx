"use client";

import React from "react";
import Image from "next/image";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  variant?: "white" | "blue";
}

export function DomusLogo({ className = "w-12 h-12", iconOnly = false, variant = "blue" }: LogoProps) {
  const logoSrc = variant === "white"
    ? "/DOMUS_svg/LogoDomusWhite.svg"
    : "/DOMUS_svg/LogoDomusColor_HEX-283970.svg";

  return (
    <div className="flex items-center gap-3">
      <div className={`${className} shrink-0 relative`}>
        <Image
          src={(process.env.NEXT_PUBLIC_CRM_BASE_PATH || "") + logoSrc}
          alt="Domus Consórcios"
          fill
          className="object-contain"
          priority
        />
      </div>

      {!iconOnly && (
        <div className="flex flex-col">
          <span className={`text-xs font-bold tracking-widest uppercase leading-none mt-1 ${variant === "white" ? "text-white/80" : "text-brand-teal"}`}>
            CRM Consórcios
          </span>
        </div>
      )}
    </div>
  );
}
