import React, { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa";
import { showToast } from "../../main/ToastManager";
import { GetCall, PostCall } from "../../ApiServices";
import { useNavigate, useParams } from "react-router";
import "./AddCompany.css";
import Loader from "../Helper/Loader";
import countryNames from "../../Data/AllCountryList.json";
import { MenuItem, Select } from "@mui/material";

const AddCompany = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [loading, setLoading] = useState(false);
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

  const steps = ["Company Details", "Employee Settings", "Contract Details"];

  const nextStep = async () => {
    // console.log("nextStep called");
    const isValid = validate();
    if (isValid) {
      const data = {
        ...formData,
      };
      // console.log("Data submitted:", data);
      if (currentStep === steps.length - 1) {
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
      } else {
        setCompletedSteps((prev) => {
          if (!prev.includes(currentStep)) {
            return [...prev, currentStep];
          }
          return prev;
        });
        setCurrentStep(currentStep + 1);
      }
    } else {
      console.log("Validation failed for current step");
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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
    const currentStepName = steps[currentStep];
    // console.log("current step ==>", currentStepName);
    const isValidEmail = (email) =>
      /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email);

    switch (currentStepName) {
      case "Company Details":
        // console.log("current step", currentStepName);
        if (!formData.companyDetails.businessName) {
          newError.businessName = "Business Name is required";
        }
        if (!formData.companyDetails.companyRegistrationNumber) {
          newError.companyRegistrationNumber =
            "Company Registration Number Name is required";
        }
        if (!formData.companyDetails.address) {
          newError.address = "Address is required";
        }
        if (!formData.companyDetails.city) {
          newError.city = "City is required";
        }
        if (!formData.companyDetails.postCode) {
          newError.postCode = "Post Code is required";
        }
        if (!formData.companyDetails.country) {
          newError.country = "Country is required";
        }
        if (!formData.companyDetails.timeZone) {
          newError.timeZone = "Time Zone is required";
        }
        if (!formData.companyDetails.contactPersonFirstname?.trim()) {
          newError.contactPersonFirstname =
            "Contact Person Firstname is required";
        }
        if (!formData.companyDetails.contactPersonLastname) {
          newError.contactPersonLastname =
            "Contact Person Lastname is required";
        }
        if (!formData.companyDetails.contactPersonEmail) {
          newError.contactPersonEmail = "Contact Person Email is required";
        } else if (!isValidEmail(formData.companyDetails.contactPersonEmail)) {
          newError.contactPersonEmail = "Please enter a valid email address";
        }
        if (!formData.companyDetails.contactPhone) {
          newError.contactPhone = "Contact Phone is required";
        } else if (!/^\d{11}$/.test(formData.companyDetails.contactPhone)) {
          newError.contactPhone = "Contact Phone must be 11 digits.";
        }
        break;

      case "Contract Details":
        // console.log("current step", currentStepName);
        if (!formData.contractDetails.startDate) {
          newError.startDate = "Start date is required";
        }
        if (!formData.contractDetails.endDate) {
          newError.endDate = "End Date is required";
        }
        if (!formData.contractDetails.maxEmployeesAllowed) {
          newError.maxEmployeesAllowed = "No of allowed employees is required";
        } else if (
          !/^[1-9]\d*$/.test(formData.contractDetails.maxEmployeesAllowed)
        ) {
          newError.maxEmployeesAllowed =
            "No of allowed employees must be a positive Number";
        }
        break;

      default:
        break;
    }

    setErrors(newError);
    return Object.keys(newError).length === 0;
  };

  const handleStepClick = (index) => {
    const isUpdateMode = !!id;
    if (
      completedSteps.includes(index) ||
      index === currentStep ||
      isUpdateMode
    ) {
      setCurrentStep(index);
    }
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
  }, [id]);

  if (loading) {
    return <Loader />;
  }

  const handleSaveClick = async () => {
    const isValid = validate();
    if (isValid) {
      const data = {
        ...formData,
      };
      setLoading(true);
      try {
        const response = await PostCall(`/updateCompany/${id}`, data);
        if (response?.data?.status === 200) {
          showToast(response?.data?.message, "success");
        } else {
          showToast(response?.data?.message, "error");
        }
        navigate("/company");
      } catch (error) {
        showToast(error, "error");
      } finally {
        setLoading(false);
      }
    } else {
      console.log("Validation failed for current step");
    }
  };

  return (
    <div className="main-setting-container">
      <div className="setting-stepper">
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
      </div>

      <div className="setting-step-content">
        {currentStep === 0 && (
          <div className="setting-flex">
            <h1>Company Details</h1>
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
                  <MenuItem value="" disabled>
                    Select Country
                  </MenuItem>
                  {countryNames.map((country, index) => (
                    <MenuItem key={index} value={country}>
                      {country}
                    </MenuItem>
                  ))}
                </Select>
                {errors.country && (
                  <p className="error-text">{errors.country}</p>
                )}
              </div>

              <div className="setting-container">
                <label className="label">Timezone*</label>
                {/* <select
                  name="timeZone"
                  className="setting-input"
                  value={formData?.companyDetails?.timeZone}
                  onChange={handleChange}
                >
                  <option value="" disabled>
                    Select Timezone
                  </option>
                  <option value="GMT+1">GMT+1</option>
                  <option value="GMT+2">GMT+2</option>
                  <option value="GMT+3">GMT+3</option>
                  <option value="GMT+4">GMT+4</option>
                </select> */}
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
                        textOverflow: "ellipsis",
                        maxHeight: 200,
                        whiteSpace: "nowrap",
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    Select Timezone
                  </MenuItem>
                  <MenuItem value="GMT+1">GMT+1</MenuItem>
                  <MenuItem value="GMT+2">GMT+2</MenuItem>
                  <MenuItem value="GMT+3">GMT+3</MenuItem>
                  <MenuItem value="GMT+4">GMT+4</MenuItem>
                </Select>
                {errors.timeZone && (
                  <p className="error-text">{errors.timeZone}</p>
                )}
              </div>
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
            </div>

            <div className="setting-section">
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

              <div className="setting-container">
                <label className="label">
                  Assign company admin to receive notification
                </label>
                {/* <select
                  name="adminToReceiveNotification"
                  className="setting-input"
                  value={formData?.companyDetails?.adminToReceiveNotification}
                  onChange={handleChange}
                >
                  <option value="" disabled>
                    Select Company Admin
                  </option>
                  <option value="Admin 1">Admin 1</option>
                  <option value="Administrator">Administrator</option>
                  <option value="Admin 2">Admin 2</option>
                  <option value="Admin">Admin</option>
                </select> */}
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
                  <MenuItem value="" disabled>
                    {" "}
                    Select Company Admin
                  </MenuItem>
                  <MenuItem value="Admin 1">Admin 1</MenuItem>
                  <MenuItem value="Administrator">Administrator</MenuItem>
                  <MenuItem value="Admin 2">Admin 2</MenuItem>
                  <MenuItem value="Admin">Admin</MenuItem>
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
            </div>

            <div className="setting-section">
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
              <div className="setting-container"></div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="setting-flex">
            <h1>Employee Settings</h1>
            <div className="setting-section">
              <div className="setting-container">
                <label className="label">
                  Employee setting-payroll frequency
                </label>
                {/* <select
                  name="payrollFrequency"
                  value={formData?.employeeSettings?.payrollFrequency}
                  onChange={handleChange}
                  className="setting-input"
                >
                  <option value="" disabled>
                    Select Payroll Frequency
                  </option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Yearly">Yearly</option>
                </select> */}
                <Select
                  name="payrollFrequency"
                  value={formData?.employeeSettings?.payrollFrequency}
                  onChange={handleChange}
                  className="selection-dropdown"
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
                  <MenuItem value="" disabled>
                    Select Payroll Frequency
                  </MenuItem>
                  <MenuItem value="Weekly">Weekly</MenuItem>
                  <MenuItem value="Monthly">Monthly</MenuItem>
                  <MenuItem value="Yearly">Yearly</MenuItem>
                </Select>
              </div>
              <div className="setting-container">
                <label className="label">
                  Employee Contract details confirmation(days)
                </label>
                <input
                  type="number"
                  name="contactConfirmationDays"
                  value={formData?.employeeSettings?.contactConfirmationDays}
                  onChange={handleChange}
                  placeholder="Enter Employee Contract details confirmation(days)"
                  className="setting-input"
                />
              </div>
              <div className="setting-container">
                <label className="label">Immigration reminder 1st (days)</label>
                <input
                  type="number"
                  name="immigrationReminderDay1st"
                  value={formData?.employeeSettings?.immigrationReminderDay1st}
                  onChange={handleChange}
                  placeholder="Enter Immigration reminder 1st(days)"
                  className="setting-input"
                />
              </div>
            </div>

            <div className="setting-section">
              <div className="setting-container">
                <label className="label">Immigration reminder 2nd (days)</label>
                <input
                  type="number"
                  name="immigrationReminderDay2nd"
                  value={formData?.employeeSettings?.immigrationReminderDay2nd}
                  onChange={handleChange}
                  placeholder="Enter Immigration reminder 2nd(days)"
                  className="setting-input"
                />
              </div>
              <div className="setting-container">
                <label className="label">Immigration reminder 3nd (days)</label>
                <input
                  type="number"
                  name="immigrationReminderDay3rd"
                  value={formData?.employeeSettings?.immigrationReminderDay3rd}
                  onChange={handleChange}
                  placeholder="Immigration reminder 3nd(days)"
                  className="setting-input"
                />
              </div>

              <div className="setting-container">
                <label className="label">
                  No of holidays excluding bank holidays for full time employee
                </label>
                <input
                  className="setting-input"
                  type="number"
                  name="holidaysExcludingBank"
                  value={formData?.employeeSettings?.holidaysExcludingBank}
                  onChange={handleChange}
                  placeholder="Ente number of holidays"
                />
              </div>
            </div>

            <div className="setting-section">
              <div className="setting-container">
                <label className="label">Holiday Year</label>
                {/* <select
                  name="holidayYear"
                  value={formData?.employeeSettings?.holidayYear}
                  onChange={handleChange}
                  className="setting-input"
                >
                  <option value="" disabled>
                    Select Holiday Year
                  </option>
                  <option value="Jan-Dec">Jan-Dec</option>
                  <option value="Dec-Mar">Dec-Mar</option>
                  <option value="Mar-Jun">Mar-Jun</option>
                </select> */}
                <Select
                  name="holidayYear"
                  value={formData?.employeeSettings?.holidayYear}
                  onChange={handleChange}
                  className="selection-dropdown"
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
                  <MenuItem value="Jan-Dec">Jan-Dec</MenuItem>
                  <MenuItem value="Dec-Mar">Dec-Mar</MenuItem>
                  <MenuItem value="Mar-Jun">Mar-Jun</MenuItem>
                </Select>
              </div>
              <div className="setting-container">
                <label className="label">
                  Number of sick leaves for full time
                </label>
                <input
                  type="number"
                  name="sickLeaves"
                  value={formData?.employeeSettings?.sickLeaves}
                  onChange={handleChange}
                  placeholder="Enter Number of sick leaves for full time"
                  className="setting-input"
                />
              </div>
              <div className="setting-container">
                <label className="label">Notice Period (Days)</label>
                <input
                  type="number"
                  name="noticePeriodDays"
                  value={formData?.employeeSettings?.noticePeriodDays}
                  onChange={handleChange}
                  placeholder="Enter Notice Period Days"
                  className="setting-input"
                />
              </div>
            </div>

            <div className="setting-section">
              <div className="setting-container">
                <label className="label">Right to check Reminder</label>
                <input
                  type="number"
                  name="rightToWorkCheckReminder"
                  value={formData?.employeeSettings?.rightToWorkCheckReminder}
                  onChange={handleChange}
                  placeholder="Enter Right to check Reminder"
                  className="setting-input"
                />
              </div>
              <div className="setting-container"></div>
              <div className="setting-container"></div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="setting-flex">
            <h1>Contract Details</h1>
            <div className="setting-section">
              <div className="setting-container">
                <label className="label">Contract Start Date*</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData?.contractDetails?.startDate}
                  onChange={handleChange}
                  placeholder="DD/MM/YYYY"
                  className="setting-input"
                />
                {errors.startDate && (
                  <p className="error-text">{errors.startDate}</p>
                )}
              </div>
              <div className="setting-container">
                <label className="label">Contract End Date*</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData?.contractDetails?.endDate}
                  onChange={handleChange}
                  placeholder="DD/MM/YYYY"
                  className="setting-input"
                />
                {errors.endDate && (
                  <p className="error-text">{errors.endDate}</p>
                )}
              </div>
              <div className="setting-container">
                <label className="label">No of Employees Allowed*</label>
                <input
                  type="number"
                  name="maxEmployeesAllowed"
                  value={formData?.contractDetails?.maxEmployeesAllowed}
                  onChange={handleChange}
                  placeholder="Enter No of Employees Allowed"
                  className="setting-input"
                />
                {errors.maxEmployeesAllowed && (
                  <p className="error-text">{errors.maxEmployeesAllowed}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {currentStep < steps.length && (
        <div className="setting-next-button">
          <button onClick={prevStep} disabled={currentStep === 0}>
            Previous
          </button>
          <button onClick={nextStep}>
            {currentStep === steps.length - 1
              ? id
                ? "Update"
                : "Submit"
              : "Next"}
          </button>
          {id && currentStep !== steps.length - 1 && (
            <button onClick={handleSaveClick}>Save</button>
          )}
        </div>
      )}
    </div>
  );
};

export default AddCompany;
