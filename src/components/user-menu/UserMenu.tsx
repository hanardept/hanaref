import React, { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchBackend } from '../../backend-variables/address';
import { useAppDispatch, useAppSelector } from '../../hooks/redux-hooks';
import { viewingActions } from '../../store/viewing-slice';
import AreYouSure from '../UI/AreYouSure';
import BigButton from '../UI/BigButton';
import classes from './UserMenu.module.css';
import { Role, User } from '../../types/user_types';
import AssociationSelection, { associationOptions } from './AssociationSelection';
import RoleSelection from './RoleSelection';
import LabeledInput from '../UI/LabeledInput';

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
    const [role, setRole] = useState(Role.Technician);
    const [association, setAssociation] = useState(associationOptions[0]);
    const [areYouSureDelete, setAreYouSureDelete] = useState(false);

    const userDetails = {
        id: id,
        firstName: firstName,
        lastName: lastName,
        username: username,
        email: email,
        role: role,
        association: association,
    };

    useEffect(() => {        
        if (params.userid) {
            const getUser = async () => {
                const fetchedUser = await fetchBackend(`users/${params.userid}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'auth-token': authToken
                    }
                });
                return await fetchedUser.json();
            };
            getUser().then((u: User) => {
                setId(u.id)
                setFirstName(u.firstName);
                setLastName(u.lastName);
                setUsername(u.username);
                setEmail(u.email);
                setRole(u.role);
            }).catch(e => console.log(`Error fetching user details: ${e}`));
        }
       
    }, [params.userid, authToken]);

    const handleInput = (setFunc: React.Dispatch<React.SetStateAction<string>>, event: ChangeEvent<HTMLInputElement>) => {
        setFunc(event.target.value);
        dispatch(viewingActions.changesAppliedToUser(true));
    }

    const handleSetRole = (role: Role) => {
        console.log(`setting role: ${role}`);
        setRole(role);
        dispatch(viewingActions.changesAppliedToItem(true));
    }

    const handleSave = () => {

        if (!userDetails.firstName || !userDetails.lastName || !userDetails.username || !userDetails.email) {
            // if the required fields of the User mongo schema are not filled then don't save
            console.log("Please make sure to enter a first name, last name, username and email");
            return;
        }

        if (!params.userid) {
            fetchBackend(`users`, {
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
            fetchBackend(encodeURI(`users/${params.userid}`), {
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
        fetchBackend(encodeURI(`users/${params.userid}`), {
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

    console.log(`current role: ${role}`);

    return (
        <div className={classes.userMenu}>
            <h1>{params.userid ? "עריכת משתמש" : "הוספת משתמש"}</h1>
            <LabeledInput label="ת.ז." placeholder="ת.ז." value={id} onChange={(e) => handleInput(setId, e)} />
            <LabeledInput label="שם פרטי" placeholder="שם פרטי" value={firstName} onChange={(e) => handleInput(setFirstName, e)} />
            <LabeledInput label="שם משפחה" placeholder="שם משפחה" value={lastName} onChange={(e) => handleInput(setLastName, e)} />
            <LabeledInput label="שם משתמש" placeholder="שם משתמש" value={username} onChange={(e) => handleInput(setUsername, e)} />
            <LabeledInput type="email" label="דואר אלקטרוני" placeholder="דואר אלקטרוני" value={email} onChange={(e) => handleInput(setEmail, e)} />
            <LabeledInput 
                label="תפקיד"
                placeholder="תפקיד"
                customInputElement={<RoleSelection selectRole={handleSetRole} currentRole={role} />}
            />
            <LabeledInput 
                label="שיוך"
                placeholder="שיוך"            
                customInputElement={<AssociationSelection priorChosenAssociation={association} selectAssociation={association => setAssociation(association)} />}
            />
            {/* {status !== "active" && <label>
                <input
                    type="checkbox"
                    checked={false}
                    onChange={(e) => handleSetStatus(e.target.checked)}
                />
                אשר משתמש
            </label>} */}
            <BigButton text="שמור" action={handleSave} overrideStyle={{ marginTop: "2.5rem" }} />
            {params.userid && <BigButton text="מחק משתמש" action={() => setAreYouSureDelete(true)} overrideStyle={{ marginTop: "1rem", backgroundColor: "#CE1F1F" }} />}
            {areYouSureDelete && <AreYouSure text="האם באמת למחוק משתמש?" leftText='מחק' leftAction={handleDelete} rightText='לא' rightAction={() => setAreYouSureDelete(false)} />}
        </div>
    )
};

export default UserMenu;