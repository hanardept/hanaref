import React, { ChangeEvent } from "react";
import { Sector } from "../../types/sector_types";
import DepartmentSelection from "../item-search/DepartmentSelection";
import SectorSelection from "../UI/SectorSelection";
import CatTypeSelection from "./CatTypeSelection";
import LabeledInput from "../UI/LabeledInput";
import classes from './ItemMenu.module.css';
import { CatType } from "../../types/item_types";

interface ItemDetailsProps {
    name: string;
    cat: string;
    kitCats: string[];
    sector: string;
    department: string;
    description: string;
    emergency: boolean;
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
    setCertificationPeriodMonths?: (value: number | null) => void;
    setKitCats?: React.Dispatch<React.SetStateAction<string[]>>;
    fields?: string[];
    elementWrapper?: (element: JSX.Element, field: string) => JSX.Element;

    isReviewMode?: boolean;
    pendingChanges?: Record<string, any>;
    fieldReviews?: Record<string, 'approve' | 'reject'>;
    onReviewDecision?: (field: string, decision: 'approve' | 'reject') => void;
}

const ItemDetails = (props: ItemDetailsProps) => {
    const { 
        name, cat, kitCats, sector, department, description, emergency, 
        catType, certificationPeriodMonths, sectorsToChooseFrom, 
        catTypesToChooseFrom, handleInput, handleDescription, 
        handleSetSector, handleSetDepartment, handleSetCatType, 
        setCertificationPeriodMonths, setName, setEmergency, setCat, 
        setKitCats, fields, elementWrapper,
        isReviewMode, pendingChanges, fieldReviews, onReviewDecision 
    } = props;

    const sectorNames = sectorsToChooseFrom.map(s => s.sectorName);
    const departmentsToChooseFrom = (sector && sectorsToChooseFrom.length > 0) 
        ? sectorsToChooseFrom.filter(s => s.sectorName === sector)[0].departments 
        : [];

    /**
     * Helper to wrap elements with the Review UI (Comparison + Buttons)
     */
    const renderReviewRow = (fieldName: string, currentInput: JSX.Element) => {
        if (!isReviewMode || !pendingChanges || pendingChanges[fieldName] === undefined) {
            return currentInput;
        }

        const review = fieldReviews?.[fieldName];
        const decision = review?.decision;
        
        // The value shown in the "Edit" box:
        // Priority: 1. The custom edit | 2. The pending change (as a starting point)
        const editValue = review?.value ?? pendingChanges[fieldName];

        const inputWithLogic = React.cloneElement(currentInput as React.ReactElement, {
            disabled: decision !== 'edit',
            // IMPORTANT: We override the value to show the local edit, not the prop
            value: decision === 'edit' ? editValue : (props as any)[fieldName],
            onChange: (e: any) => {
                const val = e.target.value;
                onReviewDecision?.(fieldName, 'edit', val);
            },
            style: { backgroundColor: decision === 'edit' ? '#fff' : '#f0f0f0' }
        });

        return (
            <div className={classes.reviewFieldContainer}>
                {/* Comparison Grid stays same */}
                
                <div className={classes.reviewActionButtons}>
                    <button onClick={() => onReviewDecision?.(fieldName, 'approve')}>אשר</button>
                    <button onClick={() => onReviewDecision?.(fieldName, 'reject')}>דחה</button>
                    <button onClick={() => onReviewDecision?.(fieldName, 'edit')}>ערוך</button>
                </div>

                <div className={classes.manualEditZone}>
                    {inputWithLogic}
                </div>
            </div>
        );
    };

    const namedElements = [
        { name: 'name', element: <LabeledInput label="שם הפריט" required value={name} onChange={(e) => handleInput(setName, e)} placeholder="שם הפריט" /> },
        { name: 'cat', element: <LabeledInput label='מק"ט' value={cat} required onChange={(e) => handleInput(setCat, e)} placeholder='מק"ט' /> },
        { name: 'kitCats', element: catType === "מכשיר" ? <LabeledInput label='מק"ט ערכה' value={kitCats[0] ?? ''} onChange={(e) => setKitCats?.([e.target.value])} placeholder='מק"ט ערכה' /> : undefined },
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
        { name: 'description', element: <textarea className={classes.descriptionArea} value={description} onChange={handleDescription} placeholder="תיאור" />},
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
    ];

    return (
        <>
            {namedElements
                .filter(({ name, element }) => element && (!fields || fields.includes(name)))
                .map(({ element, name }) => {
                    // 1. Wrap with review logic first
                    const reviewedElement = renderReviewRow(name, element!);
                    // 2. Wrap with the external elementWrapper if provided
                    return elementWrapper ? elementWrapper(reviewedElement, name) : reviewedElement;
                })
            }
        </>
    );
};

export default ItemDetails;