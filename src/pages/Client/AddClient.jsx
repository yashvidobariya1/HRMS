import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import "./AddClient.css";
import { GetCall, PostCall } from "../../ApiServices";
import Loader from "../Helper/Loader";
import { showToast } from "../../main/ToastManager";
import { IoMdAdd } from "react-icons/io";
import { MdRemove } from "react-icons/md";
import countryNames from "../../Data/AllCountryList.json";

const AddClient = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const companyId = searchParams.get("companyId");
  // console.log("companyid", companyId);
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
  });

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
          navigate(`/settings/client/?companyId=${redirectCompanyid}`);
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
    const GetClientDetails = async () => {
      try {
        setLoading(true);
        const response = await GetCall(`/getClient/${id}`);
        if (response?.data?.status === 200) {
          setFormData(response?.data?.client);
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
                <select
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
                </select>
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
