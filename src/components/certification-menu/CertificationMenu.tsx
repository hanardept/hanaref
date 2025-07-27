import React, { ChangeEvent, useEffect, useState as useStateOriginal } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { backendFirebaseUri } from '../../backend-variables/address';
import { useAppDispatch, useAppSelector } from '../../hooks/redux-hooks';
import { viewingActions } from '../../store/viewing-slice';
import AreYouSure from '../UI/AreYouSure';
import BigButton from '../UI/BigButton';
import classes from './CertificationMenu.module.css';
import { Certification } from '../../types/certification_types';
import DebouncingInput from './DebouncingInput';
import { default as ItemListItem } from '../item-search/ListItem';
import { default as TechnicianListItem } from '../technician-page/ListItem';
import { MdEdit } from "react-icons/md";
import DatePicker from "react-datepicker";
import "./react-datepicker.css";


interface ItemSummary {
    cat: string;
    name: string;
    imageLink?: string;
}

interface TechnicianSummary {
    id: string;
    firstName: string;
    lastName: string;
}

const useState = (value: any) => {
    let [state, setState] = useStateOriginal(value);
    const setStateNew = (newValue: any) => {
        var stackTrace = Error().stack;
        console.log(`set state with new value ${newValue} stack trace: ${stackTrace}`); 
        setState(newValue);
    }
    // var stackTrace = Error().stack;
    // console.log(`use state stack trace: ${stackTrace}`); 
    return [state, setStateNew];
}

