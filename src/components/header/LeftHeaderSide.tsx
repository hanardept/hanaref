import { Route, Routes, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import AdminOnly from "../authorization/AdminOnly";
import { exportDataToCsv } from "../item-search/DownloadItemWorksheet";
import classes from './Header.module.css';
import { CiExport } from "react-icons/ci";


const LeftHeaderSide = () => {
    const navigate = useNavigate();
    const currentCat = useAppSelector(state => state.viewing.itemManagement.currentCat);
    const currentTechnicianId = useAppSelector(state => state.viewing.technicianManagement.currentTechnicianId);
    const dispatch = useAppDispatch();

    const addItemAndManageSectors = 
        <span className={classes.toolbarSpan}>
            <span onClick={() => dispatch(exportDataToCsv())} style={{ lineHeight: 0 }}><CiExport/></span>
            <span onClick={() => navigate('/itemmenu')} style={{ lineHeight: 0 }}>+</span>
            <span onClick={() => navigate('/managesectors')} style={{ lineHeight: 0 }}>⋮</span>
        </span>
    ;

    const addTechnician = 
        <span className={classes.toolbarSpan}>
            <span onClick={() => navigate('/technicianmenu')} style={{ lineHeight: 0 }}>+</span>
        </span>
    ;

    return (
        <Routes>
            <Route path="/" element={addItemAndManageSectors} />
            <Route path="items/*" element={<AdminOnly><span onClick={() => navigate(`itemmenu/${currentCat}`)}>ערוך</span></AdminOnly>} />
            <Route path="itemmenu" element={<></>} />
            <Route path="itemmenu/*" element={<></>} />
            <Route path="/itemnotfound/*" element={<></>} />
            <Route path="managesectors" element={<></>} />
            <Route path="sectormenu" element={<></>} />
            <Route path="technicians" element={addTechnician} />
            <Route path="technicians/*" element={<AdminOnly><span onClick={() => navigate(`technicianmenu/${currentTechnicianId}`)}>ערוך</span></AdminOnly>} />
            <Route path="technicianmenu" element={<></>} />
            <Route path="technicianmenu/*" element={<></>} />
        </Routes>
            
    )
    
};
export default LeftHeaderSide;