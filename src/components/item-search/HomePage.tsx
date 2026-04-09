// src/components/item-search/HomePage.tsx

import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import ListItem from "./ListItem";
import SearchMenu from "./SearchMenu";
import classes from './HomePage.module.css';
import LoadingSpinner from "../UI/LoadingSpinner";
import { UIEvent, useEffect, useRef, useState } from "react";
import { viewingActions } from "../../store/viewing-slice";
import { itemsActions } from "../../store/item-slice";
import { fetchBackend } from "../../backend-variables/address";
import { AbbreviatedItem } from "../../types/item_types";
import LabeledInput from "../UI/LabeledInput";

const HomePage = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const dispatch = useAppDispatch();
    const items = useAppSelector(state => state.items.items);
    const searchComplete = useAppSelector(state => state.items.searchComplete);
    const changesId = useAppSelector(state => state.viewing.itemManagement.changesId);;
    const selectedItems = useAppSelector(state => state.viewing.itemManagement.selectedItems);
    const excludedItems = useAppSelector(state => state.viewing.itemManagement.excludedItems);
    const selectAllItems = useAppSelector(state => state.viewing.itemManagement.selectAllItems);
    const { searchVal, sector, department, showArchived, page, blockScrollSearch } = useAppSelector(state => state.viewing.searching);
    const authToken = useAppSelector(state => state.auth.jwt);
    const userPrivilege = useAppSelector(state => state.auth.frontEndPrivilege); // Debug
    const isAdmin = userPrivilege === "admin";
    const [initialized, setInitialized] = useState(false);

    //const [ selectedItems, setSelectedItems ] = useState<string[]>([]);

    // For debugging admin status
    useEffect(() => {
        console.log("[HomePage] User Privilege:", userPrivilege, "Is Admin:", isAdmin);
    }, [userPrivilege, isAdmin]);

    const goToItemPage = (cat: string) => {
        navigate(`/items/${cat}`);
    }

    // This useEffect will now trigger a new search whenever the checkbox state changes.
    useEffect(() => {

        if (!initialized) return;

        // This function will be called to start a new search
        const triggerNewSearch = () => {
            dispatch(viewingActions.changeSelectedItems({ selectAll: false, excludedItems: [], selectedItems: [] }));
            dispatch(viewingActions.changeSearchCriteria({ page: 0 }));

            const archiveStatus = showArchived ? 'all' : 'active';
            fetchBackend(encodeURI(`items?search=${searchVal}&sector=${sector}&department=${department}&page=0&status=${archiveStatus}`), {
                headers: { 'auth-token': authToken }
            })
            .then(res => res.json())
            .then(jsonedRes => {
                // Replace the current list with the new results
                dispatch(itemsActions.setItems(jsonedRes)); 
                // Reset pagination and scroll lock for the new search
                dispatch(viewingActions.changeSearchCriteria({ page: 1 }));
                dispatch(viewingActions.changeBlockSearcScroll(false));
                dispatch(itemsActions.declareSearchComplete(true));
            })
            .catch(err => {
                console.error("Error during new search:", err);
                dispatch(itemsActions.declareSearchComplete(true));
            });
        };

        // We clear the old search criteria when the component mounts.
        // We trigger a new search when the checkbox changes.
        if (searchVal === "" && sector === "" && department === "" && (showArchived === null || showArchived === undefined)) {
             dispatch(viewingActions.emptySearchCriteria());
        }
        triggerNewSearch();

    }, [dispatch, showArchived, changesId, searchVal, sector, department, authToken, initialized]);

     useEffect(() => {

        const urlSector = searchParams.get('sector') || '';
        const urlDepartment = searchParams.get('department') || '';
        const urlShowArchived = searchParams.get('showArchived') === 'true';
        const urlSearchVal = searchParams.get('search') || '';

        if (urlSector || urlDepartment || urlSearchVal || urlShowArchived) {
            dispatch(viewingActions.changeSearchCriteria({
                sector: urlSector,
                department: urlDepartment,
                showArchived: urlShowArchived,
                searchVal: urlSearchVal
            }));
        } else {
            dispatch(viewingActions.emptySearchCriteria());
        }
        setInitialized(true);
    }, [dispatch, searchParams]);

    // Update URL when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        if (searchVal) params.set('search', searchVal);
        if (sector) params.set('sector', sector);
        if (department) params.set('department', department);
        if (showArchived) params.set('showArchived', showArchived.toString());
        
        setSearchParams(params, { replace: true });
    }, [searchVal, sector, department, showArchived, setSearchParams]);

    let scrollThrottler = true;
    const handleScroll = (event: UIEvent<HTMLDivElement>) => {
        console.log(`on scroll!`);
        if (!blockScrollSearch && scrollThrottler && (event.currentTarget.scrollHeight - event.currentTarget.scrollTop < event.currentTarget.clientHeight + 70)) {
            scrollThrottler = false;
            // 2. Ensure the infinite scroll also respects the archive status
            const archiveStatus = showArchived ? 'all' : 'active';
            fetchBackend(encodeURI(`items?search=${searchVal}&sector=${sector}&department=${department}&page=${page}&status=${archiveStatus}`), {
                headers: { 'auth-token': authToken }
            })
            .then((res) => res.json())
            .then((jsonedRes) => {
                if (jsonedRes.length > 0) {
                    dispatch(viewingActions.changeSearchCriteria({ page: page + 1 }));
                    dispatch(itemsActions.addItems(jsonedRes));
                } else {
                    dispatch(viewingActions.changeBlockSearcScroll(true));
                }
            });
        }
    }

    const toggleItemSelection = (item: Partial<AbbreviatedItem>) => {
        console.log(`toggling item cat: ${item.cat}`);
        if (selectAllItems) {
            console.log(`select all is active, excluded items: ${JSON.stringify(excludedItems)}`);
            if (excludedItems.find(i => i.cat === item.cat)) {
                console.log(`item was in excluded, removing`);
                dispatch(viewingActions.changeSelectedItems({ excludedItems: excludedItems.filter(i => i.cat !== item.cat) }));
            } else {
                console.log(`item was not in excluded, adding`);
                dispatch(viewingActions.changeSelectedItems({ excludedItems: [ ...excludedItems, item ]}));
            }
        } else {
            if (selectedItems.find(i => i.cat === item.cat)) {
                dispatch(viewingActions.changeSelectedItems({ selectedItems: selectedItems.filter(i => i.cat !== item.cat) }));
            } else {
                dispatch(viewingActions.changeSelectedItems({ selectedItems: [ ...selectedItems, item ]}));
            }
        }
    }

    console.log(`selected items: ${JSON.stringify(selectedItems)}`);

    const scrollContainerRef = useRef<any>();

    return (
        <>
            <SearchMenu hideArchive={!isAdmin}/>
            {/* <div className={classes.listItemPusher}></div> */}
            {!searchComplete && <LoadingSpinner />}
            {searchComplete && items.length === 0 && <p className={classes.noResults}>לא נמצאו פריטים</p>}
            <div className={classes.itemsWrapper} onScroll={handleScroll} ref={scrollContainerRef} id="itemWrapper">
                {items.length ? <LabeledInput label="בחר הכל" type="checkbox" checked={selectAllItems} className={classes.selectAllCheckbox} onChange={(e) => {
                    dispatch(viewingActions.changeSelectedItems({ selectAll: e.target.checked, excludedItems: [], selectedItems: [] }));
                }} /> : <></>}
                {/* <input type="checkbox" checked={selectAllItems} className={classes.selectAllCheckbox} onClick={() => {
                    dispatch(viewingActions.changeSelectedItems({ selectAll: !selectAllItems, excludedItems: [], selectedItems: [] }));
                }} /> */}
                {items.map((i, index) => 
                    <div className={classes.selectableListItem} id={`selectableListItem_${index}`}> 
                        <input className={!selectAllItems && !selectedItems.length ? classes.checkItem : ''} type="checkbox" checked={(selectAllItems && !excludedItems.find(item => item.cat === i.cat)) || (!selectAllItems && !!selectedItems.find(item => item.cat === i.cat))} onClick={() => toggleItemSelection(i)} />
                        <ListItem
                            className={classes.listItem}
                            textContentClassName={classes.itemTextContent}
                            imageClassName={classes.itemImage}
                            key={i._id}
                            name={i.name}
                            cat={i.cat}
                            kitCat={i.kitCats?.[0]}
                            shouldBeColored={i.imageLink === "" && isAdmin}
                            imageLink={i.imageLink}
                            goToItemPage={goToItemPage}
                            selectItem={() => toggleItemSelection(i) }
                            isArchived={i.archived}
                            scrollContainerRef={scrollContainerRef.current}
                        />
                    </div>)}
            </div>
        </>
    )
};

export default HomePage;
