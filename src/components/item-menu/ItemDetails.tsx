import React, { ChangeEvent } from "react";
import { Sector } from "../../types/sector_types";
import DepartmentSelection from "../item-search/DepartmentSelection";
import SectorSelection from "../item-search/SectorSelection";
import CatTypeSelection from "./CatTypeSelection";
import LabeledInput from "../UI/LabeledInput";
import classes from './ItemMenu.module.css';
import { CatType } from "../../types/item_types";

interface ItemDetailsProps {
    name: string;
    cat: string;
    kitCats: string[];
    sector: string;
    department: string;
    description: string;
    emergency: boolean;
    catType: CatType;
    certificationPeriodMonths?: number | null;
    sectorsToChooseFrom: Sector[];
    catTypesToChooseFrom?: CatType[];
    handleInput: (setFunc: (value: string) => void, event: ChangeEvent<HTMLInputElement>) => void;
    handleDescription: (event: ChangeEvent<HTMLTextAreaElement>) => void;
    handleSetSector: (value: string) => void;
    handleSetDepartment: (value: string) => void;
    handleSetCatType: (catType: CatType) => void;
    setName: React.Dispatch<React.SetStateAction<string>>;
    setCat: React.Dispatch<React.SetStateAction<string>>;
    setEmergency: React.Dispatch<React.SetStateAction<boolean>>;
    setCertificationPeriodMonths: (value: number | null) => void;
    setKitCats: React.Dispatch<React.SetStateAction<string[]>>;
}

const ItemDetails = (props: ItemDetailsProps) => {
    const { name, cat, kitCats, sector, department, description, emergency, catType, certificationPeriodMonths, sectorsToChooseFrom, catTypesToChooseFrom, handleInput, handleDescription, handleSetSector, handleSetDepartment, handleSetCatType, setCertificationPeriodMonths, setName, setEmergency, setCat, setKitCats } = props;
    const sectorNames = sectorsToChooseFrom.map(s => s.sectorName);
    const departmentsToChooseFrom = (sector && sectorsToChooseFrom.length > 0) ? sectorsToChooseFrom.filter(s => s.sectorName === sector)[0].departments : [];

    return (
        <>
            <LabeledInput label="שם הפריט" required value={name} onChange={(e) => handleInput(setName, e)} placeholder="שם הפריט" />
            <LabeledInput label='מק"ט' value={cat} required onChange={(e) => handleInput(setCat, e)} placeholder='מק"ט' />
            {catType === "מכשיר" && <LabeledInput label='מק"ט ערכה' value={kitCats[0] ?? ''} onChange={(e) => { console.log(`settings kit cats`); setKitCats([e.target.value]); }} placeholder='מק"ט ערכה' />}
            {catType === "מכשיר" && <LabeledInput
                type="number"
                label='תוקף הסמכה בחודשים'
                placeholder='תוקף הסמכה בחודשים'
                min={0}
                value={certificationPeriodMonths ?? ''}
                onChange={(e) => handleInput(val => setCertificationPeriodMonths(Number.parseInt(val) ? +val : null), e)}
            />}
            <SectorSelection sectorNames={sectorNames} handleSetSector={handleSetSector} priorChosenSector={sector} required/>
            <DepartmentSelection departments={departmentsToChooseFrom} handleSetDepartment={handleSetDepartment} priorChosenDepartment={department} required />
            <CatTypeSelection catTypes={catTypesToChooseFrom} selectCatType={handleSetCatType} currentCatType={catType} />
            <textarea value={description} onChange={handleDescription} placeholder="תיאור" />
            {catType === "מכשיר" && <div className={classes.emergencyToggle}>
                <label>
                    <input
                        type="checkbox"
                        checked={emergency}
                        onChange={(e) => setEmergency(e.target.checked)}
                    />
                    חירום
                </label>
            </div>}
        </>
    )
}

export default ItemDetails;
