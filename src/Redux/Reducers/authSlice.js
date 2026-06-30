import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  accessToken: "",
  user: {},
  userType: "",
  isAuthenticated: false,
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

    logout: (state, action) => {
      state.user = {};
      state.accessToken = "";
      state.userType = "";
      state.isAuthenticated = false;
    },
  },
});

export const {
  setAccessToken,
  setUser,
  setUserType,
  setIsAuthenticated,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
