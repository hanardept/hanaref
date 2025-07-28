import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { backendFirebaseUri } from '../../backend-variables/address';
import { useAppDispatch, useAppSelector } from '../../hooks/redux-hooks';
import { viewingActions } from '../../store/viewing-slice';
import AreYouSure from '../UI/AreYouSure';
import BigButton from '../UI/BigButton';
import "./react-datepicker.css";
import classes from './CertificationMenu.module.css';
import { Certification } from '../../types/certification_types';
import DebouncingInput from './DebouncingInput';
import { default as ItemListItem } from '../item-search/ListItem';
import { default as TechnicianListItem } from '../technician-page/ListItem';
import { MdEdit } from "react-icons/md";
import DatePicker from "react-datepicker";
import moment from 'moment';


interface ItemSummary {
    _id: string;
    cat: string;
    name: string;
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
    const authToken = useAppSelector(state => state.auth.jwt);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [id, setId] = useState("");
    const [itemSearchText, setItemSearchText] = useState("")
    const [item, setItem] = useState(null as ItemSummary | null);
    // const [itemCat, setItemCat] = useState("");
    // const [itemName, setItemName] = useState("");
    // const [itemImageLink, setItemImageLink] = useState("");
    const [technicianSearchText, setTechnicianSearchText] = useState("");
    const [technician, setTechnician] = useState(null as TechnicianSummary | null);
    // const [technicianFirstName, setTechnicianFirstName] = useState("");
    // const [technicianLastName, setTechnicianLastName] = useState("");
    const [certificationDocumentLink, setCertificationDocumentLink] = useState("");
    const [firstCertificationDate, setFirstCertificationDate] = useState(null as Date | null);
    const [lastCertificationDate, setLastCertificationDate] = useState(null as Date | null);
    const [lastCertificationDurationMonths, setLastCertificationDurationMonths] = useState(null as number | null);
    //const [lastCertificationExpirationDate, setLastCertificationExpirationDate] = useState(null as unknown as Date);
    const [plannedCertificationDate, setPlannedCertificationDate] = useState(null as Date | null);
    const [areYouSureDelete, setAreYouSureDelete] = useState(false);

    const [itemSuggestions, setItemSuggestions] = useState([] as ItemSummary[]);
    const [showItemInput, setShowItemInput] = useState(false);

    const [technicianSuggestions, setTechnicianSuggestions] = useState([] as TechnicianSummary[]);
    const [showTechnicianInput, setShowTechnicianInput] = useState(false);

    const certificationDetails = {
        id: id,
        item,
        technician,
        certificationDocumentLink,
        firstCertificationDate,
        lastCertificationDate,
        lastCertificationDurationMonths,
        plannedCertificationDate,
    };

