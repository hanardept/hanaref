import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialViewState = { 
    sectorManagement: {
        currentSector: "",
        changesApplied: false
    },
    itemManagement: {
        currentCat: "",
        changesApplied: false
    },
    technicianManagement: {
        currentTechnicianId: "",
        changesApplied: false
    },
    certificationManagement: {
        currentCertificationId: "",
        changesApplied: false
    },    
    searching: {
        searchVal: "",
        sector: "",
        department: "",
        showArchived: false,
        page: 1,
        blockScrollSearch: false
    }
 };

const viewingSlice = createSlice({
    name: 'viewing',
    initialState: initialViewState,
    reducers: {
        manageSector(state, action: PayloadAction<string>) {
            state.sectorManagement.currentSector = action.payload;
        },
        changesAppliedToSector(state, action: PayloadAction<boolean>) {
            state.sectorManagement.changesApplied = action.payload;
        },
        manageTechnicianId(state, action: PayloadAction<string>) {
            state.technicianManagement.currentTechnicianId = action.payload;
        },
        changesAppliedToTechnician(state, action: PayloadAction<boolean>) {
            state.technicianManagement.changesApplied = action.payload;
        },
        manageCertificationId(state, action: PayloadAction<string>) {
            state.certificationManagement.currentCertificationId = action.payload;
        },
        changesAppliedToCertification(state, action: PayloadAction<boolean>) {
            state.certificationManagement.changesApplied = action.payload;
        },                     
        manageItem(state, action: PayloadAction<string>) {
            state.itemManagement.currentCat = action.payload;
        },
        changesAppliedToItem(state, action: PayloadAction<boolean>) {
            state.itemManagement.changesApplied = action.payload;
        },
        changeSearchCriteria(state, action: PayloadAction<{ searchVal?: string, sector?: string, department?: string, showArchived?: boolean, page?: number }>) {
            if (typeof action.payload.searchVal === "string") state.searching.searchVal = action.payload.searchVal;
            if (typeof action.payload.sector === "string") state.searching.sector = action.payload.sector;
            if (typeof action.payload.department === "string") state.searching.department = action.payload.department;
            if (typeof action.payload.showArchived === "boolean") state.searching.showArchived = action.payload.showArchived;
            if (typeof action.payload.page === "number") state.searching.page = action.payload.page;
        },
        emptySearchCriteria(state) {
            state.searching = initialViewState.searching;
        },
        changeBlockSearcScroll(state, action: PayloadAction<boolean>) {
            state.searching.blockScrollSearch = action.payload;
        }
    }
});

export const viewingActions = viewingSlice.actions;
export default viewingSlice;