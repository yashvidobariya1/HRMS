import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import "./AddLocation.css";
import useApiServices from "../../useApiServices";
import Loader from "../Helper/Loader";
import { showToast } from "../../main/ToastManager";
import countryNames from "../../Data/AllCountryList.json";
import { ListSubheader, MenuItem, Select, TextField } from "@mui/material";

const AddLocation = () => {
  const { GetCall, PostCall } = useApiServices();
  const navigate = useNavigate();
  const [companyList, setCompanyList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [countrysearchTerm, setcountrysearchTerm] = useState("");
  const [formData, setFormData] = useState({
    companyName: "",
    companyId: "",
    payeReferenceNumber: "",
    locationName: "",
    address: "",
    addressLine2: "",
    city: "",
    postcode: "",
    country: "",
    ukviApproved: false,
    graceTime: "",
    breakTime: "",
    longitude: "",
    latitude: "",
    radius: "",
  });

  const filtercompanyList = useMemo(() => {
    return companyList.filter((loc) =>
      loc?.companyDetails?.businessName
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, companyList]);

  const filteredCountryList = useMemo(() => {
    return countryNames.filter((user) =>
      user.toLowerCase().includes(countrysearchTerm.toLowerCase())
    );
  }, [countrysearchTerm, countryNames]);

  const validate = () => {
    let newErrors = {};
    if (!formData.companyId) {
      newErrors.companyId = "Company name is required";
    }
    if (!formData.address) {
      newErrors.address = "Address is required";
    }
    if (!formData.city) {
      newErrors.city = "City is required";
    }
    if (!formData.locationName) {
      newErrors.locationName = "Location Name is required";
    }
    if (!formData.postcode) {
      newErrors.postcode = "Postcode is required";
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
          response = await PostCall(`/updateLocation/${id}`, formData);
        } else {
          response = await PostCall("/addLocation", formData);
        }
        if (response?.data?.status === 200) {
          showToast(response?.data?.message, "success");
          navigate("/location");
        } else {
          showToast(response?.data?.message, "error");
        }
        setLoading(false);
      } catch (error) {
        console.log("error", error);
      }
    }
  };

  // const handleChange = (e) => {
  //   const { name, type, value, checked } = e.target;
  //   const newValue = type === "checkbox" ? checked : value;
  //   console.log(value);
  //   setFormData((prevState) => ({
  //     ...prevState,
  //     [name]: newValue,
  //   }));
  // };

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    if (name === "companyName") {
      const selectedCompany = companyList.find(
        (company) => company._id === value
      );
      setFormData((prevState) => ({
        ...prevState,
        companyName: selectedCompany?.companyDetails?.businessName || "",
        companyId: value,
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: newValue,
      }));
    }
  };

  useEffect(() => {
    const GetLocationDetails = async () => {
      try {
        setLoading(true);
        const response = await GetCall(`/getLocation/${id}`);
        if (response?.data?.status === 200) {
          setFormData(response?.data?.location);
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
      GetLocationDetails(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const GetAllCompanies = async () => {
      try {
        setLoading(true);
        const response = await GetCall(`/getAllCompany`);
        if (response?.data?.status === 200) {
          setCompanyList(response?.data?.companies);
        } else {
          showToast(response?.data?.message, "error");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    GetAllCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="Addlocation-container">
        <div className="Addlocation-step-content">
          <div className="addlocation-flex">
            <div className="addlocation-section">
              <div className="addlocation-input-container">
                <label className="label">Company Name*</label>
                {/* <select
                  name="companyName"
                  data-testid="company-select"
                  className="addlocation-input"
                  value={formData?.companyId}
                  onChange={handleChange}
                >
                  <option value="" disabled>
                    Select Company*
                  </option>
                  {companyList?.map((company) => {
                    return (
                      <option value={company?._id} key={company?._id}>
                        {company?.companyDetails?.businessName}
                      </option>
                    );
                  })}
                </select> */}
                <Select
                  id="company-select"
                  name="companyName"
                  data-testid="company-select-dropdown"
                  className="checkbox-country"
                  value={formData?.companyId || ""}
                  onChange={handleChange}
                  displayEmpty
                  MenuProps={{
                    disableAutoFocusItem: true,
                    PaperProps: {
                      style: {
                        width: 200,
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
                    if (!selected) return "Select Company";
                    const found = companyList.find(
                      (loc) => loc._id === selected
                    );
                    return found?.companyDetails?.businessName || "Not Found";
                  }}
                >
                  <ListSubheader>
                    <TextField
                      size="small"
                      placeholder="Search Company"
                      fullWidth
                      className="search-textfield"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </ListSubheader>
                  <MenuItem value="" disabled className="menu-item">
                    Select Company
                  </MenuItem>
                  {filtercompanyList.length > 0 ? (
                    filtercompanyList?.map((company) => (
                      <MenuItem
                        key={company?._id}
                        value={company?._id}
                        className="menu-item"
                      >
                        {company?.companyDetails?.businessName}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled className="menu-item">
                      No Company found
                    </MenuItem>
                  )}
                </Select>
                {errors?.companyId && (
                  <p className="error-text">{errors?.companyId}</p>
                )}
              </div>
              <div className="addlocation-input-container">
                <label className="label">PAYE Reference Number</label>
                <input
                  type="text"
                  name="payeReferenceNumber"
                  value={formData?.payeReferenceNumber}
                  onChange={handleChange}
                  placeholder="Enter PAYE reference number"
                  className="addlocation-input"
                />
              </div>
              <div className="addlocation-input-container">
                <label className="label">Location Name*</label>
                <input
                  type="text"
                  name="locationName"
                  className="addlocation-input"
                  value={formData?.locationName}
                  onChange={handleChange}
                  placeholder="Enter location name"
                />
                {errors?.locationName && (
                  <p className="error-text">{errors?.locationName}</p>
                )}
              </div>
            </div>

            <div className="addlocation-section">
              <div className="addlocation-input-container">
                <label className="label">Address*</label>
                <input
                  type="text"
                  name="address"
                  className="addlocation-input"
                  value={formData?.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                />
                {errors?.address && (
                  <p className="error-text">{errors?.address}</p>
                )}
              </div>
              <div className="addlocation-input-container">
                <label className="label">Address Line 2</label>
                <input
                  type="text"
                  name="addressLine2"
                  value={formData?.addressLine2}
                  className="addlocation-input"
                  onChange={handleChange}
                  placeholder="Enter Address Line 2"
                />
              </div>
              <div className="addlocation-input-container">
                <label className="label">City*</label>
                <input
                  type="text"
                  name="city"
                  value={formData?.city}
                  className="addlocation-input"
                  onChange={handleChange}
                  placeholder="Enter city"
                />
                {errors?.city && <p className="error-text">{errors?.city}</p>}
              </div>
            </div>

            <div className="addlocation-section">
              <div className="addlocation-input-container">
                <label className="label">Post Code*</label>
                <input
                  type="text"
                  name="postcode"
                  className="addlocation-input"
                  value={formData?.postcode}
                  onChange={handleChange}
                  placeholder="Enter post code"
                />
                {errors?.postcode && (
                  <p className="error-text">{errors?.postcode}</p>
                )}
              </div>

              <div className="addlocation-input-container">
                <label className="label">Country*</label>
                <Select
                  className="addlocation-input checkbox-country"
                  name="country"
                  value={formData?.country}
                  onChange={handleChange}
                  displayEmpty
                  MenuProps={{
                    disableAutoFocusItem: true,
                    PaperProps: {
                      style: {
                        width: 200,
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
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
                      value={countrysearchTerm}
                      onChange={(e) => setcountrysearchTerm(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </ListSubheader>
                  <MenuItem value="" disabled className="menu-item">
                    Select country
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
            </div>

            <div className="addlocation-section">
              <div className="addlocation-input-container">
                <label className="label">Grace Time (Minutes)*</label>
                <input
                  type="number"
                  name="graceTime"
                  className="addlocation-input"
                  value={formData?.graceTime}
                  onChange={handleChange}
                  placeholder="Enter grace time"
                />
                {errors?.graceTime && (
                  <p className="error-text">{errors?.graceTime}</p>
                )}
              </div>
              <div className="addlocation-input-container">
                <label className="label">Break Time (Minutes)*</label>
                <input
                  type="number"
                  name="breakTime"
                  value={formData?.breakTime}
                  className="addlocation-input"
                  onChange={handleChange}
                  placeholder="Enter break time"
                />
                {errors?.breakTime && (
                  <p className="error-text">{errors?.breakTime}</p>
                )}
              </div>
            </div>

            <div className="addlocation-section">
              <div className="addlocation-input-container">
                <label className="label">Latitude*</label>
                <input
                  type="number"
                  name="latitude"
                  className="addlocation-input"
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
                  className="addlocation-input"
                  onChange={handleChange}
                  placeholder="Enter longitude"
                />
                {errors?.longitude && (
                  <p className="error-text">{errors?.longitude}</p>
                )}
              </div>
              <div className="addlocation-input-container">
                <label className="label">Area Radius (Meter)*</label>
                <input
                  type="text"
                  name="radius"
                  value={formData?.radius}
                  className="addlocation-input"
                  onChange={handleChange}
                  placeholder="Enter radius"
                />
                {errors?.radius && (
                  <p className="error-text">{errors?.radius}</p>
                )}
              </div>
            </div>

            <div className="location-approval-link">
              <input
                type="checkbox"
                name="ukviApproved"
                checked={formData?.ukviApproved}
                onChange={handleChange}
              />
              <label className="ukvi-label">UKVI approved?</label>
            </div>
            <div className="addlocation-note">
              <p>
                Ensure that the branch location is approved by the Home Office.
                If uncertain, please verify with the original license
                application, if any sponsored migrant employee is assigned to a
                branch not approved by Home office
              </p>
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

export default AddLocation;
