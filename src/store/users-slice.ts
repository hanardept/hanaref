import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../types/user_types";

type UsersList = User[];

const initialUsers: { users: UsersList, searchComplete: boolean } = { users: [], searchComplete: false };

const usersSlice = createSlice({
    name: 'users',
    initialState: initialUsers,
    reducers: {
        setUsers(state, action: PayloadAction<UsersList>) {
            state.users = action.payload;
        },
        addUsers(state, action: PayloadAction<UsersList>) {
            state.users.push(...action.payload);
        },
        clearUserList(state) {
            state.users = [];
        },
        declareSearchComplete(state, action: PayloadAction<boolean>) {
            state.searchComplete = action.payload;
        }
    }
});

export const usersActions = usersSlice.actions;
export default usersSlice;