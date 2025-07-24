import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Technician } from "../types/technician_types";

type TechniciansList = Technician[];

const initialTechnicians: { technicians: TechniciansList, searchComplete: boolean } = { technicians: [], searchComplete: false };

const techniciansSlice = createSlice({
    name: 'technicians',
    initialState: initialTechnicians,
    reducers: {
        setTechnicians(state, action: PayloadAction<TechniciansList>) {
            state.technicians = action.payload;
        },
        addTechnicians(state, action: PayloadAction<TechniciansList>) {
            state.technicians.push(...action.payload);
        },
        clearTechnicianList(state) {
            state.technicians = [];
        },
        declareSearchComplete(state, action: PayloadAction<boolean>) {
            state.searchComplete = action.payload;
        }
    }
});

export const techniciansActions = techniciansSlice.actions;
export default techniciansSlice;