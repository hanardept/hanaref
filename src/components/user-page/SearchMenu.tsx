import classes from './Users.module.css';

const SearchMenu = () => {
    
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