    useEffect(() => {        
        if (params.certificationid) {
            const getCertification = async () => {
                const fetchedCertification = await fetch(`${backendFirebaseUri}/certifications/${params.certificationid}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'auth-token': authToken
                    }
                });
                return await fetchedCertification.json();
            };
            getCertification().then((c: Certification) => {
                setId(c._id);
                setItemSearchText(c.item.cat);
                setItem(c.item);
                setTechnicianSearchText(c.technician.id);
                setTechnician(c.technician);
                setCertificationDocumentLink(c.certificationDocumentLink ?? "");
                setFirstCertificationDate(c.firstCertificationDate ?? null);
                setLastCertificationDate(c.lastCertificationDate ?? null);
                setLastCertificationDurationMonths(c.lastCertificationDurationMonths ?? null);
                setPlannedCertificationDate(c.plannedCertificationDate ?? null);
            }).catch(e => console.log(`Error fetching certification details: ${e}`));
        }
       
    }, [params.certificationid, authToken]);

    const handleInput = (setFunc: (val: string) => any, event: ChangeEvent<HTMLInputElement>) => {
        setFunc(event.target.value);
        dispatch(viewingActions.changesAppliedToCertification(true));
    }
    
    const handleSave = () => {

        if (!certificationDetails.item || !certificationDetails.technician ||
            (!certificationDetails.lastCertificationDate && !certificationDetails.plannedCertificationDate)) {
            // if the required fields of the Certification mongo schema are not filled then don't save
            console.log("Please make sure to enter an item name, technician and either last or planned certification date");
            return;
        }

        console.log(`Saving certification with details: ${JSON.stringify(certificationDetails, null, 4)}`);

        if (!params.certificationid) {
            fetch(`${backendFirebaseUri}/certifications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'auth-token': authToken
                },
                body: JSON.stringify(certificationDetails)
            }).then((res) => {
                console.log("success saving certification");
                dispatch(viewingActions.changesAppliedToCertification(false));
                navigate(-1);
            })
            .catch((err) => console.log(`Error saving certification: ${err}`));
        }
        if (params.certificationid) {
            fetch(encodeURI(`${backendFirebaseUri}/certifications/${params.certificationid}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'auth-token': authToken
                },
                body: JSON.stringify(certificationDetails)
            }).then((res) => {
                console.log("success updating certification");
                dispatch(viewingActions.changesAppliedToCertification(false));
                navigate(-1);
            })
            .catch((err) => console.log(`Error updating certification: ${err}`));
        }
    }
    // edit mode only:
    const handleDelete = () => {
        fetch(encodeURI(`${backendFirebaseUri}/certifications/${params.certificationid}`), {
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
    const showTechnicianListItem = !showTechnicianInput && technician;

    const isPastDate = (date: Date) => {
        return date < new Date();
    }

    const isoDate = (date: Date | undefined): string => {
        if (!date) return "";
        return date.toLocaleDateString("he-IL").replace(/\./g, "-");
    }    

    const lastCertificationExpirationDate = lastCertificationDate ? moment(lastCertificationDate).add(lastCertificationDurationMonths ?? 0, 'months').toDate() : undefined; 

    return (
        <div className={classes.certificationMenu}>
            <h1>{params.certificationid ? "עריכת הסמכה" : "הוספת הסמכה"}</h1>
            {showItemListItem ? (
                <span className={classes.editableItemListItem}>
                    <ItemListItem
                        className={classes.itemListItem}
                        textContentClassName={classes.itemTextContent}
                        imageClassName={classes.itemListItemImage}
                        cat={item.cat}
                        name={item.name}
                        imageLink={item.imageLink}
                        shouldBeColored={false}
                    />
                    <MdEdit
                        onClick={() => setShowItemInput(true)}
                    />
                </span>
            ) : (
            <DebouncingInput
                id="react-autosuggest_cat"
                className={classes.itemCat}
                inputValue={itemSearchText}
                onValueChanged={(val: any) => {
                    console.log(`item cat changed to: ${val}`);
                    setItemSearchText(val);
                }}
                onSuggestionSelected={(s: any) => {
                    console.log(`item cat selected: ${s.cat}`);
                    setItem(s);
                    setShowItemInput(false)
                }}
                getSuggestionValue={s => s.cat}
                placeholder='חפש מכשיר (שם, מק"ט)'
                suggestions={itemSuggestions}
                onFetchSuggestions={(value: string) => {
                    fetch(encodeURI(`${backendFirebaseUri}/items?search=${value}`), {
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
                    // console.log(`itemName: ${itemCat}, itemSuggestions: ${JSON.stringify(itemSuggestions, null, 4 )}`);
                    if (!itemSuggestions.find((s: any) => s.cat === itemSearchText || s.name === itemSearchText)) {
                        console.log(`couldn't find`)
                        setItemSearchText("");
                    }
                }}
            />)}
            {showTechnicianListItem ? (
                <span style={{ display: "flex", flexDirection: "row", justifyItems: 'flex-end', alignItems: "center", gap: "1rem" }}>
                    <TechnicianListItem
                        className={classes.technicianListItem}
                        textContentClassName={classes.technicianTextContent}
                        id={technician.id}
                        firstName={technician.firstName}
                        lastName={technician.lastName}
                        shouldBeColored={false}
                    />
                    <MdEdit
                        onClick={() => setShowTechnicianInput(true)}
                    />
                </span>
            ) : (
            <DebouncingInput
                id="react-autosuggest_technician"
                className={classes.itemCat}
                inputValue={technicianSearchText}
                onValueChanged={(val: any) => {
                    setTechnicianSearchText(val);
                }}
                onSuggestionSelected={(t: any) => {
                    setTechnician(t)
                    setShowTechnicianInput(false)
                }}
                getSuggestionValue={s => s.id}
                placeholder='חפש טכנאי (שם, ת.ז.)'
                suggestions={technicianSuggestions}
                onFetchSuggestions={(value: string) => {
                    fetch(encodeURI(`${backendFirebaseUri}/technicians?search=${value}`), {
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
            />)}
            <span>
                <DatePicker
                    className={classes.datepicker}
                    selected={firstCertificationDate}
                    filterDate={isPastDate} dateFormat="dd/MM/yyyy"
                    placeholderText='תאריך הסמכה ראשונה'
                    onChange={setFirstCertificationDate}
                    popperPlacement="bottom"
                />
            </span>
            <span>
                <DatePicker
                    className={classes.datepicker}
                    selected={lastCertificationDate}
                    filterDate={isPastDate}
                    dateFormat="dd/MM/yyyy"
                    placeholderText='תאריך הסמכה אחרונה'
                    onChange={setLastCertificationDate}
                    popperPlacement="bottom"
                />
            </span>  
            <input type="number" placeholder="אורך הסמכה אחרונה בחודשים" value={lastCertificationDurationMonths ?? ''} disabled={!lastCertificationDate} onChange={(e) => 
                handleInput(val => Number.parseInt(val) && setLastCertificationDurationMonths(+val), e)} />
            <span>{`תאריך תפוגת הסמכה אחרונה: ${isoDate(lastCertificationExpirationDate)}`}</span>
            <span>
                <DatePicker
                    className={classes.datepicker}
                    selected={plannedCertificationDate}
                    filterDate={date => !isPastDate(date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText='תאריך הסמכה צפויה'
                    onChange={setPlannedCertificationDate}
                    popperPlacement="bottom"
                />
            </span>   
            <input type="text" placeholder='קישור לתעודת הסמכה' value={certificationDocumentLink} disabled={!lastCertificationDate} onChange={(e) => handleInput(setCertificationDocumentLink, e)} />       
            <BigButton text="שמור" action={handleSave} overrideStyle={{ marginTop: "2.5rem" }} />
            {params.technicianid && <BigButton text="מחק הסמכה" action={() => setAreYouSureDelete(true)} overrideStyle={{ marginTop: "1rem", backgroundColor: "#CE1F1F" }} />}
            {areYouSureDelete && <AreYouSure text="האם באמת למחוק הסמכה?" leftText='מחק' leftAction={handleDelete} rightText='לא' rightAction={() => setAreYouSureDelete(false)} />}
        </div>
    )
};

export default CertificationMenu;