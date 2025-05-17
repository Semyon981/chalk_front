import { cn } from "@/lib/utils";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "ghost" | "light";
    size?: "sm" | "lg";
}

export const Button: React.FC<ButtonProps> = ({
    className,
    children,
    variant = "default",
    size = "sm",
    ...props
}) => {
    const baseStyles = "rounded-2xl font-medium transition-all duration-200 cursor-pointer";
    const variants = {
        default: "bg-gray-500 hover:bg-gray-600 text-white",
        ghost: "border border-white text-white hover:bg-white hover:text-gray-900",
        light: "bg-white text-gray-900 hover:bg-gray-300",
    };
    const sizes = {
        sm: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-lg",
    };

    return (
        <button
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        >
            {children}
        </button>
    );
};
