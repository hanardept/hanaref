import React, { ChangeEvent } from "react";
import { AbbreviatedItem } from "../../types/item_types";
import InfoSectionMenu from "./InfoSectionMenu";
import LabeledInput from "./LabeledInput";

interface DeviceFieldsProps {
    imageLink: string;
    qaStandardLink: string;
    userManualLink: string;
    serviceManualLink: string;
    hebrewManualLink: string;
    supplier: string;
    kitCat: AbbreviatedItem[];
    models: AbbreviatedItem[];
    accessories: AbbreviatedItem[];
    consumables: AbbreviatedItem[];
    spareParts: AbbreviatedItem[];
    handleInput: (setFunc: React.Dispatch<React.SetStateAction<string>>, event: ChangeEvent<HTMLInputElement>) => void;
    setImageLink: React.Dispatch<React.SetStateAction<string>>;
    setQaStandardLink: React.Dispatch<React.SetStateAction<string>>;
    setUserManualLink: React.Dispatch<React.SetStateAction<string>>;
    setServiceManualLink: React.Dispatch<React.SetStateAction<string>>;
    setHebrewManualLink: React.Dispatch<React.SetStateAction<string>>;
    setSupplier: React.Dispatch<React.SetStateAction<string>>;
    setKitCat: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
    setModels: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
    setAccessories: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
    setConsumables: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
    setSpareParts: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
}

const DeviceFields = (props: DeviceFieldsProps) => {
    const { imageLink, qaStandardLink, userManualLink, serviceManualLink, hebrewManualLink, supplier, models, accessories, consumables, spareParts, handleInput, setImageLink, setQaStandardLink, setUserManualLink, setServiceManualLink, setHebrewManualLink, setSupplier, setModels, setAccessories, setConsumables, setSpareParts, kitCat, setKitCat } = props;

    return (
        <>
            <LabeledInput label="קישור לתמונה" value={imageLink} onChange={(e) => handleInput(setImageLink, e)} placeholder="קישור לתמונה" />
            <LabeledInput label='מק"ט ערכה' value={kitCat[0].cat} onChange={(e) => setKitCat([{cat: e.target.value, name: kitCat[0].name}])} placeholder='מק"ט ערכה' />
            <LabeledInput label="User manual" value={userManualLink} onChange={(e) => handleInput(setUserManualLink, e)} placeholder="User manual" />
            <LabeledInput label="הוראות הפעלה בעברית" value={hebrewManualLink} onChange={(e) => handleInput(setHebrewManualLink, e)} placeholder="הוראות הפעלה בעברית" />
            <LabeledInput label="הוראות הנר" value={qaStandardLink} onChange={(e) => handleInput(setQaStandardLink, e)} placeholder="הוראות הנר" />
            <LabeledInput label="Service manual" value={serviceManualLink} onChange={(e) => handleInput(setServiceManualLink, e)} placeholder="Service manual" />
            <LabeledInput label="ספק בארץ" value={supplier} onChange={(e) => handleInput(setSupplier, e)} placeholder="ספק בארץ" />
            <InfoSectionMenu title="דגמים" items={models} setItems={setModels} />
            <InfoSectionMenu title="אביזרים" items={accessories} setItems={setAccessories} />
            <InfoSectionMenu title="מתכלים" items={consumables} setItems={setConsumables} />
            <InfoSectionMenu title="חלקי חילוף" items={spareParts} setItems={setSpareParts} />
        </>
    )
}

export default DeviceFields;
