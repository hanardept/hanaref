import React, { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { backendFirebaseUri } from '../../backend-variables/address';
import { useAppDispatch, useAppSelector } from '../../hooks/redux-hooks';
import { viewingActions } from '../../store/viewing-slice';
import { AbbreviatedItem, Item } from '../../types/item_types';
import { Sector } from '../../types/sector_types';
import AreYouSure from '../UI/AreYouSure';
import BigButton from '../UI/BigButton';
import classes from './ItemMenu.module.css';
import ItemDetails from './ItemDetails';
import DeviceFields from './DeviceFields';
import AccessoryFields from './AccessoryFields';
import ConsumableFields from './ConsumableFields';
import SparePartFields from './SparePartFields';

function vacateItemListIfEmptyAndRemoveSpaces(itemList: AbbreviatedItem[]) {
    const filteredList = itemList.filter(i => i.cat !== "" || i.name !== "");
    return filteredList.map(i => {
        const output = {...i};
        output.cat = output.cat.replace(/ /g, '');
        return output;
    })
}

const ItemMenu = () => {
    const params = useParams();
    const authToken = useAppSelector(state => state.auth.jwt);
    const [sectorsToChooseFrom, setSectorsToChooseFrom] = useState<Sector[]>([]);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [cat, setCat] = useState(params.newitemid || "");
    const [kitCat, setKitCat] = useState<AbbreviatedItem[]>([{ cat: "", name: "" }]);
    const [sector, setSector] = useState("");
    const [department, setDepartment] = useState("");
    const [catType, setCatType] = useState<"מכשיר" | "אביזר" | "מתכלה" | "חלקי חילוף" | "חלק חילוף">("מכשיר");
    const [description, setDescription] = useState("");
    const [imageLink, setImageLink] = useState("");
    const [qaStandardLink, setQaStandardLink] = useState("");
    const [userManualLink, setUserManualLink] = useState("");
    const [serviceManualLink, setServiceManualLink] = useState("");
    const [hebrewManualLink, setHebrewManualLink] = useState("");
    const [supplier, setSupplier] = useState("");
    const [lifeSpan, setLifeSpan] = useState("");
    const [models, setModels] = useState<AbbreviatedItem[]>([{ cat: "", name: "" }]);
    const [accessories, setAccessories] = useState<AbbreviatedItem[]>([{ cat: "", name: "" }]);
    const [consumables, setConsumables] = useState<AbbreviatedItem[]>([{ cat: "", name: "" }]);
    const [spareParts, setSpareParts] = useState<AbbreviatedItem[]>([{ cat: "", name: "" }]);
    const [belongsToDevice, setBelongsToDevice] = useState<AbbreviatedItem[]>([{ cat: "", name: "" }]);
    const [areYouSureDelete, setAreYouSureDelete] = useState(false);

    useEffect(() => {
        const getSectors = async () => {
            const fetchedSectors = await fetch(`${backendFirebaseUri}/sectors`, {
                headers: { 'auth-token': authToken }
            });
            return await fetchedSectors.json();
        };
        
        if (params.itemid) {
            const getItem = async () => {
                const fetchedItem = await fetch(`${backendFirebaseUri}/items/${params.itemid}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'auth-token': authToken
                    }
                });
                return await fetchedItem.json();
            };
            getSectors().then(s => {
                setSectorsToChooseFrom(s);
                return getItem();
            }).then((i: Item) => {
                setName(i.name);
                setCat(i.cat);
                setSector(i.sector);
                setDepartment(i.department);
                setCatType(i.catType);
                setDescription(i.description);
                if (i.imageLink) setImageLink(i.imageLink);
                if (i.qaStandardLink) setQaStandardLink(i.qaStandardLink);
                if (i.userManualLink) setUserManualLink(i.userManualLink);
                if (i.serviceManualLink) setServiceManualLink(i.serviceManualLink);
                if (i.hebrewManualLink) setHebrewManualLink(i.hebrewManualLink);
                if (i.supplier) setSupplier(i.supplier);
                if (i.lifeSpan) setLifeSpan(i.lifeSpan);
                if (i.models && i.models.length > 0) setModels(i.models);
                if (i.accessories && i.accessories.length > 0) setAccessories(i.accessories);
                if (i.consumables && i.consumables.length > 0) setConsumables(i.consumables);
                if (i.spareParts && i.spareParts.length > 0) setSpareParts(i.spareParts);
                if (i.belongsToDevice && i.belongsToDevice.length > 0) setBelongsToDevice(i.belongsToDevice);
                if (i.kitCat && i.kitCat.length > 0) setKitCat(i.kitCat);
            }).catch(e => console.log(`Error fetching item details: ${e}`));
        }
        if (!params.itemid) {
            getSectors().then(s => {
                setSectorsToChooseFrom(s);
            }).catch(err => console.log(`Error fetching sectors: ${err}`));
        }
    }, [params.itemid, authToken]);

    const handleInput = (setFunc: React.Dispatch<React.SetStateAction<string>>, event: ChangeEvent<HTMLInputElement>) => {
        setFunc(event.target.value);
        dispatch(viewingActions.changesAppliedToItem(true));
    }
    const handleDescription = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(event.target.value);
        dispatch(viewingActions.changesAppliedToItem(true));
    }
    const handleSetSector = (value: string) => {
        setSector(value);
        setDepartment("");
        dispatch(viewingActions.changesAppliedToItem(true));
    }
    const handleSetDepartment = (value: string) => {
        setDepartment(value);
        dispatch(viewingActions.changesAppliedToItem(true));
    }
    const handleSetCatType = (catType: "מכשיר" | "אביזר" | "מתכלה" | "חלקי חילוף" | "חלק חילוף") => {
        setCatType(catType);
        dispatch(viewingActions.changesAppliedToItem(true));
    }
    const handleSave = () => {
        const itemDetails = {
            name: name,
            cat: cat.replace(/ /g, ''),
            kitCat: vacateItemListIfEmptyAndRemoveSpaces(kitCat),
            sector: sector,
            department: department,
            catType: catType,
            description: description,
            imageLink: imageLink,
            qaStandardLink: qaStandardLink,
            userManualLink: userManualLink,
            serviceManualLink: serviceManualLink,
            hebrewManualLink: hebrewManualLink,
            supplier: supplier,
            lifeSpan: lifeSpan,
            models: vacateItemListIfEmptyAndRemoveSpaces(models),
            accessories: vacateItemListIfEmptyAndRemoveSpaces(accessories),
            consumables: vacateItemListIfEmptyAndRemoveSpaces(consumables),
            spareParts: vacateItemListIfEmptyAndRemoveSpaces(spareParts),
            belongsToDevice: vacateItemListIfEmptyAndRemoveSpaces(belongsToDevice)
        };

        if (catType === "מכשיר") {
            itemDetails.belongsToDevice = [];
        }
        if (catType === "אביזר" || catType === "מתכלה" || catType === "חלקי חילוף" || catType === "חלק חילוף") {
            itemDetails.kitCat = [];
        }

        if (!itemDetails.name || !itemDetails.sector || !itemDetails.department) {
            // if the required fields of the Item mongo schema are not filled then don't save
            console.log("Please make sure to enter a name, catalog number, sector and department");
            return;
        }
        if(!itemDetails.cat){
            alert("מק\"ט הוא שדה חובה");
            return;
        }

        if (!params.itemid) { // creating a new item
            fetch(`${backendFirebaseUri}/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'auth-token': authToken
                },
                body: JSON.stringify(itemDetails)
            }).then((res) => {
                console.log("success saving item");
                dispatch(viewingActions.changesAppliedToItem(false));
                navigate(-1);
            })
            .catch((err) => console.log(`Error saving item: ${err}`));
        }
        if (params.itemid) { // editing existing iten
            fetch(encodeURI(`${backendFirebaseUri}/items/${params.itemid}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'auth-token': authToken
                },
                body: JSON.stringify(itemDetails)
            }).then((res) => {
                console.log("success updating item");
                dispatch(viewingActions.changesAppliedToItem(false));
                navigate(-1);
            })
            .catch((err) => console.log(`Error updating item: ${err}`));
        }
    }
    // edit mode only:
    const handleDelete = () => {
        fetch(encodeURI(`${backendFirebaseUri}/items/${params.itemid}`), {
            method: 'DELETE',
            headers: {
                'auth-token': authToken
            }
        })
            .then((res) => {
                console.log("Successfully deleted item!");
                dispatch(viewingActions.changesAppliedToItem(false));
                setAreYouSureDelete(false);
                navigate("/");
            }).catch((err) => console.log(`Error deleting item: ${err}`));
    }

    return (
        <div className={classes.itemMenu}>
            <h1 className={classes.title}>{params.itemid ? "עריכת פריט" : "הוספת פריט"}</h1>
            <div className={classes.details}>
                <ItemDetails
                    name={name}
                    cat={cat}
                    kitCat={kitCat}
                    sector={sector}
                    department={department}
                    description={description}
                    catType={catType}
                    sectorsToChooseFrom={sectorsToChooseFrom}
                    handleInput={handleInput}
                    handleDescription={handleDescription}
                    handleSetSector={handleSetSector}
                    handleSetDepartment={handleSetDepartment}
                    handleSetCatType={handleSetCatType}
                    setName={setName}
                    setCat={setCat}
                    setKitCat={setKitCat}
                />
            </div>
            <div className={classes.relations}>
                {catType === "מכשיר" && <DeviceFields
                    imageLink={imageLink}
                    qaStandardLink={qaStandardLink}
                    userManualLink={userManualLink}
                    serviceManualLink={serviceManualLink}
                    hebrewManualLink={hebrewManualLink}
                    supplier={supplier}
                    models={models}
                    accessories={accessories}
                    consumables={consumables}
                    spareParts={spareParts}
                    handleInput={handleInput}
                    setImageLink={setImageLink}
                    setQaStandardLink={setQaStandardLink}
                    setUserManualLink={setUserManualLink}
                    setServiceManualLink={setServiceManualLink}
                    setHebrewManualLink={setHebrewManualLink}
                    setSupplier={setSupplier}
                    setModels={setModels}
                    setAccessories={setAccessories}
                    setConsumables={setConsumables}
                    setSpareParts={setSpareParts}
                />}
                {catType === "אביזר" && <AccessoryFields
                    imageLink={imageLink}
                    userManualLink={userManualLink}
                    supplier={supplier}
                    models={models}
                    belongsToDevice={belongsToDevice}
                    handleInput={handleInput}
                    setImageLink={setImageLink}
                    setUserManualLink={setUserManualLink}
                    setSupplier={setSupplier}
                    setModels={setModels}
                    setBelongsToDevice={setBelongsToDevice}
                />}
                {catType === "מתכלה" && <ConsumableFields
                    imageLink={imageLink}
                    userManualLink={userManualLink}
                    supplier={supplier}
                    lifeSpan={lifeSpan}
                    models={models}
                    belongsToDevice={belongsToDevice}
                    handleInput={handleInput}
                    setImageLink={setImageLink}
                    setUserManualLink={setUserManualLink}
                    setSupplier={setSupplier}
                    setLifeSpan={setLifeSpan}
                    setModels={setModels}
                    setBelongsToDevice={setBelongsToDevice}
                />}
                {(catType === "חלקי חילוף" || catType === "חלק חילוף") && <SparePartFields
                    imageLink={imageLink}
                    userManualLink={userManualLink}
                    supplier={supplier}
                    models={models}
                    belongsToDevice={belongsToDevice}
                    handleInput={handleInput}
                    setImageLink={setImageLink}
                    setUserManualLink={setUserManualLink}
                    setSupplier={setSupplier}
                    setModels={setModels}
                    setBelongsToDevice={setBelongsToDevice}
                />}
            </div>
            <div className={classes.buttons}>
                <BigButton text="שמור" action={handleSave} overrideStyle={{ marginTop: "2.5rem" }} className={classes.button} />
                {params.itemid && <BigButton text="מחק פריט" action={() => setAreYouSureDelete(true)} overrideStyle={{ marginTop: "1rem", backgroundColor: "#CE1F1F" }} className={classes.button} />}
            </div>
            {areYouSureDelete && <AreYouSure text="האם באמת למחוק פריט?" leftText='מחק' leftAction={handleDelete} rightText='לא' rightAction={() => setAreYouSureDelete(false)} />}
        </div>
    )
};

export default ItemMenu;