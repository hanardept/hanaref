import { useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import { authActions } from "../../store/auth-slice";
import AreYouSure from "../UI/AreYouSure";
import GoBack from "./GoBack";
import classes from './Header.module.css';
import './Burger.css';
import { slide as Menu } from 'react-burger-menu';
import { CiMedicalCase } from "react-icons/ci";
import { IoMdPeople } from "react-icons/io";
import { TbCertificate } from "react-icons/tb";
import { FaUser } from "react-icons/fa";




const RightHeaderSide = ({ loggedIn }: { loggedIn: boolean }) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const loggedInAs = useAppSelector(state => state.auth.frontEndPrivilege);
    const [areYouSureLogout, setAreYouSureLogout] = useState(false);
    const [ isBurgerOpen, setIsBurgerOpen ] = useState(false);
    

    const handleLogout = () => {
        dispatch(authActions.clearAuthStateUponLogout());
        navigate(0);
    };

    const navigateTo = (path: string) => {
        setIsBurgerOpen(false);
        navigate(path);
    }

    const signInOut = loggedIn ? <span onClick={() => setAreYouSureLogout(true)}>יציאה</span> : <span onClick={() => navigate('/login')}>כניסה</span>;

    const burger = loggedInAs === "admin" && (
        <Menu right isOpen={isBurgerOpen} onOpen={() => setIsBurgerOpen(true)} onClose={() => setIsBurgerOpen(false)}>
            <span id="items" onClick={() => navigateTo('/')} /*href="/"*/>
                <CiMedicalCase />
                <span>פריטים</span>
            </span>
            <span id="technicians" onClick={() => navigateTo('/technicians')}>
                <IoMdPeople />
                <span>טכנאים</span>
            </span>
            <span id="certifications" onClick={() => navigateTo('/certifications')}>
                <TbCertificate />
                <span>הסמכות</span>
            </span>
            <span id="users" onClick={() => navigateTo('/users')}>
                <FaUser />
                <span>משתמשים</span>
            </span>            
        </Menu>
    )

    return (
        <>
            <Routes>
                    {
                        ["/login", "/itemmenu", "/itemmenu/*", "/items/*", "/managesectors", "/sectormenu",
                            "/technicianmenu", "/technicianmenu/*", "/technicians/*",
                            "/certificationmenu", "/certificationmenu/*", "/certifications/*",
                            "/usermenu", "/usermenu/*", "/users/*",
                        ].map(path => 
                            <Route 
                                path={path} 
                                element={
                                    <span className={classes.rightHeaderSpan}>
                                        {burger}
                                        <GoBack />
                                    </span>}
                                key={path} 
                            />)
                    }
                    <Route path="/itemnotfound/*" element={<span className={classes.rightHeaderSpan}>{burger}<GoBack goHome={true} /></span>} />
                    <Route path="/" element={<span className={classes.rightHeaderSpan}>{burger}{signInOut}</span>}/>
            </Routes>
            {areYouSureLogout && <AreYouSure text="לצאת מהמשתמש?" leftText="צא" leftAction={handleLogout} rightText="לא" rightAction={() => setAreYouSureLogout(false)} />}
        </>
    )
};

export default RightHeaderSide;