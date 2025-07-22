import React, { ChangeEvent } from "react";
import { AbbreviatedItem } from "../../types/item_types";
import { Sector } from "../../types/sector_types";
import DepartmentSelection from "../item-search/DepartmentSelection";
import SectorSelection from "../item-search/SectorSelection";
import CatTypeSelection from "./CatTypeSelection";
import LabeledInput from "./LabeledInput";

interface ItemDetailsProps {
    name: string;
    cat: string;
    kitCat: AbbreviatedItem[];
    sector: string;
    department: string;
    description: string;
    catType: "מכשיר" | "אביזר" | "מתכלה" | "חלקי חילוף";
    sectorsToChooseFrom: Sector[];
    handleInput: (setFunc: React.Dispatch<React.SetStateAction<string>>, event: ChangeEvent<HTMLInputElement>) => void;
    handleDescription: (event: ChangeEvent<HTMLTextAreaElement>) => void;
    handleSetSector: (value: string) => void;
    handleSetDepartment: (value: string) => void;
    handleSetCatType: (catType: "מכשיר" | "אביזר" | "מתכלה" | "חלקי חילוף") => void;
    setName: React.Dispatch<React.SetStateAction<string>>;
    setCat: React.Dispatch<React.SetStateAction<string>>;
    setKitCat: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
}

const ItemDetails = (props: ItemDetailsProps) => {
    const { name, cat, sector, department, description, catType, sectorsToChooseFrom, handleInput, handleDescription, handleSetSector, handleSetDepartment, handleSetCatType, setName, setCat, kitCat, setKitCat } = props;
    const sectorNames = sectorsToChooseFrom.map(s => s.sectorName);
    const departmentsToChooseFrom = (sector && sectorsToChooseFrom.length > 0) ? sectorsToChooseFrom.filter(s => s.sectorName === sector)[0].departments : [];

    return (
        <>
            <LabeledInput label="שם הפריט" value={name} onChange={(e) => handleInput(setName, e)} placeholder="שם הפריט" />
            <LabeledInput label='מק"ט' value={cat} onChange={(e) => handleInput(setCat, e)} placeholder='מק"ט' />
            {catType === "מכשיר" && <LabeledInput label='מק"ט ערכה' value={kitCat[0].cat} onChange={(e) => setKitCat([{cat: e.target.value, name: kitCat[0].name}])} placeholder='מק"ט ערכה' />}
            <SectorSelection sectorNames={sectorNames} handleSetSector={handleSetSector} priorChosenSector={sector} />
            <DepartmentSelection departments={departmentsToChooseFrom} handleSetDepartment={handleSetDepartment} priorChosenDepartment={department} />
            <CatTypeSelection selectCatType={handleSetCatType} />
            <textarea value={description} onChange={handleDescription} placeholder="תיאור המכשיר (מה הוא עושה וכו')" />
        </>
    )
}

export default ItemDetails;
