import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchBackend } from '../../backend-variables/address';
import { useAppDispatch, useAppSelector } from '../../hooks/redux-hooks';
import { viewingActions } from '../../store/viewing-slice';
import AreYouSure from '../UI/AreYouSure';
import BigButton from '../UI/BigButton';
import classes from './SupplierMenu.module.css';
import { Supplier } from '../../types/supplier_types';
import LabeledInput from '../UI/LabeledInput';


interface SupplierSummary {
    _id: string;
    id: string;
    name: string;
    street: string;
    city: string;
    officePhone: string;
    contact: string;
    contactCell: string;
    contactEmail: string;
}

const SupplierMenu = () => {
    const params = useParams();
    const { jwt: authToken }  = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [street, setStreet] = useState("");
    const [city, setCity] = useState("");
    const [officePhone, setOfficePhone] = useState("");
    const [contact, setContact] = useState("");
    const [contactCell, setContactCell] = useState("")
    const [contactEmail, setContactEmail] = useState("")
    const [areYouSureDelete, setAreYouSureDelete] = useState(false);

    const supplierDetails = {
        id: id,
        name,
        street,
        city,
        officePhone,
        contact,
        contactCell,
        contactEmail,
    };

    useEffect(() => {        
        if (params.supplierid) {
            const getSupplier = async () => {
                const fetchedSupplier = await fetchBackend(`suppliers/${params.supplierid}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'auth-token': authToken
                    }
                });
                return await fetchedSupplier.json();
            };
            getSupplier()
                .then((s: Supplier) => {
                    setId(s.id ?? "");
                    setName(s.name ?? "");
                    setStreet(s.street ?? "");
                    setCity(s.city ?? "");
                    setOfficePhone(s.officePhone ??"");
                    setContact(s.contact ?? "");
                    setContactCell(s.contactCell ?? "");
                    setContactEmail(s.contactEmail ?? "");
                })
                .catch(e => console.log(`Error fetching supplier details: ${e}`));
        }
        
    }, [params.supplierid, authToken]);

    const handleInput = (setFunc: (val: string) => any, event: ChangeEvent<HTMLInputElement>) => {
        setFunc(event.target.value);
        dispatch(viewingActions.changesAppliedToSupplier(true));
    }
    
    const handleSave = () => {
        if (!supplierDetails.id?.length || !supplierDetails.name?.length) {
            // if the required fields of the Supplier mongo schema are not filled then don't save
            console.log("Please make sure to enter a supplier id and name");
            return;
        }

        console.log(`Saving supplier with details: ${JSON.stringify(supplierDetails, null, 4)}`);

        let promise;
        const body = JSON.stringify(supplierDetails);
        if (!params.supplierid) {
            promise = fetchBackend(`suppliers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'auth-token': authToken
                },
                body
            })
        } else {
            promise = fetchBackend(encodeURI(`suppliers/${params.supplierid}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'auth-token': authToken
                },
                body
            });
        }
        return promise
            .then(() => {
                console.log("Successfully saved supplier!");
                dispatch(viewingActions.changesAppliedToSupplier(false));
                navigate(-1);
            })
            .catch((err) => console.log(`Error saving/updating supplier: ${err}`));
    }
    // edit mode only:
    const handleDelete = () => {
        fetchBackend(encodeURI(`suppliers/${params.supplierid}`), {
            method: 'DELETE',
            headers: {
                'auth-token': authToken
            }
        })
        .then((res) => {
            console.log(`Delete supplier response status: ${res.status}`);
            if (res.status === 409) {
                alert("לא ניתן למחוק ספק שמקושר למכשירים במערכת");
            } else {
                console.log("Successfully deleted supplier!");
                dispatch(viewingActions.changesAppliedToSupplier(false));
                navigate("/suppliers");
            }
            setAreYouSureDelete(false);
        }).catch((err) => console.log(`Error deleting supplier: ${err}`))
    }

    return (
        <div className={classes.supplierMenu}>
            <h1>{params.supplierid ? "עריכת ספק" : "הוספת ספק"}</h1>       
            <LabeledInput label="מספר ספק במשרד הביטחון" placeholder="מספר ספק במשרד הביטחון" value={id} onChange={(e) => handleInput(setId, e)} />
            <LabeledInput label="שם" placeholder="שם" value={name} onChange={(e) => handleInput(setName, e)} />
            <LabeledInput label="רחוב" placeholder="רחוב" value={street} onChange={(e) => handleInput(setStreet, e)} />
            <LabeledInput label="עיר" placeholder="עיר" value={city} onChange={(e) => handleInput(setCity, e)} />
            <LabeledInput label="מספר טלפון משרדי" placeholder="מספר טלפון משרדי" value={officePhone} onChange={(e) => handleInput(setOfficePhone, e)} />
            <LabeledInput label="איש קשר" placeholder="איש קשר" value={contact} onChange={(e) => handleInput(setContact, e)} />
            <LabeledInput label="נייד של איש קשר" placeholder="נייד של איש קשר" value={contactCell} onChange={(e) => handleInput(setContactCell, e)} />
            <LabeledInput label="מייל של איש קשר" placeholder="מייל של איש קשר" value={contactEmail} onChange={(e) => handleInput(setContactEmail, e)} />
            <BigButton text="שמור" action={handleSave} overrideStyle={{ marginTop: "2.5rem" }} />
            {params.technicianid && <BigButton text="מחק ספק" action={() => setAreYouSureDelete(true)} overrideStyle={{ marginTop: "1rem", backgroundColor: "#CE1F1F" }} />}
            {areYouSureDelete && <AreYouSure text="האם באמת למחוק ספק?" leftText='מחק' leftAction={handleDelete} rightText='לא' rightAction={() => setAreYouSureDelete(false)} />}
        </div>
    )
};

export default SupplierMenu;