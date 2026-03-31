import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import { viewingActions } from "../../store/viewing-slice";
import DebouncingSearchBar from "../item-search/DebouncingSearchBar";
import classes from '../item-search/HomePage.module.css';

const SupplierSearchMenu = () => {
    const dispatch = useAppDispatch();
    const searchBy = useAppSelector(state => state.viewing.searching.searchBy);

    const handleSearchByChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        dispatch(viewingActions.changeSearchCriteria({ searchBy: event.target.value }));
    };

    const placeholder = searchBy === 'supplier' ? "חיפוש ספק/מס' ספק" : "חיפוש לפי מק''ט פריט";

    return (
        <div className={classes.searchMenu}>
            <div className={classes.searchRow}>
                <div className={classes.searchBarWrapper}>
                    <DebouncingSearchBar placeholder={placeholder} />
                </div>
                <div className={classes.searchBy}>
                    <label htmlFor="searchBy">חיפוש לפי</label>
                    <select id="searchBy" value={searchBy} onChange={handleSearchByChange}>
                        <option value="supplier">ספק</option>
                        <option value="itemCat">מק"ט פריט</option>
                    </select>
                </div>
            </div>
        </div>
    )
}

export default SupplierSearchMenu;
