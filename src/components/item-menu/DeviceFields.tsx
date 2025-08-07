import React, { ChangeEvent } from "react";
import { AbbreviatedItem } from "../../types/item_types";
import InfoSectionMenu from "./InfoSectionMenu";
import LabeledInput from "../UI/LabeledInput";
import UploadFile from "../UI/UploadFile";

interface DeviceFieldsProps {
    imageLink: string;
    isImageUploading?: boolean;
    qaStandardLink: string;
    isQaStandardUploading?: boolean;
    userManualLink: string;
    isUserManualUploading?: boolean;
    medicalEngineeringManualLink: string;
    isMedicalEngineeringManualUploading?: boolean;
    serviceManualLink: string;
    isServiceManualUploading?: boolean;
    hebrewManualLink: string;
    isHebrewManualUploading?: boolean;
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
        imageLink, isImageUploading, qaStandardLink, isQaStandardUploading, medicalEngineeringManualLink, isMedicalEngineeringManualUploading, userManualLink, isUserManualUploading, serviceManualLink, isServiceManualUploading,
        hebrewManualLink, isHebrewManualUploading, supplier, models, accessories, consumables, spareParts, handleInput, setImageLink, setQaStandardLink, setMedicalEngineeringManualLink, setUserManualLink, setServiceManualLink, setHebrewManualLink, setSupplier, setModels,
        setAccessories, setConsumables, setSpareParts
    } = props;

    return (
        <>
            <LabeledInput type="file" label="קישור לתמונה" value={imageLink}  placeholder="קישור לתמונה" 
                customInputElement={<UploadFile placeholder= "קישור לתמונה" url={imageLink} accept="image/png, image/jpeg" isUploading={isImageUploading} onChange={(e) => setImageLink(e.target.files?.[0] ?? '')}/>}/>
            <LabeledInput type="file" label="מדריך למשתמש" value={userManualLink} placeholder="מדריך למשתמש"
                customInputElement={<UploadFile placeholder="מדריך למשתמש" url={userManualLink} isUploading={isUserManualUploading} onChange={(e) => setUserManualLink(e.target.files?.[0] ?? '')}/>}/>                
            <LabeledInput type="file" label="הוראות הפעלה בעברית" value={hebrewManualLink} placeholder="הוראות הפעלה בעברית" 
                customInputElement={<UploadFile placeholder="הוראות הפעלה בעברית" url={hebrewManualLink} isUploading={isHebrewManualUploading} onChange={(e) => setHebrewManualLink(e.target.files?.[0] ?? '')}/>}/>
            <LabeledInput type="file" label="הוראות הנר" value={medicalEngineeringManualLink} placeholder="הוראות הנר" 
                customInputElement={<UploadFile placeholder="הוראות הנר" url={medicalEngineeringManualLink} isUploading={isMedicalEngineeringManualUploading} onChange={(e) => setMedicalEngineeringManualLink(e.target.files?.[0] ?? '')}/>}/>
            <LabeledInput type="file" label="תקן בחינה" value={qaStandardLink} placeholder="תקן בחינה"
                customInputElement={<UploadFile placeholder="תקן בחינה" url={qaStandardLink} isUploading={isQaStandardUploading} onChange={(e) => setQaStandardLink(e.target.files?.[0] ?? '')}/>}/>
            <LabeledInput type="file" label="Service Manual" value={serviceManualLink} placeholder="Service Manual" 
                customInputElement={<UploadFile placeholder="Service Manual" url={serviceManualLink} isUploading={isServiceManualUploading} onChange={(e) => setServiceManualLink(e.target.files?.[0] ?? '')}/>}/>
            <LabeledInput label="ספק בארץ" value={supplier} onChange={(e) => handleInput(setSupplier, e)} placeholder="ספק בארץ" />
            <InfoSectionMenu title="דגמים" items={models} setItems={setModels} />
            <InfoSectionMenu title="אביזרים" items={accessories} setItems={setAccessories} />
            <InfoSectionMenu title="מתכלים" items={consumables} setItems={setConsumables} />
            <InfoSectionMenu title="חלקי חילוף" items={spareParts} setItems={setSpareParts} />
        </>
    )
}

export default DeviceFields;
