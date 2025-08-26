import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { backendFirebaseUri } from '../../backend-variables/address';
import { useAppDispatch, useAppSelector } from '../../hooks/redux-hooks';
import { viewingActions } from '../../store/viewing-slice';
import { AbbreviatedItem, CatType, Item } from '../../types/item_types';
import { Sector } from '../../types/sector_types';
import AreYouSure from '../UI/AreYouSure';
import BigButton from '../UI/BigButton';
import classes from './ItemMenu.module.css';
import ItemDetails from './ItemDetails';
import DeviceFields from './DeviceFields';
import AccessoryFields from './AccessoryFields';
import ConsumableFields from './ConsumableFields';
import SparePartFields from './SparePartFields';
import { getFilename } from '../../utils';
import { Role } from '../../types/user_types';

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
    const { jwt: authToken, frontEndPrivilege } = useAppSelector(state => state.auth);
    const [sectorsToChooseFrom, setSectorsToChooseFrom] = useState<Sector[]>([]);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [cat, setCat] = useState(params.newitemid || "");
    const [kitCats, setKitCats] = useState<string[]>([]);
    const [sector, setSector] = useState("");
    const [department, setDepartment] = useState("");
    const [catType, setCatType] = useState<CatType>(CatType.Device);
    const [certificationPeriodMonths, setCertificationPeriodMonths] = useState<number | null>(null);
    const [description, setDescription] = useState("");
    const [imageLink, setImageLink] = useState("" as (string | File));
    const [isImageUploading, setIsImageUploading] = useState(false);
    const [qaStandardLink, setQaStandardLink] = useState("" as (string | File));
    const [isQaStandardUploading, setIsQaStandardUploading] = useState(false);
    const [medicalEngineeringManualLink, setMedicalEngineeringManualLink] = useState("" as (string | File));
    const [isMedicalEngineeringManualUploading, setIsMedicalEngineeringManualUploading] = useState(false);
    const [userManualLink, setUserManualLink] = useState("" as (string | File));
    const [isUserManualUploading, setIsUserManualUploading] = useState(false);
    const [serviceManualLink, setServiceManualLink] = useState("" as (string | File));
    const [isServiceManualUploading, setServiceManualUploading] = useState(false);
    const [hebrewManualLink, setHebrewManualLink] = useState("" as (string | File));
    const [isHebrewManualUploading, setIsHebrewManualUploading] = useState(false);
    const [supplier, setSupplier] = useState("");
    const [lifeSpan, setLifeSpan] = useState("");
    const [models, setModels] = useState<AbbreviatedItem[]>([{ cat: "", name: "" }]);
    const [accessories, setAccessories] = useState<AbbreviatedItem[]>([{ cat: "", name: "" }]);
    const [consumables, setConsumables] = useState<AbbreviatedItem[]>([{ cat: "", name: "" }]);
    const [spareParts, setSpareParts] = useState<AbbreviatedItem[]>([{ cat: "", name: "" }]);
    const [belongsToDevices, setBelongsToDevices] = useState<AbbreviatedItem[]>([{ cat: "", name: "" }]);
    const [areYouSureDelete, setAreYouSureDelete] = useState(false);

    useEffect(() => {
            const getSectors = async () => {
            const params: any = {};
            if (frontEndPrivilege === Role.Technician) {
                params.isMaintenance = true;
            }
            const searchParams = new URLSearchParams(params);
            const fetchedSectors = await fetch(`${backendFirebaseUri}/sectors?` + searchParams, {
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
                setCertificationPeriodMonths(i.certificationPeriodMonths ?? null);
                setDescription(i.description);
                if (i.imageLink) setImageLink(i.imageLink);
                if (i.qaStandardLink) setQaStandardLink(i.qaStandardLink);
                if (i.medicalEngineeringManualLink) setMedicalEngineeringManualLink(i.medicalEngineeringManualLink);
                if (i.userManualLink) setUserManualLink(i.userManualLink);
                if (i.serviceManualLink) setServiceManualLink(i.serviceManualLink);
                if (i.hebrewManualLink) setHebrewManualLink(i.hebrewManualLink);
                if (i.supplier) setSupplier(i.supplier);
                if (i.lifeSpan) setLifeSpan(i.lifeSpan);
                if (i.models && i.models.length > 0) setModels(i.models);
                if (i.accessories && i.accessories.length > 0) setAccessories(i.accessories);
                if (i.consumables && i.consumables.length > 0) setConsumables(i.consumables);
                if (i.spareParts && i.spareParts.length > 0) setSpareParts(i.spareParts);
                if (i.belongsToDevices && i.belongsToDevices.length > 0) setBelongsToDevices(i.belongsToDevices);
                if (i.kitCats) setKitCats(i.kitCats);
            }).catch(e => console.log(`Error fetching item details: ${e}`));
        }
        if (!params.itemid) {
            getSectors().then(s => {
                setSectorsToChooseFrom(s);
            }).catch(err => console.log(`Error fetching sectors: ${err}`));
        }
    }, [params.itemid, authToken]);

    const handleInput = (setFunc: (val: string) => any, event: ChangeEvent<HTMLInputElement>) => {
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
    const handleSetCatType = (catType: CatType) => {
        setCatType(catType);
        dispatch(viewingActions.changesAppliedToItem(true));
    }

    const saveItem = (newItem: boolean, saveLinks: boolean, newLinks: Record<string, string>): Promise<any> => {

        const itemCat = cat.replace(/ /g, '');

        const itemDetails = {
            name: name,
            cat: itemCat,
            kitCats: kitCats?.map(kc => kc?.replace(/ /g, '')),
            sector: sector,
            department: department,
            catType: catType,
            certificationPeriodMonths,
            description: description,
            imageLink: saveLinks ? (newLinks.imageLink ?? imageLink) : undefined,
            qaStandardLink: saveLinks ? newLinks.qaStandardLink ?? qaStandardLink : undefined,
            medicalEngineeringManualLink: saveLinks ? newLinks.medicalEngineeringManualLink ?? medicalEngineeringManualLink : undefined,
            userManualLink: saveLinks ? newLinks.userManualLink ?? userManualLink : undefined,
            serviceManualLink: saveLinks ? newLinks.serviceManualLink ?? serviceManualLink : undefined,
            hebrewManualLink: saveLinks ? newLinks.hebrewManualLink ?? hebrewManualLink : undefined,
            supplier: supplier,
            lifeSpan: lifeSpan,
            models: vacateItemListIfEmptyAndRemoveSpaces(models),
            accessories: vacateItemListIfEmptyAndRemoveSpaces(accessories),
            consumables: vacateItemListIfEmptyAndRemoveSpaces(consumables),
            spareParts: vacateItemListIfEmptyAndRemoveSpaces(spareParts),
            belongsToDevices: vacateItemListIfEmptyAndRemoveSpaces(belongsToDevices)
        };

        if (catType === "מכשיר") {
            itemDetails.belongsToDevices = [];
        }
        if (catType === "אביזר" || catType === "מתכלה" || catType === "חלק חילוף") {
            itemDetails.kitCats = [];
        }

        if (newItem) { // creating a new item
            return fetch(`${backendFirebaseUri}/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'auth-token': authToken
                },
                body: JSON.stringify(itemDetails)
            }).then((res) => {
                console.log("success saving item");
            })
            .catch((err) => console.log(`Error saving item: ${err}`));
        }            
        if (!newItem) { // editing existing iten
            return fetch(encodeURI(`${backendFirebaseUri}/items/${params.itemid ?? itemCat}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'auth-token': authToken
                },
                body: JSON.stringify(itemDetails)
            }).then((res) => {
                console.log("success updating item");
            })
            .catch((err) => console.log(`Error updating item: ${err}`));
        }    
        return Promise.resolve();    
    }
    
    const saveLinks = (): Promise<Record<string, string>> => {
        const getIfFile = (obj : { value: string | File, setter: React.Dispatch<React.SetStateAction<string | File>>, contentType: string, isUploadingSetter?: React.Dispatch<React.SetStateAction<boolean>> })
            : { value: string | File, setter: React.Dispatch<React.SetStateAction<string | File>>, contentType: string, isUploadingSetter?: React.Dispatch<React.SetStateAction<boolean>> } | undefined => 
                (obj.value && typeof obj.value !== 'string') ? obj : undefined ;
        const newFileFields: Record<string, { value: string | File, setter: React.Dispatch<React.SetStateAction<string | File>>, contentType: string, isUploadingSetter?: React.Dispatch<React.SetStateAction<boolean>> } | undefined> = {//: Array<keyof typeof itemDetails> = [ 
            imageLink: getIfFile({ value: imageLink, setter: setImageLink, contentType: 'image/png', isUploadingSetter: setIsImageUploading }),
            qaStandardLink: getIfFile({ value: qaStandardLink, setter: setQaStandardLink, contentType: 'application/pdf', isUploadingSetter: setIsQaStandardUploading }),
            medicalEngineeringManualLink: getIfFile({ value: medicalEngineeringManualLink, setter: setMedicalEngineeringManualLink, contentType: 'application/pdf', isUploadingSetter: setIsMedicalEngineeringManualUploading }),
            userManualLink: getIfFile({ value: userManualLink, setter: setUserManualLink, contentType: 'application/pdf', isUploadingSetter: setIsUserManualUploading }),
            serviceManualLink: getIfFile({ value: serviceManualLink, setter: setServiceManualLink, contentType: 'application/pdf', isUploadingSetter: setServiceManualUploading }),
            hebrewManualLink: getIfFile({ value: hebrewManualLink, setter: setHebrewManualLink, contentType: 'application/pdf', isUploadingSetter: setIsHebrewManualUploading }),
        };

        const newLinks: Record<string, string> = {};
        return Promise.all(Object.keys(newFileFields).map(key => {
            if (!newFileFields[key]) {
                return undefined;
            }
            const { value, setter, isUploadingSetter } = newFileFields[key]!;
            console.log(`file type: ${(value as File).type}`)
            const itemCat = cat.replace(/ /g, '');
            return fetch(encodeURI(`${backendFirebaseUri}/items/${params.itemid ?? itemCat}/url`), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'auth-token': authToken
                },
                body: JSON.stringify({ 
                    filename: (value as File).name,
                    contentType: (value as File).type
                })
            })
            .then(res => res.json())
            .then(json => {
                const urlObj = new URL(json.url);
                urlObj.search = '';
                const objectUrl = urlObj.toString();
                setter(objectUrl);
                isUploadingSetter?.(true);
                return fetch(json.url, {
                    method: 'PUT',
                    headers: { 'Content-Type': (value as File).type },
                    body: value
                }).then(res => { 
                    newLinks[key] = objectUrl;
                    isUploadingSetter?.(false);
                })
            }
            )
        })).then(() => newLinks);
    }

    const handleSave = () => {
        if (!name || !sector || !department) {
            // if the required fields of the Item mongo schema are not filled then don't save
            console.log("Please make sure to enter a name, catalog number, sector and department");
            return;
        }

        if(!cat){
            alert("מק\"ט הוא שדה חובה");
            return;
        }

        if (params.itemid) {
            saveLinks()
                .then(newLinks => saveItem(false, true, newLinks))
                .then(() => {
                    dispatch(viewingActions.changesAppliedToItem(false));
                    navigate(-1);
                })
        } else {
            saveItem(true, false, {})
                .then(saveLinks)
                .then(newLinks => saveItem(false, true, newLinks))
                .then(() => {
                    dispatch(viewingActions.changesAppliedToItem(false));
                    navigate(-1);
                })
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

    const catTypesToChooseFrom = frontEndPrivilege === Role.Technician ? [ CatType.SparePart ] : undefined;

    return (
        <div className={classes.itemMenu}>
            <h1 className={classes.title}>{params.itemid ? "עריכת פריט" : "הוספת פריט"}</h1>
            <div className={classes.details}>
                <ItemDetails
                    name={name}
                    cat={cat}
                    kitCats={kitCats}
                    sector={sector}
                    department={department}
                    description={description}
                    catType={catType}
                    certificationPeriodMonths={certificationPeriodMonths}
                    sectorsToChooseFrom={sectorsToChooseFrom}
                    catTypesToChooseFrom={catTypesToChooseFrom}
                    handleInput={handleInput}
                    handleDescription={handleDescription}
                    handleSetSector={handleSetSector}
                    handleSetDepartment={handleSetDepartment}
                    handleSetCatType={handleSetCatType}
                    setCertificationPeriodMonths={setCertificationPeriodMonths}
                    setName={setName}
                    setCat={setCat}
                    setKitCats={setKitCats}
                />
            </div>
            <div className={classes.relations}>
                {catType === "מכשיר" && <DeviceFields
                    imageLink={getFilename(imageLink)}
                    isImageUploading={isImageUploading}
                    qaStandardLink={getFilename(qaStandardLink)}
                    isQaStandardUploading={isQaStandardUploading}
                    medicalEngineeringManualLink={getFilename(medicalEngineeringManualLink)}
                    isMedicalEngineeringManualUploading={isMedicalEngineeringManualUploading}
                    userManualLink={getFilename(userManualLink)}
                    isUserManualUploading={isUserManualUploading}
                    serviceManualLink={getFilename(serviceManualLink)}
                    isServiceManualUploading={isServiceManualUploading}
                    hebrewManualLink={getFilename(hebrewManualLink)}
                    isHebrewManualUploading={isHebrewManualUploading}
                    supplier={supplier}
                    models={models}
                    accessories={accessories}
                    consumables={consumables}
                    spareParts={spareParts}
                    handleInput={handleInput}
                    setImageLink={setImageLink}
                    setQaStandardLink={setQaStandardLink}
                    setMedicalEngineeringManualLink={setMedicalEngineeringManualLink}
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
                    imageLink={getFilename(imageLink)}
                    isImageUploading={isImageUploading}
                    userManualLink={getFilename(userManualLink)}
                    isUserManualUploading={isUserManualUploading}
                    supplier={supplier}
                    models={models}
                    belongsToDevices={belongsToDevices}
                    handleInput={handleInput}
                    setImageLink={setImageLink}
                    setUserManualLink={setUserManualLink}
                    setSupplier={setSupplier}
                    setModels={setModels}
                    setBelongsToDevices={setBelongsToDevices}
                />}
                {catType === "מתכלה" && <ConsumableFields
                    imageLink={getFilename(imageLink)}
                    isImageUploading={isImageUploading}
                    userManualLink={getFilename(userManualLink)}
                    isUserManualUploading={isUserManualUploading}
                    supplier={supplier}
                    lifeSpan={lifeSpan}
                    models={models}
                    belongsToDevices={belongsToDevices}
                    handleInput={handleInput}
                    setImageLink={setImageLink}
                    setUserManualLink={setUserManualLink}
                    setSupplier={setSupplier}
                    setLifeSpan={setLifeSpan}
                    setModels={setModels}
                    setBelongsToDevices={setBelongsToDevices}
                />}
                {catType === "חלק חילוף" && <SparePartFields
                    imageLink={getFilename(imageLink)}
                    isImageUploading={isImageUploading}
                    userManualLink={getFilename(userManualLink)}
                    isUserManualUploading={isUserManualUploading}
                    supplier={supplier}
                    models={models}
                    belongsToDevices={belongsToDevices}
                    handleInput={handleInput}
                    setImageLink={setImageLink}
                    setUserManualLink={setUserManualLink}
                    setSupplier={setSupplier}
                    setModels={setModels}
                    setBelongsToDevices={setBelongsToDevices}
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