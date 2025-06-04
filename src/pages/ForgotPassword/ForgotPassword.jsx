import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import "../Login/Login.css";
import useApiServices from "../../useApiServices";
import { showToast } from "../../main/ToastManager";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { setUserInfo } from "../../store/userInfoSlice";
import Loader from "../Helper/Loader";

const ForgotPassword = () => {
  const { PostCall } = useApiServices();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const validateEmail = () => {
    if (!formData.email) {
      setErrors({ email: "Email is required." });
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors({ email: "Please enter a valid email address." });
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateEmail() || (!isForgotPassword && !formData.password)) return;

    try {
      setLoading(true);
      if (isForgotPassword) {
        if (!otpSent) {
          // Send OTP API
          const response = await PostCall("/forgot-password", {
            email: formData.email,
          });

          if (response?.data?.status === 200) {
            showToast("OTP has been sent to your email.", "success");
            setOtpSent(true);
          } else {
            showToast(response?.data?.message, "error");
          }
        } else if (!otpVerified) {
          // Verify OTP API
          const response = await PostCall("/verify-otp", {
            email: formData.email,
            otp: formData.otp,
          });

          if (response?.data?.status === 200) {
            showToast("OTP verified successfully!", "success");
            setOtpVerified(true);
          } else {
            showToast(response?.data?.message, "error");
          }
        } else {
          // Reset Password API
          if (
            !formData.newPassword ||
            formData.newPassword !== formData.confirmPassword
          ) {
            setErrors({ confirmPassword: "Passwords do not match!" });
            setLoading(false);
            return;
          }

          const response = await PostCall("/reset-password", {
            email: formData.email,
            password: formData.newPassword,
          });

          if (response?.data?.status === 200) {
            showToast("Password reset successfully! Please login.", "success");
            setIsForgotPassword(false);
            setOtpSent(false);
            setOtpVerified(false);
          } else {
            showToast(response?.data?.message, "error");
          }
        }
      } else {
        // Login API
        const response = await PostCall("/login", formData);

        if (response?.data?.status === 200) {
          const userInfo = response?.data?.user;
          localStorage.setItem("token", JSON.stringify(userInfo.token));
          dispatch(setUserInfo(userInfo));
          navigate("/dashboard");
          showToast(response?.data?.message, "success");
        } else {
          showToast(response?.data?.message, "error");
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  return (
    <div className="main-login">
      {loading && (
        <div className="loader-wrapper">
          <Loader />
        </div>
      )}
      <div className="login-section">
        <div className="login-bg">
          <img src="/image/login-bg.png" alt="login-img" />
        </div>
        <div className="login-form">
          <div className="form-container">
            <h1>Welcome to HRMS</h1>
            <p>
              {isForgotPassword
                ? "Reset your password"
                : "Login to your account"}
            </p>

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email*</label>
                <input
                  type="email"
                  name="email"
                  className="login-input"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <span className="error-text">{errors.email}</span>
                )}
              </div>

              {isForgotPassword && otpSent && !otpVerified && (
                <div className="form-group">
                  <label>Enter OTP*</label>
                  <input
                    type="text"
                    name="otp"
                    className="login-input"
                    value={formData.otp}
                    onChange={handleChange}
                    placeholder="Enter OTP"
                  />
                </div>
              )}

              {isForgotPassword && otpVerified && (
                <>
                  <div className="form-group">
                    <label>New Password*</label>
                    <input
                      type="password"
                      name="newPassword"
                      className="login-input"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm Password*</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="login-input"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm new password"
                    />
                    {errors.confirmPassword && (
                      <span className="error-text">
                        {errors.confirmPassword}
                      </span>
                    )}
                  </div>
                </>
              )}

              {!isForgotPassword && (
                <div className="form-group">
                  <label>Password*</label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="login-input"
                    />
                    <span
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </span>
                  </div>
                </div>
              )}

              <button type="submit" className="login-btn">
                {isForgotPassword
                  ? otpSent
                    ? otpVerified
                      ? "Reset Password"
                      : "Verify OTP"
                    : "Send OTP to Email"
                  : "Login"}
              </button>

              <p
                className="forgot-password"
                onClick={() => setIsForgotPassword(!isForgotPassword)}
              >
                {isForgotPassword ? "Back to Login" : "Forgot password?"}
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
