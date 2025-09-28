import React from "react";

interface HoverCardProps {
    children: React.ReactNode;
    className?: string;
    effect?: "lift" | "glow" | "scale" | "float" | "rotate" | "slide";
    intensity?: "light" | "medium" | "strong";
}

export function HoverCard({
    children,
    className = "",
    effect = "lift",
}: HoverCardProps) {
    const getEffectClass = () => {
        const baseClass = "transition-all duration-300 cursor-pointer";

        switch (effect) {
            case "lift":
                return `${baseClass} hover-lift`;
            case "glow":
                return `${baseClass} hover-glow`;
            case "scale":
                return `${baseClass} hover-scale`;
            case "float":
                return `${baseClass} hover-float`;
            case "rotate":
                return `${baseClass} hover-rotate`;
            case "slide":
                return `${baseClass} hover-slide`;
            default:
                return `${baseClass} hover-lift`;
        }
    };

    return <div className={`${getEffectClass()} ${className}`}>{children}</div>;
}

interface HoverButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    icon?: React.ReactNode;
    iconPosition?: "left" | "right";
}

export function HoverButton({
    children,
    onClick,
    className = "",
    variant = "primary",
    size = "md",
    icon,
    iconPosition = "left",
}: HoverButtonProps) {
    const getVariantClass = () => {
        switch (variant) {
            case "primary":
                return "sky-gradient text-white hover:opacity-90 hover:shadow-xl";
            case "secondary":
                return "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700";
            case "outline":
                return "border-2 border-primary text-primary hover:bg-primary hover:text-white";
            case "ghost":
                return "text-slate-600 dark:text-slate-300 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800";
            default:
                return "sky-gradient text-white hover:opacity-90 hover:shadow-xl";
        }
    };

    const getSizeClass = () => {
        switch (size) {
            case "sm":
                return "px-4 py-2 text-sm";
            case "md":
                return "px-6 py-3 text-base";
            case "lg":
                return "px-8 py-4 text-lg";
            default:
                return "px-6 py-3 text-base";
        }
    };

    return (
        <button
            onClick={onClick}
            className={`
        ${getVariantClass()}
        ${getSizeClass()}
        rounded-xl font-medium
        hover-lift transition-all duration-300
        group flex items-center gap-2
        ${className}
      `}
        >
            {icon && iconPosition === "left" && (
                <span className="group-hover:scale-110 transition-transform duration-300">
                    {icon}
                </span>
            )}
            {children}
            {icon && iconPosition === "right" && (
                <span className="group-hover:scale-110 transition-transform duration-300">
                    {icon}
                </span>
            )}
        </button>
    );
}

interface HoverIconProps {
    children: React.ReactNode;
    className?: string;
    effect?: "bounce" | "spin" | "pulse" | "shake" | "glow";
}

export function HoverIcon({
    children,
    className = "",
    effect = "bounce",
}: HoverIconProps) {
    const getEffectClass = () => {
        switch (effect) {
            case "bounce":
                return "hover:animate-bounce-in hover:-translate-y-1";
            case "spin":
                return "hover:rotate-12";
            case "pulse":
                return "hover:animate-pulse-glow hover:scale-110";
            case "shake":
                return "hover:animate-shake";
            case "glow":
                return "hover:drop-shadow-lg hover:scale-110";
            default:
                return "hover:animate-bounce-in hover:-translate-y-1";
        }
    };

    return (
        <span
            className={`
      inline-block transition-all duration-300 cursor-pointer
      ${getEffectClass()}
      ${className}
    `}
        >
            {children}
        </span>
    );
}

interface HoverTextProps {
    children: React.ReactNode;
    className?: string;
    effect?: "color" | "underline" | "glow" | "scale";
    color?: string;
}

export function HoverText({
    children,
    className = "",
    effect = "color",
    color = "sky-600",
}: HoverTextProps) {
    const getEffectClass = () => {
        switch (effect) {
            case "color":
                return `hover:text-${color} dark:hover:text-${color.replace(
                    "600",
                    "400"
                )}`;
            case "underline":
                return `hover:text-${color} dark:hover:text-${color.replace(
                    "600",
                    "400"
                )} hover:underline underline-offset-2`;
            case "glow":
                return `hover:text-${color} dark:hover:text-${color.replace(
                    "600",
                    "400"
                )} hover:drop-shadow-lg`;
            case "scale":
                return `hover:text-${color} dark:hover:text-${color.replace(
                    "600",
                    "400"
                )} hover:scale-105`;
            default:
                return `hover:text-${color} dark:hover:text-${color.replace(
                    "600",
                    "400"
                )}`;
        }
    };

    return (
        <span
            className={`
      transition-all duration-300 cursor-pointer
      ${getEffectClass()}
      ${className}
    `}
        >
            {children}
        </span>
    );
}
