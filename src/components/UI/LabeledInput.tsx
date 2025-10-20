import React, { ChangeEvent, HTMLInputTypeAttribute } from "react";
import classes from './LabeledInput.module.css';

const LabeledInput = ({ type, min, max, label, required, value, checked, onChange, placeholder, customInputElement, className }: 
    { type?: HTMLInputTypeAttribute, label: string, required?: boolean, value?: string | number, min?: number, max?: number, checked?: boolean, onChange?: (event: ChangeEvent<HTMLInputElement>) => void, placeholder?: string, customInputElement?: JSX.Element, className?: string }) => {
    
    const labelElement = <label>{label}{required ? ' *' : ''}</label>;
    const inputElement = customInputElement ?? <input type={type ?? 'text'} required={required} value={value} min={min} max={max} checked={checked} onChange={onChange} placeholder={placeholder || ""} />;
    return (
        <div className={className ?? classes.labeledInput}>
            {type === 'checkbox' ? 
            <>
                {inputElement}
                {labelElement}
            </> :
            <>
                {labelElement}
                {inputElement}
            </>}           
        </div>
    )
};

export default LabeledInput;
