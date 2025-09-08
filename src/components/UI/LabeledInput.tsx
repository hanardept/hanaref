import React, { ChangeEvent, HTMLInputTypeAttribute } from "react";
import classes from './LabeledInput.module.css';

const LabeledInput = ({ type, min, max, label, required, value, checked, onChange, placeholder, customInputElement }: 
    { type?: HTMLInputTypeAttribute, label: string, required?: boolean, value?: string | number, min?: number, max?: number, checked?: boolean, onChange?: (event: ChangeEvent<HTMLInputElement>) => void, placeholder?: string, customInputElement?: JSX.Element }) => {
    return (
        <div className={classes.labeledInput}>
            <label>{label}{required ? ' *' : ''}</label>
            {customInputElement ?? <input type={type ?? 'text'} required={required} value={value} min={min} max={max} checked={checked} onChange={onChange} placeholder={placeholder || ""} />}
        </div>
    )
};

export default LabeledInput;
