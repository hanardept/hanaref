import { useAppSelector } from "../../hooks/redux-hooks";
import LeftHeaderSide from "./LeftHeaderSide";
import RightHeaderSide from "./RightHeaderSide";
import classes from './Header.module.css';
import ActionsHeader from "./ActionsHeader";

const Header = (props: any) => {
    const loggedInAs = useAppSelector(state => state.auth.frontEndPrivilege);
    const selectedItems = useAppSelector(state => state.viewing.itemManagement.selectedItems);

    return (
        <nav className={classes.navbar} data-extra-options={!!selectedItems.length}>
            <RightHeaderSide loggedIn={loggedInAs !== "public"} />
            <h1>hanaref</h1>
            <LeftHeaderSide />
            {/* {selectedItems.length ? <span style={{ gridColumnStart: 2 }}></span> : <></>} */}
            {selectedItems.length ? <ActionsHeader style={{ gridColumnStart: 3 }}  /> : <></>}
            {props.children}
        </nav>
    )
};

export default Header;