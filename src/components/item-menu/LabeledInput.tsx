import React, { ChangeEvent, HTMLInputTypeAttribute } from "react";
import classes from './LabeledInput.module.css';

const LabeledInput = ({ type, min, max, label, value, onChange, placeholder }: 
    { type?: HTMLInputTypeAttribute, label: string, value: string | number, min?: number, max?: number, onChange: (event: ChangeEvent<HTMLInputElement>) => void, placeholder?: string }) => {
    return (
        <div className={classes.labeledInput}>
            <label>{label}</label>
            <input type={type ?? 'text'} value={value} min={min} max={max} onChange={onChange} placeholder={placeholder || ""} />
        </div>
    )
};

export default LabeledInput;
