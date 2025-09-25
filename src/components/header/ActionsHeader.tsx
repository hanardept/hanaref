import { Route, Routes, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../hooks/redux-hooks";
import AdminOnly from "../authorization/AdminOnly";
import classes from './Header.module.css';
import { MdEdit } from "react-icons/md";
import { FiArchive } from "react-icons/fi";
import { useState } from "react";
import AreYouSure from "../UI/AreYouSure";


const ActionsHeader = (props: any) => {
    const navigate = useNavigate();
    const selectedItems = useAppSelector(state => state.viewing.itemManagement.selectedItems);

    const [ areYouSureArchive, setAreYouSureArchive ] = useState(false);

    const actions = 
        <span className={classes.toolbarSpan} {...props}>
            {selectedItems.length ? <AdminOnly hide={true}><MdEdit onClick={() => navigate('/itemmenu/multiple')} style={{ lineHeight: 0 }}/></AdminOnly> : <></>}
            {selectedItems.length ? <AdminOnly hide={true}><FiArchive onClick={() => setAreYouSureArchive(true)} style={{ lineHeight: 0 }}/></AdminOnly> : <></>}
        </span>

    return (
        <>
        <Routes>
            <Route path="/" element={actions} />
            {/* <Route path="items/*" element={<AdminOnly hide={true}><span className={classes.toolbarSpan} onClick={() => navigate(`itemmenu/${currentCat}`)}>ערוך</span></AdminOnly>} />
            <Route path="itemmenu" element={<></>} />
            <Route path="itemmenu/*" element={<></>} />
            <Route path="/itemnotfound/*" element={<></>} />
            <Route path="managesectors" element={<></>} />
            <Route path="sectormenu" element={<></>} />
            <Route path="technicians/:id" element={<AdminOnly hide={true}><span className={classes.toolbarSpan} onClick={() => navigate(`technicianmenu/${currentTechnicianId}`)}>ערוך</span></AdminOnly>} />
            <Route path="technicianmenu" element={<></>} />
            <Route path="technicianmenu/*" element={<></>} />
            <Route path="certifications" element={addCertification} />
            <Route path="certifications/*" element={<AdminOnly hide={true}><span className={classes.toolbarSpan} onClick={() => navigate(`certificationmenu/${currentCertificationId}`)}>ערוך</span></AdminOnly>} />
            <Route path="certificationmenu" element={<></>} />
            <Route path="certificationmenu/*" element={<></>} />
            <Route path="users" element={addUser} />
            <Route path="users/*" element={<AdminOnly hide={true}><span className={classes.toolbarSpan} onClick={() => navigate(`usermenu/${currentUserId}`)}>ערוך</span></AdminOnly>} />
            <Route path="usermenu" element={<></>} />
            <Route path="usermenu/*" element={<></>} />
            <Route path="suppliers" element={addSupplier} />
            <Route path="suppliers/*" element={<AdminOnly hide={true}><span className={classes.toolbarSpan} onClick={() => navigate(`suppliermenu/${currentSupplierId}`)}>ערוך</span></AdminOnly>} />
            <Route path="suppliermenu" element={<></>} />
            <Route path="suppliermenu/*" element={<></>} />                 */}
        </Routes>
        {areYouSureArchive && <AreYouSure text="האם באמת לארכב את הפריטים?" leftText='ארכב' leftAction={() => {}} rightText='לא' rightAction={() => setAreYouSureArchive(false)} />}
        </>
            
    )
    
};
export default ActionsHeader;