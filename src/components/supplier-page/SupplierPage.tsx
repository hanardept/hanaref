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

        return () => {
            setSupplier(null);
        }

    }, [params.supplierid, authToken, navigate, dispatch, frontEndPrivilege]);

    return (
        <>
            {loading && <LoadingSpinner />}
            {!loading && supplier && <div className={classes.supplierPage}>
                <h1>{supplier.name}</h1>
                <p>{`מספר ספק במשרד הביטחון: ${supplier.id}`}</p>
                <p>{`רחוב: ${supplier.street ?? ''}`}</p>
                <p>{`עיר: ${supplier.city ?? ''}`}</p>
                <p>מספר טלפון משרדי: <a href={`tel:${supplier.officePhone}`}>{supplier.officePhone}</a></p>
                <p>{`איש קשר: ${supplier.contact ?? ''}`}</p>
                <p>נייד של איש הקשר: <a href={`tel:${supplier.contactCell}`}>{supplier.contactCell}</a></p>
                <p>מייל של איש הקשר: <a href={`mailto:${supplier.contactEmail}`}>{supplier.contactEmail}</a></p>
            </div>}
        </>
    );
};

export default SupplierPage;

