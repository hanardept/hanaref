import React, { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { backendFirebaseUri } from '../../backend-variables/address';
import { useAppDispatch, useAppSelector } from '../../hooks/redux-hooks';
import { viewingActions } from '../../store/viewing-slice';
import AreYouSure from '../UI/AreYouSure';
import BigButton from '../UI/BigButton';
import classes from './CertificationMenu.module.css';
import { Certification } from '../../types/certification_types';
import AssociationSelection, { associationOptions } from './AssociationSelection';

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
    const [firstCertificationDate, setFirstCertificationDate] = useState(null);
    const [lastCertificationDate, setLastCertificationDate] = useState(null);
    const [lastCertificationExpirationDate, setLastCertificationExpirationDate] = useState(null);
    const [areYouSureDelete, setAreYouSureDelete] = useState(false);

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
        lastCertificationExpirationDate
    };

    useEffect(() => {        
        if (params.technicianid) {
            const getTechnician = async () => {
                const fetchedTechnician = await fetch(`${backendFirebaseUri}/technicians/${params.technicianid}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'auth-token': authToken
                    }
                });
                return await fetchedTechnician.json();
            };
            getTechnician().then((c: Certification) => {
                setId(c._id);
                setItemCat(c.itemCat);
                setItemName(c.itemName);
                setTechnicianId(c.technicianId);
                setTechnicianFirstName(c.technicianFirstName);
                setTechnicianLastName(c.technicianLastName);
                setCertificationDocumentLink(c.certificationDocumentLink ?? "");
                setFirstCertificationDate(c.firstCertificationDate);
                setLastCertificationDate(c.lastCertificationDate);
                setLastCertificationExpirationDate(c.lastCertificationExpirationDate);
            }).catch(e => console.log(`Error fetching certification details: ${e}`));
        }
       
    }, [params.certificationid, authToken]);

    const handleInput = (setFunc: React.Dispatch<React.SetStateAction<string>>, event: ChangeEvent<HTMLInputElement>) => {
        setFunc(event.target.value);
        dispatch(viewingActions.changesAppliedToCertification(true));
    }
    
    const handleSave = () => {

        if (!certificationDetails.itemCat || !certificationDetails.technicianId || (!certificationDetails.lastCertificationDate && !certificationDetails.)) {
            // if the required fields of the Certification mongo schema are not filled then don't save
            console.log("Please make sure to enter an item name and association");
            return;
        }

        if (!params.technicianid) {
            fetch(`${backendFirebaseUri}/technicians`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'auth-token': authToken
                },
                body: JSON.stringify(technicianDetails)
            }).then((res) => {
                console.log("success saving technician");
                dispatch(viewingActions.changesAppliedToTechnician(false));
                navigate(-1);
            })
            .catch((err) => console.log(`Error saving technician: ${err}`));
        }
        if (params.technicianid) {
            fetch(encodeURI(`${backendFirebaseUri}/technicians/${params.technicianid}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'auth-token': authToken
                },
                body: JSON.stringify(technicianDetails)
            }).then((res) => {
                console.log("success updating technician");
                dispatch(viewingActions.changesAppliedToTechnician(false));
                navigate(-1);
            })
            .catch((err) => console.log(`Error updating technician: ${err}`));
        }
    }
    // edit mode only:
    const handleDelete = () => {
        fetch(encodeURI(`${backendFirebaseUri}/technicians/${params.technicianid}`), {
            method: 'DELETE',
            headers: {
                'auth-token': authToken
            }
        })
            .then((res) => {
                console.log("Successfully deleted technician!");
                dispatch(viewingActions.changesAppliedToTechnician(false));
                setAreYouSureDelete(false);
                navigate("/technicians");
            }).catch((err) => console.log(`Error deleting technician: ${err}`));
    }

    return (
        <div className={classes.technicianMenu}>
            <h1>{params.technicianid ? "עריכת טכנאי" : "הוספת טכנאי"}</h1>
            <input type="text" placeholder='ת.ז.' value={id} onChange={(e) => handleInput(setId, e)} />
            <input type="text" placeholder='שם פרטי' value={firstName} onChange={(e) => handleInput(setFirstName, e)} />
            <input type="text" placeholder='שם משפחה' value={lastName} onChange={(e) => handleInput(setLastName, e)} />
            <AssociationSelection priorChosenAssociation={association} selectAssociation={association => setAssociation(association)} />
            <BigButton text="שמור" action={handleSave} overrideStyle={{ marginTop: "2.5rem" }} />
            {params.technicianid && <BigButton text="מחק טכנאי" action={() => setAreYouSureDelete(true)} overrideStyle={{ marginTop: "1rem", backgroundColor: "#CE1F1F" }} />}
            {areYouSureDelete && <AreYouSure text="האם באמת למחוק טכנאי?" leftText='מחק' leftAction={handleDelete} rightText='לא' rightAction={() => setAreYouSureDelete(false)} />}
        </div>
    )
};

export default TechnicianMenu;