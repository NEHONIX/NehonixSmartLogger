import { Loader2 } from "lucide-react";
import React from "react";
import "../styles/components/_buttonLoading.scss";

interface ButtonLoadingProps {
  size?: "small" | "medium" | "large";
  variant?: "primary" | "secondary" | "danger" | "default";
  className?: string;
}

export function ButtonLoading({
  size = "medium",
  variant = "default",
  className = "",
}: ButtonLoadingProps) {
  const buttonClasses = [
    "button-loading",
    size !== "medium" && size,
    variant !== "default" && variant,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={buttonClasses} title="Chargement..." disabled>
      <Loader2 className="btn-loading-spin" />
    </button>
  );
}
