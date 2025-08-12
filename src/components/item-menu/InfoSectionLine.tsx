import React, { useState } from 'react';
import { ChangeEvent } from 'react';
import { AbbreviatedItem } from '../../types/item_types';
import classes from './ItemMenu.module.css';
import DebouncingInput from '../UI/DebouncingInput';

const InfoSectionLine = ({ isLast, item, addLine, deleteLine, editItemCat, editItemName, editItemManufacturer, first, modelsLine, itemSuggestions, onFetchSuggestions, onClearSuggestions, onBlur }
    : { 
        isLast: boolean,
        item: AbbreviatedItem,
        addLine: () => void,
        deleteLine: () => void,
        editItemCat: (cat: string) => void,
        editItemName: (name: string) => void,
        editItemManufacturer?: (manufacturer: string) => void,
        first?: boolean,
        modelsLine?: boolean,
        itemSuggestions?: AbbreviatedItem[],
        onFetchSuggestions?: (value: string, field: string) => any,
        onClearSuggestions?: () => any,
        onBlur?: () => any,
    }) => {

    const [ itemCatSearchText, setItemCatSearchText] = useState<string | null>(null);
    const [ itemNameSearchText, setItemNameSearchText] = useState<string | null>(null);    
    
    const handleCatInput = (event: ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        editItemCat(event.target.value);
    };
    const handleNameInput = (event: ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        editItemName(event.target.value);
    };
    const handleManufacturerInput = (event: ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        if (editItemManufacturer) {
            editItemManufacturer(event.target.value);
        }
    };
    const handleClick = () => {
        if (isLast && item.cat.length > 0 && item.name.length > 0) {
            addLine();
        }
    }
    const conditionalDeleteUponBlur = (force: boolean = false) => {
        if (item.cat.length === 0 && item.name.length === 0) {
            console.log(`deleting line`);
            deleteLine();
        }
    }

    return (
        <div className={classes.infoSectionLine} style={{ gridTemplateColumns: modelsLine ? "1fr 1fr 1fr 2.5rem" : "1fr 2fr 2.5rem" }}>
            {modelsLine && <input type="text" placeholder='יצרן' value={item.manufacturer} onChange={handleManufacturerInput} onBlur={() => conditionalDeleteUponBlur()} />}
            {onFetchSuggestions ?
            <DebouncingInput
                id="searchCat"
                className={classes.autosuggest}
                inputValue={itemCatSearchText ?? item.cat ?? ''}
                onValueChanged={(val: any) => setItemCatSearchText(val)}
                onValueErased={deleteLine}
                onSuggestionSelected={(s: any) => {
                    editItemCat(s.cat);
                    editItemName(s.name);
                    setItemCatSearchText(null);
                }}
                getSuggestionValue={s => s.cat}
                placeholder={modelsLine ? 'מק"ט יצרן' : 'מק"ט'}
                suggestions={itemSuggestions}
                onFetchSuggestions={s => onFetchSuggestions?.(s, 'cat')}
                renderSuggestion={s => <span>{s.cat} {s.name}</span>}
                onClearSuggestions={onClearSuggestions}
                onBlur={() => { setItemCatSearchText(null); conditionalDeleteUponBlur(); }}
            /> :
            <input type="text" placeholder={modelsLine ? 'מק"ט יצרן' : 'מק"ט'} value={item.cat} onChange={handleCatInput} onBlur={() => conditionalDeleteUponBlur()} />
            }
            {onFetchSuggestions ?
            <DebouncingInput
                id="searchName"
                className={classes.autosuggest}
                inputValue={itemNameSearchText ?? item.name ?? ''}
                onValueChanged={(val: any) => setItemNameSearchText(val)}
                onValueErased={deleteLine}
                onSuggestionSelected={(s: any) => {
                    editItemCat(s.cat);
                    editItemName(s.name);
                    setItemNameSearchText(null);
                }}
                getSuggestionValue={s => s.name}
                placeholder={modelsLine ? 'שם דגם' : 'שם'}
                suggestions={itemSuggestions}
                onFetchSuggestions={s => onFetchSuggestions?.(s, 'name')}
                renderSuggestion={s => <span>{s.cat} {s.name}</span>}
                onClearSuggestions={onClearSuggestions}
                onBlur={() => { setItemNameSearchText(null); conditionalDeleteUponBlur(); }}
            /> :
            <input type="text" placeholder={modelsLine ? 'שם דגם' : 'שם'} value={item.name} onChange={handleNameInput} onBlur={() => conditionalDeleteUponBlur()} />
            }
            <div onClick={handleClick} className={(item.cat.length > 0 && item.name.length > 0) ? classes.infoSectionPlusClickable : classes.infoSectionPlusGrayed} style={{ display: isLast ? "flex" : "none" }}>+</div>
        </div>
    )
};

export default React.memo(InfoSectionLine);