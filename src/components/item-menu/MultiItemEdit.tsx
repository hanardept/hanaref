import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { backendFirebaseUri, fetchBackend } from '../../backend-variables/address';
import { useAppDispatch, useAppSelector } from '../../hooks/redux-hooks';
import { viewingActions } from '../../store/viewing-slice';
import { AbbreviatedItem, CatType, Item, SupplierSummary } from '../../types/item_types';
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
import { MdAddCircle, MdRemoveCircle } from 'react-icons/md';
import LabeledInput from '../UI/LabeledInput';

function vacateItemListIfEmptyAndRemoveSpaces(itemList: AbbreviatedItem[]) {
    const filteredList = itemList.filter(i => i.cat !== "" || i.name !== "");
    return filteredList.map(i => {
        const output = {...i};
        output.cat = output.cat.replace(/ /g, '');
        return output;
    })
}

const allowedFields = [
    { name: 'sector', text: 'מדור'},
    { name: 'department', text: 'תחום'},
    { name: 'supplier', text: 'ספק' },
    { name: 'emergency', text: 'חירום' },
    { name: 'archive', text: 'ארכיון' },
    { name: 'belongsToDevic', text: 'שייך למכשירים' }
];

const MultiItemEdit = () => {
    const params = useParams();
    const { jwt: authToken, frontEndPrivilege } = useAppSelector(state => state.auth);
    const { selectedItems } = useAppSelector(state => state.viewing.itemManagement);
    const [sectorsToChooseFrom, setSectorsToChooseFrom] = useState<Sector[]>([]);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [sector, setSector] = useState("");
    const [department, setDepartment] = useState("");
    const [emergency, setEmergency] = useState(false);
    const [supplier, setSupplier] =  useState(undefined as SupplierSummary | null | undefined);
    const [belongsToDevices, setBelongsToDevices] = useState<AbbreviatedItem[]>([{ cat: "", name: "" }]);
    const [ fields, setFields ] = useState([] as string[]);
    const [ changes, setChanges ] = useState({});
    const [ selectedField, setSelectedField] = useState<string | undefined>();

    useEffect(() => {
            const getSectors = async () => {
            const params: any = {};
            if (frontEndPrivilege === Role.Technician) {
                params.isMaintenance = true;
            }
            const searchParams = new URLSearchParams(params);
            const fetchedSectors = await fetchBackend(`sectors?` + searchParams, {
                headers: { 'auth-token': authToken }
            });
            return await fetchedSectors.json();
        };

        getSectors().then(s => setSectorsToChooseFrom(s));
    }, [authToken, frontEndPrivilege]);

    const handleInput = (setFunc: ((val: string) => any) | undefined, event: ChangeEvent<HTMLInputElement>) => {
        if (setFunc) {
            setFunc(event.target.value);
            dispatch(viewingActions.changesAppliedToItem(true));
        }
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

    const handleSave = async (): Promise<any> => {

        const fullItemDetails: Record<string, any> = {
            sector: sector,
            department: department,
            emergency: emergency,
            supplier: supplier,
            belongsToDevices: vacateItemListIfEmptyAndRemoveSpaces(belongsToDevices)
        };

        const itemDetails = fields.reduce((obj, field) => ({ ...obj, [field]: fullItemDetails[field] }), {})

        try {
            await fetchBackend('items', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'auth-token': authToken
                },
                body: JSON.stringify({ cats: selectedItems.map(i => i.cat), data: itemDetails })
            });

            console.log("success saving items");
        } catch(err) {
            console.log(`Error saving items: ${err}`);
        }
        return Promise.resolve();    
    }

    const catTypesToChooseFrom = frontEndPrivilege === Role.Technician ? [ CatType.SparePart ] : undefined;

    const catType = selectedItems.reduce((type, item) => !type || (type === item.catType) ? type : undefined, undefined);

    console.log(`sectors to choose: ${JSON.stringify(sectorsToChooseFrom)}`);

    return (
        <div className={`${classes.itemMenu} ${classes.multiItemMenu}`}>
            <h1 className={classes.title}>עריכת פריטים</h1>
            <div className={classes.fields}>
                <LabeledInput label="שדה"  placeholder="שדה"
                    customInputElement={
                        <div className={classes.fields}>
                        <select name="fields" id="fields" onChange={e => setSelectedField(e.target.value)} value={selectedField}>
                            {allowedFields.filter(({ name }) => !fields?.includes(name)).map(({ name, text }) => <option selected={selectedField === name}>{text}</option>)}
                            <option value="" disabled selected>--- בחר שדה ---</option>
                        </select>
                        {selectedField ?
                        <MdAddCircle onClick={() => { if (selectedField) { setFields([ ...fields, allowedFields.find(f => f.text ===  selectedField as string)?.name as string ]); setSelectedField('');} } }/> : <></>}
                        </div>}
                />
            </div>
            <div className={classes.details}>
                <ItemDetails
                    name=''
                    cat=''
                    kitCats={[]}
                    sector={sector}
                    department={department}
                    description=''
                    catType={CatType.Device}
                    emergency={emergency}
                    sectorsToChooseFrom={sectorsToChooseFrom}
                    handleInput={handleInput}
                    handleSetSector={handleSetSector}
                    handleSetDepartment={handleSetDepartment}
                    setEmergency={setEmergency}
                    fields={fields}
                    elementWrapper={(child, field) => (<span className={classes.removeField}>
                        <MdRemoveCircle onClick={() => setFields(fields.filter(f => f !== field))}/>
                        {child}
                    </span>)}
                />
            </div>
            <div className={classes.relations}>
                {catType === "מכשיר" && <DeviceFields
                    imageLink=''
                    qaStandardLink=''
                    medicalEngineeringManualLink=''
                    userManualLink=''
                    serviceManualLink=''
                    hebrewManualLink=''
                    supplier={supplier}
                    models={[]}
                    accessories={[]}
                    consumables={[]}
                    spareParts={[]}
                    handleInput={handleInput}
                    setSupplier={setSupplier}
                />}
                {catType === "אביזר" && <AccessoryFields
                    imageLink=''
                    userManualLink=''
                    supplier={supplier}
                    models={[]}
                    belongsToDevices={belongsToDevices}
                    handleInput={handleInput}
                    setSupplier={setSupplier}
                    setBelongsToDevices={setBelongsToDevices}
                />}
                {catType === "מתכלה" && <ConsumableFields
                    imageLink=''
                    userManualLink=''
                    supplier={supplier}
                    models={[]}
                    lifeSpan=''
                    belongsToDevices={belongsToDevices}
                    handleInput={handleInput}
                    setSupplier={setSupplier}
                    setBelongsToDevices={setBelongsToDevices}
                />}
                {catType === "חלק חילוף" && <SparePartFields
                    imageLink=''
                    userManualLink=''
                    supplier={supplier}
                    models={[]}
                    belongsToDevices={belongsToDevices}
                    handleInput={handleInput}
                    setSupplier={setSupplier}
                    setBelongsToDevices={setBelongsToDevices}
                />}
            </div>
            <div className={classes.buttons}>
                <BigButton text="שמור" action={handleSave} overrideStyle={{ marginTop: "2.5rem" }} className={classes.button} />
            </div>
        </div>
    )
};

export default MultiItemEdit;