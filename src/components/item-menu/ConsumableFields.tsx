import React, { ChangeEvent } from "react";
import { AbbreviatedItem } from "../../types/item_types";
import InfoSectionMenu from "./InfoSectionMenu";
import LabeledInput from "../UI/LabeledInput";

interface ConsumableFieldsProps {
    imageLink: string;
    userManualLink: string;
    supplier: string;
    lifeSpan: string;
    models: AbbreviatedItem[];
    belongsToDevices: AbbreviatedItem[];
    handleInput: (setFunc: React.Dispatch<React.SetStateAction<string>>, event: ChangeEvent<HTMLInputElement>) => void;
    setImageLink: React.Dispatch<React.SetStateAction<string>>;
    setUserManualLink: React.Dispatch<React.SetStateAction<string>>;
    setSupplier: React.Dispatch<React.SetStateAction<string>>;
    setLifeSpan: React.Dispatch<React.SetStateAction<string>>;
    setModels: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
    setBelongsToDevices: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
}

const ConsumableFields = (props: ConsumableFieldsProps) => {
    const { imageLink, userManualLink, supplier, lifeSpan, models, belongsToDevices, handleInput, setImageLink, setUserManualLink, setSupplier, setLifeSpan, setModels, setBelongsToDevices } = props;

    return (
        <>
            <LabeledInput label="אורך חיים בחודשים" value={lifeSpan} onChange={(e) => handleInput(setLifeSpan, e)} placeholder="אורך חיים בחודשים" />
            <LabeledInput label="קישור לתמונה" value={imageLink} onChange={(e) => handleInput(setImageLink, e)} placeholder="קישור לתמונה" />
            <LabeledInput label="User manual" value={userManualLink} onChange={(e) => handleInput(setUserManualLink, e)} placeholder="User manual" />
            <LabeledInput label="ספק בארץ" value={supplier} onChange={(e) => handleInput(setSupplier, e)} placeholder="ספק בארץ" />
            <InfoSectionMenu title="דגמים" items={models} setItems={setModels} />
            <InfoSectionMenu title="שייך למכשיר" items={belongsToDevices} setItems={setBelongsToDevices} />
        </>
    )
}

export default ConsumableFields;
