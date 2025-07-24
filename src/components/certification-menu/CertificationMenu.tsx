import React, { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { backendFirebaseUri } from '../../backend-variables/address';
import { useAppDispatch, useAppSelector } from '../../hooks/redux-hooks';
import { viewingActions } from '../../store/viewing-slice';
import AreYouSure from '../UI/AreYouSure';
import BigButton from '../UI/BigButton';
import classes from './CertificationMenu.module.css';
import { Certification } from '../../types/certification_types';
import DebouncingInput from './DebouncingInput';

const CertificationMenu = () => {
    const params = useParams();
    const authToken = useAppSelector(state => state.auth.jwt);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [id, setId] = useState("");
    const [itemId, setItemId] = useState("");
    const [itemCat, setItemCat] = useState("");
    const [itemName, setItemName] = useState("");
    const [technicianId, setTechnicianId] = useState("");
    const [technicianFirstName, setTechnicianFirstName] = useState("");
    const [technicianLastName, setTechnicianLastName] = useState("");
    const [certificationDocumentLink, setCertificationDocumentLink] = useState("");
    const [firstCertificationDate, setFirstCertificationDate] = useState<Date | null>(null);
    const [lastCertificationDate, setLastCertificationDate] = useState<Date | null>(null);
    const [lastCertificationExpirationDate, setLastCertificationExpirationDate] = useState<Date | null>(null);
    const [plannedCertificationDate, setPlannedCertificationDate] = useState<Date | null>(null);
    const [areYouSureDelete, setAreYouSureDelete] = useState(false);

    const [itemSuggestions, setItemSuggestions] = useState([]);

    const certificationDetails = {
        id: id,
        itemId,
        itemCat,
        itemName,
        technicianId,
        technicianFirstName,
        technicianLastName,
        certificationDocumentLink,
        firstCertificationDate,
        lastCertificationDate,
        lastCertificationExpirationDate,
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
                setTechnicianId(c.technicianId);
                setTechnicianFirstName(c.technicianFirstName);
                setTechnicianLastName(c.technicianLastName);
                setCertificationDocumentLink(c.certificationDocumentLink ?? "");
                setFirstCertificationDate(c.firstCertificationDate ?? null);
                setLastCertificationDate(c.lastCertificationDate ?? null);
                setLastCertificationExpirationDate(c.lastCertificationExpirationDate ?? null);
                setPlannedCertificationDate(c.plannedCertificationDate ?? null);
            }).catch(e => console.log(`Error fetching certification details: ${e}`));
        }
       
    }, [params.certificationid, authToken]);

    const handleInput = (setFunc: React.Dispatch<React.SetStateAction<string>>, event: ChangeEvent<HTMLInputElement>) => {
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

    return (
        <div className={classes.certificationMenu}>
            <h1>{params.certificationid ? "עריכת הסמכה" : "הוספת הסמכה"}</h1>
            <DebouncingInput
                inputValue={itemCat}
                onValueChanged={val => setItemCat(val)}
                placeholder='מק"ט מכשיר'
                suggestions={itemSuggestions.map((s: any) => s.cat)}
                onFetchSuggestions={(value: string) => {
                    fetch(encodeURI(`${backendFirebaseUri}/items/suggestions?cat=${value}`), {
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