const CertificationMenu = () => {
    const params = useParams();
    const authToken = useAppSelector(state => state.auth.jwt);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [id, setId] = useState("");
    const [itemId, setItemId] = useState("");
    const [itemCat, setItemCat] = useState("");
    const [itemName, setItemName] = useState("");
    const [itemImageLink, setItemImageLink] = useState("");
    const [technicianId, setTechnicianId] = useState("");
    const [technicianFirstName, setTechnicianFirstName] = useState("");
    const [technicianLastName, setTechnicianLastName] = useState("");
    const [certificationDocumentLink, setCertificationDocumentLink] = useState("");
    const [firstCertificationDate, setFirstCertificationDate] = useState(null as unknown as Date);
    const [lastCertificationDate, setLastCertificationDate] = useState(null as unknown as Date);
    const [lastCertificationDurationMonths, setLastCertificationDurationMonths] = useState(null);
    //const [lastCertificationExpirationDate, setLastCertificationExpirationDate] = useState(null as unknown as Date);
    const [plannedCertificationDate, setPlannedCertificationDate] = useState(null as unknown as Date);
    const [areYouSureDelete, setAreYouSureDelete] = useState(false);

    const [itemSuggestions, setItemSuggestions] = useState([] as ItemSummary[]);
    const [showItemInput, setShowItemInput] = useState(false);

    const [technicianSuggestions, setTechnicianSuggestions] = useState([] as TechnicianSummary[]);
    const [showTechnicianInput, setShowTechnicianInput] = useState(false);

    const certificationDetails = {
        id: id,
        itemId,
        itemCat,
        itemName,
        itemImageLink,
        technicianId,
        technicianFirstName,
        technicianLastName,
        certificationDocumentLink,
        firstCertificationDate,
        lastCertificationDate,
        lastCertificationDurationMonths,
        //lastCertificationExpirationDate,
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
                setItemId(c.itemId);
                setItemCat(c.itemCat);
                setItemName(c.itemName);
                setItemImageLink(c.itemImageLink ?? "");
                setTechnicianId(c.technicianId);
                setTechnicianFirstName(c.technicianFirstName);
                setTechnicianLastName(c.technicianLastName);
                setCertificationDocumentLink(c.certificationDocumentLink ?? "");
                setFirstCertificationDate(c.firstCertificationDate ?? null);
                setLastCertificationDate(c.lastCertificationDate ?? null);
                setLastCertificationDurationMonths(c.lastCertificationDurationMonths ?? null);
                //setLastCertificationExpirationDate(c.lastCertificationExpirationDate ?? null);
                setPlannedCertificationDate(c.plannedCertificationDate ?? null);
            }).catch(e => console.log(`Error fetching certification details: ${e}`));
        }
       
    }, [params.certificationid, authToken]);

    const handleInput = (setFunc: (val: string) => any, event: ChangeEvent<HTMLInputElement>) => {
        setFunc(event.target.value);
        dispatch(viewingActions.changesAppliedToCertification(true));
    }
    
    const handleSave = () => {

        if (!certificationDetails.itemCat || !certificationDetails.technicianId ||
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

    console.log(`item cat: ${itemCat}, item name: ${itemName}, show item input: ${showItemInput}`);
    const showItemListItem = !showItemInput && itemCat && itemName;
    const showTechnicianListItem = !showTechnicianInput && technicianId && technicianFirstName;

    console.log(`item cat: ${itemCat}`)

      const isPastDate = (date: Date) => {
        return date < new Date();
      }

    return (
        <div className={classes.certificationMenu}>
            <h1>{params.certificationid ? "עריכת הסמכה" : "הוספת הסמכה"}</h1>
            {showItemListItem ? (
                <span style={{ display: "flex", flexDirection: "row", justifyItems: 'flex-end', alignItems: "center", gap: "1rem" }}>
                    <ItemListItem
                        className={classes.itemListItem}
                        cat={itemCat}
                        name={itemName}
                        imageLink={itemImageLink}
                        goToItemPage={() => setShowItemInput(true)}
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
                inputValue={itemCat}
                onValueChanged={(val: any) => {
                    console.log(`item cat changed to: ${val}`);
                    setItemCat(val);
                    //const found = itemSuggestions.find(s => s.cat === val);
                    // setItemName(found?.name ?? "")
                    // if (found) setShowItemInput(false);
                }}
                onSuggestionSelected={(s: any) => {
                    console.log(`item cat selected: ${s.cat}`);
                    setItemId(s._id);
                    setItemCat(s.cat);
                    setItemName(s.name);
                    setItemImageLink(s.imageLink);
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
                    console.log(`itemName: ${itemCat}, itemSuggestions: ${JSON.stringify(itemSuggestions, null, 4 )}`);
                    if (!itemSuggestions.find((s: any) => s.cat === itemCat)) {
                        console.log(`couldn't find`)
                        setItemCat("");
                        setItemName("");
                    }
                }}
            />)}
            {showTechnicianListItem ? (
                <span style={{ display: "flex", flexDirection: "row", justifyItems: 'flex-end', alignItems: "center", gap: "1rem" }}>
                    <TechnicianListItem
                        className={classes.technicianListItem}
                        id={technicianId}
                        firstName={technicianFirstName}
                        lastName={technicianLastName}
                        goToTechnicianPage={() => setShowTechnicianInput(true)}
                    />
                    <MdEdit
                        onClick={() => setShowTechnicianInput(true)}
                    />
                </span>
            ) : (
            <DebouncingInput
                id="react-autosuggest_technician"
                className={classes.itemCat}
                inputValue={technicianId}
                onValueChanged={(val: any) => {
                    setTechnicianId(val);
                    //const found = itemSuggestions.find(s => s.cat === val);
                    // setItemName(found?.name ?? "")
                    // if (found) setShowItemInput(false);
                }}
                onSuggestionSelected={(t: any) => {
                    setTechnicianId(t.id)
                    setTechnicianFirstName(t.firstName);
                    setTechnicianLastName(t.lastName);
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
                renderSuggestion={t => <span>{t.id} {t.firstName} {t.LastName}</span>}
                onClearSuggestions={() => setTechnicianSuggestions([])}
                onBlur={() => {
                    if (!technicianSuggestions.find((t: any) => t.id === technicianId)) {
                        setTechnicianId("");
                        setTechnicianFirstName("");
                        setTechnicianLastName("");
                    }
                }}
            />)}
            <span style={{ width: 'fit-content' }}>
                <DatePicker className={classes.datepicker} selected={firstCertificationDate} filterDate={isPastDate} dateFormat="dd/MM/yyyy" placeholderText='תאריך הסמכה ראשונה' onChange={setFirstCertificationDate} />
            </span>
            <span style={{ width: 'fit-content' }}>
                <DatePicker className={classes.datepicker} selected={lastCertificationDate} filterDate={isPastDate} dateFormat="dd/MM/yyyy" placeholderText='תאריך הסמכה אחרונה' onChange={setLastCertificationDate} />
            </span>  
            <input type="number" style={{ width: "25ch" }} placeholder="אורך הסמכה אחרונה בחודשים" value={lastCertificationDurationMonths ?? 0} disabled={!lastCertificationDate} onChange={(e) => 
                handleInput(val => Number.parseInt(val) && setLastCertificationDurationMonths(+val), e)} />
            {/* <span style={{ width: 'fit-content' }}>
                <DatePicker className={classes.datepicker} selected={lastCertificationExpirationDate} dateFormat="dd/MM/yyyy" placeholderText='תאריך תפוגת הסמכה אחרונה' onChange={(date) => setLastCertificationExpirationDate(date)} />
            </span> */}
            <span style={{ width: 'fit-content' }}>
                <DatePicker className={classes.datepicker} selected={plannedCertificationDate} filterDate={date => !isPastDate(date)} dateFormat="dd/MM/yyyy" placeholderText='תאריך הסמכה צפויה ' onChange={setPlannedCertificationDate} />
            </span>   
            <input type="text" placeholder='קישור לתעודת הסמכה' value={certificationDocumentLink} disabled={!lastCertificationDate} onChange={(e) => handleInput(setCertificationDocumentLink, e)} />       
            {/* // <input type="text" placeholder='ת.ז.' value={id} onChange={(e) => handleInput(setId, e)} />
            // <input type="text" placeholder='שם פרטי' value={firstName} onChange={(e) => handleInput(setFirstName, e)} />
            // <input type="text" placeholder='שם משפחה' value={lastName} onChange={(e) => handleInput(setLastName, e)} />
            // <AssociationSelection priorChosenAssociation={association} selectAssociation={association => setAssociation(association)} /> */}
            <BigButton text="שמור" action={handleSave} overrideStyle={{ marginTop: "2.5rem" }} />
            {params.technicianid && <BigButton text="מחק הסמכה" action={() => setAreYouSureDelete(true)} overrideStyle={{ marginTop: "1rem", backgroundColor: "#CE1F1F" }} />}
            {areYouSureDelete && <AreYouSure text="האם באמת למחוק הסמכה?" leftText='מחק' leftAction={handleDelete} rightText='לא' rightAction={() => setAreYouSureDelete(false)} />}
        </div>
    )
};

export default CertificationMenu;