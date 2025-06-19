import React from "react";

export interface ToggleButtonProps {
    isToggled?: boolean;
    onToggle?: () => void;
    children?: React.ReactNode;
}


const ToggleButton: React.FC<ToggleButtonProps> = ({
    isToggled = false,
    onToggle = () => { },
    children,
}) => {
    return (
        <button
            type="button"
            onClick={onToggle}
            className={`
        ${isToggled ? "bg-white text-black" : "text-white hover:text-cgray-50"}
        flex items-center justify-center cursor-pointer h-8 w-8 rounded-full transition-colors duration-300
      `}
        >
            {children}
        </button>
    );
};

export default ToggleButton;
