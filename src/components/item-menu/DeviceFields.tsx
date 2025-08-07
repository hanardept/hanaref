import React, { ChangeEvent } from "react";
import { AbbreviatedItem } from "../../types/item_types";
import InfoSectionMenu from "./InfoSectionMenu";
import LabeledInput from "../UI/LabeledInput";
import UploadFile from "../UI/UploadFile";

interface DeviceFieldsProps {
    imageLink: string;
    isImageUploading?: boolean;
    qaStandardLink: string;
    userManualLink: string;
    medicalEngineeringManualLink: string;
    serviceManualLink: string;
    hebrewManualLink: string;
    supplier: string;
    models: AbbreviatedItem[];
    accessories: AbbreviatedItem[];
    consumables: AbbreviatedItem[];
    spareParts: AbbreviatedItem[];
    handleInput: (setFunc: React.Dispatch<React.SetStateAction<string>>, event: ChangeEvent<HTMLInputElement>) => void;
    setImageLink: React.Dispatch<React.SetStateAction<string | File>>;
    setQaStandardLink: React.Dispatch<React.SetStateAction<string | File>>;
    setMedicalEngineeringManualLink: React.Dispatch<React.SetStateAction<string | File>>;
    setUserManualLink: React.Dispatch<React.SetStateAction<string | File>>;
    setServiceManualLink: React.Dispatch<React.SetStateAction<string | File>>;
    setHebrewManualLink: React.Dispatch<React.SetStateAction<string | File>>;
    setSupplier: React.Dispatch<React.SetStateAction<string>>;
    setModels: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
    setAccessories: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
    setConsumables: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
    setSpareParts: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
}

const DeviceFields = (props: DeviceFieldsProps) => {
    const {
        imageLink, isImageUploading, qaStandardLink, medicalEngineeringManualLink, userManualLink, serviceManualLink, hebrewManualLink, supplier, models, accessories, consumables, spareParts,
        handleInput, setImageLink, setQaStandardLink, setMedicalEngineeringManualLink, setUserManualLink, setServiceManualLink, setHebrewManualLink, setSupplier, setModels,
        setAccessories, setConsumables, setSpareParts
    } = props;

    return (
        <>
            <LabeledInput type="file" label="קישור לתמונה" value={imageLink}  placeholder="קישור לתמונה" 
                customInputElement={<UploadFile placeholder= "קישור לתמונה" url={imageLink} accept="image/png, image/jpeg" isUploading={isImageUploading} onChange={(e) => setImageLink(e.target.files?.[0] ?? '')}/>}/>
            <LabeledInput type="file" label="הוראות הפעלה בעברית" value={hebrewManualLink} placeholder="הוראות הפעלה בעברית" 
                customInputElement={<UploadFile placeholder="הוראות הפעלה בעברית" url={hebrewManualLink} onChange={(e) => setHebrewManualLink(e.target.files?.[0] ?? '')}/>}/>
            <LabeledInput type="file" label="הוראות הנר" value={medicalEngineeringManualLink} placeholder="הוראות הנר" 
                customInputElement={<UploadFile placeholder="הוראות הנר" url={medicalEngineeringManualLink} onChange={(e) => setMedicalEngineeringManualLink(e.target.files?.[0] ?? '')}/>}/>
            <LabeledInput type="file" label="תקן בחינה" value={qaStandardLink} placeholder="תקן בחינה"
                customInputElement={<UploadFile placeholder="תקן בחינה" url={qaStandardLink} onChange={(e) => setQaStandardLink(e.target.files?.[0] ?? '')}/>}/>
            <LabeledInput type="file" label="Service Manual" value={serviceManualLink} placeholder="Service Manual" 
                customInputElement={<UploadFile placeholder="Service Manual" url={serviceManualLink} onChange={(e) => setServiceManualLink(e.target.files?.[0] ?? '')}/>}/>
            <LabeledInput label="ספק בארץ" value={supplier} onChange={(e) => handleInput(setSupplier, e)} placeholder="ספק בארץ" />
            <InfoSectionMenu title="דגמים" items={models} setItems={setModels} />
            <InfoSectionMenu title="אביזרים" items={accessories} setItems={setAccessories} />
            <InfoSectionMenu title="מתכלים" items={consumables} setItems={setConsumables} />
            <InfoSectionMenu title="חלקי חילוף" items={spareParts} setItems={setSpareParts} />
        </>
    )
}

export default DeviceFields;
