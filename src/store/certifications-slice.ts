import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Certification } from "../types/certification_types";

type CertificationsList = Certification[];

const initialCertifications: { certifications: CertificationsList, searchComplete: boolean } = { certifications: [], searchComplete: false };

const certificationsSlice = createSlice({
    name: 'certifications',
    initialState: initialCertifications,
    reducers: {
        setCertifications(state, action: PayloadAction<CertificationsList>) {
            state.certifications = action.payload;
        },
        addCertifications(state, action: PayloadAction<CertificationsList>) {
            state.certifications.push(...action.payload);
        },
        clearCertificationsList(state) {
            state.certifications = [];
        },
        declareSearchComplete(state, action: PayloadAction<boolean>) {
            state.searchComplete = action.payload;
        }
    }
});

export const certificationsActions = certificationsSlice.actions;
export default certificationsSlice;