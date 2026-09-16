import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  accessToken: "",
  user: {},
  userType: "",
  isAuthenticated: false,
  sessionExpiresAt: null, // ISO string from login response, e.g. "2026-09-23T10:28:23.176Z"
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },

    setUser: (state, action) => {
      state.user = action.payload;
    },
    setUserType: (state, action) => {
      state.userType = action.payload;
    },
    setIsAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    setSessionExpiresAt: (state, action) => {
      state.sessionExpiresAt = action.payload;
    },

    logout: (state) => {
      state.user = {};
      state.accessToken = "";
      state.userType = "";
      state.isAuthenticated = false;
      state.sessionExpiresAt = null;
    },
  },
});

export const {
  setAccessToken,
  setUser,
  setUserType,
  setIsAuthenticated,
  setSessionExpiresAt,
  logout,
} = authSlice.actions;

export default authSlice.reducer;