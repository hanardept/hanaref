import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import classes from './SupplierPage.module.css';
import { viewingActions } from "../../store/viewing-slice";
import LoadingSpinner from "../UI/LoadingSpinner";
import { fetchBackend } from "../../backend-variables/address";
import { Supplier } from "../../types/supplier_types";

const SupplierPage = () => {
    const params = useParams();
    const authToken = useAppSelector(state => state.auth.jwt);
    const [supplier, setSupplier] = useState<Supplier | null>(null);
    const [loading, setLoading] = useState(true);
    const frontEndPrivilege = useAppSelector(state => state.auth.frontEndPrivilege);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const getSupplier = async () => {
            setLoading(true);
            const fetchedSuppliers = await fetchBackend(`suppliers/${params.supplierid}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'auth-token': authToken
                }
            });
            return await fetchedSuppliers.json();
        };

        getSupplier().then(c => {
            setSupplier(c);
            setLoading(false);
            if (frontEndPrivilege === "admin") {
                dispatch(viewingActions.manageSupplierId(params.supplierid as string));
            }
        }).catch(e => {
            setLoading(false);
            navigate(`/itemnotfound/${params.supplierid}`);
        });

        return () => { setSupplier(null); }
    }, [params.supplierid, authToken, navigate, dispatch, frontEndPrivilege]);

    return (
        <>
            {loading && <LoadingSpinner />}
            {!loading && supplier && (
                <div className={classes.supplierPage}>
                    <h1>{supplier.name}</h1>
                    
                    {/* General Supplier Information */}
                    <div className={classes.generalInfo}>
                        <p><strong>מספר ספק במשרד הביטחון:</strong> {supplier.id}</p>
                        <p><strong>רחוב:</strong> {supplier.street || 'לא הוזן'}</p>
                        <p><strong>עיר:</strong> {supplier.city || 'לא הוזן'}</p>
                        {/* Requirement 1: Office Phone at Supplier level */}
                        {supplier.officePhone && (
                            <p><strong>טלפון משרדי:</strong> <a href={`tel:${supplier.officePhone}`}>{supplier.officePhone}</a></p>
                        )}
                    </div>
                    
                    <hr className={classes.separator} />
                    
                    <h2>אנשי קשר</h2>
                    {supplier.contacts && supplier.contacts.length > 0 ? (
                        <div className={classes.contactsContainer}>
                            {supplier.contacts.map((contact, index) => (
                                <div key={index} className={classes.contactBlock}>
                                    {/* Requirement 2: Display Role next to Name */}
                                    <h3>
                                        {contact.fullName} 
                                        {contact.role && <span className={classes.roleText}>{` - ${contact.role}`}</span>}
                                    </h3>
                                    
                                    {contact.officePhone && (
                                        <p><strong>טלפון משרדי:</strong> <a href={`tel:${contact.officePhone}`}>{contact.officePhone}</a></p>
                                    )}
                                    {contact.cell && (
                                        <p><strong>נייד:</strong> <a href={`tel:${contact.cell}`}>{contact.cell}</a></p>
                                    )}
                                    {contact.email && (
                                        <p><strong>מייל:</strong> <a href={`mailto:${contact.email}`}>{contact.email}</a></p>
                                    )}
                                    {contact.comments && (
                                        <p className={classes.comments}><strong>הערות:</strong> {contact.comments}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className={classes.noContacts}>אין אנשי קשר רשומים לספק זה.</p>
                    )}
                </div>
            )}
        </>
    );
};

export default SupplierPage;