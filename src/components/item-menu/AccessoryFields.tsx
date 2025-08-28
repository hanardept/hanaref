import React, { ChangeEvent, useState } from "react";
import { AbbreviatedItem, SupplierSummary } from "../../types/item_types";
import InfoSectionMenu from "./InfoSectionMenu";
import { useAppSelector } from "../../hooks/redux-hooks";
import { backendFirebaseUri } from "../../backend-variables/address";
import LabeledInput from "../UI/LabeledInput";
import UploadFile from "../UI/UploadFile";

interface AccessoryFieldsProps {
    imageLink: string;
    isImageUploading?: boolean;
    userManualLink: string;
    isUserManualUploading?: boolean;
    supplier?: Supplier | null;
    models: AbbreviatedItem[];
    belongsToDevices: AbbreviatedItem[];
    handleInput: (setFunc: React.Dispatch<React.SetStateAction<string>>, event: ChangeEvent<HTMLInputElement>) => void;
    setImageLink: React.Dispatch<React.SetStateAction<string | File>>;
    setUserManualLink: React.Dispatch<React.SetStateAction<string | File>>;
    setSupplier: React.Dispatch<React.SetStateAction<SupplierSummary | null>>;
    setModels: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
    setBelongsToDevices: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
}

const AccessoryFields = (props: AccessoryFieldsProps) => {
    const { imageLink, isImageUploading, userManualLink, isUserManualUploading, supplier, models, belongsToDevices, handleInput, setImageLink, setUserManualLink, setSupplier, setModels, setBelongsToDevices } = props;

    const authToken = useAppSelector(state => state.auth.jwt);
    const [ itemSuggestions, setItemSuggestions ] = useState([]);    

    return (
        <>
            <LabeledInput type="file" label="קישור לתמונה" value={imageLink} placeholder="קישור לתמונה" 
                customInputElement={<UploadFile placeholder="קישור לתמונה" url={imageLink} accept="image/png, image/jpeg" isUploading={isImageUploading} onChange={(e) => setImageLink(e.target.files?.[0] ?? '')} onClear={() => setImageLink("")}/>}/>
            <LabeledInput type="file" label="מדריך למשתמש" value={userManualLink} placeholder="מדריך למשתמש" 
                customInputElement={<UploadFile placeholder="מדריך למשתמש" url={userManualLink} isUploading={isUserManualUploading} onChange={(e) => setUserManualLink(e.target.files?.[0] ?? '')} onClear={() => setUserManualLink("")}/>}/>
            <LabeledInput label="ספק בארץ" value={supplier} onChange={(e) => handleInput(setSupplier, e)} placeholder="ספק בארץ" />
            <InfoSectionMenu title="דגמים" items={models} setItems={setModels} />
            <InfoSectionMenu
                title="שייך למכשיר"
                items={belongsToDevices}
                setItems={setBelongsToDevices}
                itemSuggestions={itemSuggestions}
                onFetchSuggestions={(value: string, field: string) => {
                    return fetch(encodeURI(`${backendFirebaseUri}/items?catType=מכשיר&search=${value}&searchFields=${field}`), {
                        method: 'GET',
                        headers: {
                            'auth-token': authToken
                        }
                    })
                    .then((res) => res.json())
                    .then(jsonRes => setItemSuggestions(jsonRes))
                    .catch((err) => console.log(`Error getting item suggestions: ${err}`));
                }}
                onClearSuggestions={() => setItemSuggestions([])}

            />
        </>
    )
}

export default AccessoryFields;
