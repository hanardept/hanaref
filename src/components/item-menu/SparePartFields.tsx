import React, { ChangeEvent } from "react";
import { AbbreviatedItem } from "../../types/item_types";
import InfoSectionMenu from "./InfoSectionMenu";
import LabeledInput from "./LabeledInput";

interface SparePartFieldsProps {
    imageLink: string;
    userManualLink: string;
    supplier: string;
    models: AbbreviatedItem[];
    belongsToDevice: AbbreviatedItem[];
    handleInput: (setFunc: React.Dispatch<React.SetStateAction<string>>, event: ChangeEvent<HTMLInputElement>) => void;
    setImageLink: React.Dispatch<React.SetStateAction<string>>;
    setUserManualLink: React.Dispatch<React.SetStateAction<string>>;
    setSupplier: React.Dispatch<React.SetStateAction<string>>;
    setModels: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
    setBelongsToDevice: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
}

const SparePartFields = (props: SparePartFieldsProps) => {
    const { imageLink, userManualLink, supplier, models, belongsToDevice, handleInput, setImageLink, setUserManualLink, setSupplier, setModels, setBelongsToDevice } = props;

    return (
        <>
            <LabeledInput label="קישור לתמונה" value={imageLink} onChange={(e) => handleInput(setImageLink, e)} placeholder="קישור לתמונה" />
            <LabeledInput label="User manual" value={userManualLink} onChange={(e) => handleInput(setUserManualLink, e)} placeholder="User manual" />
            <LabeledInput label="ספק בארץ" value={supplier} onChange={(e) => handleInput(setSupplier, e)} placeholder="ספק בארץ" />
            <InfoSectionMenu title="דגמים" items={models} setItems={setModels} />
            <InfoSectionMenu title="שייך למכשיר" items={belongsToDevice} setItems={setBelongsToDevice} />
        </>
    )
}

export default SparePartFields;
