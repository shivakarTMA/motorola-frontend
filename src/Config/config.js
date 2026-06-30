import axios from "axios";
import { store } from '../Redux/store';

export const apiAxios = () => {
  return axios.create({
    baseURL: process.env.REACT_APP_BASEURL,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const authAxios = () => {
  const token = store.getState().auth.accessToken;

  return axios.create({
    baseURL: process.env.REACT_APP_BASEURL,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
};