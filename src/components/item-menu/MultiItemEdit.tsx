import { ChangeEvent, useEffect, useState } from 'react';
import { fetchBackend } from '../../backend-variables/address';
import { useAppDispatch, useAppSelector } from '../../hooks/redux-hooks';
import { viewingActions } from '../../store/viewing-slice';
import { AbbreviatedItem, CatType, SupplierSummary } from '../../types/item_types';
import { Sector } from '../../types/sector_types';
import BigButton from '../UI/BigButton';
import classes from './ItemMenu.module.css';
import ItemDetails from './ItemDetails';
import DeviceFields from './DeviceFields';
import AccessoryFields from './AccessoryFields';
import ConsumableFields from './ConsumableFields';
import SparePartFields from './SparePartFields';
import { Role } from '../../types/user_types';
import { MdRemoveCircle } from 'react-icons/md';
import LabeledInput from '../UI/LabeledInput';
import { useNavigate, useSearchParams } from 'react-router-dom';

function vacateItemListIfEmptyAndRemoveSpaces(itemList: AbbreviatedItem[]) {
    const filteredList = itemList.filter(i => i.cat !== "" || i.name !== "");
    return filteredList.map(i => {
        const output = {...i};
        output.cat = output.cat.replace(/ /g, '');
        return output;
    })
}

const allowedFields = [
    { names: [ 'sector', 'department' ], text: 'מדור ותחום'},
    { names: [ 'supplier' ], text: 'ספק' },
    { names: [ 'emergency' ], text: 'חירום', exceptCatTypes: [ CatType.Accessory, CatType.Consumable, CatType.SparePart ] },
    { names: [ 'belongsToDevices' ], text: 'שייך למכשירים', exceptCatTypes: [ CatType.Device ] }
];

const MultiItemEdit = () => {
    const { jwt: authToken, frontEndPrivilege } = useAppSelector(state => state.auth);
    const { selectedItems } = useAppSelector(state => state.viewing.itemManagement);
    const [sectorsToChooseFrom, setSectorsToChooseFrom] = useState<Sector[]>([]);
    const dispatch = useAppDispatch();
    const [sector, setSector] = useState("");
    const [department, setDepartment] = useState("");
    const [emergency, setEmergency] = useState(false);
    const [supplier, setSupplier] =  useState(undefined as SupplierSummary | null | undefined);
    const [belongsToDevices, setBelongsToDevices] = useState<AbbreviatedItem[]>([{ cat: "", name: "" }]);
    const [fields, setFields ] = useState([] as string[]);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    // const [ selectedField, setSelectedField] = useState<string | undefined>();

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
        const data: Record<string, any> = { sector, department, emergency, supplier, belongsToDevices };
        if (fields.some(f => data[f] === undefined || data[f] === "" || (Array.isArray(data[f]) && data[f].length === 0))) {
            console.log(`missing field: ${fields.find(f => data[f] === undefined || data[f] === "" || (Array.isArray(data[f]) && data[f].length === 0))}`);
            // if the required fields of the Item mongo schema are not filled then don't save
            alert("לא כל השדות שנבחרו מולאו");
            return;
        }


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
        } finally {
            dispatch(viewingActions.changesAppliedToItem(false));
            dispatch(viewingActions.changeSelectedItems([]));
            navigate(-1);
        }
        return Promise.resolve();    
    }

    const catType = selectedItems.reduce((type, item) => !type || (type === item.catType) ? type : undefined, undefined);

    console.log(`sectors to choose: ${JSON.stringify(sectorsToChooseFrom)}`);

    const removeField = (field: string) => {
        const fieldGroup = allowedFields.find(f => f.names.includes(field));
        setFields(fields.filter(f => !fieldGroup?.names.includes(f)));
    }

    return (
        <div className={`${classes.itemMenu} ${classes.multiItemMenu}`}>
            <h1 className={classes.title}>עריכת פריטים</h1>
            <div className={classes.fields}>
                <LabeledInput label="שדה"  placeholder="שדה"
                    customInputElement={
                        <div className={classes.fieldSelectionContainer}>
                            <select className={classes.fieldSelection} name="fields" id="fields" onChange={e => {
                                // setSelectedField(e.target.value)
                                const selectedField = e.target.value;
                                setFields([ ...fields, ...(allowedFields.find(f => f.text ===  selectedField as string)?.names as string[])])
                            }
                            } value={""}>
                                {allowedFields.filter(({ names, exceptCatTypes }) => 
                                    (!exceptCatTypes ||
                                    selectedItems.every(selectedItem => !exceptCatTypes.includes(selectedItem.catType!))) &&
                                    !fields?.some(name => names.includes(name))).map(({ names, text }) => <option>{text}</option>)}
                                <option value="" disabled selected>--- בחר שדה ---</option>
                            </select>
                            {/* {selectedField ?
                            <MdAddCircle onClick={() => { if (selectedField) { setFields([ ...fields, allowedFields.find(f => f.text ===  selectedField as string)?.name as string ]); setSelectedField('');} } }/> : <></>} */}
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
                    elementWrapper={(child, field) => (<span className={classes.removableField}>
                        <MdRemoveCircle onClick={() => removeField(field)}/>
                        {child}
                    </span>)}
                />
                <DeviceFields
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
                    fields={fields}
                    elementWrapper={(child, field) => (<span className={classes.removableField}>
                        <MdRemoveCircle onClick={() => removeField(field)}/>
                        {child}
                    </span>)}                    
                />
                <AccessoryFields
                    imageLink=''
                    userManualLink=''
                    supplier={supplier}
                    models={[]}
                    belongsToDevices={belongsToDevices}
                    handleInput={handleInput}
                    setSupplier={setSupplier}
                    setBelongsToDevices={setBelongsToDevices}
                    fields={fields.filter(f => f !== 'supplier')}
                    elementWrapper={(child, field) => (<span className={classes.removableField}>
                        <MdRemoveCircle onClick={() => removeField(field)}/>
                        {child}
                    </span>)}                     
                />
                <ConsumableFields
                    imageLink=''
                    userManualLink=''
                    supplier={supplier}
                    models={[]}
                    lifeSpan=''
                    belongsToDevices={belongsToDevices}
                    handleInput={handleInput}
                    setSupplier={setSupplier}
                    setBelongsToDevices={setBelongsToDevices}
                    fields={fields.filter(f => !['belongsToDevices', 'supplier'].includes(f))}
                    elementWrapper={(child, field) => (<span className={classes.removableField}>
                        <MdRemoveCircle onClick={() => removeField(field)}/>
                        {child}
                    </span>)}                     
                />
                <SparePartFields
                    imageLink=''
                    userManualLink=''
                    supplier={supplier}
                    models={[]}
                    belongsToDevices={belongsToDevices}
                    handleInput={handleInput}
                    setSupplier={setSupplier}
                    setBelongsToDevices={setBelongsToDevices}
                    fields={fields.filter(f => !['belongsToDevices', 'supplier'].includes(f))}
                    elementWrapper={(child, field) => (<span className={classes.removableField}>
                        <MdRemoveCircle onClick={() => removeField(field)}/>
                        {child}
                    </span>)}                     
                />
            </div>
            <div className={classes.buttons}>
                <BigButton text="שמור" action={handleSave} overrideStyle={{ marginTop: "2.5rem" }} className={classes.button} />
            </div>
        </div>
    )
};

export default MultiItemEdit;