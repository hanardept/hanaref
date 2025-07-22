import React, { ChangeEvent } from "react";
import classes from './LabeledInput.module.css';

const LabeledInput = ({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (event: ChangeEvent<HTMLInputElement>) => void, placeholder?: string }) => {
    return (
        <div className={classes.labeledInput}>
            <label>{label}</label>
            <input type="text" value={value} onChange={onChange} placeholder={placeholder || ""} />
        </div>
    )
};

export default LabeledInput;
