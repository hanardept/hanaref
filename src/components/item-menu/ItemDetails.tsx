import React, { ChangeEvent } from "react";
import { Sector } from "../../types/sector_types";
import DepartmentSelection from "../item-search/DepartmentSelection";
import SectorSelection from "../item-search/SectorSelection";
import CatTypeSelection from "./CatTypeSelection";
import LabeledInput from "../UI/LabeledInput";
import classes from './ItemMenu.module.css';
import { CatType, MaintenanceMethod } from "../../types/item_types";
import MaintenanceMethodSelection from "./MaintenanceMethodSelection";

interface ItemDetailsProps {
    name: string;
    cat: string;
    kitCats: string[];
    sector: string;
    department: string;
    description: string;
    emergency: boolean;
    maintenanceMethod: MaintenanceMethod,
    maintenanceMethodsToChooseFrom?: MaintenanceMethod[];
    maintenanceIntervalMonths?: number | null;
    catType: CatType;
    certificationPeriodMonths?: number | null;
    sectorsToChooseFrom: Sector[];
    catTypesToChooseFrom?: CatType[];
    handleInput: (setFunc: ((value: string) => void) | undefined, event: ChangeEvent<HTMLInputElement>) => void;
    handleDescription?: (event: ChangeEvent<HTMLTextAreaElement>) => void;
    handleSetSector?: (value: string) => void;
    handleSetDepartment?: (value: string) => void;
    handleSetCatType?: (catType: CatType) => void;
    setName?: React.Dispatch<React.SetStateAction<string>>;
    setCat?: React.Dispatch<React.SetStateAction<string>>;
    setEmergency?: React.Dispatch<React.SetStateAction<boolean>>;
    handleSetMaintenanceMethod?: (maintenanceMethod: MaintenanceMethod) => void;
    handleSetMaintenanceIntervalMonths?: (value: number | null) => void;
    setCertificationPeriodMonths?: (value: number | null) => void;
    setKitCats?: React.Dispatch<React.SetStateAction<string[]>>;
    fields?: string[];
    elementWrapper?: (element: JSX.Element, field: string) => JSX.Element;
}

