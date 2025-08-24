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
import { useAuth0 } from "@auth0/auth0-react";
import { Role } from "../../types/user_types";




const RightHeaderSide = ({ loggedIn }: { loggedIn: boolean }) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const loggedInAs = useAppSelector(state => state.auth.frontEndPrivilege);
    const [areYouSureLogout, setAreYouSureLogout] = useState(false);
    const [ isBurgerOpen, setIsBurgerOpen ] = useState(false);

    const {
        logout, // Starts the logout flow
    } = useAuth0();    

    

    const handleLogout = () => {
        logout({
            logoutParams: { 
                returnTo: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/authorize?prompt=login&client_id=${process.env.REACT_APP_AUTH0_CLIENT_ID}` } 
            }).then(res => {
            dispatch(authActions.clearAuthStateUponLogout());
           //return loginWithRedirect();
        });
        //navigate(0);
    };

    const navigateTo = (path: string) => {
        setIsBurgerOpen(false);
        navigate(path);
    }

    //const signInOut = loggedIn ? <span onClick={() => setAreYouSureLogout(true)}>יציאה</span> : <span onClick={() => navigate('/login')}>כניסה</span>;
    const signOut = <span onClick={() => setAreYouSureLogout(true)}>יציאה</span>;

    console.log(`loggedInAs: ${loggedInAs}`);

    const menuItems: Record<string, JSX.Element> = {
        items: <span id="items" onClick={() => navigateTo('/')} /*href="/"*/>
            <CiMedicalCase />
            <span>פריטים</span>
        </span>,
        technicians: <span id="technicians" onClick={() => navigateTo('/technicians')}>
            <IoMdPeople />
            <span>טכנאים</span>
        </span>,
        certifications: <span id="certifications" onClick={() => navigateTo('/certifications')}>
            <TbCertificate />
            <span>הסמכות</span>
        </span>,
        users: <span id="users" onClick={() => navigateTo('/users')}>
            <FaUser />
            <span>משתמשים</span>
        </span> ,
    };
    const permissions = {
        [Role.Admin]: [ 'items', 'technicians', 'certifications', 'users' ],
        [Role.Technician]: [ 'items', 'technicians', 'certifications' ],
        [Role.Viewer]: [ 'items' ],
    }
    const menuItemsForRole = permissions[loggedInAs as Role]?.map(permission => menuItems[permission]) ?? [];

    const burger = /*loggedInAs === "admin" &&*/ (
        <Menu right isOpen={isBurgerOpen} onOpen={() => setIsBurgerOpen(true)} onClose={() => setIsBurgerOpen(false)}>
            {menuItemsForRole}
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
                    <Route path="/" element={<span className={classes.rightHeaderSpan}>{burger}{signOut}</span>}/>
            </Routes>
            {areYouSureLogout && <AreYouSure text="לצאת מהמשתמש?" leftText="צא" leftAction={handleLogout} rightText="לא" rightAction={() => setAreYouSureLogout(false)} />}
        </>
    )
};

export default RightHeaderSide;