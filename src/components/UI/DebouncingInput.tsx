import { useEffect, useRef, useState } from "react";
import classes from './DebouncingInput.module.css';
import Autosuggest from 'react-autosuggest';
import './AutoSuggest.css';

const DEBOUNCE_LAG = 800;

const DebouncingInput = ({ inputValue, onValueErased, onValueChanged, onSuggestionSelected, suggestions, placeholder, getSuggestionValue, renderSuggestion, onFetchSuggestions, onClearSuggestions, onBlur, ...props }: {
    inputValue: string,
    suggestions?: any[],
    placeholder: string,
    getSuggestionValue: (suggestion: any) => string,
    renderSuggestion: (suggestion: any) => JSX.Element,
    onFetchSuggestions?: (value: string) => any,
    onClearSuggestions?: () => any,
    onValueErased?: () => any,
    onValueChanged?: (newValue: string) => any,
    onSuggestionSelected?: (value: any) => any,
    onBlur?: () => any,
    [x: string]: any
}) => {

    const [localValue, setLocalValue] = useState("");


    const eraseValue = () => {
        onValueErased?.();
    }

    useEffect(() => {
        setLocalValue?.(inputValue);
    }, [inputValue]);

    let debouncer = useRef(setTimeout(() => {}, DEBOUNCE_LAG));

    return (
        <div className={classes.container} {...props}>
           <Autosuggest
                suggestions={suggestions ?? []}
                onSuggestionsFetchRequested={({ value }) => {
                    setLocalValue(value);
                    if (debouncer.current) {
                        clearTimeout(debouncer.current);
                    }
                    debouncer.current = setTimeout(() => onFetchSuggestions?.(value), DEBOUNCE_LAG)}
                    
                }
                onSuggestionSelected={(_, { suggestion }) => { console.log(`hii`); onSuggestionSelected?.(suggestion); }}
                onSuggestionsClearRequested={onClearSuggestions}
                getSuggestionValue={getSuggestionValue}
                renderSuggestion={s => renderSuggestion?.(s) ?? <span>{s}</span>}
                inputProps={
                    {
                        value: inputValue,
                        onChange: (_, { newValue }) => { console.log(`new value: ${newValue}`); onValueChanged?.(newValue); },
                        onBlur: onBlur,
                        type: "search",
                        placeholder,
                    }
                }
            />
            {/* {localValue.length > 0 && <div className={classes.xButton} onClick={eraseValue}>×</div>} */}
        </div>
    )
};

export default DebouncingInput;