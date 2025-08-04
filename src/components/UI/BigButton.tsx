import React, { CSSProperties } from "react";
import classes from "./Button.module.css";

interface BigButtonProps {
    text: string;
    action: () => void;
    overrideStyle?: CSSProperties;
    disabled?: boolean;
    className?: string;
}

const BigButton: React.FC<BigButtonProps> = ({ text, action, overrideStyle, disabled, className }) => {
    const handleClick = () => {
        if (disabled) {
            return;
        }
        action();
    };

    const combinedStyles: CSSProperties = {
        ...overrideStyle,
        ...(disabled && { opacity: 0.5, cursor: 'not-allowed' }),
    };

    return (
        <button
            className={`${classes.bigBtn} ${className}`}
            onClick={handleClick}
            style={combinedStyles}
            disabled={disabled}
        >
            {text}
        </button>
    );
};

export default BigButton;