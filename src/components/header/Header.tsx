import { useAppSelector } from "../../hooks/redux-hooks";
import LeftHeaderSide from "./LeftHeaderSide";
import RightHeaderSide from "./RightHeaderSide";
import classes from './Header.module.css';

const Header = () => {
    const loggedInAs = useAppSelector(state => state.auth.frontEndPrivilege);

    return (
        <nav className={classes.navbar}>
            <RightHeaderSide loggedIn={loggedInAs !== "public"} />
            <h1>hanaref</h1>
            {loggedInAs === "admin" && <LeftHeaderSide />}
        </nav>
    )
};

export default Header;