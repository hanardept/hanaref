import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { set } from 'idb-keyval';
import { UserStatus } from "../types/user_types";

const initialAuthState = { jwt: "", frontEndPrivilege: "public", jwtExpiryDate: 0, userId: "", status: null as UserStatus | null };

const authSlice = createSlice({
    name: 'auth',
    initialState: initialAuthState,
    reducers: {
        setAuthStateUponLogin(state, action: PayloadAction<{ jwt: string, frontEndPrivilege: string, jwtExpiryDate: number, userId: string, status: UserStatus }>) {
            const { jwt, frontEndPrivilege, jwtExpiryDate, userId, status } = action.payload;
            state.jwt = jwt;
            state.frontEndPrivilege = frontEndPrivilege;
            state.jwtExpiryDate = jwtExpiryDate;
            state.userId = userId;
            state.status = status;
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
        consumeAuthStateFromIDB(state, action: PayloadAction<{ jwt: string, frontEndPrivilege: string, jwtExpiryDate: number, status: UserStatus }>) {
            const { jwt, frontEndPrivilege, jwtExpiryDate, status } = action.payload;
            state.jwt = jwt;
            state.frontEndPrivilege = frontEndPrivilege;
            state.jwtExpiryDate = jwtExpiryDate;
            state.status = status;
        }
    }
});

export const authActions = authSlice.actions;
export default authSlice;