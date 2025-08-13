import classes from './Users.module.css';
import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import { viewingActions } from "../../store/viewing-slice";

const SearchMenu = ({ hideArchive = false }: { hideArchive?: boolean }) => {
    const dispatch = useAppDispatch();
    const showArchived = useAppSelector(state => state.viewing.searching.showArchived);

    const handleShowArchived = (value: boolean) => {
        dispatch(viewingActions.changeSearchCriteria({ showArchived: value }));
    }
    
    return (
        <div className={classes.searchMenu}> 
            <div className={classes.searchRow}>
                {/* {!hideArchive && (
                    <div className={classes.archiveToggle}>
                        <label>
                            <input
                                type="checkbox"
                                checked={showArchived}
                                onChange={(e) => handleShowArchived(e.target.checked)}
                            />
                            הצג טכנאים בארכיון
                        </label>
                    </div>
                )} */}
            </div>
        </div>
    )
}

export default SearchMenu;