import React, { ChangeEvent, useState } from "react";
import { AbbreviatedItem } from "../../types/item_types";
import InfoSectionMenu from "./InfoSectionMenu";
import LabeledInput from "./LabeledInput";
import { useAppSelector } from "../../hooks/redux-hooks";
import { backendFirebaseUri } from "../../backend-variables/address";

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

    const authToken = useAppSelector(state => state.auth.jwt);
    const [ itemSuggestions, setItemSuggestions ] = useState([]);    

    return (
        <>
            <LabeledInput label="קישור לתמונה" value={imageLink} onChange={(e) => handleInput(setImageLink, e)} placeholder="קישור לתמונה" />
            <LabeledInput label="User manual" value={userManualLink} onChange={(e) => handleInput(setUserManualLink, e)} placeholder="User manual" />
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
