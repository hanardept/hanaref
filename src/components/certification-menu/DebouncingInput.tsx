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
    // const dispatch = useAppDispatch();
    // const searchVal = useAppSelector(state => state.viewing.searching.searchVal);

    const [localValue, setLocalValue] = useState("");

    console.log(`debouncing input value: ${inputValue}`);

    const eraseValue = () => {
        onValueErased?.();
        //dispatch(viewingActions.changeSearchCriteria({ searchVal: "" }));
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
                    console.log("setting local value to:", value);
                    if (debouncer.current) {
                        console.log(`debouncer current exists!`);
                        clearTimeout(debouncer.current);
                    }
                    debouncer.current = setTimeout(() => {
                        onFetchSuggestions?.(value)
                        //onValueChanged?.(value)
                        //dispatch(viewingActions.changeSearchCriteria({ searchVal: event.target.value }));
                    }, DEBOUNCE_LAG)}
                    
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
                        // onBlur: () => { 
                        //     if (!suggestions?.includes(inputValue)) {
                        //         console.log(`invalid suggestion. clearing!`);
                        //         onClearSuggestions?.()
                        //     }
                        // },
                        type: "search",
                        placeholder,
                    }
                }
            />
            {/* <TextInput type="text" value={localValue} onChange={(event) => { 
                setLocalValue(event.target.value);
                console.log("setting local value to:", event.target.value);
                if (debouncer.current) {
                    console.log(`debouncer current exists!`);
                    clearTimeout(debouncer.current);
                }
                debouncer.current = setTimeout(() => {
                    onValueChanged?.(event.target.value)
                    //dispatch(viewingActions.changeSearchCriteria({ searchVal: event.target.value }));
                }, DEBOUNCE_LAG)}} /> */}
            {localValue.length > 0 && <div className={classes.xButton} onClick={eraseValue}>×</div>}
        </div>
    )
};

export default DebouncingInput;