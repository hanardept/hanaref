import React, { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { backendFirebaseUri } from '../../backend-variables/address';
import { useAppDispatch, useAppSelector } from '../../hooks/redux-hooks';
import { viewingActions } from '../../store/viewing-slice';
import AreYouSure from '../UI/AreYouSure';
import BigButton from '../UI/BigButton';
import classes from './TechnicianMenu.module.css';
import { Technician } from '../../types/technician_types';
import AssociationSelection, { associationOptions } from './AssociationSelection';

const TechnicianMenu = () => {
    const params = useParams();
    const authToken = useAppSelector(state => state.auth.jwt);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [association, setAssociation] = useState(associationOptions[0]);
    const [areYouSureDelete, setAreYouSureDelete] = useState(false);

    const technicianDetails = {
        firstName: firstName,
        lastName: lastName,
        association: association
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
            getTechnician().then((t: Technician) => {
                setFirstName(t.firstName);
                setLastName(t.lastName);
                setAssociation(t.association);
            }).catch(e => console.log(`Error fetching technician details: ${e}`));
        }
       
    }, [params.technicianid, authToken]);

    const handleInput = (setFunc: React.Dispatch<React.SetStateAction<string>>, event: ChangeEvent<HTMLInputElement>) => {
        setFunc(event.target.value);
        dispatch(viewingActions.changesAppliedToTechnician(true));
    }
    
    const handleSave = () => {

        if (!technicianDetails.firstName || !technicianDetails.lastName || !technicianDetails.association) {
            // if the required fields of the Technician mongo schema are not filled then don't save
            console.log("Please make sure to enter a first name, last name and association");
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