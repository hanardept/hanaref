import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Supplier } from "../types/supplier_types";

type SuppliersList = Supplier[];

const initialSuppliers: { suppliers: SuppliersList, searchComplete: boolean } = { suppliers: [], searchComplete: false };

const suppliersSlice = createSlice({
    name: 'suppliers',
    initialState: initialSuppliers,
    reducers: {
        setSuppliers(state, action: PayloadAction<SuppliersList>) {
            state.suppliers = action.payload;
        },
        addSuppliers(state, action: PayloadAction<SuppliersList>) {
            state.suppliers.push(...action.payload);
        },
        clearSuppliersList(state) {
            state.suppliers = [];
        },
        declareSearchComplete(state, action: PayloadAction<boolean>) {
            state.searchComplete = action.payload;
        }
    }
});

export const suppliersActions = suppliersSlice.actions;
export default suppliersSlice;