const ItemDetails = (props: ItemDetailsProps) => {
    const { name, cat, kitCats, sector, department, description, emergency, maintenanceMethod, maintenanceIntervalMonths, catType, certificationPeriodMonths, sectorsToChooseFrom, catTypesToChooseFrom, maintenanceMethodsToChooseFrom, handleInput, handleDescription, handleSetSector, handleSetDepartment, handleSetCatType, setCertificationPeriodMonths, setName, setEmergency, handleSetMaintenanceMethod, handleSetMaintenanceIntervalMonths, setCat, setKitCats, fields, elementWrapper } = props;
    const sectorNames = sectorsToChooseFrom.map(s => s.sectorName);
    const departmentsToChooseFrom = (sector && sectorsToChooseFrom.length > 0) ? sectorsToChooseFrom.filter(s => s.sectorName === sector)[0].departments : [];

    console.log(`maintenanceMethod: ${maintenanceMethod}`);

    console.log(`fields: ${fields}`);

    const namedElements = [
            { name: 'name', element: <LabeledInput label="שם הפריט" required value={name} onChange={(e) => handleInput(setName, e)} placeholder="שם הפריט" /> },
            { name: 'cat', element: <LabeledInput label='מק"ט' value={cat} required onChange={(e) => handleInput(setCat, e)} placeholder='מק"ט' /> },
            { name: 'kitCats', element: catType === "מכשיר" ? <LabeledInput label='מק"ט ערכה' value={kitCats[0] ?? ''} onChange={(e) => { console.log(`settings kit cats`); setKitCats?.([e.target.value]); }} placeholder='מק"ט ערכה' /> : undefined },
            { name: 'certificationPeriodMonths', element: catType === "מכשיר" ? <LabeledInput
                type="number"
                label='תוקף הסמכה בחודשים'
                placeholder='תוקף הסמכה בחודשים'
                min={0}
                value={certificationPeriodMonths ?? ''}
                onChange={(e) => handleInput(val => setCertificationPeriodMonths?.(Number.parseInt(val) ? +val : null), e)}
            /> : undefined },
            { name: 'sector', element: <SectorSelection sectorNames={sectorNames} handleSetSector={handleSetSector} priorChosenSector={sector} required/>},
            { name: 'department', element: <DepartmentSelection departments={departmentsToChooseFrom} handleSetDepartment={handleSetDepartment} priorChosenDepartment={department} required />},
            { name: 'catType', element: <CatTypeSelection catTypes={catTypesToChooseFrom} selectCatType={handleSetCatType} currentCatType={catType} />},
            { name: 'description', element: <textarea value={description} onChange={handleDescription} placeholder="תיאור" />},
            { name: 'emergency', element: catType === "מכשיר" ? <div className={classes.emergencyToggle}>
                <label>
                    <input
                        type="checkbox"
                        checked={emergency}
                        onChange={(e) => setEmergency?.(e.target.checked)}
                    />
                    חירום
                </label>
            </div> : undefined},
            { name: 'maintenanceMethod', element: <LabeledInput
                label='שיטת אחזקה'
                placeholder='שיטת אחזקה'
                customInputElement={
                    <MaintenanceMethodSelection maintenanceMethods={maintenanceMethodsToChooseFrom} selectMaintenanceMethod={handleSetMaintenanceMethod} currentMaintenanceMethod={maintenanceMethod} />
                }/>
            },
            { name: 'maintenanceIntervalMonths', element: catType === "מכשיר" && maintenanceMethod === MaintenanceMethod.PeriodicTestAndCalibration ? <LabeledInput
                type="number"
                label='תדירות אחזקה בחודשים'
                placeholder='תדירות אחזקה בחודשים'
                min={0}
                value={maintenanceIntervalMonths ?? ''}
                onChange={(e) => handleInput(val => handleSetMaintenanceIntervalMonths?.(Number.parseInt(val) ? +val : null), e)}
            /> : undefined },
    ];

    return <>
        {
            namedElements
            .filter(({ name, element }) => element && (!fields || fields.includes(name)))
            .map(({ element, name }) => elementWrapper ? elementWrapper(element!, name) : element)
        }
        </>

        // return React.Children.map((<>
        //     {hasField(fields, 'name') ? <LabeledInput label="שם הפריט" required value={name} onChange={(e) => handleInput(setName, e)} placeholder="שם הפריט" /> : undefined}
        //     {hasField(fields, 'cat') ? <LabeledInput label='מק"ט' value={cat} required onChange={(e) => handleInput(setCat, e)} placeholder='מק"ט' /> : undefined}
        //     {hasField(fields, 'kitCats') && catType === "מכשיר" ? <LabeledInput label='מק"ט ערכה' value={kitCats[0] ?? ''} onChange={(e) => { console.log(`settings kit cats`); setKitCats?.([e.target.value]); }} placeholder='מק"ט ערכה' /> : undefined}
        //     {hasField(fields, 'certificationPeriodMonths') && catType === "מכשיר" ? <LabeledInput
        //         type="number"
        //         label='תוקף הסמכה בחודשים'
        //         placeholder='תוקף הסמכה בחודשים'
        //         min={0}
        //         value={certificationPeriodMonths ?? ''}
        //         onChange={(e) => handleInput(val => setCertificationPeriodMonths?.(Number.parseInt(val) ? +val : null), e)}
        //     /> : undefined}
        //     {hasField(fields, 'sector') ? <SectorSelection sectorNames={sectorNames} handleSetSector={handleSetSector} priorChosenSector={sector} required/> : undefined}
        //     {hasField(fields, 'department') ? <DepartmentSelection departments={departmentsToChooseFrom} handleSetDepartment={handleSetDepartment} priorChosenDepartment={department} required /> : undefined}
        //     {hasField(fields, 'catType') ? <CatTypeSelection catTypes={catTypesToChooseFrom} selectCatType={handleSetCatType} currentCatType={catType} /> : undefined}
        //     {hasField(fields, 'description') ? <textarea value={description} onChange={handleDescription} placeholder="תיאור" /> : undefined}
        //     {hasField(fields, 'emergency') && catType === "מכשיר" ? <div className={classes.emergencyToggle}>
        //         <label>
        //             <input
        //                 type="checkbox"
        //                 checked={emergency}
        //                 onChange={(e) => setEmergency?.(e.target.checked)}
        //             />
        //             חירום
        //         </label>
        //     </div> : undefined}
        // </>).props.children.filter(Boolean), child => elementWrapper ? elementWrapper(child) : child);
}

export default ItemDetails;
