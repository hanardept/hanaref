import { Route, Routes, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import AdminOnly from "../authorization/AdminOnly";
import { exportDataToCsv } from "../item-search/DownloadItemWorksheet";
import classes from './Header.module.css';
import { CiExport } from "react-icons/ci";


const LeftHeaderSide = () => {
    const navigate = useNavigate();
    const currentCat = useAppSelector(state => state.viewing.itemManagement.currentCat);
    const dispatch = useAppDispatch();

    const loggedInAs = useAppSelector(state => state.auth.frontEndPrivilege);
    const addItemAndManageSectors = 
        <span className={classes.toolbarSpan}>
            <span onClick={() => dispatch(exportDataToCsv())} style={{ lineHeight: 0 }}><CiExport/></span>
            {loggedInAs === "admin" && <span onClick={() => navigate('/itemmenu')} style={{ lineHeight: 0 }}>+</span>}
            {loggedInAs === "admin" && <span onClick={() => navigate('/managesectors')} style={{ lineHeight: 0 }}>⋮</span>}
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

        </Routes>
            
    )
    
};
export default LeftHeaderSide;