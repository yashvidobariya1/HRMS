import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import "./AddJob.css";
import { GetCall, PostCall } from "../../ApiServices";
import Loader from "../Helper/Loader";
import { showToast } from "../../main/ToastManager";
import moment from "moment";

const AddJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [locationList, setLocationList] = useState([]);
  const { id } = useParams();
  const [formData, setFormData] = useState({
    jobPhoto: "", // mandatory
    jobTitle: "", // mandatory
    jobDescription: "", // mandatory
    jobCategory: "",
    jobApplyTo: "",
    jobStatus: "", // mandatory
    locationId: "", // mandatory
    companyWebSite: "",
    companyContactNumber: "",
  });

  const validate = () => {
    let newErrors = {};

    if (!formData.jobTitle) {
      newErrors.jobTitle = "Job Title is required";
    }
    if (!formData.jobDescription) {
      newErrors.jobDescription = "Job Description is required";
    }
    if (!formData.jobPhoto) {
      newErrors.jobPhoto = "Job Photo is required";
    }
    if (!formData.jobCategory) {
      newErrors.jobCategory = "Job Category is required";
    }
    if (!formData.jobStatus) {
      newErrors.jobStatus = "Job Status is required";
    }
    if (!formData.locationId) {
      newErrors.locationId = "Location is required";
    }
    if (!formData.jobApplyTo) {
      newErrors.jobApplyTo = "Job Apply To is required";
    }
    if (!formData.companyContactNumber) {
      newErrors.companyContactNumber = "Contact Number is required";
    } else if (!/^\d+$/.test(formData?.companyContactNumber)) {
      newErrors.companyContactNumber =
        "Contact number must contain only numbers";
    } else if (!/^\d{11}$/.test(formData?.companyContactNumber)) {
      newErrors.companyContactNumber =
        "Contact number must be exactly 11 digits";
    }

    const website = formData.companyWebSite?.trim();
    if (
      website &&
      !/^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/i.test(
        website
      )
    ) {
      newErrors.companyWebSite = "Invalid website URL format";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validate()) {
      // console.log("Form Data Submitted:", formData);
      try {
        setLoading(true);
        let response;
        if (id) {
          response = await PostCall(`/updateJobPost/${id}`, formData);
        } else {
          response = await PostCall("/createJobPost", formData);
        }
        if (response?.data?.status === 200) {
          showToast(response?.data?.message, "success");
          navigate(`/job`);
        } else {
          showToast(response?.data?.message, "error");
        }
        setLoading(false);
      } catch (error) {
        console.log("error", error);
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

  const GetJobDetails = async () => {
    try {
      setLoading(true);
      const response = await GetCall(`/getJobPost/${id}`);
      if (response?.data?.status === 200) {
        setFormData(response?.data?.jobPost);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (id) {
      GetJobDetails(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    GetLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const GetLocations = async () => {
    try {
      setLoading(true);

      const response = await GetCall(`/getCompanyLocationsForJobPost`);

      if (response?.data?.status === 200) {
        setLocationList(response?.data?.locations);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
      // console.log("Company", Company);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleFileUpload = (e, field) => {
    const file = e.target.files[0];

    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [field]: "Only image files are allowed.",
        }));
        e.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prevState) => ({
          ...prevState,
          [field]: event.target.result,
        }));
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
    <div className="Addjob-main-container">
      <form onSubmit={handleSubmit}>
        <div className="AddJob-container">
          <div className="addjob-section">
            <div className="addjob-input-container">
              <label className="label">Job Title*</label>
              <input
                name="jobTitle"
                className="addjob-input"
                placeholder="Enter Job Title"
                value={formData?.jobTitle}
                onChange={handleChange}
              />
              {errors?.jobTitle && (
                <p className="error-text">{errors?.jobTitle}</p>
              )}
            </div>

            <div className="addjob-input-container">
              <label className="label">Select Location*</label>
              <select
                name="locationId"
                className="addjob-input"
                value={formData.locationId}
                onChange={handleChange}
              >
                <option value="">Select Location</option>
                {locationList.map((location) => (
                  <option key={location._id} value={location._id}>
                    {location.locationName}
                  </option>
                ))}
              </select>
              {errors?.locationId && (
                <p className="error-text">{errors?.locationId}</p>
              )}
            </div>

            <div className="addjob-input-container">
              <label className="label">Company WebSite</label>
              <input
                className="addjob-input checkbox-country"
                name="companyWebSite"
                value={formData?.companyWebSite}
                onChange={handleChange}
                placeholder="Enter Company WebSite"
              />
              {errors?.companyWebSite && (
                <p className="error-text">{errors?.companyWebSite}</p>
              )}
            </div>
          </div>
          <div className="addjob-section">
            <div className="addjob-input-container">
              <label className="label">Job Category*</label>
              <input
                type="text"
                name="jobCategory"
                className="addjob-input"
                value={formData?.jobCategory}
                onChange={handleChange}
                placeholder="Enter Job Category"
              />
              {errors?.jobCategory && (
                <p className="error-text">{errors?.jobCategory}</p>
              )}
            </div>

            <div className="addjob-input-container">
              <label className="label">Job Apply To*</label>
              <input
                type="date"
                name="jobApplyTo"
                value={formData?.jobApplyTo}
                className="addjob-input"
                onChange={handleChange}
                placeholder="Enter job Apply Date"
                min={moment().add(1, "day").format("YYYY-MM-DD")}
              />
              {errors?.jobApplyTo && (
                <p className="error-text">{errors?.jobApplyTo}</p>
              )}
            </div>

            <div className="addjob-input-container">
              <label className="label">Contact Number*</label>
              <input
                type="text"
                className="addjob-input checkbox-country"
                name="companyContactNumber"
                value={formData?.companyContactNumber}
                onChange={handleChange}
                placeholder="Enter Contact Number"
              />
              {errors?.companyContactNumber && (
                <p className="error-text">{errors?.companyContactNumber}</p>
              )}
            </div>
          </div>

          <div className="addjob-section">
            <div className="addjob-input-container">
              <label className="label">Description*</label>
              <textarea
                type="text"
                name="jobDescription"
                value={formData?.jobDescription}
                onChange={handleChange}
                placeholder="Enter Description"
                className="addjob-input"
                rows={4}
              />
              {errors?.jobDescription && (
                <p className="error-text">{errors?.jobDescription}</p>
              )}
            </div>
            <div className="addjob-input-container">
              <label className="label">Job Status*</label>
              <input
                type="text"
                name="jobStatus"
                value={formData?.jobStatus}
                className="addjob-input"
                onChange={handleChange}
                placeholder="Enter job Status"
              />
              {errors?.jobStatus && (
                <p className="error-text">{errors?.jobStatus}</p>
              )}
            </div>

            <div className="addjob-input-container">
              <label className="label">Job Photo*</label>
              <div className="job-logo-flex">
                {formData?.jobPhoto && (
                  <div className="upload-aection-button">
                    <img
                      src={formData?.jobPhoto}
                      alt="Job"
                      style={{
                        width: "100px",
                        height: "100px",
                        marginTop: "10px",
                        border: "1px solid rgb(207, 205, 205)",
                        padding: "10px",
                      }}
                    />
                    <p
                      className="job-upload-img"
                      onClick={() => handleRemoveImage("jobPhoto")}
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
                    htmlFor="jobPhotoUpload"
                    className="job-custom-file-upload"
                  >
                    Choose File
                  </label>
                  <input
                    type="file"
                    id="jobPhotoUpload"
                    name="jobPhoto"
                    accept="image/*"
                    className="job-hidden-file-input"
                    onChange={(e) => handleFileUpload(e, "jobPhoto")}
                  />
                </div>
              </div>
              {errors.jobPhoto && (
                <p className="error-text">{errors.jobPhoto}</p>
              )}
            </div>
          </div>

          <button type="submit" className="save-button">
            {id ? "Update" : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddJob;
