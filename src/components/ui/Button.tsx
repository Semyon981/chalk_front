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
    disabled,
    ...props
}) => {
    const baseStyles = "rounded-2xl font-medium transition-all duration-200";
    
    const variantStyles = {
        default: disabled 
            ? "bg-gray-700 text-gray-400"
            : "bg-gray-500 text-white hover:bg-gray-600 cursor-pointer",
        
        ghost: disabled
            ? "border-gray-600 text-gray-400"
            : "border-white text-white hover:bg-white hover:text-gray-900 cursor-pointer border",
        
        light: disabled
            ? "bg-gray-300 text-gray-500"
            : "bg-white text-gray-900 hover:bg-gray-300 cursor-pointer"
    };

    const sizeStyles = {
        sm: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-lg"
    };

    return (
        <button
            className={cn(
                baseStyles,
                sizeStyles[size],
                variantStyles[variant],
                className
            )}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};