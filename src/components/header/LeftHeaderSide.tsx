import { Route, Routes, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import AdminOnly from "../authorization/AdminOnly";
import { exportItemsToCsv } from "../item-search/DownloadItemWorksheet";
import { exportCertificationsToCsv } from "../certification-page/DownloadCertificationWorksheet";
import classes from './Header.module.css';
import { CiExport } from "react-icons/ci";


const LeftHeaderSide = () => {
    const navigate = useNavigate();
    const currentCat = useAppSelector(state => state.viewing.itemManagement.currentCat);
    const currentTechnicianId = useAppSelector(state => state.viewing.technicianManagement.currentTechnicianId);
    const currentCertificationId = useAppSelector(state => state.viewing.certificationManagement.currentCertificationId);
    const dispatch = useAppDispatch();

    const addItemAndManageSectors = 
        <span className={classes.toolbarSpan}>
            <span onClick={() => dispatch(exportItemsToCsv())} style={{ lineHeight: 0 }}><CiExport/></span>
            <span onClick={() => navigate('/itemmenu')} style={{ lineHeight: 0 }}>+</span>
            <span onClick={() => navigate('/managesectors')} style={{ lineHeight: 0 }}>⋮</span>
        </span>
    ;

    const addTechnician = 
        <span className={classes.toolbarSpan}>
            <span onClick={() => navigate('/technicianmenu')} style={{ lineHeight: 0 }}>+</span>
        </span>
    ;

    const addCertification = 
        <span className={classes.toolbarSpan}>
            <span onClick={() => dispatch(exportCertificationsToCsv())} style={{ lineHeight: 0 }}><CiExport/></span>
            <span onClick={() => navigate('/certificationmenu')} style={{ lineHeight: 0 }}>+</span>
        </span>
    ;

    return (
        <Routes>
            <Route path="/" element={addItemAndManageSectors} />
            <Route path="items/*" element={<AdminOnly><span className={classes.toolbarSpan} onClick={() => navigate(`itemmenu/${currentCat}`)}>ערוך</span></AdminOnly>} />
            <Route path="itemmenu" element={<></>} />
            <Route path="itemmenu/*" element={<></>} />
            <Route path="/itemnotfound/*" element={<></>} />
            <Route path="managesectors" element={<></>} />
            <Route path="sectormenu" element={<></>} />
            <Route path="technicians" element={addTechnician} />
            <Route path="technicians/*" element={<AdminOnly><span className={classes.toolbarSpan} onClick={() => navigate(`technicianmenu/${currentTechnicianId}`)}>ערוך</span></AdminOnly>} />
            <Route path="technicianmenu" element={<></>} />
            <Route path="technicianmenu/*" element={<></>} />
            <Route path="certifications" element={addCertification} />
            <Route path="certifications/*" element={<AdminOnly><span className={classes.toolbarSpan} onClick={() => navigate(`certificationmenu/${currentCertificationId}`)}>ערוך</span></AdminOnly>} />
            <Route path="certificationmenu" element={<></>} />
            <Route path="certificationmenu/*" element={<></>} />
        </Routes>
            
    )
    
};
export default LeftHeaderSide;