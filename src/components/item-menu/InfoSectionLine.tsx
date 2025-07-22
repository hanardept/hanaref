import React from 'react';
import { ChangeEvent } from 'react';
import { AbbreviatedItem } from '../../types/item_types';
import classes from './ItemMenu.module.css';

const InfoSectionLine = ({ isLast, item, addLine, deleteLine, editItemCat, editItemName, editItemManufacturer, first, modelsLine }: { isLast: boolean, item: AbbreviatedItem, addLine: () => void, deleteLine: () => void, editItemCat: (cat: string) => void, editItemName: (name: string) => void, editItemManufacturer?: (manufacturer: string) => void, first?: boolean, modelsLine?: boolean }) => {
    
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
    const conditionalDeleteUponBlur = () => {
        if (!first && item.cat.length === 0 && item.name.length === 0) {
            deleteLine();
        }
    }

    return (
        <div className={classes.infoSectionLine} style={{ gridTemplateColumns: modelsLine ? "1fr 1fr 1fr 2.5rem" : "1fr 2fr 2.5rem" }}>
            {modelsLine && <input type="text" placeholder='יצרן' value={item.manufacturer} onChange={handleManufacturerInput} onBlur={conditionalDeleteUponBlur} />}
            <input type="text" placeholder={modelsLine ? 'מק"ט יצרן' : 'מק"ט'} value={item.cat} onChange={handleCatInput} onBlur={conditionalDeleteUponBlur} />
            <input type="text" placeholder={modelsLine ? 'שם דגם' : 'שם'} value={item.name} onChange={handleNameInput} onBlur={conditionalDeleteUponBlur} />
            <div onClick={handleClick} className={(item.cat.length > 0 && item.name.length > 0) ? classes.infoSectionPlusClickable : classes.infoSectionPlusGrayed} style={{ display: isLast ? "flex" : "none" }}>+</div>
        </div>
    )
};

export default React.memo(InfoSectionLine);