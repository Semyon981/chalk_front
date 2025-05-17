// src/components/Avatar.tsx
import { cn } from "@/lib/utils";

interface AvatarProps {
    name?: string;
    className?: string;
    size?: "sm" | "md" | "lg" | "xl";
}

export const Avatar = ({ name, className, size = "md" }: AvatarProps) => {
    const initials = name ? name.charAt(0).toUpperCase() : '';

    const sizeClasses = {
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-14 w-14 text-lg",
    };

    return (
        <div className={cn(
            "rounded-full bg-blue-500 flex items-center justify-center",
            "text-white font-semibold select-none flex-shrink-0", // Добавлен flex-shrink-0
            "overflow-hidden", // На случай, если будет реальное изображение
            sizeClasses[size],
            className
        )}>
            {initials}
        </div>
    );
};