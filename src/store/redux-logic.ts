import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authSlice from "./auth-slice";
import itemsSlice from "./item-slice";
import viewingSlice from "./viewing-slice";
import techniciansSlice from "./technicians-slice";
import certificationsSlice from "./certifications-slice";
import usersSlice from "./users-slice";
import suppliersSlice from "./supplier-slice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "root",
  storage,
};

const rootReducer = combineReducers({ 
    auth: authSlice.reducer,
    items: itemsSlice.reducer,
    viewing: viewingSlice.reducer,
    technicians: techniciansSlice.reducer,
    certifications: certificationsSlice.reducer,
    users: usersSlice.reducer,
    suppliers: suppliersSlice.reducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
        },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;