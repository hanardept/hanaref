import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import LoadingSpinner from '../UI/LoadingSpinner';
import ListItem from './ListItem';
import classes from './Users.module.css';
import { UIEvent, useEffect } from "react";
import { backendFirebaseUri } from "../../backend-variables/address";
import { usersActions } from "../../store/users-slice";
import { viewingActions } from "../../store/viewing-slice";
import { useNavigate } from "react-router-dom";
import SearchMenu from "./SearchMenu";


const Users = () => {

    const navigate = useNavigate();
    const searchComplete = useAppSelector(state => state.users.searchComplete);
    const users = useAppSelector(state => state.users.users);
    const { searchVal, showArchived, page, blockScrollSearch } = useAppSelector(state => state.viewing.searching);
    const authToken = useAppSelector(state => state.auth.jwt);
    const dispatch = useAppDispatch();

    const goToUserPage = (id: string) => {
        console.log(`Navigating to user page with ID: ${id}`);
        navigate(`/users/${id}`);
    }

    const handleScroll = (event: UIEvent<HTMLDivElement>) => {
        console.log("Scroll event triggered");

        let scrollThrottler = true;
        if (!blockScrollSearch && scrollThrottler && (event.currentTarget.scrollHeight - event.currentTarget.scrollTop < event.currentTarget.clientHeight + 70)) {
            scrollThrottler = false;
            
            fetch(encodeURI(`${backendFirebaseUri}/users?page=${page}`), {
                headers: { 'auth-token': authToken }
            })
            .then(res => res.json())
            .then((jsonedRes) => {
                if (jsonedRes.length > 0) {
                    dispatch(usersActions.addUsers(jsonedRes));
                    dispatch(viewingActions.changeSearchCriteria({ page: page + 1 }));
                } else {
                    dispatch(usersActions.declareSearchComplete(true));
                }
            });
        } else {
            console.log(`no users search!`);
        }
    }

    useEffect(() => {

        const triggerNewSearch = () => {
            fetch(encodeURI(`${backendFirebaseUri}/users?search=${searchVal}`), {
                headers: { 'auth-token': authToken }
            })
            .then(res => res.json())
            .then(jsonedRes => {
                dispatch(usersActions.setUsers(jsonedRes)); 
                dispatch(usersActions.declareSearchComplete(true));
            })
            .catch(err => {
                console.error("Error during new search:", err);
                dispatch(usersActions.declareSearchComplete(true));
            });
        };

        triggerNewSearch();

    }, [dispatch, authToken, searchVal]);

    return (
        <>
            <SearchMenu/>
            <div className={classes.listItemPusher}></div>
            {!searchComplete && <LoadingSpinner />}
            {searchComplete && users.length === 0 && <p className={classes.noResults}>לא נמצאו משתמשים</p>}
            <div className={classes.itemsWrapper} onScroll={handleScroll}>
                {users.map(t => <ListItem className={classes.listItem} textContentClassName={classes.itemTextContent} key={t._id} _id={t._id} shouldBeColored={false} firstName={t.firstName} lastName={t.lastName} username={t.username} goToUserPage={goToUserPage} />)}
            </div>
        </>
    )
}

export default Users;