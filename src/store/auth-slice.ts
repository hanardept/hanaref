import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { set } from 'idb-keyval';

const initialAuthState = { jwt: "", frontEndPrivilege: "public", jwtExpiryDate: 0, userId: "" };

const authSlice = createSlice({
    name: 'auth',
    initialState: initialAuthState,
    reducers: {
        setAuthStateUponLogin(state, action: PayloadAction<{ jwt: string, frontEndPrivilege: string, jwtExpiryDate: number, userId: string }>) {
            const { jwt, frontEndPrivilege, jwtExpiryDate, userId } = action.payload;
            state.jwt = jwt;
            state.frontEndPrivilege = frontEndPrivilege;
            state.jwtExpiryDate = jwtExpiryDate;
            state.userId = userId;
            Promise.all([set('hanaref-jwt', state.jwt), set('hanaref-front-end-privilege', state.frontEndPrivilege), set('hanaref-jwt-expiry-date', state.jwtExpiryDate)])
                .then((values) => console.log('Saved auth state in localStorage'))
                .catch((err) => console.log(`Error saving auth state in localStorage: ${err}`));
        },
        clearAuthStateUponLogout(state) {
            state = initialAuthState;
            Promise.all([set('hanaref-jwt', ""), set('hanaref-front-end-privilege', "public"), set('hanaref-jwt-expiry-date', 0)])
                .then((values) => console.log('Cleared auth state from localStorage'))
                .catch((err) => console.log(`Error clearing auth state from localStorage: ${err}`));
        },
        consumeAuthStateFromIDB(state, action: PayloadAction<{ jwt: string, frontEndPrivilege: string, jwtExpiryDate: number }>) {
            const { jwt, frontEndPrivilege, jwtExpiryDate } = action.payload;
            state.jwt = jwt;
            state.frontEndPrivilege = frontEndPrivilege;
            state.jwtExpiryDate = jwtExpiryDate;
        }
    }
});

export const authActions = authSlice.actions;
export default authSlice;