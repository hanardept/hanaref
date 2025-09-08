import { useCallback, useEffect, useRef } from "react";
import classes from './DebouncingInput.module.css';
import Autosuggest from 'react-autosuggest';
import './AutoSuggest.css';

const DEBOUNCE_LAG = 800;

const DebouncingInput = ({ inputValue, onValueErased, onValueChanged, onSuggestionSelected, suggestions, placeholder, disabled, required, getSuggestionValue, renderSuggestion, onFetchSuggestions, onClearSuggestions, onBlur, ...props }: {
    inputValue: string,
    suggestions?: any[],
    placeholder: string,
    disabled?: boolean,
    required?: boolean,
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

    let debouncer = useRef(setTimeout(() => {}, DEBOUNCE_LAG));

    const handleClear = useCallback(() => {
        onValueErased?.();
    }, [ onValueErased ]);

    const autosuggest = useRef<any>(null);

    useEffect(() => {
        const inputElement = autosuggest.current?.input;

        if (inputElement) {
            inputElement.addEventListener('search', handleClear);
        }

        return () => {
            if (inputElement) {
                inputElement.removeEventListener('search', handleClear);
            }
        };
    }, [ handleClear ]);


    const inputProps = {
            value: inputValue,
            onChange: (_: any, params: any) => onValueChanged?.(params.newValue),
            onBlur: onBlur,
            type: "search",
            placeholder,
            disabled,
            required
    };

    return (
        <div className={classes.container} {...props}>
           <Autosuggest
                ref={autosuggest}
                suggestions={suggestions ?? []}
                containerProps={{ disabled: true }}
                onSuggestionsFetchRequested={({ value }) => {
                    if (debouncer.current) {
                        clearTimeout(debouncer.current);
                    }
                    debouncer.current = setTimeout(() => onFetchSuggestions?.(value), DEBOUNCE_LAG)}
                    
                }
                onSuggestionSelected={(_, { suggestion }) => onSuggestionSelected?.(suggestion)}
                onSuggestionsClearRequested={onClearSuggestions}
                getSuggestionValue={getSuggestionValue}
                renderSuggestion={s => renderSuggestion?.(s) ?? <span>{s}</span>}
                inputProps={inputProps}
            />
        </div>
    )
};

export default DebouncingInput;