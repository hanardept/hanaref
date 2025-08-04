import React, { ChangeEvent } from "react";
import { AbbreviatedItem } from "../../types/item_types";
import InfoSectionMenu from "./InfoSectionMenu";
import LabeledInput from "./LabeledInput";

interface AccessoryFieldsProps {
    imageLink: string;
    userManualLink: string;
    supplier: string;
    models: AbbreviatedItem[];
    belongsToDevices: AbbreviatedItem[];
    handleInput: (setFunc: React.Dispatch<React.SetStateAction<string>>, event: ChangeEvent<HTMLInputElement>) => void;
    setImageLink: React.Dispatch<React.SetStateAction<string>>;
    setUserManualLink: React.Dispatch<React.SetStateAction<string>>;
    setSupplier: React.Dispatch<React.SetStateAction<string>>;
    setModels: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
    setBelongsToDevices: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
}

const AccessoryFields = (props: AccessoryFieldsProps) => {
    const { imageLink, userManualLink, supplier, models, belongsToDevices, handleInput, setImageLink, setUserManualLink, setSupplier, setModels, setBelongsToDevices } = props;

    return (
        <>
            <LabeledInput label="קישור לתמונה" value={imageLink} onChange={(e) => handleInput(setImageLink, e)} placeholder="קישור לתמונה" />
            <LabeledInput label="User manual" value={userManualLink} onChange={(e) => handleInput(setUserManualLink, e)} placeholder="User manual" />
            <LabeledInput label="ספק בארץ" value={supplier} onChange={(e) => handleInput(setSupplier, e)} placeholder="ספק בארץ" />
            <InfoSectionMenu title="דגמים" items={models} setItems={setModels} />
            <InfoSectionMenu title="שייך למכשיר" items={belongsToDevices} setItems={setBelongsToDevices} />
        </>
    )
}

export default AccessoryFields;
