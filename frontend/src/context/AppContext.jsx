import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  axios.defaults.withCredentials = true;
 
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setuserData] = useState(false);

  const getAuthStatus = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/auth/is-auth");
      if (data.success) {
        setIsLoggedin(true);
        getUserData();
      }
    } catch (error) {
      toast.error("error.message");
    }
  };
  const getUserData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/data");
      data.success ? setuserData(data.userData) : toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getAuthStatus();
  }, []);

  const value = {
    backendUrl,
    isLoggedin,
    setIsLoggedin,
    userData,
    setuserData,
    getUserData,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
