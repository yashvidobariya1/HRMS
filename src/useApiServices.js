import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { persistor } from "./store";
import { clearUserInfo } from "./store/userInfoSlice";
import { clearNotificationCount } from "./store/notificationCountSlice";
import { clearThemeColor } from "./store/themeColorSlice";
import { clearJobRoleSelect } from "./store/selectJobeRoleSlice";
import { clearCompanySelect } from "./store/selectCompanySlice";
import { clearEmployeeformFilled } from "./store/EmployeeFormSlice";

const useApiServices = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const BASE_URL = process.env.REACT_APP_API_URL;

  const getAuthToken = () => {
    const token = JSON.parse(localStorage.getItem("token"));
    return token;
  };

  const defaultHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${getAuthToken()}`,
  });

  const handleUnauthorized = async () => {
    localStorage.clear();
    dispatch(clearUserInfo());
    dispatch(clearNotificationCount());
    dispatch(clearThemeColor());
    dispatch(clearJobRoleSelect());
    dispatch(clearCompanySelect());
    dispatch(clearEmployeeformFilled());
    persistor.pause();
    await persistor.purge();
    persistor.persist();
    navigate("/login");
  };

  const GetCall = async (endpoint, params = {}, headers = {}) => {
    try {
      const response = await axios.get(`${BASE_URL}${endpoint}`, {
        params,
        headers: {
          ...defaultHeaders(),
          ...headers,
        },
      });
      if (response?.data?.status === 5000) {
        await handleUnauthorized();
      }
      return response;
    } catch (error) {
      console.error("GET request error:", error);
    }
  };

  const PostCall = async (endpoint, body = {}, headers = {}) => {
    try {
      const response = await axios.post(`${BASE_URL}${endpoint}`, body, {
        headers: {
          ...defaultHeaders(),
          ...headers,
        },
      });
      if (response?.data?.status === 5000) {
        await handleUnauthorized();
      }
      return response;
    } catch (error) {
      console.error("POST request error:", error);
      return error.response;
    }
  };

  return { GetCall, PostCall };
};

export default useApiServices;
