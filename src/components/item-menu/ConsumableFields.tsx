import React, { ChangeEvent } from "react";
import { AbbreviatedItem } from "../../types/item_types";
import InfoSectionMenu from "./InfoSectionMenu";
import LabeledInput from "../UI/LabeledInput";
import UploadFile from "../UI/UploadFile";

interface ConsumableFieldsProps {
    imageLink: string;
    userManualLink: string;
    supplier: string;
    lifeSpan: string;
    models: AbbreviatedItem[];
    belongsToDevices: AbbreviatedItem[];
    handleInput: (setFunc: React.Dispatch<React.SetStateAction<string>>, event: ChangeEvent<HTMLInputElement>) => void;
    setImageLink: React.Dispatch<React.SetStateAction<string | File>>;
    setUserManualLink: React.Dispatch<React.SetStateAction<string | File>>;
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
            <LabeledInput type="file" label="קישור לתמונה" value={imageLink} placeholder="קישור לתמונה" 
                customInputElement={<UploadFile placeholder="קישור לתמונה" url={imageLink} onChange={(e) => setImageLink(e.target.files?.[0] ?? '')}/>}/>
            <LabeledInput type="file" label="מדריך למשתמש" value={userManualLink} placeholder="מדריך למשתמש" 
                customInputElement={<UploadFile placeholder="מדריך למשתמש" url={userManualLink} onChange={(e) => setUserManualLink(e.target.files?.[0] ?? '')}/>}/>
            <LabeledInput label="ספק בארץ" value={supplier} onChange={(e) => handleInput(setSupplier, e)} placeholder="ספק בארץ" />
            <InfoSectionMenu title="דגמים" items={models} setItems={setModels} />
            <InfoSectionMenu title="שייך למכשיר" items={belongsToDevices} setItems={setBelongsToDevices} />
        </>
    )
}

export default ConsumableFields;
