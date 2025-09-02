import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchBackend } from '../../backend-variables/address';
import { useAppDispatch, useAppSelector } from '../../hooks/redux-hooks';
import { viewingActions } from '../../store/viewing-slice';
import AreYouSure from '../UI/AreYouSure';
import BigButton from '../UI/BigButton';
import "./react-datepicker.css";
import classes from './CertificationMenu.module.css';
import { Certification } from '../../types/certification_types';
import DebouncingInput from '../UI/DebouncingInput';
import { default as ItemListItem } from '../item-search/ListItem';
import { default as TechnicianListItem } from '../technician-page/ListItem';
import { MdEdit } from "react-icons/md";
import { MdAddCircle, MdRemoveCircle } from "react-icons/md";

import DatePicker from "react-datepicker";
import moment from 'moment';
import { Role } from '../../types/user_types';
import LabeledInput from '../UI/LabeledInput';
import UploadFile from '../UI/UploadFile';
import { getFilename } from '../../utils';


interface ItemSummary {
    _id: string;
    cat: string;
    kitCats?: string[];
    name: string;
    certificationPeriodMonths?: number;
    imageLink?: string;
}

interface TechnicianSummary {
    _id: string;
    id: string;
    firstName: string;
    lastName: string;
}

const CertificationMenu = () => {
    const params = useParams();
    const { frontEndPrivilege, jwt: authToken, userId }  = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [id, setId] = useState("");
    const [itemSearchText, setItemSearchText] = useState("")
    const [item, setItem] = useState(null as ItemSummary | null);
    const [technicianSearchText, setTechnicianSearchText] = useState("");
    const [technicians, setTechnicians] = useState<(TechnicianSummary | null)[]>([]);
    const [certificationDocumentLink, setCertificationDocumentLink] = useState("" as (string | File));
    const [firstCertificationDate, setFirstCertificationDate] = useState(null as Date | null);
    const [lastCertificationDate, setLastCertificationDate] = useState(null as Date | null);
    const [plannedCertificationDate, setPlannedCertificationDate] = useState(null as Date | null);
    const [areYouSureDelete, setAreYouSureDelete] = useState(false);

    const [itemSuggestions, setItemSuggestions] = useState([] as ItemSummary[]);
    const [showItemInput, setShowItemInput] = useState(false);

    const [technicianSuggestions, setTechnicianSuggestions] = useState([] as TechnicianSummary[]);
    //const [showTechnicianInput, setShowTechnicianInput] = useState(false);
    const [addTechniciansRequested, setAddTechniciansRequested] = useState(false);

    const [isCertificationDocumentUploading, setIsCertificationDocumentUploading] = useState(false);

     const fetchItem = useCallback(async (itemCat: string) => {
        const res = await fetchBackend(`items/${itemCat}`, {
            headers: {
                'Content-Type': 'application/json',
                'auth-token': authToken
            }
        });
        const itemDetails = await res.json();
        setItem(itemDetails);
    }, [ authToken ]);

    useEffect(() => {        
        if (params.certificationid) {
            const getCertification = async () => {
                const fetchedCertification = await fetchBackend(`certifications/${params.certificationid}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'auth-token': authToken
                    }
                });
                return await fetchedCertification.json();
            };
            getCertification()
                .then((c: Certification) => {
                    setId(c._id);
                    setItemSearchText(c.item.cat);
                    setItem(c.item);
                    setTechnicianSearchText(c.user.id);
                    setTechnicians([ c.user ]);
                    setCertificationDocumentLink(c.certificationDocumentLink ?? "");
                    setFirstCertificationDate(c.firstCertificationDate ?? null);
                    setLastCertificationDate(c.lastCertificationDate ?? null);
                    setPlannedCertificationDate(c.plannedCertificationDate ?? null);
                    return c.item?.cat;
                })
                .then(fetchItem)
                .catch(e => console.log(`Error fetching certification details: ${e}`));
        }
        
    }, [params.certificationid, fetchItem, authToken]);

    useEffect(() => {
        const fetchTechnician = async () => {
            const fetchedTechnician = await fetchBackend(`technicians/${userId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'auth-token': authToken
                }
            });
            return await fetchedTechnician.json();
        }
        if (frontEndPrivilege !== Role.Admin) {
            console.log(`fetching own technician, id: ${userId}`);
            fetchTechnician().then(technician => setTechnicians([ technician ]))
        }
    }, [ userId, authToken, frontEndPrivilege ])

    console.log(`last certification type: ${typeof lastCertificationDate}`);

    const saveLinks = (certificationId: string): Promise<Record<string, string>> => {
        console.log(`saving links....`);
        const getIfFile = (obj : { value: string | File, setter: React.Dispatch<React.SetStateAction<string | File>>, contentType: string, isUploadingSetter?: React.Dispatch<React.SetStateAction<boolean>> })
            : { value: string | File, setter: React.Dispatch<React.SetStateAction<string | File>>, contentType: string, isUploadingSetter?: React.Dispatch<React.SetStateAction<boolean>> } | undefined => 
                (obj.value && typeof obj.value !== 'string') ? obj : undefined ;
        const newFileFields: Record<string, { value: string | File, setter: React.Dispatch<React.SetStateAction<string | File>>, contentType: string, isUploadingSetter?: React.Dispatch<React.SetStateAction<boolean>> } | undefined> = {//: Array<keyof typeof itemDetails> = [ 
            certificationDocumentLink: getIfFile({ value: certificationDocumentLink, setter: setCertificationDocumentLink, contentType: 'application/pdf', isUploadingSetter: setIsCertificationDocumentUploading }),
        };

        const newLinks: Record<string, string> = {};
        return Promise.all(Object.keys(newFileFields).map(key => {
            if (!newFileFields[key]) {
                return undefined;
            }
            const { value, setter, isUploadingSetter } = newFileFields[key]!;
            console.log(`file type: ${(value as File).type}`)
            return fetchBackend(encodeURI(`certifications/${certificationId}/url`), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'auth-token': authToken
                },
                body: JSON.stringify({ 
                    filename: (value as File).name,
                    contentType: (value as File).type
                })
            })
            .then(res => res.json())
            .then(json => {
                const urlObj = new URL(json.url);
                urlObj.search = '';
                const objectUrl = urlObj.toString();
                setter(objectUrl);
                isUploadingSetter?.(true);
                return fetch(json.url, {
                    method: 'PUT',
                    headers: { 'Content-Type': (value as File).type },
                    body: value
                }).then(res => { 
                    newLinks[key] = objectUrl;
                    isUploadingSetter?.(false);
                })
            }
            )
        })).then(() => newLinks);
    }    
    
    const saveCertification = ({ certificationId, saveLinks, newLinks, technicianId } : 
        { certificationId?: string, saveLinks: boolean, newLinks: Record<string, string>, technicianId?: string }): Promise<any> => {

        const certificationDetails = {
            id: id,
            item,
            users: technicianId ? [ { _id: technicianId } ] : technicians,
            certificationDocumentLink: saveLinks ? (newLinks.certificationDocumentLink ?? certificationDocumentLink) : undefined,
            firstCertificationDate,
            lastCertificationDate,
            plannedCertificationDate,
        };

        console.log(`Saving certification with details: ${JSON.stringify(certificationDetails, null, 4)}`);

        const { users, ...restDetails } = certificationDetails;
        return Promise.all(users.map((technician) => {
            console.log(`saving certification for user: ${technician!._id}, item: ${item?._id}`);
            const body = JSON.stringify({ ...restDetails, user: technician});
            if (certificationId) {
                return fetchBackend(encodeURI(`certifications/${certificationId}`), {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'auth-token': authToken
                    },
                    body
                });                
            } else {
                return fetchBackend(`certifications`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'auth-token': authToken
                    },
                    body
                })
            }
        }));
    }

    const handleSave = () => {
        if (!item || !technicians?.length ||
            (!lastCertificationDate && !plannedCertificationDate)) {
            // if the required fields of the Certification mongo schema are not filled then don't save
            console.log("Please make sure to enter an item name, technician and either last or planned certification date");
            return;
        }

        if (params.certificationid) {
            saveLinks(params.certificationid)
                .then(newLinks => saveCertification({ certificationId: params.certificationid, saveLinks: true, newLinks }))
                .then(() => {
                    dispatch(viewingActions.changesAppliedToCertification(false));
                    navigate(-1);
                })
        } else {
            saveCertification({ saveLinks: false, newLinks: {} })
                .then(ress => ress[0].json())
                .then(json =>
                    (technicians.length === 1) ?
                        saveLinks(json.id).then(newLinks => ({ certificationId: json.id, newLinks})) :
                        Promise.resolve({ certificationId: json.id, newLinks: {} })
                )
                .then(({ certificationId, newLinks}) => {
                    if (technicians.length === 1) {
                        saveCertification({ certificationId, saveLinks: true, newLinks, technicianId: technicians[0]?._id })
                    }
                })
                .then(() => {
                    dispatch(viewingActions.changesAppliedToCertification(false));
                    navigate(-1);
                });
        }
    }

    // edit mode only:
    const handleDelete = () => {
        fetchBackend(encodeURI(`certifications/${params.certificationid}`), {
            method: 'DELETE',
            headers: {
                'auth-token': authToken
            }
        })
        .then((res) => {
            console.log("Successfully deleted certification!");
            dispatch(viewingActions.changesAppliedToCertification(false));
            setAreYouSureDelete(false);
            navigate("/certifications");
        }).catch((err) => console.log(`Error deleting certification: ${err}`));
    }


    const showItemListItem = !showItemInput && item;
    //const showTechnicianListItem = !showTechnicianInput && technician;

    const isPastDate = (date: Date) => {
        return date < new Date();
    }

    const isoDate = (date: Date | undefined): string => {
        if (!date) return "";
        return date.toLocaleDateString("he-IL").replace(/\./g, "-");
    }     

    const certificationPeriodMonths = item?.certificationPeriodMonths ?? 0;
    const lastCertificationExpirationDate = lastCertificationDate ? moment(lastCertificationDate).add(certificationPeriodMonths ?? 0, 'months').toDate() : undefined; 

    const deviceCat = "מכשיר";

    return (
        <div className={classes.certificationMenu}>
            <h1>{params.certificationid ? "עריכת הסמכה" : "הוספת הסמכה"}</h1>
            <div className={classes.inputGroup}>
                <label htmlFor="itemSearch">מכשיר</label>                
                {showItemListItem ? (
                    <span className={classes.listItemContainer}>
                        <ItemListItem
                            className={classes.itemListItem}
                            textContentClassName={classes.itemTextContent}
                            imageClassName={classes.itemListItemImage}
                            cat={item.cat}
                            kitCat={item.kitCats?.[0]}
                            name={item.name}
                            imageLink={item.imageLink}
                            shouldBeColored={false}
                            goToItemPage={() => setShowItemInput(true)}
                        />
                        <MdEdit
                            onClick={() => setShowItemInput(true)}
                        />
                    </span>
                ) : (
                    <DebouncingInput
                        id="itemSearch"
                        className={classes.itemCat}
                        inputValue={itemSearchText}
                        onValueChanged={(val: any) => setItemSearchText(val)}
                        onSuggestionSelected={(s: any) => {
                            setItem(s);
                            fetchItem(s.cat);
                            setShowItemInput(false)
                        }}
                        getSuggestionValue={s => s.cat}
                        placeholder='חפש מכשיר (שם, מק"ט)'
                        suggestions={itemSuggestions}
                        onFetchSuggestions={(value: string) => {
                            fetchBackend(encodeURI(`items?catType=${deviceCat}&search=${value}`), {
                                method: 'GET',
                                headers: {
                                    'auth-token': authToken
                                }
                            })
                            .then((res) => res.json())
                            .then(jsonRes => setItemSuggestions(jsonRes))
                            .catch((err) => console.log(`Error getting item suggestions: ${err}`));
                        }}
                        renderSuggestion={s => <span>{s.cat} {s.name}</span>}
                        onClearSuggestions={() => { console.log(`clearing suggestions`); setItemSuggestions([]); }}
                        onBlur={() => {
                            if (!itemSuggestions.find((s: any) => s.cat === itemSearchText || s.name === itemSearchText)) {
                                setItemSearchText("");
                            }
                        }}
                    />
                )}
            </div>
            { frontEndPrivilege === Role.Admin && 
            <div className={classes.inputGroup}>
                <label htmlFor="technicianSearch">טכנאי</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {technicians.map((technician, i) =>
                        <span className={classes.listItemContainer}>
                            <TechnicianListItem
                                className={classes.technicianListItem}
                                textContentClassName={classes.technicianTextContent}
                                id={technician?.id ?? ''}
                                firstName={technician?.firstName ?? ''}
                                lastName={technician?.lastName ?? ''}
                                shouldBeColored={false}
                            />
                            {params.certificationid ? (
                            <MdEdit
                                onClick={() => setTechnicians([])}
                            />) : (
                            <MdRemoveCircle
                                onClick={() => setTechnicians(technicians.filter((_, index) => index !== i))}
                            />)}
                        </span>
                    )}
                {(addTechniciansRequested || !technicians?.length) && (
                    <DebouncingInput
                        id="technicianSearch"
                        className={classes.itemCat}
                        inputValue={technicianSearchText}
                        onValueChanged={(val: any) => {
                            setTechnicianSearchText(val);
                        }}
                        onSuggestionSelected={(t: any) => {
                            setTechnicians([...technicians, t ]);
                            if (technicians.length) {
                                setCertificationDocumentLink("");
                            }
                            setAddTechniciansRequested(false)
                            setTechnicianSearchText("");
                        }}
                        getSuggestionValue={s => s.id}
                        placeholder='חפש טכנאי (שם, ת.ז.)'
                        suggestions={technicianSuggestions.filter(ts => technicians.every(t => t?._id !== ts._id))}
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
                )}
                {(!params.certificationid && !addTechniciansRequested && technicians.length) ? 
                    <span className={classes.addButtonContainer}>
                        <MdAddCircle onClick={() => setAddTechniciansRequested(true) }/>
                    </span> : <></>}
                </div>
            </div>}
            <div className={classes.inputGroup}>
                <label htmlFor="firstCertificationDate">תאריך הסמכה ראשונה</label>
                <DatePicker
                    id="firstCertificationDate"
                    className={classes.datepicker}
                    selected={firstCertificationDate}
                    dateFormat="dd/MM/yyyy"
                    placeholderText='תאריך הסמכה ראשונה'
                    maxDate={new Date(Math.min(...[new Date(lastCertificationDate ?? new Date()), new Date()].filter(Boolean).map(d => d.getTime())))}
                    onChange={val => {
                        setFirstCertificationDate(val);
                        if (!lastCertificationDate) {
                            setLastCertificationDate(val);
                        }
                    }}
                    popperPlacement="bottom"
                />
            </div>
            <div className={classes.inputGroup}> 
                <label htmlFor="lastCertificationDate">תאריך הסמכה אחרונה</label>
                <DatePicker
                    id="lastCertificationDate"
                    className={classes.datepicker}
                    selected={lastCertificationDate}
                    //filterDate={isPastDate}
                    dateFormat="dd/MM/yyyy"
                    maxDate={new Date()}
                    minDate={firstCertificationDate ?? undefined}
                    placeholderText='תאריך הסמכה אחרונה'
                    onChange={val => {
                        setLastCertificationDate(val);
                        if (!firstCertificationDate) {
                            setFirstCertificationDate(val);
                        }
                    }}
                    popperPlacement="bottom"
                />
            </div>  
            <span>{`תוקף הסמכה אחרונה בחודשים: ${item?.certificationPeriodMonths ?? ''}`}</span>
            <span>{`תאריך תפוגת הסמכה אחרונה: ${isoDate(lastCertificationExpirationDate)}`}</span>
            <div className={classes.inputGroup}>
                <label htmlFor="plannedCertificationDate">תאריך הסמכה צפויה</label>
                <DatePicker
                    id="plannedCertificationDate"
                    className={classes.datepicker}
                    selected={plannedCertificationDate}
                    filterDate={date => !isPastDate(date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText='תאריך הסמכה צפויה'
                    onChange={setPlannedCertificationDate}
                    popperPlacement="bottom"
                />
            </div>  
            {/* <LabeledInput type="file" label=">קישור לתעודת הסמכה" value={getFilename(certificationDocumentLink)} placeholder="מדריך למשתמש" */}
            {technicians.length <= 1 && <div className={classes.inputGroup}>
                <label htmlFor="certificationDocumentLink">קישור לתעודת הסמכה</label>
                <UploadFile id="certificationDocumentLink" placeholder="קישור לתעודת הסמכה" url={getFilename(certificationDocumentLink)} isUploading={isCertificationDocumentUploading} disabled={!lastCertificationDate} onChange={(e) => setCertificationDocumentLink(e.target.files?.[0] ?? '')} onClear={() => setCertificationDocumentLink("")}/>
            </div>}
            {/* <div className={classes.inputGroup}> 
                <label htmlFor="certificationDocumentLink">קישור לתעודת הסמכה</label>
                <input
                    id="certificationDocumentLink"
                    type="text"
                    placeholder='קישור לתעודת הסמכה'
                    value={certificationDocumentLink}
                    disabled={!lastCertificationDate}
                    onChange={(e) => handleInput(setCertificationDocumentLink, e)}
                />      
            </div> */}
            <BigButton text="שמור" action={handleSave} overrideStyle={{ marginTop: "2.5rem" }} />
            {params.certificationid && <BigButton text="מחק הסמכה" action={() => setAreYouSureDelete(true)} overrideStyle={{ marginTop: "1rem", backgroundColor: "#CE1F1F" }} />}
            {areYouSureDelete && <AreYouSure text="האם באמת למחוק הסמכה?" leftText='מחק' leftAction={handleDelete} rightText='לא' rightAction={() => setAreYouSureDelete(false)} />}
        </div>
    )
};

export default CertificationMenu;