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

const SupplierMenu = () => {
    const params = useParams();
    const { jwt: authToken } = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    // General Supplier State
    const [id, setId] = useState("");
    const [name, setName] = useState("");
    const [street, setStreet] = useState("");
    const [city, setCity] = useState("");
    const [officePhone, setOfficePhone] = useState("");
    
    // Contacts State (Array)
    const [contacts, setContacts] = useState<NonNullable<Supplier['contacts']>>([]);
    
    const [areYouSureDelete, setAreYouSureDelete] = useState(false);

    const supplierDetails = {
        id,
        name,
        street,
        city,
        officePhone,
        contacts,
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
                    setOfficePhone(s.officePhone ?? "");
                    setContacts(s.contacts ?? []);
                })
                .catch(e => console.log(`Error fetching supplier details: ${e}`));
        }
    }, [params.supplierid, authToken]);

    const handleInput = (setFunc: (val: string) => any, event: ChangeEvent<HTMLInputElement>) => {
        setFunc(event.target.value);
        dispatch(viewingActions.changesAppliedToSupplier(true));
    }

    // --- Contact Management Logic ---

    const handleContactChange = (index: number, field: string, value: string) => {
        const updatedContacts = [...contacts];
        updatedContacts[index] = { ...updatedContacts[index], [field]: value };
        setContacts(updatedContacts);
        dispatch(viewingActions.changesAppliedToSupplier(true));
    };

    const addContact = () => {
        setContacts([...contacts, { fullName: "", role: "", cell: "", email: "", comments: "" }]);
        dispatch(viewingActions.changesAppliedToSupplier(true));
    };

    const removeContact = (index: number) => {
        setContacts(contacts.filter((_, i) => i !== index));
        dispatch(viewingActions.changesAppliedToSupplier(true));
    };

    // --- Save and Delete Logic ---

    const handleSave = () => {
        if (!supplierDetails.id?.length || !supplierDetails.name?.length) {
            alert("לא כל שדות החובה מולאו (מספר ספק ושם)");
            return;
        }

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
            });
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
                dispatch(viewingActions.changesAppliedToSupplier(false));
                navigate(-1);
            })
            .catch((err) => console.log(`Error saving/updating supplier: ${err}`));
    }

    const handleDelete = () => {
        fetchBackend(encodeURI(`suppliers/${params.supplierid}`), {
            method: 'DELETE',
            headers: { 'auth-token': authToken }
        })
        .then((res) => {
            if (res.status === 409) {
                alert("לא ניתן למחוק ספק שמקושר למכשירים במערכת");
            } else {
                dispatch(viewingActions.changesAppliedToSupplier(false));
                navigate("/suppliers");
            }
            setAreYouSureDelete(false);
        }).catch((err) => console.log(`Error deleting supplier: ${err}`))
    }

    return (
        <div className={classes.supplierMenu}>
            <h1>{params.supplierid ? "עריכת ספק" : "הוספת ספק"}</h1>       
            
            <LabeledInput label="מספר ספק במשרד הביטחון" value={id} onChange={(e) => handleInput(setId, e)} required/>
            <LabeledInput label="שם" value={name} onChange={(e) => handleInput(setName, e)} required/>
            <LabeledInput label="רחוב" value={street} onChange={(e) => handleInput(setStreet, e)} />
            <LabeledInput label="עיר" value={city} onChange={(e) => handleInput(setCity, e)} />
            <LabeledInput label="מספר טלפון משרדי" value={officePhone} onChange={(e) => handleInput(setOfficePhone, e)} />

            <hr style={{ width: '100%', margin: '2rem 0' }} />
            
            <h3>אנשי קשר</h3>
            {contacts.map((contact, index) => (
                <div key={index} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem', borderRadius: '8px', position: 'relative' }}>
                    <h4 style={{marginTop: 0}}>איש קשר {index + 1}</h4>
                    <LabeledInput 
                        label="שם מלא" 
                        value={contact.fullName} 
                        onChange={(e) => handleContactChange(index, 'fullName', e.target.value)} 
                        required 
                    />
                    <LabeledInput 
                        label="תפקיד"
                        value={contact.role} 
                        onChange={(e) => handleContactChange(index, 'role', e.target.value)} 
                    />
                    <LabeledInput 
                        label="נייד" 
                        value={contact.cell} 
                        onChange={(e) => handleContactChange(index, 'cell', e.target.value)} 
                    />
                    <LabeledInput 
                        label="מייל" 
                        value={contact.email} 
                        onChange={(e) => handleContactChange(index, 'email', e.target.value)} 
                    />
                    <LabeledInput 
                        label="הערות" 
                        value={contact.comments} 
                        onChange={(e) => handleContactChange(index, 'comments', e.target.value)} 
                    />
                    
                    <button 
                        onClick={() => removeContact(index)} 
                        style={{ backgroundColor: '#CE1F1F', color: 'white', border: 'none', padding: '0.5rem', cursor: 'pointer', borderRadius: '4px' }}
                    >
                        מחק איש קשר
                    </button>
                </div>
            ))}

            <BigButton text="הוסף איש קשר" action={addContact} overrideStyle={{ backgroundColor: '#4CAF50', marginTop: '1rem' }} />

            <hr style={{ width: '100%', margin: '2rem 0' }} />

            <BigButton text="שמור" action={handleSave} overrideStyle={{ marginTop: "1rem" }} />
            
            {params.supplierid && (
                <BigButton 
                    text="מחק ספק" 
                    action={() => setAreYouSureDelete(true)} 
                    overrideStyle={{ marginTop: "1rem", backgroundColor: "#CE1F1F" }} 
                />
            )}
            
            {areYouSureDelete && (
                <AreYouSure 
                    text="האם באמת למחוק ספק?" 
                    leftText='מחק' 
                    leftAction={handleDelete} 
                    rightText='לא' 
                    rightAction={() => setAreYouSureDelete(false)} 
                />
            )}
        </div>
    )
};

export default SupplierMenu;