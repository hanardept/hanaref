import React, { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux-hooks';
import { viewingActions } from '../../store/viewing-slice';
import { AbbreviatedItem, Item } from '../../types/item_types';
import { Sector } from '../../types/sector_types';
import DepartmentSelection from '../item-search/DepartmentSelection';
import SectorSelection from '../item-search/SectorSelection';
import BigButton from '../UI/BigButton';
import CatTypeSelection from './CatTypeSelection';
import InfoSectionMenu from './InfoSectionMenu';
import classes from './ItemMenu.module.css';

function vacateItemListIfEmpty(itemList: AbbreviatedItem[]) {
    return itemList.filter(i => i.cat !== "" || i.name !== "");
}

const ItemMenu = () => {
    const params = useParams();
    const authToken = useAppSelector(state => state.auth.jwt);
    const [sectorsToChooseFrom, setSectorsToChooseFrom] = useState<Sector[]>([]);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [cat, setCat] = useState("");
    const [sector, setSector] = useState("");
    const [department, setDepartment] = useState("");
    const [catType, setCatType] = useState("מקט רגיל");
    const [description, setDescription] = useState("");
    const [imageLink, setImageLink] = useState("");
    const [qaStandardLink, setQaStandardLink] = useState("");
    const [models, setModels] = useState<AbbreviatedItem[]>([{ cat: "", name: "" }]);
    const [accessories, setAccessories] = useState<AbbreviatedItem[]>([{ cat: "", name: "" }]);
    const [consumables, setConsumables] = useState<AbbreviatedItem[]>([{ cat: "", name: "" }]);
    const [belongsToKits, setBelongsToKits] = useState<AbbreviatedItem[]>([{ cat: "", name: "" }]);
    const [similarItems, setSimilarItems] = useState<AbbreviatedItem[]>([{ cat: "", name: "" }]);
    const [kitItem, setKitItem] = useState<AbbreviatedItem[]>([{ cat: "", name: "" }]);

    const itemDetails = {
        name: name,
        cat: cat,
        sector: sector,
        department: department,
        catType: catType,
        description: description,
        imageLink: imageLink,
        qaStandardLink: qaStandardLink,
        models: models,
        accessories: accessories,
        consumables: consumables,
        belongsToKits: belongsToKits,
        similarItems: similarItems,
        kitItem: kitItem
    };

    useEffect(() => {
        const getSectors = async () => {
            const fetchedSectors = await fetch(`/sectors`, {
                headers: { 'auth-token': authToken }
            });
            return await fetchedSectors.json();
        };
        
        if (params.itemid) {
            const getItem = async () => {
                const fetchedItem = await fetch(`/items/${params.itemid}`, {
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
                if (i.qaStandardLink) setQaStandardLink(i.qaStandardLink)
                if (i.models && i.models.length > 0) setModels(i.models);
                if (i.accessories && i.accessories.length > 0) setAccessories(i.accessories);
                if (i.consumables && i.consumables.length > 0) setConsumables(i.consumables);
                if (i.belongsToKits && i.belongsToKits.length > 0) setBelongsToKits(i.belongsToKits);
                if (i.similarItems && i.similarItems.length > 0) setSimilarItems(i.similarItems);
                if (i.kitItem && i.kitItem.length > 0) setKitItem(i.kitItem);
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
    const sectorNames = sectorsToChooseFrom.map(s => s.sectorName);
    const departmentsToChooseFrom = (sector && sectorsToChooseFrom.length > 0) ? sectorsToChooseFrom.filter(s => s.sectorName === sector)[0].departments : [];
    const handleSetCatType = (catType: "מקט רגיל" | "מקט ערכה") => {
        setCatType(catType);
    }
    const handleSave = () => {
        itemDetails.models = vacateItemListIfEmpty(itemDetails.models);
        itemDetails.belongsToKits = vacateItemListIfEmpty(itemDetails.belongsToKits);
        itemDetails.similarItems = vacateItemListIfEmpty(itemDetails.similarItems);
        itemDetails.kitItem = vacateItemListIfEmpty(itemDetails.kitItem);
        itemDetails.accessories = vacateItemListIfEmpty(itemDetails.accessories);
        itemDetails.consumables = vacateItemListIfEmpty(itemDetails.consumables);

        if (catType === "מקט ערכה") {
            itemDetails.models = [];
            itemDetails.belongsToKits = [];
            itemDetails.similarItems = [];
        }
        if (catType === "מקט רגיל") {
            itemDetails.kitItem = [];
        }

        if (!itemDetails.name || !itemDetails.cat || !itemDetails.sector || !itemDetails.department) {
            // if the required fields of the Item mongo schema are not filled then don't save
            console.log("Please make sure to enter a name, catalog number, sector and department");
            return;
        }

        if (!params.itemid) { // creating a new item
            fetch(`/items`, {
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
            fetch(encodeURI(`/items/${params.itemid}`), {
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

    return (
        <div className={classes.itemMenu}>
            <h1>{params.itemid ? "עריכת פריט" : "הוספת פריט"}</h1>
            <input type="text" placeholder='שם הפריט' value={name} onChange={(e) => handleInput(setName, e)} />
            <input type="text" placeholder='מק"ט' value={cat} onChange={(e) => handleInput(setCat, e)} />
            <SectorSelection sectorNames={sectorNames} handleSetSector={handleSetSector} priorChosenSector={sector} />
            <DepartmentSelection departments={departmentsToChooseFrom} handleSetDepartment={handleSetDepartment} priorChosenDepartment={department} />
            <CatTypeSelection selectCatType={handleSetCatType} />
            <textarea value={description} onChange={handleDescription} placeholder="תיאור" />
            <input type="text" placeholder='קישור לתמונה' value={imageLink} onChange={(e) => handleInput(setImageLink, e)} />
            <input type="text" placeholder='קישור לתקן בחינה' value={qaStandardLink} onChange={(e) => handleInput(setQaStandardLink, e)} />
            {catType === "מקט ערכה" && <InfoSectionMenu title="מכשיר" items={kitItem} setItems={setKitItem} />}
            {catType === "מקט רגיל" && <InfoSectionMenu title="דגמים" items={models} setItems={setModels} />}
            <InfoSectionMenu title="אביזרים" items={accessories} setItems={setAccessories} />
            <InfoSectionMenu title="מתכלים" items={consumables} setItems={setConsumables} />
            {catType === "מקט רגיל" && <InfoSectionMenu title="שייך לערכות" items={belongsToKits} setItems={setBelongsToKits} />}
            {catType === "מקט רגיל" && <InfoSectionMenu title="פריטים דומים" items={similarItems} setItems={setSimilarItems} />}
            <BigButton text="שמור" action={handleSave} overrideStyle={{ marginTop: "1rem" }} />
        </div>
    )
};

export default ItemMenu;