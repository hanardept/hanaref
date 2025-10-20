import { Route, Routes, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import AdminOnly from "../authorization/AdminOnly";
import classes from './Header.module.css';
import { MdEdit } from "react-icons/md";
import { FiArchive } from "react-icons/fi";
import { useState } from "react";
import AreYouSure from "../UI/AreYouSure";
import { fetchBackend } from "../../backend-variables/address";
import { viewingActions } from "../../store/viewing-slice";
import { Tooltip } from 'react-tooltip'


const ActionsHeader = (props: any) => {
    const navigate = useNavigate();
    //const selectedItems = useAppSelector(state => state.viewing.itemManagement.selectedItems);
    //const selectedAllItems = useAppSelector(state => state.viewing.itemManagement.selectAllItems);
    const { selectAllItems, selectedItems, excludedItems } = useAppSelector(state => state.viewing.itemManagement);
    const { searchVal, sector: filteredSector, department: filteredDepartment, showArchived } = useAppSelector(state => state.viewing.searching);
    const { jwt: authToken }  = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch();

    const [ areYouSureArchive, setAreYouSureArchive ] = useState(false);
    const [ isArchiveAction, setIsArchiveAction ] = useState(true);

    let searchParams: URLSearchParams;
    if (selectAllItems) {
        searchParams = new URLSearchParams({ selectAll: 'true' });
        if (searchVal) searchParams.append('search', searchVal);
        if (filteredSector) searchParams.append('sector', filteredSector);
        if (filteredDepartment) searchParams.append('department', filteredDepartment);  
        if (!showArchived) searchParams.append('status', 'active');
        excludedItems?.forEach(item => searchParams.append('excludedCats', item.cat!));
    } else {
        searchParams = new URLSearchParams();
        selectedItems?.forEach(item => searchParams.append('cats', item.cat!));
    }   

    const handleArchive = () => {
        fetchBackend(encodeURI(`items/archive?` + searchParams.toString()), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'auth-token': authToken
            },
            body: JSON.stringify({
                archived: isArchiveAction
            })
        })
        .then((res) => {
            if (res.status !== 200) {
                return res.json();
            }
            console.log("Successfully set archived items!");
            dispatch(viewingActions.changeSelectedItems({ selectAll: false, excludedItems: [], selectedItems: [] }));
            dispatch(viewingActions.changesAppliedToItem(false));
            dispatch(viewingActions.changesIdAppliedToItems());
            navigate("/");
        })
        .then(errJson => {
            if (errJson) {
                alert(`ארכוב הפריטים נכשל: ${errJson.details}`);
            }
            setAreYouSureArchive(false);
        })
        .catch((err) => console.log(`Error setting archived items: ${err}`));
    }    

    const selected = !!(selectAllItems || selectedItems.length);
    console.log(`selected: ${selected}`);

    const actions = 
        <span className={classes.toolbarSpan} {...props}>
            {selected ? <AdminOnly hide={true}><MdEdit onClick={() => navigate('/itemmenu/multiple')} style={{ lineHeight: 0, cursor: "pointer" }} data-tooltip-id="edit-multiple" data-tooltip-content="ערוך פריטים"/></AdminOnly> : <></>}
            {selected ? <Tooltip id="edit-multiple" place="bottom" /> : <></>}

            {selected ? <AdminOnly hide={true}>
                <span style={{ margin: 0, position: 'relative', display: 'inline-block', height: '1rem' }} data-tooltip-id="unarchive-multiple" data-tooltip-content="הוצא פריטים מארכיון">
                    <FiArchive onClick={() => { setIsArchiveAction(false); setAreYouSureArchive(true)}} style={{ lineHeight: 0, zIndex: 10, cursor: "pointer" }}/>
                    <svg onClick={() => { setIsArchiveAction(false); setAreYouSureArchive(true)}} width="16" height="16" style={{ position: 'absolute', top: 0, left: 0, cursor: "pointer" }} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <line
                            x1="4" 
                            y1="0" 
                            x2="12" 
                            y2="15" 
                            stroke="white" 
                            strokeWidth="1" 
                        />
                    </svg>                    
                </span>
            </AdminOnly> : <></>}   
            {selected ? <Tooltip id="unarchive-multiple" place="bottom" /> : <></>}                    

            {selected ? <AdminOnly hide={true}><FiArchive title="ארכב פריטים" onClick={() => { setIsArchiveAction(true); setAreYouSureArchive(true)}} style={{ lineHeight: 0, cursor: "pointer" }} data-tooltip-id="archive-multiple" data-tooltip-content="ארכב פריטים"/></AdminOnly> : <></>}
            {selected ? <Tooltip id="archive-multiple" place="bottom" /> : <></>}         
        </span>

    return (
        <>
        <Routes>
            <Route path="/" element={actions} />
        </Routes>
        {areYouSureArchive && <AreYouSure text={isArchiveAction ? "האם באמת לארכב את הפריטים?" : "האם באמת להוציא את הפריטים מהארכיון?"} leftText={isArchiveAction ? 'ארכב' : 'הוצא מארכיון'} leftAction={handleArchive} rightText='לא' rightAction={() => setAreYouSureArchive(false)} />}
        </>
            
    )
    
};
export default ActionsHeader;