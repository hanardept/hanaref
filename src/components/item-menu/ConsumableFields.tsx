import React, { ChangeEvent, useCallback, useState } from "react";
import { AbbreviatedItem, SupplierSummary } from "../../types/item_types";
import InfoSectionMenu from "./InfoSectionMenu";
import LabeledInput from "../UI/LabeledInput";
import UploadFile from "../UI/UploadFile";
import { backendFirebaseUri, fetchBackend } from "../../backend-variables/address";
import { useAppSelector } from "../../hooks/redux-hooks";
import classes from './ItemMenu.module.css';
import { MdEdit } from "react-icons/md";
import { default as SupplierListItem } from "../supplier-page/ListItem"
import DebouncingInput from "../UI/DebouncingInput";

interface ConsumableFieldsProps {
    imageLink: string;
    isImageUploading?: boolean;
    userManualLink: string;
    isUserManualUploading?: boolean;
    supplier: SupplierSummary | null;
    lifeSpan: string;
    models: AbbreviatedItem[];
    belongsToDevices: AbbreviatedItem[];
    handleInput: (setFunc: React.Dispatch<React.SetStateAction<string>>, event: ChangeEvent<HTMLInputElement>) => void;
    setImageLink: React.Dispatch<React.SetStateAction<string | File>>;
    setUserManualLink: React.Dispatch<React.SetStateAction<string | File>>;
    setSupplier: React.Dispatch<React.SetStateAction<SupplierSummary | null>>;
    setLifeSpan: React.Dispatch<React.SetStateAction<string>>;
    setModels: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
    setBelongsToDevices: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
}

const ConsumableFields = (props: ConsumableFieldsProps) => {
    const { imageLink, isImageUploading, userManualLink, isUserManualUploading, supplier, lifeSpan, models, belongsToDevices, handleInput, setImageLink, setUserManualLink, setSupplier, setLifeSpan, setModels, setBelongsToDevices } = props;

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
            <LabeledInput label="אורך חיים בחודשים" value={lifeSpan} onChange={(e) => handleInput(setLifeSpan, e)} placeholder="אורך חיים בחודשים" />
            <LabeledInput type="file" label="קישור לתמונה" value={imageLink} placeholder="קישור לתמונה" 
                customInputElement={<UploadFile placeholder="קישור לתמונה" url={imageLink} isUploading={isImageUploading} accept="image/png, image/jpeg" onChange={(e) => setImageLink(e.target.files?.[0] ?? '')} onClear={() => setImageLink("")}/>}/>
            <LabeledInput type="file" label="מדריך למשתמש" value={userManualLink} placeholder="מדריך למשתמש" 
                customInputElement={<UploadFile placeholder="מדריך למשתמש" url={userManualLink} isUploading={isUserManualUploading} onChange={(e) => setUserManualLink(e.target.files?.[0] ?? '')} onClear={() => setUserManualLink("")}/>}/>

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
                        placeholder='חפש ספק (שם, מזהה במשדד הביטחון)'
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

export default ConsumableFields;
