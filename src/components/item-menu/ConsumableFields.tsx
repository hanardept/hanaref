import React, { ChangeEvent } from "react";
import { AbbreviatedItem } from "../../types/item_types";
import InfoSectionMenu from "./InfoSectionMenu";
import LabeledInput from "./LabeledInput";

interface ConsumableFieldsProps {
    description: string;
    imageLink: string;
    userManualLink: string;
    supplier: string;
    lifeSpan: string;
    models: AbbreviatedItem[];
    belongsToDevice: AbbreviatedItem[];
    handleDescription: (event: ChangeEvent<HTMLTextAreaElement>) => void;
    handleInput: (setFunc: React.Dispatch<React.SetStateAction<string>>, event: ChangeEvent<HTMLInputElement>) => void;
    setDescription: React.Dispatch<React.SetStateAction<string>>;
    setImageLink: React.Dispatch<React.SetStateAction<string>>;
    setUserManualLink: React.Dispatch<React.SetStateAction<string>>;
    setSupplier: React.Dispatch<React.SetStateAction<string>>;
    setLifeSpan: React.Dispatch<React.SetStateAction<string>>;
    setModels: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
    setBelongsToDevice: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
}

const ConsumableFields = (props: ConsumableFieldsProps) => {
    const { description, imageLink, userManualLink, supplier, lifeSpan, models, belongsToDevice, handleDescription, handleInput, setImageLink, setUserManualLink, setSupplier, setLifeSpan, setModels, setBelongsToDevice } = props;

    return (
        <>
            <textarea value={description} onChange={handleDescription} placeholder="תיאור המתכלה" />
            <LabeledInput label="אורך חיים בחודשים" value={lifeSpan} onChange={(e) => handleInput(setLifeSpan, e)} placeholder="אורך חיים בחודשים" />
            <LabeledInput label="קישור לתמונה" value={imageLink} onChange={(e) => handleInput(setImageLink, e)} placeholder="קישור לתמונה" />
            <LabeledInput label="User manual" value={userManualLink} onChange={(e) => handleInput(setUserManualLink, e)} placeholder="User manual" />
            <LabeledInput label="ספק בארץ" value={supplier} onChange={(e) => handleInput(setSupplier, e)} placeholder="ספק בארץ" />
            <InfoSectionMenu title="דגמים" items={models} setItems={setModels} />
            <InfoSectionMenu title="שייך למכשיר" items={belongsToDevice} setItems={setBelongsToDevice} />
        </>
    )
}

export default ConsumableFields;
