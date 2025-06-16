import React, { useEffect, useMemo, useState } from "react";
// import { FaCheck } from "react-icons/fa";
import { showToast } from "../../main/ToastManager";
import useApiServices from "../../useApiServices";
import { useNavigate, useParams } from "react-router";
import "./AddCompany.css";
import Loader from "../Helper/Loader";
import countryNames from "../../Data/AllCountryList.json";
import { ListSubheader, MenuItem, Select, TextField } from "@mui/material";

const AddCompany = () => {
  const { GetCall, PostCall } = useApiServices();
  const { id } = useParams();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  // const [completedSteps, setCompletedSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    companyDetails: {
      companyCode: "",
      businessName: "",
      companyLogo: "",
      companyRegistrationNumber: "",
      payeReferenceNumber: "",
      address: "",
      addressLine2: "",
      city: "",
      postCode: "",
      country: "",
      timeZone: "",
      contactPersonFirstname: "",
      contactPersonMiddlename: "",
      contactPersonLastname: "",
      contactPersonEmail: "",
      contactPhone: "",
      adminToReceiveNotification: "",
      additionalEmailsForCompliance: "",
      pensionProvider: "",
    },
    employeeSettings: {
      payrollFrequency: "",
      immigrationReminderDay1st: 0,
      immigrationReminderDay2nd: 0,
      immigrationReminderDay3rd: 0,
      holidayYear: "",
      noticePeriodDays: 0,
      contactConfirmationDays: 0,
      rightToWorkCheckReminder: 0,
      holidaysExcludingBank: 0,
      sickLeaves: 0,
    },
    contractDetails: {
      startDate: "",
      endDate: "",
      maxEmployeesAllowed: 0,
    },
  });

  const filteredCountryList = useMemo(() => {
    return countryNames.filter((user) =>
      user.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, countryNames]);

  const Submit = async () => {
    // console.log("nextStep called");
    const isValid = validate();
    if (isValid) {
      const data = {
        ...formData,
      };
      // console.log("Data submitted:", data);
      setLoading(true);
      try {
        let response;
        if (id) {
          response = await PostCall(`/updateCompany/${id}`, data);
        } else {
          response = await PostCall("/addCompany", data);
        }
        if (response?.data?.status === 200) {
          showToast(response?.data?.message, "success");
        } else {
          showToast(response?.data?.message, "error");
        }
        navigate("/company");
        setLoading(false);
      } catch (error) {
        showToast(error, "error");
        setLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const isCheckbox = type === "checkbox";
    const sectionKeys = {
      0: "companyDetails",
      1: "employeeSettings",
      2: "contractDetails",
    };
    const sectionKey = sectionKeys[currentStep];
    if (sectionKey && formData[sectionKey].hasOwnProperty(name)) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [sectionKey]: {
          ...prevFormData[sectionKey],
          [name]: isCheckbox ? checked : value,
        },
      }));
    } else {
      console.error(`Field ${name} not found in section ${sectionKey}`);
    }
  };

  const handleFileUpload = (e, section, field) => {
    const file = e.target.files[0];
    const maxFileSize = 50 * 1024;

    if (file) {
      if (file.size > maxFileSize) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [field]: `Max File size 50KB. Recommended resolation: 150x150.`,
        }));
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          setFormData((prevState) => ({
            ...prevState,
            [section]: {
              ...prevState[section],
              [field]: event.target.result,
            },
          }));
          setErrors((prevErrors) => ({
            ...prevErrors,
            [field]: "",
          }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleRemoveImage = (section, field) => {
    setFormData((prevState) => ({
      ...prevState,
      [section]: {
        ...prevState[section],
        [field]: "",
      },
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: "",
    }));
  };

  const validate = () => {
    let newError = {};

    const isValidEmail = (email) =>
      /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email);

    if (currentStep === 0) {
      const company = formData.companyDetails || {};

      if (!company.businessName) {
        newError.businessName = "Business Name is required";
      }
      if (!company.companyRegistrationNumber) {
        newError.companyRegistrationNumber =
          "Company Registration Number is required";
      }
      if (!company.address) {
        newError.address = "Address is required";
      }
      if (!company.city) {
        newError.city = "City is required";
      }
      if (!company.postCode) {
        newError.postCode = "Post Code is required";
      }
      if (!company.country) {
        newError.country = "Country is required";
      }
      // if (!company.timeZone) {
      //   newError.timeZone = "Time Zone is required";
      // }
      if (!company.contactPersonFirstname?.trim()) {
        newError.contactPersonFirstname =
          "Contact Person First name is required";
      }
      if (!company.contactPersonLastname) {
        newError.contactPersonLastname = "Contact Person Last name is required";
      }
      if (!company.contactPersonEmail) {
        newError.contactPersonEmail = "Contact Person Email is required";
      } else if (!isValidEmail(company.contactPersonEmail)) {
        newError.contactPersonEmail = "Please enter a valid email address";
      }
      if (!company.contactPhone) {
        newError.contactPhone = "Contact Phone is required";
      } else if (!/^\d{11}$/.test(company.contactPhone)) {
        newError.contactPhone = "Contact Phone must be 11 digits.";
      }
    }
    setErrors(newError);
    return Object.keys(newError).length === 0;
  };

  useEffect(() => {
    const GetCompanyDetails = async (id) => {
      try {
        setLoading(true);
        const Company = await GetCall(`/getCompany/${id}`);
        if (Company?.data?.status === 200) {
          setFormData(Company?.data?.company);
        } else {
          showToast(Company?.data?.message, "error");
        }
        setLoading(false);
        // console.log("Company", Company);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    if (id) {
      GetCompanyDetails(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return <Loader />;
  }

  // const handleSaveClick = async () => {
  //   const isValid = validate();
  //   if (isValid) {
  //     const data = {
  //       ...formData,
  //     };
  //     setLoading(true);
  //     try {
  //       const response = await PostCall(`/updateCompany/${id}`, data);
  //       if (response?.data?.status === 200) {
  //         showToast(response?.data?.message, "success");
  //       } else {
  //         showToast(response?.data?.message, "error");
  //       }
  //       navigate("/company");
  //     } catch (error) {
  //       showToast(error, "error");
  //     } finally {
  //       setLoading(false);
  //     }
  //   } else {
  //     console.log("Validation failed for current step");
  //   }
  // };

  return (
    <div className="main-setting-container">
      {/* <div className="setting-stepper">
        {steps?.map((step, index) => (
          <div
            key={index}
            className={`setting-step ${index <= currentStep ? "active" : ""} ${
              completedSteps.includes(index) ? "completed" : ""
            }`}
            onClick={() => handleStepClick(index)}
            style={{ cursor: id ? "pointer" : "not-allowed" }}
          >
            <div className="setting-step-number">
              {completedSteps.includes(index) ? (
                <FaCheck className="checkmark-icon" />
              ) : (
                index + 1
              )}
            </div>
            <div className="setting-step-label">{step}</div>
          </div>
        ))}
      </div> */}

      <div className="setting-step-content">
        {currentStep === 0 && (
          <div className="setting-flex">
            {/* <h1>Company Details</h1> */}
            <div className="setting-section">
              <div className="setting-container">
                <label className="label">Company Code</label>
                <input
                  type="text"
                  name="companyCode"
                  className="setting-input"
                  value={formData?.companyDetails?.companyCode}
                  onChange={handleChange}
                  placeholder="Enter Company Code"
                />
              </div>
              <div className="setting-container">
                <label className="label">Business Name*</label>
                <input
                  type="text"
                  value={formData?.companyDetails?.businessName}
                  onChange={handleChange}
                  placeholder="Enter Business Name"
                  className="setting-input"
                  name="businessName"
                />
                {errors.businessName && (
                  <p className="error-text">{errors.businessName}</p>
                )}
              </div>
              <div className="setting-container">
                <label className="label">Company Logo</label>
                <div className="setting-logo-flex">
                  {formData?.companyDetails?.companyLogo && (
                    <div className="upload-aection-button">
                      <img
                        src={formData?.companyDetails?.companyLogo}
                        alt="Company Logo"
                        className="company-logo-uplaod"
                      />
                      <p
                        className="setting-upload-img"
                        onClick={() =>
                          handleRemoveImage("companyDetails", "companyLogo")
                        }
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
                      htmlFor="companyLogoUpload"
                      className="custom-file-upload"
                    >
                      Choose File
                    </label>
                    <input
                      type="file"
                      id="companyLogoUpload"
                      name="companyLogo"
                      accept="image/*"
                      className="hidden-file-input"
                      onChange={(e) =>
                        handleFileUpload(e, "companyDetails", "companyLogo")
                      }
                    />
                  </div>
                </div>
                {errors.companyLogo && (
                  <p className="error-text">{errors.companyLogo}</p>
                )}
              </div>
            </div>

            <div className="setting-section">
              <div className="setting-container">
                <label className="label">Company Registration Number*</label>
                <input
                  type="text"
                  className="setting-input"
                  name="companyRegistrationNumber"
                  value={formData?.companyDetails?.companyRegistrationNumber}
                  onChange={handleChange}
                  placeholder="enter company Registration Number"
                />
                {errors.companyRegistrationNumber && (
                  <p className="error-text">
                    {errors.companyRegistrationNumber}
                  </p>
                )}
              </div>
              <div className="setting-container">
                <label className="label">PAYE Reference Number</label>
                <input
                  type="text"
                  className="setting-input"
                  name="payeReferenceNumber"
                  value={formData?.companyDetails?.payeReferenceNumber}
                  onChange={handleChange}
                  placeholder="Enter PAYE Reference Number"
                />
              </div>

              <div className="setting-container">
                <label className="label">Address*</label>
                <input
                  type="text"
                  name="address"
                  className="setting-input"
                  value={formData?.companyDetails?.address}
                  onChange={handleChange}
                  placeholder="Enter Address"
                />
                {errors.address && (
                  <p className="error-text">{errors.address}</p>
                )}
              </div>
            </div>

            <div className="setting-section">
              <div className="setting-container">
                <label className="label">Address Line 2</label>
                <input
                  type="text"
                  name="addressLine2"
                  className="setting-input"
                  value={formData?.companyDetails?.addressLine2}
                  onChange={handleChange}
                  placeholder="Enter Address Line 2"
                />
              </div>
              <div className="setting-container">
                <label className="label">City*</label>
                <input
                  type="text"
                  name="city"
                  value={formData?.companyDetails?.city}
                  onChange={handleChange}
                  placeholder="Enter City"
                  className="setting-input"
                />
                {errors.city && <p className="error-text">{errors.city}</p>}
              </div>
              <div className="setting-container">
                <label className="label">Post Code*</label>
                <input
                  type="text"
                  name="postCode"
                  value={formData?.companyDetails?.postCode}
                  onChange={handleChange}
                  className="setting-input"
                  placeholder="Enter Post Code"
                />
                {errors.postCode && (
                  <p className="error-text">{errors.postCode}</p>
                )}
              </div>
            </div>

            <div className="setting-section">
              <div className="setting-container">
                <label className="label">Country*</label>
                {/* <select
                  name="country"
                  value={formData?.companyDetails?.country}
                  onChange={handleChange}
                  className="setting-input"
                >
                  <option value="" disabled>
                    Select Country
                  </option>
                  {countryNames.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select> */}
                <Select
                  name="country"
                  className="selection-dropdown"
                  value={formData.companyDetails.country}
                  onChange={handleChange}
                  displayEmpty
                  MenuProps={{
                    disableAutoFocusItem: true,
                    PaperProps: {
                      style: {
                        width: 200,
                        overflowX: "auto",
                        scrollbarWidth: "thin",
                        maxHeight: 200,
                      },
                    },
                    MenuListProps: {
                      onMouseDown: (e) => {
                        if (e.target.closest(".search-textfield")) {
                          e.stopPropagation();
                        }
                      },
                    },
                  }}
                  renderValue={(selected) => {
                    if (!selected) return "Select Country";
                    const found = countryNames.find((emp) => emp === selected);
                    return found || "No found";
                  }}
                >
                  <ListSubheader>
                    <TextField
                      size="small"
                      placeholder="Search Country"
                      fullWidth
                      className="search-textfield"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </ListSubheader>
                  <MenuItem value="" disabled className="menu-item">
                    Select Country
                  </MenuItem>
                  {filteredCountryList.length > 0 ? (
                    filteredCountryList.map((country, index) => (
                      <MenuItem
                        key={index}
                        value={country}
                        className="menu-item"
                      >
                        {country}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No countries found</MenuItem>
                  )}
                </Select>
                {errors.country && (
                  <p className="error-text">{errors.country}</p>
                )}
              </div>

              <div className="setting-container">
                <label className="label">Contact Telephone*</label>
                <input
                  type="tel"
                  name="contactPhone"
                  className="setting-input"
                  value={formData?.companyDetails?.contactPhone}
                  onChange={handleChange}
                  placeholder="Enter Telephone"
                />
                {errors.contactPhone && (
                  <p className="error-text">{errors.contactPhone}</p>
                )}
              </div>
              {/* <div className="setting-container">
                <label className="label">Timezone*</label>
                <Select
                  name="timeZone"
                  className="selection-dropdown"
                  value={formData?.companyDetails?.timeZone}
                  onChange={handleChange}
                  displayEmpty
                  MenuProps={{
                    PaperProps: {
                      style: {
                        width: 200,
                        maxHeight: 200,
                        overflowX: "auto",
                        scrollbarWidth: "thin",
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled className="menu-item">
                    Select Timezone
                  </MenuItem>
                  <MenuItem value="GMT+1" className="menu-item">
                    GMT+1
                  </MenuItem>
                  <MenuItem value="GMT+2" className="menu-item">
                    GMT+2
                  </MenuItem>
                  <MenuItem value="GMT+3" className="menu-item">
                    GMT+3
                  </MenuItem>
                  <MenuItem value="GMT+4" className="menu-item">
                    GMT+4
                  </MenuItem>
                </Select>
                {errors.timeZone && (
                  <p className="error-text">{errors.timeZone}</p>
                )}
              </div> */}

              <div className="setting-container">
                <label className="label">Conatct Person Email Address*</label>
                <input
                  type="email"
                  name="contactPersonEmail"
                  value={formData?.companyDetails?.contactPersonEmail}
                  onChange={handleChange}
                  placeholder="Enter contact Person Email"
                  className="setting-input"
                />
                {errors.contactPersonEmail && (
                  <p className="error-text">{errors.contactPersonEmail}</p>
                )}
              </div>
            </div>

            <div className="setting-section">
              <div className="setting-container">
                <label className="label">Contact Person First Name*</label>
                <input
                  type="text"
                  name="contactPersonFirstname"
                  value={formData?.companyDetails?.contactPersonFirstname}
                  onChange={handleChange}
                  placeholder="Enter contact Person Firstname"
                  className="setting-input"
                />
                {errors.contactPersonFirstname && (
                  <p className="error-text">{errors.contactPersonFirstname}</p>
                )}
              </div>

              <div className="setting-container">
                <label className="label">Contact Person Middle Name</label>
                <input
                  type="text"
                  name="contactPersonMiddlename"
                  className="setting-input"
                  value={formData?.companyDetails?.contactPersonMiddlename}
                  onChange={handleChange}
                  placeholder="Enter contact Person Middlename"
                />
              </div>

              <div className="setting-container">
                <label className="label">Conatct Person Last Name*</label>
                <input
                  type="text"
                  className="setting-input"
                  name="contactPersonLastname"
                  value={formData?.companyDetails?.contactPersonLastname}
                  onChange={handleChange}
                  placeholder="Enter contact Person Lastname"
                />
                {errors.contactPersonLastname && (
                  <p className="error-text">{errors.contactPersonLastname}</p>
                )}
              </div>
            </div>

            {/* <div className="setting-section">
              <div className="setting-container">
                <label className="label">Pension Provider</label>
                <input
                  type="text"
                  name="pensionProvider"
                  value={formData?.companyDetails?.pensionProvider}
                  onChange={handleChange}
                  placeholder="Enter pension Provider"
                  className="setting-input"
                />
              </div>
              <div className="setting-container"></div>

              <div className="setting-container">
                <label className="label">
                  Assign company admin to receive notification
                </label>
                <Select
                  name="adminToReceiveNotification"
                  className="selection-dropdown"
                  value={formData?.companyDetails?.adminToReceiveNotification}
                  onChange={handleChange}
                  displayEmpty
                  MenuProps={{
                    PaperProps: {
                      style: {
                        width: 200,
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxHeight: 200,
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled className="menu-item">
                    {" "}
                    Select Company Admin
                  </MenuItem>
                  <MenuItem value="Admin 1" className="menu-item">
                    Admin 1
                  </MenuItem>
                  <MenuItem value="Administrator" className="menu-item">
                    Administrator
                  </MenuItem>
                  <MenuItem value="Admin 2" className="menu-item">
                    Admin 2
                  </MenuItem>
                  <MenuItem value="Admin" className="menu-item">
                    Admin
                  </MenuItem>
                </Select>
              </div>
              <div className="setting-container">
                <label className="label">
                  Assign Email Addresses for compliance notification
                </label>
                <input
                  type="text"
                  name="additionalEmailsForCompliance"
                  value={
                    formData?.companyDetails?.additionalEmailsForCompliance
                  }
                  onChange={handleChange}
                  placeholder="Enter additional Emails For Compliance"
                  className="setting-input"
                />
              </div>
            </div> */}
          </div>
        )}
      </div>

      <button onClick={Submit} className="save-button">
        {id ? "Update" : "Submit"}
      </button>
    </div>
  );
};

export default AddCompany;
