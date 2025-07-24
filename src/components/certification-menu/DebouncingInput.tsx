import { useEffect, useRef, useState } from "react";
import classes from './DebouncingInput.module.css';
import Autosuggest from 'react-autosuggest';

const DEBOUNCE_LAG = 800;

const DebouncingInput = ({ inputValue, onValueErased, onValueChanged, suggestions, placeholder, onFetchSuggestions, onClearSuggestions }: {
    inputValue: string,
    suggestions?: string[],
    placeholder: string,
    onFetchSuggestions?: (value: string) => any,
    onClearSuggestions?: () => any,
    onValueErased?: () => any,
    onValueChanged?: (newValue: string) => any
}) => {
    // const dispatch = useAppDispatch();
    // const searchVal = useAppSelector(state => state.viewing.searching.searchVal);

    const [localValue, setLocalValue] = useState("");

    const eraseValue = () => {
        onValueErased?.();
        //dispatch(viewingActions.changeSearchCriteria({ searchVal: "" }));
    }

    useEffect(() => {
        setLocalValue?.(inputValue);
    }, [inputValue]);

    let debouncer = useRef(setTimeout(() => {}, DEBOUNCE_LAG));

    return (
        <div className={classes.searchBarWrapper}>
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
                onSuggestionsClearRequested={onClearSuggestions}
                getSuggestionValue={s => s}
                renderSuggestion={(s => <p>{s} משה</p>)}
                inputProps={
                    {
                        value: inputValue,
                        onChange: (_, { newValue }) => onValueChanged?.(newValue),
                        onBlur: () => { if (!suggestions?.includes(inputValue)) { onClearSuggestions?.() }},
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