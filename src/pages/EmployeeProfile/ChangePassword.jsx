import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./ChangePassword.css";
import useApiServices from "../../useApiServices";
import Loader from "../Helper/Loader";
import { useNavigate } from "react-router";
import { showToast } from "../../main/ToastManager";
import { useSelector } from "react-redux";

const ChangePassword = () => {
  const { PostCall } = useApiServices();
  const navigate = useNavigate();
  // const userID = useState(JSON.parse(localStorage.getItem("userId")));
  const user = useSelector((state) => state.userInfo.userInfo);
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    userId: user._id,
  });
  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewPassword({
      ...newPassword,
      [name]: value,
    });
  };

  const toggleShowPassword = (field) => {
    setShowPassword((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
  };

  const validate = () => {
    let newErrors = {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
    let isValid = true;
    if (!newPassword.oldPassword) {
      newErrors.oldPassword = "Old Password is required.";
      isValid = false;
    }
    if (!newPassword.newPassword) {
      newErrors.newPassword = "New Password is required.";
      isValid = false;
    } else if (!validatePassword(newPassword.newPassword)) {
      newErrors.newPassword =
        "Password must be at least 8 characters long, contain one capital letter, one number, and one special character.";
      isValid = false;
    }
    if (!newPassword.confirmPassword) {
      newErrors.confirmPassword = "Confirm Password is required.";
      isValid = false;
    } else if (newPassword.newPassword !== newPassword.confirmPassword) {
      newErrors.confirmPassword =
        "Confirm Password does not match New Password.";
      isValid = false;
    }
    setErrorMessage(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      // console.log("Data submitted:", newPassword);
      try {
        setLoading(true);
        const response = await PostCall(`/updatePassword`, newPassword);
        if (response?.data?.status === 200) {
          showToast(response?.data?.message, "success");
          navigate("/dashboard");
        } else {
          showToast(response?.data?.message);
        }
        setLoading(false);
      } catch (error) {
        console.log("error", error);
      }
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="form-wrapper">
      <form onSubmit={handleSubmit}>
        <label htmlFor="oldPassword" className="changepassword-label">
          Old Password
        </label>
        <div className="input-wrapper">
          <input
            type={showPassword.oldPassword ? "text" : "password"}
            id="oldPassword"
            name="oldPassword"
            placeholder="Enter Old Password"
            value={newPassword.oldPassword}
            onChange={handleChange}
            className="input-field"
          />
          <button
            type="button"
            onClick={() => toggleShowPassword("oldPassword")}
            className="toggle-button"
          >
            {showPassword.oldPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {errorMessage.oldPassword && (
          <div className="error-text">{errorMessage.oldPassword}</div>
        )}

        <label htmlFor="newPassword" className="changepassword-label">
          New Password
        </label>
        <div className="input-wrapper">
          <input
            type={showPassword.newPassword ? "text" : "password"}
            id="newPassword"
            name="newPassword"
            placeholder="Enter New Password"
            value={newPassword.newPassword}
            onChange={handleChange}
            className="input-field"
          />
          <button
            type="button"
            onClick={() => toggleShowPassword("newPassword")}
            className="toggle-button"
          >
            {showPassword.newPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {errorMessage.newPassword && (
          <div className="error-text">{errorMessage.newPassword}</div>
        )}

        <label htmlFor="confirmPassword" className="changepassword-label">
          Confirm Password
        </label>
        <div className="input-wrapper">
          <input
            type={showPassword.confirmPassword ? "text" : "password"}
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Enter Confirm Password"
            value={newPassword.confirmPassword}
            onChange={handleChange}
            className="input-field"
          />
          <button
            type="button"
            onClick={() => toggleShowPassword("confirmPassword")}
            className="toggle-button"
          >
            {showPassword.confirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {errorMessage.confirmPassword && (
          <div className="error-text">{errorMessage.confirmPassword}</div>
        )}
        <button type="submit" className="save-button">
          Change Password
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
