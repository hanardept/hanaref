import { useAppDispatch, useAppSelector } from "../../hooks/redux-hooks";
import LoadingSpinner from '../UI/LoadingSpinner';
import ListItem from './ListItem';
import classes from './Users.module.css';
import { UIEvent, useEffect } from "react";
import { fetchBackend } from "../../backend-variables/address";
import { usersActions } from "../../store/users-slice";
import { viewingActions } from "../../store/viewing-slice";
import { useNavigate } from "react-router-dom";
import SearchMenu from "./SearchMenu";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";



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

    const { loginWithRedirect } = useAuth0();

    const handleScroll = (event: UIEvent<HTMLDivElement>) => {
        console.log("Scroll event triggered");

        let scrollThrottler = true;
        if (!blockScrollSearch && scrollThrottler && (event.currentTarget.scrollHeight - event.currentTarget.scrollTop < event.currentTarget.clientHeight + 70)) {
            scrollThrottler = false;
            fetchBackend(encodeURI(`users?page=${page}`), {
                headers: { 'auth-token': authToken }
            //}, () => loginWithRedirect({ authorizationParams: { redirect_uri: window.location.href } }))
            },loginWithRedirect)
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
            console.log(`origin: ${window.location.href}`);
            fetchBackend(encodeURI(`users?search=${searchVal}`), {
                headers: { 'auth-token': authToken }
            //}, () => loginWithRedirect({ authorizationParams: { redirect_uri: window.location.href } }))
            },() => loginWithRedirect({ appState: { returnTo: window.location.pathname } }))
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

    }, [dispatch, authToken, searchVal, showArchived, loginWithRedirect]);

    return (
        <>
            <SearchMenu/>
            <div className={classes.listItemPusher}></div>
            {!searchComplete && <LoadingSpinner />}
            {searchComplete && users.length === 0 && <p className={classes.noResults}>לא נמצאו משתמשים</p>}
            <div className={classes.itemsWrapper} onScroll={handleScroll}>
                {users.map(u => <ListItem className={classes.listItem} textContentClassName={classes.itemTextContent} key={u._id} _id={u._id} shouldBeColored={false} firstName={u.firstName} lastName={u.lastName} username={u.username} role={u.role} goToUserPage={goToUserPage} />)}
            </div>
        </>
    )
}

export default withAuthenticationRequired(Users);