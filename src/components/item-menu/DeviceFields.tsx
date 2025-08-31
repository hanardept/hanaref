import React, { ChangeEvent, useCallback, useState } from "react";
import { AbbreviatedItem, SupplierSummary } from "../../types/item_types";
import InfoSectionMenu from "./InfoSectionMenu";
import LabeledInput from "../UI/LabeledInput";
import UploadFile from "../UI/UploadFile";
import { backendFirebaseUri, fetchBackend } from "../../backend-variables/address";
import { useAppSelector } from "../../hooks/redux-hooks";
import DebouncingInput from "../UI/DebouncingInput";
import classes from './ItemMenu.module.css';
import { MdEdit } from "react-icons/md";
import { default as SupplierListItem } from "../supplier-page/ListItem"

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
        hebrewManualLink, isHebrewManualUploading, supplier, models, accessories, consumables, spareParts, setImageLink, setQaStandardLink, setMedicalEngineeringManualLink, setUserManualLink, setServiceManualLink, setHebrewManualLink, setSupplier, setModels,
        setAccessories, setConsumables, setSpareParts
    } = props;

    const authToken = useAppSelector(state => state.auth.jwt);
    const [ itemSuggestions, setItemSuggestions ] = useState([]);

    const [ supplierSuggestions, setSupplierSuggestions ] = useState([]);
    const [ supplierSearchText, setSupplierSearchText ] = useState("");
    const [ showSupplierInput, setShowSupplierInput] = useState(false);

    const showSupplierListItem = !showSupplierInput && supplier;
    
    const fetchSupplier = useCallback(async (supplierId: string) => {
        const res = await fetchBackend(`suppliers/${supplierId}`, {
            headers: {
                'Content-Type': 'application/json',
                'auth-token': authToken
            }
        });
        const supplierDetails = await res.json();
        setSupplier(supplierDetails);
    }, [ authToken, setSupplier ]);    

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
            
            <div className={classes.inputGroup}>
                <label htmlFor="supplierSearch">ספק בארץ</label>                
                {showSupplierListItem ? (
                    <span className={classes.listItemContainer}>
                        <SupplierListItem
                            className={classes.supplierListItem}
                            textContentClassName={classes.itemTextContent}
                            _id={supplier?._id ?? ""}
                            supplier={supplier}
                            goToSupplierPage={() => setShowSupplierInput(true)}
                        />
                        <MdEdit
                            onClick={() => {
                                setShowSupplierInput(true);
                                setSupplierSearchText(supplier.name);
                            }}
                        />
                    </span>
                ) : (
                    <DebouncingInput
                        id="supplierSearch"
                        className={classes.itemCat}
                        inputValue={supplierSearchText}
                        onValueChanged={(val: any) => setSupplierSearchText(val)}
                        onValueErased={() => setSupplier(null)}
                        onSuggestionSelected={(s: any) => {
                            setSupplier(s);
                            fetchSupplier(s._id);
                            setShowSupplierInput(false)
                        }}
                        getSuggestionValue={s => s.name}
                        placeholder='חפש ספק (שם, מזהה במשרד הביטחון)'
                        suggestions={supplierSuggestions}
                        onFetchSuggestions={(value: string) => {
                            fetchBackend(encodeURI(`suppliers?search=${value}`), {
                                method: 'GET',
                                headers: {
                                    'auth-token': authToken
                                }
                            })
                            .then((res) => res.json())
                            .then(jsonRes => setSupplierSuggestions(jsonRes))
                            .catch((err) => console.log(`Error getting item suggestions: ${err}`));
                        }}
                        renderSuggestion={s => <span>{s.id} {s.name}</span>}
                        onClearSuggestions={() => { console.log(`clearing suggestions`); setSupplierSuggestions([]); }}
                        onBlur={() => {
                            if (!supplierSuggestions.find((s: any) => s.id === supplierSearchText || s.name === supplierSearchText)) {
                                setSupplierSearchText("");
                            }
                        }}
                    />
                )}
            </div>
            
            
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
