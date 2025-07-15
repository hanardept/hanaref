import { createAsyncThunk } from '@reduxjs/toolkit';
 import { saveAs } from 'file-saver';
import { backendFirebaseUri } from "../../backend-variables/address";

export const exportDataToCsv = createAsyncThunk(
  'data/exportDataToXlsx',
  async (arg, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: { jwt: string } };
      const authToken = state.auth.jwt;

      fetch(encodeURI(`${backendFirebaseUri}/items/download-worksheet`), {
          headers: { 'auth-token': authToken }
      })
      .then(res => res.blob())
      .then(blob => {
          saveAs(blob, 'items.xlsx');
      })
      .catch(err => {
          console.error("Error during new search:", err);
      });

      return 'Data successfully exported!';
    } catch (error: any) {
      console.error('Failed to export data:', error);
      return rejectWithValue(error.message || 'Failed to export data');
    }
  }
);