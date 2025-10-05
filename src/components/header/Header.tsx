import { useAppSelector } from "../../hooks/redux-hooks";
import LeftHeaderSide from "./LeftHeaderSide";
import RightHeaderSide from "./RightHeaderSide";
import classes from './Header.module.css';
import ActionsHeader from "./ActionsHeader";
import { PropsWithChildren, useEffect, useLayoutEffect, useRef } from "react";

const Header = ({ children, onHeightChanged }: PropsWithChildren & { onHeightChanged: (height: number) => void }) => {
    const loggedInAs = useAppSelector(state => state.auth.frontEndPrivilege);
    const selectedItems = useAppSelector(state => state.viewing.itemManagement.selectedItems);
    const selectAllItems = useAppSelector(state => state.viewing.itemManagement.selectAllItems);

    const navElement = useRef<HTMLElement>(null);
    
    useLayoutEffect(() => {
        if (navElement.current) {
            const observer = new ResizeObserver(entries => {
                if (navElement.current) {
                    console.log(`Header height: ${navElement.current?.clientHeight}`);
                    onHeightChanged(navElement.current.clientHeight);
                }
            });
            console.log(`Header height: ${navElement.current?.clientHeight}`);
            observer.observe(navElement.current);
            return () => observer.disconnect();
        }        
    }, [selectedItems.length, selectAllItems]);

    return (
        <nav ref={navElement} className={classes.navbar} data-extra-options={!!selectedItems.length}>
            <RightHeaderSide loggedIn={loggedInAs !== "public"} />
            <h1>hanaref</h1>
            <LeftHeaderSide />
            {/* {selectedItems.length ? <span style={{ gridColumnStart: 2 }}></span> : <></>} */}
            {selectedItems.length || selectAllItems ? <ActionsHeader style={{ gridColumnStart: 3 }}  /> : <></>}
            {children}
        </nav>
    )
};

export default Header;