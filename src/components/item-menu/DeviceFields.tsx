import React, { ChangeEvent, useState } from "react";
import { AbbreviatedItem } from "../../types/item_types";
import InfoSectionMenu from "./InfoSectionMenu";
import LabeledInput from "./LabeledInput";
import { backendFirebaseUri } from "../../backend-variables/address";
import { useAppSelector } from "../../hooks/redux-hooks";

interface DeviceFieldsProps {
    imageLink: string;
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
    setImageLink: React.Dispatch<React.SetStateAction<string>>;
    setQaStandardLink: React.Dispatch<React.SetStateAction<string>>;
    setMedicalEngineeringManualLink: React.Dispatch<React.SetStateAction<string>>;
    setUserManualLink: React.Dispatch<React.SetStateAction<string>>;
    setServiceManualLink: React.Dispatch<React.SetStateAction<string>>;
    setHebrewManualLink: React.Dispatch<React.SetStateAction<string>>;
    setSupplier: React.Dispatch<React.SetStateAction<string>>;
    setModels: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
    setAccessories: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
    setConsumables: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
    setSpareParts: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
}

const DeviceFields = (props: DeviceFieldsProps) => {
    const {
        imageLink, qaStandardLink, medicalEngineeringManualLink, userManualLink, serviceManualLink, hebrewManualLink, supplier, models, accessories, consumables, spareParts,
        handleInput, setImageLink, setQaStandardLink, setMedicalEngineeringManualLink, setUserManualLink, setServiceManualLink, setHebrewManualLink, setSupplier, setModels,
        setAccessories, setConsumables, setSpareParts
    } = props;

    const authToken = useAppSelector(state => state.auth.jwt);
    const [ itemSuggestions, setItemSuggestions ] = useState([]);

    return (
        <>
            <LabeledInput label="קישור לתמונה" value={imageLink} onChange={(e) => handleInput(setImageLink, e)} placeholder="קישור לתמונה" />
            <LabeledInput label="מדריך למשתמש" value={userManualLink} onChange={(e) => handleInput(setUserManualLink, e)} placeholder="מדריך למשתמש" />
            <LabeledInput label="הוראות הפעלה בעברית" value={hebrewManualLink} onChange={(e) => handleInput(setHebrewManualLink, e)} placeholder="הוראות הפעלה בעברית" />
            <LabeledInput label="הוראות הנר" value={medicalEngineeringManualLink} onChange={(e) => handleInput(setMedicalEngineeringManualLink, e)} placeholder="הוראות הנר" />
            <LabeledInput label="תקן בחינה" value={qaStandardLink} onChange={(e) => handleInput(setQaStandardLink, e)} placeholder="תקן בחינה" />
            <LabeledInput label="Service Manual" value={serviceManualLink} onChange={(e) => handleInput(setServiceManualLink, e)} placeholder="Service Manual" />
            <LabeledInput label="ספק בארץ" value={supplier} onChange={(e) => handleInput(setSupplier, e)} placeholder="ספק בארץ" />
            <InfoSectionMenu title="דגמים" items={models} setItems={setModels} />
            <InfoSectionMenu 
                title="אביזרים"
                items={accessories}
                setItems={setAccessories}
                itemSuggestions={itemSuggestions}
                onFetchSuggestions={(value: string, field: string) => {
                    return fetch(encodeURI(`${backendFirebaseUri}/items?catType=אביזר&search=${value}&searchFields=${field}`), {
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
            <InfoSectionMenu 
                title="מתכלים"
                items={consumables}
                setItems={setConsumables}
                itemSuggestions={itemSuggestions}
                onFetchSuggestions={(value: string, field: string) => {
                    return fetch(encodeURI(`${backendFirebaseUri}/items?catType=מתכלה&search=${value}&searchFields=${field}`), {
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
            <InfoSectionMenu 
                title="חלקי חילוף"
                items={spareParts}
                setItems={setSpareParts}
                itemSuggestions={itemSuggestions}
                onFetchSuggestions={(value: string, field: string) => {
                    return fetch(encodeURI(`${backendFirebaseUri}/items?catType=חלק חילוף&search=${value}&searchFields=${field}`), {
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

export default DeviceFields;
