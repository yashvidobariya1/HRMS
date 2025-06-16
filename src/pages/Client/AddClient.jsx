import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import "./AddClient.css";
import useApiServices from "../../useApiServices";
import Loader from "../Helper/Loader";
import { showToast } from "../../main/ToastManager";
import { IoMdAdd } from "react-icons/io";
import { MdRemove } from "react-icons/md";
import countryNames from "../../Data/AllCountryList.json";
import { useSelector } from "react-redux";
import { ListSubheader, MenuItem, Select, TextField } from "@mui/material";

const AddClient = () => {
  const navigate = useNavigate();
  const { PostCall, GetCall } = useApiServices();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  // const location = useLocation();
  // const searchParams = new URLSearchParams(location.search);
  // const companyId = searchParams.get("companyId");
  const [isOn, setIsOn] = useState(false);
  const companyId = useSelector((state) => state.companySelect.companySelect);
  const [searchTerm, setSearchTerm] = useState("");
  const { id } = useParams();
  const [formData, setFormData] = useState({
    clientName: "",
    contactNumber: "",
    email: [""],
    address: "",
    addressLine2: "",
    city: "",
    postCode: "",
    country: "",
    graceTime: "",
    breakTime: "",
    longitude: "",
    latitude: "",
    radius: "",
    isAutoGenerateReport: false,
    reportFrequency: "",
    reportTime: "",
    weekday: "",
    monthDate: "",
  });
  const HourList = [
    "00:00",
    "01:00",
    "02:00",
    "03:00",
    "04:00",
    "05:00",
    "06:00",
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
    "23:00",
  ];
  const WeekDayList = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const MonthDateList = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "20",
    "21",
    "22",
    "23",
    "24",
    "25",
    "26",
    "27",
    "28",
  ];

  // const validate = () => {
  //   let newErrors = {};
  //   const EMAIL_REGEX = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
  //   let emailSet = new Set();
  //   if (!formData.clientName) {
  //     newErrors.clientName = "Client name is required";
  //   }
  //   if (!formData?.contactNumber) {
  //     newErrors.contactNumber = "contact Number is required";
  //   } else if (!/^\d+$/.test(formData?.contactNumber)) {
  //     newErrors.contactNumber = "contact Number must contain only numbers";
  //   } else if (!/^\d{10}$/.test(formData?.contactNumber)) {
  //     newErrors.contactNumber = "contact Number must be exactly 10 digits";
  //   }
  //   if (!formData.address) {
  //     newErrors.address = "Address is required";
  //   }
  //   if (!formData.city) {
  //     newErrors.city = "City is required";
  //   }
  //   if (!formData.email || formData.email.length === 0) {
  //     newErrors.email = "At least one email is required";
  //   } else {
  //     formData.email.forEach((email, index) => {
  //       if (!email) {
  //         newErrors[`email-${index}`] = `Email is required`;
  //       } else if (!EMAIL_REGEX.test(email)) {
  //         newErrors[`email-${index}`] = `Invalid email`;
  //       } else {
  //         emailSet.add(email);
  //       }
  //     });
  // }
  //
  //   if (!formData.postCode) {
  //     newErrors.postCode = "postCode is required";
  //   }
  //   if (!formData.country) {
  //     newErrors.country = "Country is required";
  //   }
  //   setErrors(newErrors);
  //   return Object.keys(newErrors).length === 0;
  // };

  const filteredCountryList = useMemo(() => {
    return countryNames.filter((user) =>
      user.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, countryNames]);

  const validate = () => {
    let newErrors = {};
    const EMAIL_REGEX = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    let emailSet = new Set();
    if (!formData.clientName) {
      newErrors.clientName = "Client name is required";
    }
    if (!formData?.contactNumber) {
      newErrors.contactNumber = "Contact number is required";
    } else if (!/^\d+$/.test(formData?.contactNumber)) {
      newErrors.contactNumber = "Contact number must contain only numbers";
    } else if (!/^\d{11}$/.test(formData?.contactNumber)) {
      newErrors.contactNumber = "Contact number must be exactly 11 digits";
    }
    if (!formData.address) {
      newErrors.address = "Address is required";
    }
    if (!formData.city) {
      newErrors.city = "City is required";
    }
    if (!formData.email || formData.email.length === 0) {
      newErrors.email = "At least one email is required";
    } else {
      formData.email.forEach((email, index) => {
        if (!email) {
          newErrors[`email-${index}`] = `Email is required`;
        } else if (!EMAIL_REGEX.test(email)) {
          newErrors[`email-${index}`] = `Invalid email`;
        } else if (emailSet.has(email)) {
          newErrors[`email-${index}`] = "Duplicate email not allowed";
        } else {
          emailSet.add(email);
          delete newErrors[`email-${index}`];
        }
      });
      if (formData.email.length === 5) {
        delete newErrors.email;
      }
    }
    if (!formData.postCode) {
      newErrors.postCode = "Postcode is required";
    }
    if (!formData.country) {
      newErrors.country = "Country is required";
    }
    if (!formData.graceTime) {
      newErrors.graceTime = "Grace Time is required";
    } else if (!/^[1-9]\d*$/.test(formData.graceTime)) {
      newErrors.graceTime = "Grace Time must be a positive Number";
    }
    if (!formData.breakTime) {
      newErrors.breakTime = "Break Time is required";
    } else if (!/^[1-9]\d*$/.test(formData.breakTime)) {
      newErrors.breakTime = "Break Time must be a positive Number";
    }
    const latLongRegex = /^-?\d{2}\.\d{5,}$/;
    if (!formData.latitude || !latLongRegex.test(formData.latitude)) {
      newErrors.latitude = "Latitude must be in format XX.XXXXX";
    }
    if (!formData.longitude || !latLongRegex.test(formData.longitude)) {
      newErrors.longitude = "Longitude must be in format XX.XXXXX";
    }
    if (!formData.radius) {
      newErrors.radius = "Radius is required";
    } else if (!/^[1-9]\d*$/.test(formData.radius)) {
      newErrors.radius = "Radius must be a positive number in meters";
    }
    if (isOn && !formData.reportFrequency) {
      newErrors.reportFrequency = "Frequency is required";
    }
    if (isOn && formData.reportFrequency && !formData.reportTime) {
      newErrors.reportTime = "Hour is required";
    }
    if (isOn && formData.reportFrequency === "Weekly" && !formData.weekday) {
      newErrors.weekday = "Week Day is required";
    }
    if (isOn && formData.reportFrequency === "Monthly" && !formData.monthDate) {
      newErrors.monthDate = "Month Date is required";
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
          // console.log("id", id);
          response = await PostCall(`/updateClient/${id}`, formData);
        } else {
          response = await PostCall(
            `/addClient?companyId=${companyId}`,
            formData
          );
          // console.log("formdata", formData);
        }
        if (response?.data?.status === 200) {
          showToast(response?.data?.message, "success");
          const redirectCompanyid = id
            ? formData.companyId || companyId
            : companyId;
          navigate(`/clients/?companyId=${redirectCompanyid}`);
        } else {
          showToast(response?.data?.message, "error");
        }
        setLoading(false);
      } catch (error) {
        console.log("error", error);
      }
    }
  };

  const handleChange = (e, index) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (name.startsWith("email")) {
        const updatedEmails = [...prev.email];
        updatedEmails[index] = value;
        return { ...prev, email: updatedEmails };
      } else {
        return { ...prev, [name]: value };
      }
    });
  };

  const handleAddEmail = () => {
    const EMAIL_REGEX = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    let newErrors = { ...errors };
    let emailSet = new Set();
    let hasError = false;

    formData.email.forEach((email, index) => {
      if (!email) {
        newErrors[`email-${index}`] = `Email is required`;
        hasError = true;
      } else if (!EMAIL_REGEX.test(email)) {
        newErrors[`email-${index}`] = `Invalid email format`;
        hasError = true;
      } else if (emailSet.has(email)) {
        newErrors[`email-${index}`] = `Duplicate email not allowed`;
        hasError = true;
      } else {
        emailSet.add(email);
        delete newErrors[`email-${index}`];
      }
    });

    setErrors(newErrors);

    if (hasError) {
      return;
    }

    setFormData((prev) => {
      if (prev.email.length >= 5) return prev;
      return {
        ...prev,
        email: [...prev.email, ""],
      };
    });
  };

  const handleRemoveEmail = (index) => {
    setFormData((prev) => {
      if (prev.email.length === 1) return prev;
      return { ...prev, email: prev.email.filter((_, i) => i !== index) };
    });
  };

  useEffect(() => {
    setIsOn(formData.isAutoGenerateReport);
  }, [formData.isAutoGenerateReport]);

  useEffect(() => {
    const GetClientDetails = async () => {
      try {
        setLoading(true);
        const response = await GetCall(`/getClient/${id}`);
        if (response?.data?.status === 200) {
          setFormData(response?.data?.client);
          setIsOn(response?.data?.client?.isAutoGenerateReport);
        } else {
          showToast(response?.data?.message, "error");
        }
        setLoading(false);
        // console.log("response", response);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    if (id) {
      GetClientDetails(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return <Loader />;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="Addclient-container">
        <div className="Addclient-step-content">
          <div className="addclient-flex">
            <div className="addclient-section">
              <div className="addclient-input-container">
                <label className="label">Client Name*</label>
                <input
                  name="clientName"
                  className="addclient-input"
                  placeholder="Enter Client Name"
                  value={formData?.clientName}
                  onChange={handleChange}
                />
                {errors?.clientName && (
                  <p className="error-text">{errors?.clientName}</p>
                )}
              </div>
              <div className="addclient-input-container">
                <label className="label">Contact Number*</label>
                <input
                  type="text"
                  name="contactNumber"
                  value={formData?.contactNumber}
                  onChange={handleChange}
                  placeholder="Enter contact Number"
                  className="addclient-input"
                />
                {errors?.contactNumber && (
                  <p className="error-text">{errors?.contactNumber}</p>
                )}
              </div>
              <div className="addclient-input-container">
                <label className="label">Email*</label>
                {formData?.email?.map((email, index) => (
                  <div className="input-wrapper" key={index}>
                    <input
                      type="email"
                      name={`email-${index}`}
                      className="addclient-input"
                      value={email}
                      onChange={(e) => handleChange(e, index)}
                      placeholder="Enter email"
                    />
                    <div
                      className="email-action-addclient"
                      // style={{
                      //   right: formData.email.length > 1 ? "15px" : "15px",
                      //   gap: formData.email.length > 1 ? "5px" : "0px",
                      // }}
                    >
                      {formData?.email?.length > 1 && (
                        <MdRemove
                          className="remove-email-icon"
                          onClick={() => handleRemoveEmail(index)}
                        />
                      )}
                      {index === formData?.email?.length - 1 &&
                        formData?.email?.length < 5 && (
                          <IoMdAdd
                            className={`add-email-icon ${
                              formData?.email?.length < 5 ? "disabled" : ""
                            }`}
                            onClick={handleAddEmail}
                            // style={{
                            //   cursor:
                            //     formData.email.length < 5
                            //       ? "not-allowed"
                            //       : "pointer",
                            // }}
                          />
                        )}
                    </div>
                  </div>
                ))}
                {Object.keys(errors).find((key) => key.startsWith("email")) && (
                  <p className="error-text">
                    {
                      errors[
                        Object.keys(errors).find((key) =>
                          key.startsWith("email")
                        )
                      ]
                    }
                  </p>
                )}
              </div>
            </div>

            <div className="addclient-section">
              <div className="addclient-input-container">
                <label className="label">Address*</label>
                <input
                  type="text"
                  name="address"
                  className="addclient-input"
                  value={formData?.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                />
                {errors?.address && (
                  <p className="error-text">{errors?.address}</p>
                )}
              </div>
              <div className="addclient-input-container">
                <label className="label">Address Line 2</label>
                <input
                  type="text"
                  name="addressLine2"
                  value={formData?.addressLine2}
                  className="addclient-input"
                  onChange={handleChange}
                  placeholder="Enter Address Line 2"
                />
              </div>
              <div className="addclient-input-container">
                <label className="label">City*</label>
                <input
                  type="text"
                  name="city"
                  value={formData?.city}
                  className="addclient-input"
                  onChange={handleChange}
                  placeholder="Enter city"
                />
                {errors?.city && <p className="error-text">{errors?.city}</p>}
              </div>
            </div>

            <div className="addclient-section">
              <div className="addclient-input-container">
                <label className="label">Country*</label>
                {/* <select
                  data-testid="country-select"
                  className="addclient-input checkbox-country"
                  name="country"
                  value={formData?.country}
                  onChange={handleChange}
                >
                  <option value="" disabled>
                    Select Country Of Issue
                  </option>
                  {countryNames.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select> */}
                <Select
                  data-testid="country-select"
                  className="addclient-input checkbox-country"
                  name="country"
                  value={formData?.country}
                  onChange={handleChange}
                  displayEmpty
                  MenuProps={{
                    disableAutoFocusItem: true,
                    PaperProps: {
                      style: {
                        maxWidth: 100,
                        maxHeight: 200,
                        overflowX: "auto",
                        scrollbarWidth: "thin",
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
                    Select Country Of Issue
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
                    <MenuItem disabled className="menu-item">
                      No countries found
                    </MenuItem>
                  )}
                </Select>
                {errors?.country && (
                  <p className="error-text">{errors?.country}</p>
                )}
              </div>

              <div className="addclient-input-container">
                <label className="label">Post Code*</label>
                <input
                  type="text"
                  name="postCode"
                  className="addclient-input"
                  value={formData?.postCode}
                  onChange={handleChange}
                  placeholder="Enter post code"
                />
                {errors?.postCode && (
                  <p className="error-text">{errors?.postCode}</p>
                )}
              </div>
            </div>

            <div className="addclient-section">
              <div className="addclient-input-container">
                <label className="label">Grace Time (Minutes)*</label>
                <input
                  type="number"
                  name="graceTime"
                  className="addclient-input"
                  value={formData?.graceTime}
                  onChange={handleChange}
                  placeholder="Enter grace time"
                />
                {errors?.graceTime && (
                  <p className="error-text">{errors?.graceTime}</p>
                )}
              </div>
              <div className="addclient-input-container">
                <label className="label">Break Time (Minutes)*</label>
                <input
                  type="number"
                  name="breakTime"
                  value={formData?.breakTime}
                  className="addclient-input"
                  onChange={handleChange}
                  placeholder="Enter break time"
                />
                {errors?.breakTime && (
                  <p className="error-text">{errors?.breakTime}</p>
                )}
              </div>
            </div>

            <div className="addclient-section">
              <div className="addclient-input-container">
                <label className="label">Latitude*</label>
                <input
                  type="number"
                  name="latitude"
                  className="addclient-input"
                  value={formData?.latitude}
                  onChange={handleChange}
                  placeholder="Enter latitude"
                />
                {errors?.latitude && (
                  <p className="error-text">{errors?.latitude}</p>
                )}
              </div>
              <div className="addlocation-input-container">
                <label className="label">Longitude*</label>
                <input
                  type="number"
                  name="longitude"
                  value={formData?.longitude}
                  className="addclient-input"
                  onChange={handleChange}
                  placeholder="Enter longitude"
                />
                {errors?.longitude && (
                  <p className="error-text">{errors?.longitude}</p>
                )}
              </div>
              <div className="addclient-input-container">
                <label className="label">Area Radius (Meter)*</label>
                <input
                  type="number"
                  name="radius"
                  value={formData?.radius}
                  className="addclient-input"
                  onChange={handleChange}
                  placeholder="Enter radius"
                />
                {errors?.radius && (
                  <p className="error-text">{errors?.radius}</p>
                )}
              </div>
            </div>

            <div className="addclient-section">
              <div className="addclient-input-container">
                <label className="label">Auto Generate Report</label>
                <div
                  className={`slider-container ${isOn ? "on" : "off"}`}
                  onClick={() => {
                    const newIsOn = !isOn;
                    setIsOn(newIsOn);
                    setFormData((prev) => ({
                      ...prev,
                      isAutoGenerateReport: newIsOn,
                      ...(newIsOn
                        ? {}
                        : {
                            reportFrequency: "",
                            reportTime: "",
                            weekday: "",
                            monthDate: "",
                          }),
                    }));
                  }}
                >
                  <div className="slider-circle"></div>
                  <span className="slider-label">{isOn ? "ON" : "OFF"}</span>
                </div>
              </div>
              {isOn && (
                <div className="addclient-input-container">
                  <label className="label">Select Frequency</label>
                  <Select
                    className="addclient-input checkbox-country"
                    name="reportFrequency"
                    value={formData?.reportFrequency}
                    onChange={handleChange}
                    displayEmpty
                    MenuProps={{
                      PaperProps: {
                        style: {
                          width: 150,
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxHeight: 192,
                        },
                      },
                    }}
                  >
                    <MenuItem value="" disabled className="menu-item">
                      Select Frequency
                    </MenuItem>
                    <MenuItem value="Daily" className="menu-item">
                      Daily
                    </MenuItem>
                    <MenuItem value="Weekly" className="menu-item">
                      Weekly
                    </MenuItem>
                    <MenuItem value="Monthly" className="menu-item">
                      Monthly
                    </MenuItem>
                  </Select>
                  {errors?.reportFrequency && (
                    <p className="error-text">{errors?.reportFrequency}</p>
                  )}
                </div>
              )}
              {isOn && formData?.reportFrequency !== "" && (
                <div className="addclient-input-container">
                  <label className="label">Select Hour*</label>
                  <Select
                    className="addclient-input checkbox-country"
                    name="reportTime"
                    value={formData?.reportTime}
                    onChange={handleChange}
                    displayEmpty
                    MenuProps={{
                      PaperProps: {
                        style: {
                          width: 150,
                          overflowX: "auto",
                          scrollbarWidth: "thin",
                          maxHeight: 192,
                        },
                      },
                    }}
                  >
                    <MenuItem value="" disabled className="menu-item">
                      Select Time
                    </MenuItem>
                    {HourList.map((hr, index) => (
                      <MenuItem key={index} value={hr} className="menu-item">
                        {hr}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors?.reportTime && (
                    <p className="error-text">{errors?.reportTime}</p>
                  )}
                </div>
              )}
              {isOn && formData?.reportFrequency === "Weekly" && (
                <div className="addclient-input-container">
                  <label className="label">Select Week Day*</label>
                  <Select
                    className="addclient-input checkbox-country"
                    name="weekday"
                    value={formData?.weekday}
                    onChange={handleChange}
                    displayEmpty
                    MenuProps={{
                      PaperProps: {
                        style: {
                          width: 150,
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxHeight: 192,
                        },
                      },
                    }}
                  >
                    <MenuItem value="" disabled className="menu-item">
                      Select Week Day
                    </MenuItem>
                    {WeekDayList.map((weekday, index) => (
                      <MenuItem
                        key={index}
                        value={weekday}
                        className="menu-item"
                      >
                        {weekday}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors?.weekday && (
                    <p className="error-text">{errors?.weekday}</p>
                  )}
                </div>
              )}
              {isOn && formData?.reportFrequency === "Monthly" && (
                <div className="addclient-input-container">
                  <label className="label">Select Month Date*</label>
                  <Select
                    className="addclient-input checkbox-country"
                    name="monthDate"
                    value={formData?.monthDate}
                    onChange={handleChange}
                    displayEmpty
                    MenuProps={{
                      PaperProps: {
                        style: {
                          width: 150,
                          overflowX: "auto",
                          scrollbarWidth: "thin",
                          maxHeight: 192,
                        },
                      },
                    }}
                  >
                    <MenuItem value="" disabled className="menu-item">
                      Select Month Date
                    </MenuItem>
                    {MonthDateList.map((monthDate, index) => (
                      <MenuItem
                        key={index}
                        value={monthDate}
                        className="menu-item"
                      >
                        {monthDate}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors?.monthDate && (
                    <p className="error-text">{errors?.monthDate}</p>
                  )}
                </div>
              )}
            </div>
            <button type="submit" className="save-button">
              {id ? "Update" : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default AddClient;
