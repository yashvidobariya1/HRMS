import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { persistor } from "./store";
import { clearUserInfo } from "./store/userInfoSlice";
import { clearNotificationCount } from "./store/notificationCountSlice";
import { clearThemeColor } from "./store/themeColorSlice";
import { clearJobRoleSelect } from "./store/selectJobeRoleSlice";
import { clearCompanySelect } from "./store/selectCompanySlice";
import { clearEmployeeformFilled } from "./store/EmployeeFormSlice";
import { clearSession, setSession } from "./store/SessionSlice";
import { useRef } from "react";
import { showToast } from "./main/ToastManager";

const useApiServices = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const sessionExpired = useSelector((state) => state.session.session);
  const unauthorizedCalled = useRef(false);
  if (typeof window.sessionExpired === "undefined") {
    window.sessionExpired = false;
  }

  const BASE_URL = process.env.REACT_APP_API_URL;

  const getAuthToken = () => {
    const token = JSON.parse(localStorage.getItem("token"));
    return token;
  };

  const defaultHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getAuthToken()}`,
  });

  const handleUnauthorized = async (errorMessage) => {
    if (unauthorizedCalled.current || window.sessionExpired) return;
    unauthorizedCalled.current = true;
    window.sessionExpired = true;
    showToast(errorMessage, "error");
    localStorage.clear();
    await new Promise((resolve) => setTimeout(resolve, 500));

    dispatch(clearUserInfo());
    dispatch(clearNotificationCount());
    dispatch(clearThemeColor());
    dispatch(clearJobRoleSelect());
    dispatch(clearCompanySelect());
    dispatch(clearEmployeeformFilled());
    dispatch(clearSession());
    window.sessionExpired = false;
    persistor.pause();
    await persistor.purge();
    persistor.persist();
    navigate("/login");
  };

  const GetCall = async (endpoint, params = {}, headers = {}) => {
    if (sessionExpired || window.sessionExpired) return;

    try {
      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        params,
        headers: {
          ...defaultHeaders(),
          ...headers,
        },
      });
      if (response?.data?.status === 5000) {
        dispatch(setSession(true));
        await handleUnauthorized(response?.data?.message);
        // await handleUnauthorized();
        return;
      }
      console.log(("response", response));
      return response;
    } catch (error) {
      console.error("GET request error:", error);
      return error.response;
    }
  };

  const PostCall = async (endpoint, body = {}, headers = {}) => {
    if (sessionExpired || window.sessionExpired) return;

    try {
      const response = await axios.post(`${BASE_URL}${endpoint}`, body, {
        headers: {
          ...defaultHeaders(),
          ...headers,
        },
      });
      if (response?.data?.status === 5000) {
        dispatch(setSession(true));
        await handleUnauthorized(response?.data?.message);
        return;
      }
      console.log(("response", response));
      return response;
    } catch (error) {
      console.error("POST request error:", error);
      return error.response;
    }
  };

  return { GetCall, PostCall };
};

export default useApiServices;
