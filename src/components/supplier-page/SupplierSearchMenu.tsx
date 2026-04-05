import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import { viewingActions } from "../../store/viewing-slice";
import DebouncingSearchBar from "../item-search/DebouncingSearchBar";
import classes from '../item-search/HomePage.module.css';

const SupplierSearchMenu = () => {
    const dispatch = useAppDispatch();
    
    // Pull the searchBy value from our newly updated Redux slice
    const searchBy = useAppSelector(state => state.viewing.searching.searchBy);

    const handleSearchByChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        // This dispatches exactly "supplier" or "itemCat" to Redux
        dispatch(viewingActions.changeSearchCriteria({ searchBy: event.target.value }));
    };

    // Change the text inside the search bar based on the dropdown choice
    const placeholder =
        searchBy === 'supplier' ? "חיפוש ספק/מס' ספק" :
        searchBy === 'itemCat' ? "חיפוש לפי מק''ט פריט" :
        "חיפוש לפי שם פריט";

    return (
        <div className={classes.searchMenu}>
            <div className={classes.searchRow}>
                <div className={classes.searchBarWrapper}>
                    {/* Note: If the word 'placeholder' gets a red squiggly line under it, let me know! */}
                    <DebouncingSearchBar placeholder={placeholder} />
                </div>
                <div className={classes.searchBy}>
                    <label htmlFor="searchBy">חיפוש לפי</label>
                    <select id="searchBy" value={searchBy} onChange={handleSearchByChange}>
                        {/* The values must be strictly English for the backend to understand */}
                        <option value="supplier">ספק</option>
                        <option value="itemCat">מק"ט פריט</option>
                         <option value="itemName">שם פריט</option>
                    </select>
                </div>
            </div>
        </div>
    )
}

export default SupplierSearchMenu;