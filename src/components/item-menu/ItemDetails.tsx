import React, { ChangeEvent } from "react";
import { Sector } from "../../types/sector_types";
import DepartmentSelection from "../item-search/DepartmentSelection";
import SectorSelection from "../item-search/SectorSelection";
import CatTypeSelection from "./CatTypeSelection";
import LabeledInput from "./LabeledInput";

interface ItemDetailsProps {
    name: string;
    cat: string;
    sector: string;
    department: string;
    imageLink: string;
    qaStandardLink: string;
    sectorsToChooseFrom: Sector[];
    handleInput: (setFunc: React.Dispatch<React.SetStateAction<string>>, event: ChangeEvent<HTMLInputElement>) => void;
    handleSetSector: (value: string) => void;
    handleSetDepartment: (value: string) => void;
    handleSetCatType: (catType: "מכשיר" | "אביזר" | "מתכלה" | "חלקי חילוף") => void;
    setName: React.Dispatch<React.SetStateAction<string>>;
    setCat: React.Dispatch<React.SetStateAction<string>>;
    setImageLink: React.Dispatch<React.SetStateAction<string>>;
    setQaStandardLink: React.Dispatch<React.SetStateAction<string>>;
}

const ItemDetails = (props: ItemDetailsProps) => {
    const { name, cat, sector, department, imageLink, qaStandardLink, sectorsToChooseFrom, handleInput, handleSetSector, handleSetDepartment, handleSetCatType, setName, setCat, setImageLink, setQaStandardLink } = props;
    const sectorNames = sectorsToChooseFrom.map(s => s.sectorName);
    const departmentsToChooseFrom = (sector && sectorsToChooseFrom.length > 0) ? sectorsToChooseFrom.filter(s => s.sectorName === sector)[0].departments : [];

    return (
        <>
            <LabeledInput label="שם הפריט" value={name} onChange={(e) => handleInput(setName, e)} placeholder="שם הפריט" />
            <LabeledInput label='מק"ט' value={cat} onChange={(e) => handleInput(setCat, e)} placeholder='מק"ט' />
            <SectorSelection sectorNames={sectorNames} handleSetSector={handleSetSector} priorChosenSector={sector} />
            <DepartmentSelection departments={departmentsToChooseFrom} handleSetDepartment={handleSetDepartment} priorChosenDepartment={department} />
            <CatTypeSelection selectCatType={handleSetCatType} />
            <LabeledInput label="קישור לתמונה" value={imageLink} onChange={(e) => handleInput(setImageLink, e)} placeholder="קישור לתמונה" />
            <LabeledInput label="קישור לתקן בחינה" value={qaStandardLink} onChange={(e) => handleInput(setQaStandardLink, e)} placeholder="קישור לתקן בחינה" />
        </>
    )
}

export default ItemDetails;
