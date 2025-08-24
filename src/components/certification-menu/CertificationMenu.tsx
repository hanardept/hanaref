import { ChangeEvent, useCallback, useEffect, useState } from 'react';
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


interface ItemSummary {
    _id: string;
    cat: string;
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
    const [certificationDocumentLink, setCertificationDocumentLink] = useState("");
    const [firstCertificationDate, setFirstCertificationDate] = useState(null as Date | null);
    const [lastCertificationDate, setLastCertificationDate] = useState(null as Date | null);
    const [plannedCertificationDate, setPlannedCertificationDate] = useState(null as Date | null);
    const [areYouSureDelete, setAreYouSureDelete] = useState(false);

    const [itemSuggestions, setItemSuggestions] = useState([] as ItemSummary[]);
    const [showItemInput, setShowItemInput] = useState(false);

    const [technicianSuggestions, setTechnicianSuggestions] = useState([] as TechnicianSummary[]);
    //const [showTechnicianInput, setShowTechnicianInput] = useState(false);
    const [addTechniciansRequested, setAddTechniciansRequested] = useState(false);

    const certificationDetails = {
        id: id,
        item,
        users: technicians,
        certificationDocumentLink,
        firstCertificationDate,
        lastCertificationDate,
        plannedCertificationDate,
    };

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

    const handleInput = (setFunc: (val: string) => any, event: ChangeEvent<HTMLInputElement>) => {
        setFunc(event.target.value);
        dispatch(viewingActions.changesAppliedToCertification(true));
    }

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
    
    const handleSave = () => {
        console.log(`saving with technicians: ${certificationDetails.users}`);
        if (!certificationDetails.item || !certificationDetails.users?.length ||
            (!certificationDetails.lastCertificationDate && !certificationDetails.plannedCertificationDate)) {
            // if the required fields of the Certification mongo schema are not filled then don't save
            console.log("Please make sure to enter an item name, technician and either last or planned certification date");
            return;
        }

        console.log(`Saving certification with details: ${JSON.stringify(certificationDetails, null, 4)}`);

        const { users, ...restDetails } = certificationDetails;
        const promises = users.map((technician) => {
            const body = JSON.stringify({ ...restDetails, user: technician});
            if (!params.certificationid) {
                return fetchBackend(`certifications`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'auth-token': authToken
                    },
                    body
                })
            } else {
                return fetchBackend(encodeURI(`certifications/${params.certificationid}`), {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'auth-token': authToken
                    },
                    body
                });
            }
        })
        return Promise.all(promises)
            .then(() => {
                console.log("Successfully saved certification!");
                dispatch(viewingActions.changesAppliedToCertification(false));
                navigate(-1);
            })
            .catch((err) => console.log(`Error saving/updating certification: ${err}`));
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
            <div className={classes.inputGroup}> 
                <label htmlFor="certificationDocumentLink">קישור לתעודת הסמכה</label>
                <input
                    id="certificationDocumentLink"
                    type="text"
                    placeholder='קישור לתעודת הסמכה'
                    value={certificationDocumentLink}
                    disabled={!lastCertificationDate}
                    onChange={(e) => handleInput(setCertificationDocumentLink, e)}
                />      
            </div>
            <BigButton text="שמור" action={handleSave} overrideStyle={{ marginTop: "2.5rem" }} />
            {params.technicianid && <BigButton text="מחק הסמכה" action={() => setAreYouSureDelete(true)} overrideStyle={{ marginTop: "1rem", backgroundColor: "#CE1F1F" }} />}
            {areYouSureDelete && <AreYouSure text="האם באמת למחוק הסמכה?" leftText='מחק' leftAction={handleDelete} rightText='לא' rightAction={() => setAreYouSureDelete(false)} />}
        </div>
    )
};

export default CertificationMenu;