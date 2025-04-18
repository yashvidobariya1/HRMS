import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import "./ApplyJobForm.css";
import { showToast } from "../../main/ToastManager";
import Loader from "../Helper/Loader";
import { PostCall } from "../../ApiServices";

const ApplyJobForm = () => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [FileName, setFileName] = useState(null);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const jobUniqueKey = searchParams.get("key");
  const Navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    resume: "",
  });

  const validate = () => {
    let newErrors = {};

    const EMAIL_REGEX = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!formData.firstName) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData?.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\d+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must contain only numbers";
    } else if (!/^\d{11}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be exactly 11 digits";
    }
    if (!formData.resume) {
      newErrors.resume = "Resume is required";
    }
    const email = formData?.email;
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = "Valid Email format is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validate()) {
      setLoading(true);
      try {
        const response = await PostCall(
          `/applyForJob/${jobUniqueKey}`,
          formData
        );
        if (response?.data?.status === 200) {
          showToast(response?.data?.message, "success");
          Navigate("/applyjob");
        } else {
          showToast(response?.data?.message, "error");
        }
        setLoading(false);
      } catch (error) {
        console.log("error", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];

    if (file) {
      if (file.type !== "application/pdf") {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [field]: "Only PDF files are allowed.",
        }));
        setFormData((prevState) => ({
          ...prevState,
          [field]: "",
        }));
        setFileName("");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prevState) => ({
          ...prevState,
          [field]: event.target.result,
        }));
        setFileName(file);
        setErrors((prevErrors) => ({
          ...prevErrors,
          [field]: "",
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (field) => {
    setFormData((prevState) => ({
      ...prevState,
      [field]: "",
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: "",
    }));
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="Addapplyjob-main-container">
      <form onSubmit={handleSubmit}>
        <div className="Addapplyjob-container">
          <h1>Apply Job Application</h1>
          <div className="addapplyjob-section">
            <div className="addapplyjob-input-container">
              <label className="label">First Name*</label>
              <input
                name="firstName"
                className="addapplyjob-input"
                placeholder="Enter first Name"
                value={formData?.firstName}
                onChange={handleChange}
              />
              {errors?.firstName && (
                <p className="error-text">{errors?.firstName}</p>
              )}
            </div>
            <div className="addapplyjob-input-container">
              <label className="label">Last Name*</label>
              <input
                type="text"
                name="lastName"
                className="addapplyjob-input"
                value={formData?.lastName}
                onChange={handleChange}
                placeholder="Enter last Name"
              />
              {errors?.lastName && (
                <p className="error-text">{errors?.lastName}</p>
              )}
            </div>
          </div>

          <div className="addapplyjob-section">
            <div className="addapplyjob-input-container">
              <label className="label">Email*</label>
              <input
                type="email"
                name="email"
                value={formData?.email}
                className="addapplyjob-input"
                onChange={handleChange}
                placeholder="Enter email"
              />
              {errors?.email && <p className="error-text">{errors?.email}</p>}
            </div>

            <div className="addapplyjob-input-container">
              <label className="label">Phone Number*</label>
              <input
                type="text"
                name="phoneNumber"
                value={formData?.phoneNumber}
                className="addapplyjob-input"
                onChange={handleChange}
                placeholder="Enter job Status"
              />
              {errors?.phoneNumber && (
                <p className="error-text">{errors?.phoneNumber}</p>
              )}
            </div>
          </div>

          <div className="addapplyjob-section ">
            <div className="addapplyjob-input-container">
              <label className="label">Resume*</label>
              <div className="applyjob-logo-flex">
                {formData?.resume && (
                  <div
                    className="upload-aection-button"
                    style={{ marginTop: "10px" }}
                  >
                    <p style={{ fontWeight: "500" }}>
                      Uploaded: {FileName.name}
                    </p>

                    <p
                      className="applyjob-upload-img"
                      onClick={() => handleRemoveImage("resume")}
                      style={{ color: "white", cursor: "pointer" }}
                    >
                      Remove
                    </p>
                  </div>
                )}
                <div
                  className="file-buttons-flex"
                  style={{ display: "flex", gap: "10px" }}
                >
                  <label
                    htmlFor="applyjobresumeUpload"
                    className="applyjob-custom-file-upload"
                  >
                    Choose Resume
                  </label>
                  <input
                    type="file"
                    id="applyjobresumeUpload"
                    name="resume"
                    accept=".pdf"
                    className="job-hidden-file-input"
                    onChange={(e) => handleFileUpload(e, "resume")}
                  />
                </div>
              </div>
              {errors.resume && <p className="error-text">{errors.resume}</p>}
            </div>

            <div className="addapplyjob-input-container"></div>
          </div>

          <button type="submit" className="save-button">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApplyJobForm;
