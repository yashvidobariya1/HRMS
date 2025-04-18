import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL;

const getAuthToken = () => {
  const token = JSON.parse(localStorage.getItem("token"));
  return token;
};

const defaultHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getAuthToken()}`,
});

export const GetCall = async (endpoint, params = {}, headers = {}) => {
  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      params,
      headers: {
        ...defaultHeaders(),
        ...headers,
      },
    });
    // console.log("Get response", response);
    return response;
  } catch (error) {
    console.error("GET request error:", error);
  }
};

export const PostCall = async (endpoint, body = {}, headers = {}) => {
  try {
    const response = await axios.post(`${BASE_URL}${endpoint}`, body, {
      headers: {
        ...defaultHeaders(),
        ...headers,
      },
    });
    // console.log("Post response", response);
    return response;
  } catch (error) {
    console.error("POST request error:", error);
    return error.response;
  }
};
