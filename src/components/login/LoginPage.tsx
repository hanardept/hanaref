import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../hooks/redux-hooks";
import { authActions } from "../../store/auth-slice";
import { useAuth0 } from "@auth0/auth0-react";
import { jwtDecode } from "jwt-decode";

const LoginPage = () => {
    const dispatch = useAppDispatch();

    const {
        isLoading, // Loading state, the SDK needs to reach Auth0 on load
        isAuthenticated,
        loginWithRedirect: login, // Starts the login flow
        logout: auth0Logout, // Starts the logout flow
        getAccessTokenSilently
    } = useAuth0();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            login().then(() => {
                getAccessTokenSilently().then(token => {
                    const rolesTokenField = `${process.env.REACT_APP_AUTH0_NAMESPACE}/roles`;
                    const userIdField = `${process.env.REACT_APP_AUTH0_NAMESPACE}/user_id`;
                    const decoded = jwtDecode<any>(token);
                    console.log(`token field: ${rolesTokenField}`);
                    console.log(`decoded: ${JSON.stringify(decoded)}`);
                    console.log(`role: ${decoded[rolesTokenField]?.[0]}`);
                    dispatch(authActions.setAuthStateUponLogin({ jwt: token, frontEndPrivilege: decoded[rolesTokenField]?.[0], jwtExpiryDate: decoded.exp, userId: decoded[userIdField] }));
                })
            })
        }
    }, [ isLoading, isAuthenticated, login ])

    return <></>
};

export default LoginPage;