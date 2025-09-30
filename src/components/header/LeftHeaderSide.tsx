import { Route, Routes, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import AdminOnly from "../authorization/AdminOnly";
import { exportItemsToCsv } from "../item-search/DownloadItemWorksheet";
import { exportCertificationsToCsv } from "../certification-page/DownloadCertificationWorksheet";
import classes from './Header.module.css';
import { CiExport, CiImport } from "react-icons/ci";
import { Role } from "../../types/user_types";
import RolesOnly from "../authorization/RolesOnly";
import { exportSuppliersToCsv } from "../supplier-page/DownloadSupplierWorksheet";
import FileImport from "./FileImport";
import { Tooltip } from "react-tooltip";


const LeftHeaderSide = () => {
    const navigate = useNavigate();
    const currentCat = useAppSelector(state => state.viewing.itemManagement.currentCat);
    const currentTechnicianId = useAppSelector(state => state.viewing.technicianManagement.currentTechnicianId);
    const currentCertificationId = useAppSelector(state => state.viewing.certificationManagement.currentCertificationId);
    const currentUserId = useAppSelector(state => state.viewing.userManagement.currentUserId);
    const currentSupplierId = useAppSelector(state => state.viewing.supplierManagement.currentSupplierId);
    const dispatch = useAppDispatch();    

    const addItemAndManageSectors = 
        <span className={classes.toolbarSpan}>
            <AdminOnly hide={true}><FileImport><CiImport data-tooltip-id="import-items" data-tooltip-content="ייבא פריטים"/></FileImport></AdminOnly> 
            <AdminOnly hide={true}><span onClick={() =>  dispatch(exportItemsToCsv())} style={{ lineHeight: 0, cursor: "pointer" }} data-tooltip-id="export-items" data-tooltip-content="ייצא פריטים"><CiExport/></span></AdminOnly> 
            <RolesOnly hide={true} roles={[ Role.Admin, Role.Technician ]}><span onClick={() => navigate('/itemmenu')} style={{ lineHeight: 0, cursor: "pointer" }} data-tooltip-id="add-item" data-tooltip-content="הוסף פריט חדש">+</span></RolesOnly>
            <AdminOnly hide={true}><span onClick={() => navigate('/managesectors')} style={{ lineHeight: 0, cursor: "pointer" }} data-tooltip-id="edit-sectors" data-tooltip-content="ערוך מדורים">⋮</span></AdminOnly>
            <Tooltip id="import-items" place="bottom" />
            <Tooltip id="export-items" place="bottom" />
            <Tooltip id="add-item" place="bottom" />
            <Tooltip id="edit-sectors" place="bottom" />
        </span>
    

    const addCertification = 
        <span className={classes.toolbarSpan}>
            <AdminOnly hide={true}><span onClick={() => dispatch(exportCertificationsToCsv())} style={{ lineHeight: 0 }}><CiExport/></span></AdminOnly>
            <span onClick={() => navigate('/certificationmenu')} style={{ lineHeight: 0 }}>+</span>
        </span>
    ;

    const addUser = 
        <span className={classes.toolbarSpan}>
            <span onClick={() => navigate('/usermenu')} style={{ lineHeight: 0 }}>+</span>
        </span>
    ;

    const addSupplier = 
        <span className={classes.toolbarSpan}>
            <AdminOnly hide={true}><span onClick={() => dispatch(exportSuppliersToCsv())} style={{ lineHeight: 0 }}><CiExport/></span></AdminOnly>
            <span onClick={() => navigate('/suppliermenu')} style={{ lineHeight: 0 }}>+</span>
        </span>
    ;    


    return (
        <Routes>
            <Route path="/" element={addItemAndManageSectors} />
            <Route path="items/*" element={<AdminOnly hide={true}><span className={classes.toolbarSpan} onClick={() => navigate(`itemmenu/${currentCat}`)}>ערוך</span></AdminOnly>} />
            <Route path="itemmenu" element={<></>} />
            <Route path="itemmenu/*" element={<></>} />
            <Route path="/itemnotfound/*" element={<></>} />
            <Route path="managesectors" element={<></>} />
            <Route path="sectormenu" element={<></>} />
            {/* <Route path="technicians" element={addTechnician} /> */}
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
            <Route path="suppliermenu/*" element={<></>} />                
        </Routes>
            
    )
    
};
export default LeftHeaderSide;