import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  session: null,
  loading: true,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.loading = false;
    },
    setSession: (state, action) => {
      state.session = action.payload;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.session = null;
      state.loading = false;
    },
  },
});

export const { setUser, setSession, setLoading, clearAuth } = authSlice.actions;

export default authSlice.reducer; 