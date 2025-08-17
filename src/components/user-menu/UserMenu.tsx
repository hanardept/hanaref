import React, { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { backendFirebaseUri } from '../../backend-variables/address';
import { useAppDispatch, useAppSelector } from '../../hooks/redux-hooks';
import { viewingActions } from '../../store/viewing-slice';
import AreYouSure from '../UI/AreYouSure';
import BigButton from '../UI/BigButton';
import classes from './UserMenu.module.css';
import { User } from '../../types/user_types';
import AssociationSelection, { associationOptions } from './AssociationSelection';

const UserMenu = () => {
    const params = useParams();
    const authToken = useAppSelector(state => state.auth.jwt);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [id, setId] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [areYouSureDelete, setAreYouSureDelete] = useState(false);

    const userDetails = {
        firstName: firstName,
        lastName: lastName,
        username: username,
        email: email,
    };

    useEffect(() => {        
        if (params.userid) {
            const getUser = async () => {
                const fetchedUser = await fetch(`${backendFirebaseUri}/users/${params.userid}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'auth-token': authToken
                    }
                });
                return await fetchedUser.json();
            };
            getUser().then((t: User) => {
                setFirstName(t.firstName);
                setLastName(t.lastName);
                setUsername(t.username);
            }).catch(e => console.log(`Error fetching user details: ${e}`));
        }
       
    }, [params.userid, authToken]);

    const handleInput = (setFunc: React.Dispatch<React.SetStateAction<string>>, event: ChangeEvent<HTMLInputElement>) => {
        setFunc(event.target.value);
        dispatch(viewingActions.changesAppliedToUser(true));
    }
    
    const handleSave = () => {

        if (!userDetails.firstName || !userDetails.lastName || !userDetails.username || !userDetails.email) {
            // if the required fields of the User mongo schema are not filled then don't save
            console.log("Please make sure to enter a first name, last name, username and email");
            return;
        }

        if (!params.userid) {
            fetch(`${backendFirebaseUri}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'auth-token': authToken
                },
                body: JSON.stringify(userDetails)
            }).then((res) => {
                console.log("success saving user");
                dispatch(viewingActions.changesAppliedToUser(false));
                navigate(-1);
            })
            .catch((err) => console.log(`Error saving user: ${err}`));
        }
        if (params.userid) {
            fetch(encodeURI(`${backendFirebaseUri}/users/${params.userid}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'auth-token': authToken
                },
                body: JSON.stringify(userDetails)
            }).then((res) => {
                console.log("success updating user");
                dispatch(viewingActions.changesAppliedToUser(false));
                navigate(-1);
            })
            .catch((err) => console.log(`Error updating user: ${err}`));
        }
    }
    // edit mode only:
    const handleDelete = () => {
        fetch(encodeURI(`${backendFirebaseUri}/users/${params.userid}`), {
            method: 'DELETE',
            headers: {
                'auth-token': authToken
            }
        })
            .then((res) => {
                console.log("Successfully deleted user!");
                dispatch(viewingActions.changesAppliedToUser(false));
                setAreYouSureDelete(false);
                navigate("/users");
            }).catch((err) => console.log(`Error deleting user: ${err}`));
    }

    return (
        <div className={classes.userMenu}>
            <h1>{params.userid ? "עריכת טכנאי" : "הוספת טכנאי"}</h1>
            <input type="text" placeholder='שם פרטי' value={firstName} onChange={(e) => handleInput(setFirstName, e)} />
            <input type="text" placeholder='שם משפחה' value={lastName} onChange={(e) => handleInput(setLastName, e)} />
            <input type="text" placeholder='שם משתמש' value={username} onChange={(e) => handleInput(setUsername, e)} />
            <input type="email" placeholder='דואר אלקטרוני' value={email} onChange={(e) => handleInput(setEmail, e)} />
            <BigButton text="שמור" action={handleSave} overrideStyle={{ marginTop: "2.5rem" }} />
            {params.userid && <BigButton text="מחק טכנאי" action={() => setAreYouSureDelete(true)} overrideStyle={{ marginTop: "1rem", backgroundColor: "#CE1F1F" }} />}
            {areYouSureDelete && <AreYouSure text="האם באמת למחוק טכנאי?" leftText='מחק' leftAction={handleDelete} rightText='לא' rightAction={() => setAreYouSureDelete(false)} />}
        </div>
    )
};

export default UserMenu;