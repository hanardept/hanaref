import React, { ChangeEvent, useCallback, useState } from "react";
import { AbbreviatedItem, SupplierSummary } from "../../types/item_types";
import InfoSectionMenu from "./InfoSectionMenu";
import { useAppSelector } from "../../hooks/redux-hooks";
import { backendFirebaseUri, fetchBackend } from "../../backend-variables/address";
import LabeledInput from "../UI/LabeledInput";
import UploadFile from "../UI/UploadFile";
import DebouncingInput from "../UI/DebouncingInput";
import classes from './ItemMenu.module.css';
import { MdEdit } from "react-icons/md";
import { default as SupplierListItem } from "../supplier-page/ListItem"

interface AccessoryFieldsProps {
    imageLink: string;
    isImageUploading?: boolean;
    userManualLink: string;
    isUserManualUploading?: boolean;
    supplier: SupplierSummary | null | undefined;
    models: AbbreviatedItem[];
    belongsToDevices: AbbreviatedItem[];
    handleInput: (setFunc: React.Dispatch<React.SetStateAction<string>>, event: ChangeEvent<HTMLInputElement>) => void;
    setImageLink?: React.Dispatch<React.SetStateAction<string | File>>;
    setUserManualLink?: React.Dispatch<React.SetStateAction<string | File>>;
    setSupplier?: React.Dispatch<React.SetStateAction<SupplierSummary | null | undefined>>;
    setModels?: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
    setBelongsToDevices?: React.Dispatch<React.SetStateAction<AbbreviatedItem[]>>;
    fields?: string[];
    elementWrapper?: (element: JSX.Element, field: string) => JSX.Element;
}

const AccessoryFields = (props: AccessoryFieldsProps) => {
    const { imageLink, isImageUploading, userManualLink, isUserManualUploading, supplier, models, belongsToDevices, setImageLink, setUserManualLink, setSupplier, setModels, setBelongsToDevices, fields, elementWrapper } = props;

    const authToken = useAppSelector(state => state.auth.jwt);
    const [ itemSuggestions, setItemSuggestions ] = useState([]);    

    const [ supplierSuggestions, setSupplierSuggestions ] = useState([]);
    const [ supplierSearchText, setSupplierSearchText ] = useState("");
    const [ showSupplierInput, setShowSupplierInput] = useState(false);

    const actualSupplier = {
        supplier: undefined as SupplierSummary | null | undefined,
        isParent: false,
    };
    if (supplier !== undefined) {
        actualSupplier.supplier = supplier;
    } else {
        actualSupplier.supplier = belongsToDevices?.sort((d1, d2) => new Date(d1.createdAt!).getTime() - new Date(d2.createdAt!).getTime()).find(d => d.supplier)?.supplier;
        actualSupplier.isParent = true;
    }

    const showSupplierListItem = actualSupplier.supplier && !showSupplierInput;
    
     const fetchSupplier = useCallback(async (supplierId: string) => {
        const res = await fetchBackend(`suppliers/${supplierId}`, {
            headers: {
                'Content-Type': 'application/json',
                'auth-token': authToken
            }
        });
        const supplierDetails = await res.json();
        setSupplier?.(supplierDetails);
    }, [ authToken, setSupplier ]);  

    const namedElements = [
        { name: 'imageLink', element:
            <LabeledInput type="file" label="קישור לתמונה" value={imageLink} placeholder="קישור לתמונה" 
                customInputElement={<UploadFile placeholder="קישור לתמונה" url={imageLink} accept="image/png, image/jpeg" isUploading={isImageUploading} onChange={(e) => setImageLink?.(e.target.files?.[0] ?? '')} onClear={() => setImageLink?.("")}/>}/>
        },
        { name: 'userManualLink', element:
            <LabeledInput type="file" label="מדריך למשתמש" value={userManualLink} placeholder="מדריך למשתמש" 
                customInputElement={<UploadFile placeholder="מדריך למשתמש" url={userManualLink} isUploading={isUserManualUploading} onChange={(e) => setUserManualLink?.(e.target.files?.[0] ?? '')} onClear={() => setUserManualLink?.("")}/>}/>
        },
        {name: 'supplier', element:
            <div className={classes.inputGroup}>
                <label htmlFor="supplierSearch">ספק בארץ</label>      
                <div className={classes.supplierRow}>         
                    {showSupplierListItem ? (
                        <span className={classes.listItemContainer}>
                            <SupplierListItem
                                className={classes.supplierListItem}
                                textContentClassName={classes.itemTextContent}
                                _id={actualSupplier.supplier?._id ?? ""}
                                supplier={actualSupplier.supplier!}
                                goToSupplierPage={() => setShowSupplierInput(true)}
                                customElement={actualSupplier.isParent ? <span className={classes.parentSupplierBadge}>עפ"י מכשיר מקושר</span> : undefined}
                            />
                            {supplier !== undefined && <MdEdit
                                onClick={() => {
                                    setShowSupplierInput(true);
                                    setSupplierSearchText(actualSupplier.supplier!.name);
                                }}
                            />}
                        </span>
                    ) : (
                        <DebouncingInput
                            id="supplierSearch"
                            disabled={supplier === undefined}
                            className={classes.itemCat}
                            inputValue={supplierSearchText}
                            onValueChanged={(val: any) => setSupplierSearchText(val)}
                            onValueErased={() => setSupplier?.(null)}
                            onSuggestionSelected={(s: any) => {
                                setSupplier?.(s);
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
                    <LabeledInput 
                        label="ממכשיר"
                        type="checkbox"
                        checked={supplier === undefined}
                        onChange={v => {
                            setSupplier?.(v.target.checked ? undefined : null);
                            setSupplierSearchText("");
                        }}/>
                </div>
            </div>
        },
        { name: 'models', element:
            <InfoSectionMenu title="דגמים" items={models} setItems={setModels} />
        },
        { name: 'belongsToDevices', element:
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
        }
    ];

    
    return <>
        {
            namedElements
            .filter(({ name, element }) => element && (!fields || fields.includes(name)))
            .map(({ element, name }) => elementWrapper ? elementWrapper(element!, name) : element)
        }
        </>
}

export default AccessoryFields;
