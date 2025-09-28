import { Route, Routes, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import AdminOnly from "../authorization/AdminOnly";
import classes from './Header.module.css';
import { MdEdit } from "react-icons/md";
import { FiArchive } from "react-icons/fi";
import { Fragment, useState } from "react";
import AreYouSure from "../UI/AreYouSure";
import { fetchBackend } from "../../backend-variables/address";
import { viewingActions } from "../../store/viewing-slice";


const ActionsHeader = (props: any) => {
    const navigate = useNavigate();
    const selectedItems = useAppSelector(state => state.viewing.itemManagement.selectedItems);
    const { jwt: authToken }  = useAppSelector(state => state.auth);
    const dispatch = useAppDispatch();

    const [ areYouSureArchive, setAreYouSureArchive ] = useState(false);
    const [ isArchiveAction, setIsArchiveAction ] = useState(true);

    const handleArchive = () => {
        fetchBackend(encodeURI(`items/archive`), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'auth-token': authToken
            },
            body: JSON.stringify({
                cats: selectedItems.map(item => item.cat),
                archived: isArchiveAction
            })
        })
        .then((res) => {
            console.log("Successfully set archived items!");
            dispatch(viewingActions.changesAppliedToItem(false));
            setAreYouSureArchive(false);
            navigate("/");
        }).catch((err) => console.log(`Error setting archived items: ${err}`));
    }    

    const actions = 
        <span className={classes.toolbarSpan} {...props}>
            {selectedItems.length ? <AdminOnly hide={true}><MdEdit onClick={() => navigate('/itemmenu/multiple')} style={{ lineHeight: 0 }}/></AdminOnly> : <></>}
            {selectedItems.length ? <AdminOnly hide={true}>
                <span style={{ margin: 0, position: 'relative', display: 'inline-block', height: '1rem' }}>
                    <FiArchive onClick={() => { setIsArchiveAction(false); setAreYouSureArchive(true)}} style={{ lineHeight: 0, zIndex: 10 }}/>
                    <svg onClick={() => { setIsArchiveAction(false); setAreYouSureArchive(true)}} width="16" height="16" style={{ position: 'absolute', top: 0, left: 0 }} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            {selectedItems.length ? <AdminOnly hide={true}><FiArchive onClick={() => { setIsArchiveAction(true); setAreYouSureArchive(true)}} style={{ lineHeight: 0 }}/></AdminOnly> : <></>}
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