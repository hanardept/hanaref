import React, { ChangeEvent, useState } from "react";
import { AbbreviatedItem, SupplierSummary } from "../../types/item_types";
import InfoSectionMenu from "./InfoSectionMenu";
import LabeledInput from "../UI/LabeledInput";
import UploadFile from "../UI/UploadFile";
import { backendFirebaseUri } from "../../backend-variables/address";
import { useAppSelector } from "../../hooks/redux-hooks";

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
    supplier: SupplierSummary | null;
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
    setSupplier: React.Dispatch<React.SetStateAction<SupplierSummary | null>>;
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

    const authToken = useAppSelector(state => state.auth.jwt);
    const [ itemSuggestions, setItemSuggestions ] = useState([]);

    const [ supplierSuggestions, setSupplierSuggestions ] = useState([]);

    return (
        <>
            <LabeledInput type="file" label="קישור לתמונה" value={imageLink}  placeholder="קישור לתמונה" 
                customInputElement={<UploadFile placeholder= "קישור לתמונה" url={imageLink} accept="image/png, image/jpeg" isUploading={isImageUploading} onChange={(e) => setImageLink(e.target.files?.[0] ?? '')} onClear={() => setImageLink("")}/>}/>
            <LabeledInput type="file" label="מדריך למשתמש" value={userManualLink} placeholder="מדריך למשתמש"
                customInputElement={<UploadFile placeholder="מדריך למשתמש" url={userManualLink} isUploading={isUserManualUploading} onChange={(e) => setUserManualLink(e.target.files?.[0] ?? '')} onClear={() => setUserManualLink("")}/>}/>                
            <LabeledInput type="file" label="הוראות הפעלה בעברית" value={hebrewManualLink} placeholder="הוראות הפעלה בעברית" 
                customInputElement={<UploadFile placeholder="הוראות הפעלה בעברית" url={hebrewManualLink} isUploading={isHebrewManualUploading} onChange={(e) => setHebrewManualLink(e.target.files?.[0] ?? '')} onClear={() => setHebrewManualLink("")}/>}/>
            <LabeledInput type="file" label="הוראות הנר" value={medicalEngineeringManualLink} placeholder="הוראות הנר" 
                customInputElement={<UploadFile placeholder="הוראות הנר" url={medicalEngineeringManualLink} isUploading={isMedicalEngineeringManualUploading} onChange={(e) => setMedicalEngineeringManualLink(e.target.files?.[0] ?? '')}  onClear={() => setMedicalEngineeringManualLink("")}/>}/>
            <LabeledInput type="file" label="תקן בחינה" value={qaStandardLink} placeholder="תקן בחינה"
                customInputElement={<UploadFile placeholder="תקן בחינה" url={qaStandardLink} isUploading={isQaStandardUploading} onChange={(e) => setQaStandardLink(e.target.files?.[0] ?? '')}  onClear={() => setQaStandardLink("")}/>}/>
            <LabeledInput type="file" label="Service Manual" value={serviceManualLink} placeholder="Service Manual" 
                customInputElement={<UploadFile placeholder="Service Manual" url={serviceManualLink} isUploading={isServiceManualUploading} onChange={(e) => setServiceManualLink(e.target.files?.[0] ?? '')}  onClear={() => setServiceManualLink("")}/>}/>
            <LabeledInput label="ספק בארץ" value={supplier} onChange={(e) => handleInput(setSupplier, e)} placeholder="ספק בארץ" />
            
            <DebouncingInput
                id="supplierSearch"
                className={classes.itemCat}
                inputValue={technicianSearchText}
                onValueChanged={(val: any) => {
                    setTechnicianSearchText(val);
                }}
                onSuggestionSelected={(t: any) => {
                    setTechnicians([...technicians, t ])
                    setAddTechniciansRequested(false)
                    setTechnicianSearchText("");
                }}
                getSuggestionValue={s => s.id}
                placeholder='חפש טכנאי (שם, ת.ז.)'
                suggestions={technicianSuggestions.filter(ts => technicians.every(t => t?.id !== ts.id))}
                onFetchSuggestions={(value: string) => {
                    fetchBackend(encodeURI(`technicians?search=${value}`), {
                        method: 'GET',
                        headers: {
                            'auth-token': authToken
                        }
                    })
                    .then((res) => res.json())
                    .then(jsonRes => setTechnicianSuggestions(jsonRes))
                    .catch((err) => console.log(`Error getting technician suggestions: ${err}`));
                }}
                renderSuggestion={t => <span>{t.id} {t.firstName} {t.lastName}</span>}
                onClearSuggestions={() => setTechnicianSuggestions([])}
                onBlur={() => {
                    if (!technicianSuggestions.find((t: any) => t.id === technicianSearchText || t.firstName === technicianSearchText || t.lastName === technicianSearchText)) {
                        setTechnicianSearchText("");
                    }
                }}
            />
            
            
            <InfoSectionMenu title="דגמים" items={models} setItems={setModels} />
            <InfoSectionMenu 
                title="אביזרים"
                items={accessories}
                setItems={setAccessories}
                itemSuggestions={itemSuggestions}
                allowNewItem={true}
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
                allowNewItem={true}
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
                allowNewItem={true}
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
