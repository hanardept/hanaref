import ReactDOM from 'react-dom';
import React, { ChangeEvent, FocusEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import { Department, Sector } from "../../types/sector_types";
import BigButton from "../UI/BigButton";
import classes from './SectorManagement.module.css';
import { portalElement } from '../../elements/portalElement';
import AreYouSure from '../UI/AreYouSure';
import { viewingActions } from '../../store/viewing-slice';

function vacateItemListIfEmpty(itemList: Department[]) {
    return itemList.filter(i => i.departmentName !== "");
}

const SectorMenu = ({ exit, sector, reload }: { exit: () => void, sector?: Sector, reload?: () => void }) => {
    const [sectorName, setSectorName] = useState(sector?.sectorName ?? "");
    let visibleToPublicPreload = true;
    if (sector) visibleToPublicPreload = sector.visibleToPublic;
    const [visibleToPublic, setVisibleToPublic] = useState(visibleToPublicPreload);

    let departmentsPreload = [{ departmentName: "" }];
    if (sector && sector.departments.length > 0) departmentsPreload = sector.departments;
    const [departments, setDepartments] = useState<Department[]>(departmentsPreload);
    const authToken = useAppSelector(state => state.auth.jwt);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const changesApplied = useAppSelector(state => state.viewing.sectorManagement.changesApplied);
    const [showAreYouSure, setShowAreYouSure] = useState(false);
    const [warningBeforeDeletion, setWarningBeforeDeletion] = useState(false); // useful only in edit mode;

    const handleDepartmentChangeByIndex = (index: number, event: ChangeEvent<HTMLInputElement>) => {
        dispatch(viewingActions.changesAppliedToSector(true));
        setDepartments(prev => {
            const newDepartments = [...prev];
            newDepartments[index].departmentName = event.target.value;
            return newDepartments;
        });
    }
    const deleteUponBlur = (event: FocusEvent<HTMLInputElement>) => {
        if (event.target.value.length === 0) { 
            setDepartments(prev => {
                const newDepartments = [...prev];
                return newDepartments.slice(0, newDepartments.length-1)
            });
        }
    }
    const addInput = () => {
        setDepartments(prev => {
            const newDepartments = [...prev];
            newDepartments.push({ departmentName: "" });
            return newDepartments;
        })
    }
    const handleSave = () => {
        const departmentsToSave = vacateItemListIfEmpty(departments);

        if (sector) { // if editing an existing sector
            fetch(encodeURI(`/sectors/${sectorName}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'auth-token': authToken
                },
                body: JSON.stringify({
                    sectorName: sectorName,
                    visibleToPublic: visibleToPublic,
                    departments: departmentsToSave
                })
            })
                .then((res) => {
                    console.log('Success updating sector');
                    dispatch(viewingActions.changesAppliedToSector(false))
                    exit();
                    reload!();
                })
                .catch((err) => console.log(`Error updating sector: ${err}`));
        } else { // if creating a new sector
            fetch(encodeURI(`/sectors`), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'auth-token': authToken
                },
                body: JSON.stringify({
                    sectorName: sectorName,
                    visibleToPublic: visibleToPublic,
                    departments: departmentsToSave
                })
            })
                .then((res) => {
                    console.log('Success saving sector');
                    dispatch(viewingActions.changesAppliedToSector(false));
                    if (sector) {
                        exit();
                    } else {
                        navigate(-1);
                    }
                })
                .catch((err) => console.log(`Error saving sector: ${err}`));
        }
    }

    // ----------- relevant only for edit mode -------------
    const handleReturn = () => {
        if (changesApplied) {
            setShowAreYouSure(true);
        } else {
            exit();
        }
    }
    const exitAndRevertChanges = () => {
        setSectorName(sector!.sectorName);
        setVisibleToPublic(sector!.visibleToPublic);
        setDepartments(sector!.departments);
        dispatch(viewingActions.changesAppliedToSector(false));
        exit();
    }
    const triggerWarningBeforeDeletion = () => {
        setWarningBeforeDeletion(true);
    }
    const handleDeleteSector = () => {
        fetch(`/sectors`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'auth-token': authToken
            },
            body: JSON.stringify({ sectorName: sector!.sectorName })
        })
            .then((res) => {
                console.log("Deleted sector successfully!");
                exit();
                reload!();
            }).catch((err) => console.log(`Error deleting sector: ${err}`));
    }
    // ----------- relevant only for edit mode -------------

    return (
        <div className={classes.wrapper}>
            {showAreYouSure && <AreYouSure text='נדמה לנו שבוצעו שינויים. לצאת ללא שמירה?' leftText='צא' leftAction={exitAndRevertChanges} rightText='הישאר' rightAction={() => setShowAreYouSure(false)} />}
            {sector && ReactDOM.createPortal(<div className={classes.returnButtonCover} onClick={handleReturn}></div>, portalElement)}
            <input type="text" placeholder="שם המדור" value={sectorName} onChange={(event) => { dispatch(viewingActions.changesAppliedToSector(true)); setSectorName(event.target.value)}} />
            <div className={classes.checkbox}>
                <input type="checkbox" id="hiddenFromPublic" defaultChecked={!visibleToPublic} onChange={() => setVisibleToPublic(prev => !prev)} />
                <label htmlFor="hiddenFromPublic">מוסתר מהציבור</label>
            </div>
            <input type="text" placeholder="שם תחום" value={departments[0].departmentName} onChange={(event) => handleDepartmentChangeByIndex(0, event)} />
            {departments.map((d, idx) => {
                if (idx === 0) return <React.Fragment key="a"></React.Fragment>
                return <input key={`${idx.toString()}+z`} type="text" placeholder="שם תחום" value={d.departmentName} onChange={(event) => handleDepartmentChangeByIndex(idx, event)} onBlur={deleteUponBlur} />
            })}
            <div className={classes.plusButton} onClick={addInput}>+</div>
            <BigButton text="שמור" action={handleSave} overrideStyle={{ marginTop: "3rem" }} />
            {sector && <BigButton text="מחיקת מדור" action={triggerWarningBeforeDeletion} overrideStyle={{ marginTop: "1rem", backgroundColor: "#CE1F1F" }} />}
            {warningBeforeDeletion && <AreYouSure text="באמת למחוק מדור?" leftText='מחק' leftAction={handleDeleteSector} rightText="אל תמחק" rightAction={() => setWarningBeforeDeletion(false)} />}
        </div>
    )
};

export default SectorMenu;