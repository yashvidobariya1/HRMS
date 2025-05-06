import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import "../Login/Login.css";
import { PostCall } from "../../ApiServices";
import { showToast } from "../../main/ToastManager";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { setUserInfo } from "../../store/userInfoSlice";
import Loader from "../Helper/Loader";
import { setEmployeeformFilled } from "../../store/EmployeeFormSlice";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  // const [isForgotPassword, setIsForgotPassword] = useState(false);
  // const [otpsend, setotpsend] = useState(false);
  // const [otpVerified, setOtpVerified] = useState(false);
  const verifyemail = localStorage.getItem("verifyemail");
  const [step, setStep] = useState(localStorage.getItem("step") || "login");
  // console.log("step", step);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "otp" ? parseInt(value, 10) || "" : value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const validateForm = () => {
    let isValid = true;
    let newErrors = {};

    if (step === "login" || step === "otpSent") {
      if (!formData.email) {
        newErrors.email = "Email is required.";
        isValid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address.";
        isValid = false;
      }

      if (!formData.password && step === "login") {
        newErrors.password = "Password is required.";
        isValid = false;
      }
    }

    if (step === "otpVerified") {
      if (!formData.otp) {
        newErrors.otp = "OTP is required.";
        isValid = false;
      } else if (isNaN(formData.otp) || formData.otp.toString().length !== 6) {
        newErrors.otp = "Please enter 6-digit OTP.";
        isValid = false;
      }
    }

    if (step === "updatepassword") {
      if (!formData.newPassword) {
        newErrors.newPassword = "New password is required.";
        isValid = false;
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = "Password must be at least 6 characters long.";
        isValid = false;
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Confirm password is required.";
        isValid = false;
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match.";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      if (step === "login") {
        const response = await PostCall("/login", {
          email: formData.email,
          password: formData.password,
        });

        if (response?.data?.status === 200) {
          const userInfo = response?.data?.user;
          localStorage.setItem("token", JSON.stringify(userInfo.token));
          dispatch(setUserInfo(userInfo));
          const isFormFilled = response?.data?.user?.isFormFilled;
          dispatch(setEmployeeformFilled(isFormFilled));
          navigate("/dashboard");
          showToast(response?.data?.message, "success");
          localStorage.removeItem("step");
          localStorage.removeItem("verifyemail");
        } else {
          showToast(response?.data?.message, "error");
        }
      } else if (step === "otpSent") {
        const response = await PostCall("/emailVerification", {
          email: formData.email,
        });

        if (response?.data?.status === 200) {
          showToast(response.data.message, "success");
          localStorage.setItem("step", "otpVerified");
          localStorage.setItem("verifyemail", formData.email);
          setStep("otpVerified");
        } else {
          showToast(response?.data?.message, "error");
        }
      } else if (step === "otpVerified") {
        const response = await PostCall("/otpVerification", {
          email: verifyemail,
          otp: formData.otp,
        });

        if (response?.data?.status === 200) {
          showToast(response?.data?.message, "success");
          localStorage.setItem("step", "updatepassword");
          setStep("updatepassword");
        } else {
          showToast(response?.data?.message, "error");
        }
      } else if (step === "updatepassword") {
        const response = await PostCall("/forgotPassword", {
          email: verifyemail,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        });

        if (response?.data?.status === 200) {
          showToast(response?.data?.message, "success");
          resetForgotPasswordState();
        } else {
          showToast(response?.data?.message, "error");
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForgotPasswordState = () => {
    setFormData({
      email: "",
      password: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    });
    localStorage.setItem("step", "login");
    setStep("login");
    localStorage.removeItem("verifyemail");
  };

  const handleclear = () => {
    if (step === "updatepassword") {
      resetForgotPasswordState();
    } else {
      localStorage.setItem("step", "otpSent");
      setStep("otpSent");
      if (step === "otpSent" || step === "otpVerified") {
        localStorage.setItem("step", "login");
        setStep("login");
      }
    }
  };

  useEffect(() => {
    if (step) setStep(step);
  }, [step]);

  return (
    <div className="main-login">
      {loading && (
        <div className="loader-wrapper">
          <Loader />
        </div>
      )}
      <div className="login-section">
        <div className="login-bg">
          <img src="/favicon.png" alt="login-img" />
        </div>
        <div className="login-form">
          <div className="form-container">
            <h1>Welcome to City Clean London</h1>
            <p>
              {step === "login" && "Login to your Account"}
              {step === "otpSent" && "Email Verify"}
              {step === "otpVerified" && "Verify OTP"}
              {step === "updatepassword" && "Reset Password"}
            </p>

            <form onSubmit={handleLogin}>
              {step === "login" || step === "otpSent" ? (
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
              ) : null}

              {step === "otpVerified" ? (
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
                  {errors.otp && (
                    <span className="error-text">{errors.otp}</span>
                  )}
                </div>
              ) : null}

              {step === "updatepassword" ? (
                <>
                  <div className="form-group">
                    <label>New Password*</label>
                    <div className="password-wrapper">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        className="login-input"
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="Enter new password"
                      />
                      <span
                        className="toggle-password"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </div>
                    {errors.newPassword && (
                      <span className="error-text">{errors.newPassword}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Confirm Password*</label>
                    <div className="password-wrapper">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        className="login-input"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm new password"
                      />
                      <span
                        className="toggle-password"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </span>
                    </div>
                    {errors.confirmPassword && (
                      <span className="error-text">
                        {errors.confirmPassword}
                      </span>
                    )}
                  </div>
                </>
              ) : null}

              {step === "login" ? (
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
                  {errors.password && (
                    <span className="error-text">{errors?.password}</span>
                  )}
                </div>
              ) : null}

              <button type="submit" className="login-btn">
                {step === "login" && "Login"}
                {step === "otpSent" && "Send OTP to Email"}
                {step === "otpVerified" && "Verify OTP"}
                {step === "updatepassword" && "Reset Password"}
              </button>

              <div className="forgot-password" onClick={handleclear}>
                <h6>
                  {step === "login" ? "Forgot password?" : "Back to Login"}
                </h6>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
