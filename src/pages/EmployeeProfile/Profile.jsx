import React, { useEffect, useRef, useState } from "react";
import "./Profile.css";
// import { useSelector } from "react-redux";
import { GetCall, PostCall } from "../../ApiServices";
import { showToast } from "../../main/ToastManager";
import CommonAddButton from "../../SeparateCom/CommonAddButton";
import { IoAddOutline } from "react-icons/io5";
// import DeleteConfirmation from "../../main/DeleteConfirmation";
import CommonTable from "../../SeparateCom/CommonTable";
import Loader from "../Helper/Loader";
import { MenuItem, Select } from "@mui/material";

const Profile = () => {
  // const user = useSelector((state) => state.userInfo.userInfo.user);
  // const userRole = useSelector((state) => state.userInfo.userInfo.role);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [update, setupdate] = useState(false);
  const [file, setFile] = useState({
    documentType: "",
    files: [],
  });
  const fileInputRef = useRef(null);
  const [documentDetails, setDocumentDetails] = useState([]);
  const [oldDocument, setoldDocument] = useState([]);
  const [showDropdownAction, setShowDropdownAction] = useState(null);

  const [user, setUser] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    maritalStatus: "",
    phone: "",
    homeTelephone: "",
    email: "",
  });

  const validate = () => {
    const EMAIL_REGEX = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    let newErrors = {};
    if (!user?.firstName?.trim()) {
      newErrors.firstName = "First Name is required";
    }
    if (!user?.lastName) {
      newErrors.lastName = "Last Name is required";
    }
    if (!user.dateOfBirth) {
      newErrors.dateOfBirth = "Date of Birth is required";
    }
    if (!user.gender) {
      newErrors.gender = "Gender is required";
    }
    if (!user?.maritalStatus) {
      newErrors.maritalStatus = "Marital Status is required";
    }
    if (!user?.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d+$/.test(user?.phone)) {
      newErrors.phone = "Phone number must contain only numbers";
    } else if (!/^\d{11}$/.test(user?.phone)) {
      newErrors.phone = "Phone number must be exactly 11 digits";
    }
    const email = user?.email;
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = "Valid Email format is required";
    }
    // console.log("error", newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const GetprofileDetails = async () => {
    try {
      setLoading(true);
      const response = await GetCall("/getDetails");

      if (response?.data?.status === 200) {
        // console.log("User profile:", response?.data.user);

        const personalDetails = response?.data?.user?.personalDetails || {};
        const documents = response?.data?.user?.documentDetails || [];
        setUser(personalDetails);
        setoldDocument(documents);
        // console.log(" old documents:", documents);
        // console.log("old", oldDocument.documentName);
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleUpdateProfile = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const updatedDocumentDetails = await Promise.all(
        documentDetails?.map(async (doc) => {
          if (doc?.document instanceof File) {
            const base64Document = await convertFileToBase64(doc?.document);
            return {
              ...doc,
              document: base64Document,
            };
          }
          return doc;
        })
      );

      // console.log("oldDocument", oldDocument);

      const Userdetails = {
        ...user,
        documentDetails: [...oldDocument, ...updatedDocumentDetails],
      };

      // console.log("Userdetails", Userdetails);

      const response = await PostCall("/updateProfileDetails", Userdetails);

      if (response?.data?.status === 200) {
        showToast(response?.data?.message, "success");
        setupdate(false);
        setFile({ documentType: "", document: "", fileName: "" });
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFile({ ...file, [field]: value });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length) {
      setFile((prev) => ({
        ...prev,
        document: selectedFiles,
      }));
    }
    // console.log("file", file);
  };

  const handleAddDocument = async () => {
    let newErrors = {};

    if (!file.documentType) {
      newErrors.documentType = "Please select a document type.";
      setErrors(newErrors);
      return;
    }

    if (!file.document) {
      newErrors.document = "Please select a document.";
      setErrors(newErrors);
      return;
    }

    const isDuplicate =
      (oldDocument &&
        oldDocument.some((doc) => doc.documentType === file.documentType)) ||
      documentDetails.some((doc) => doc.documentType === file.documentType);

    if (isDuplicate) {
      newErrors.documentType = "This document already uploaded.";
      setErrors(newErrors);
      return;
    }

    if (documentDetails.length >= 1) {
      newErrors.limit = "You can upload only one document.";
      setErrors(newErrors);
      return;
    }

    // const newDocument = {
    //   documentType: file?.documentType,
    //   document: file?.document,
    //   documentName: file?.fileName,
    // };

    // setDocumentDetails((prevDocuments) => [...prevDocuments, newDocument]);

    // setFile({ documentType: "", document: "", fileName: "" });
    // if (fileInputRef.current) fileInputRef.current.value = "";

    // setErrors({});

    const newDocuments = await Promise.all(
      file.document.map(async (doc) => {
        const base64 = await convertFileToBase64(doc);
        return {
          documentName: doc.name,
          document: base64,
        };
      })
    );

    const existingIndex = documentDetails.findIndex(
      (doc) => doc.documentType === file.documentType
    );

    let updatedDocuments;

    if (existingIndex !== -1) {
      updatedDocuments = [...documentDetails];
      updatedDocuments[existingIndex].documents.push(...newDocuments);
    } else {
      updatedDocuments = [
        ...documentDetails,
        {
          documentType: file.documentType,
          documents: newDocuments,
        },
      ];
    }
    setDocumentDetails(updatedDocuments);
    setFile({ documentType: "", document: [], fileName: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";

    setErrors({});
  };
  // const allDocuments = [
  //   ...(oldDocument || []).map((doc) => ({ ...doc, isOldDocument: true })),
  //   ...(documentDetails || []).map((doc) => ({ ...doc, isOldDocument: false })),
  // ];

  // const HandleEditProfile = (id) => {
  //   const targetDocument = documentDetails[id];
  //   if (!targetDocument) return;

  //   setFile({
  //     documentType: targetDocument.documentType,
  //     document: targetDocument.document,
  //     fileName: targetDocument.documentName,
  //     isOldDocument: targetDocument.isOldDocument,
  //   });

  //   setupdate(true);
  //   setEditIndex(id);
  // };

  const HandleDeleteProfile = (id) => {
    // console.log("id", id);

    setDocumentDetails((prevDetails) => {
      // console.log("prevdetails", prevDetails);
      const targetDocument = documentDetails.find((doc, index) => index === id);
      // console.log("targetDocument", targetDocument);
      if (!targetDocument) return prevDetails;
      return prevDetails.filter(
        (doc) => doc.documentType !== targetDocument.documentType
      );
    });
  };

  const actions = [
    // {
    //   label: "Edit",
    //   onClick: (id) => HandleEditProfile(id),
    // },
    {
      label: "Delete",
      onClick: (id) => HandleDeleteProfile(id),
    },
  ];

  const handleAction = (id) => {
    setShowDropdownAction(showDropdownAction === id ? null : id);
  };

  useEffect(() => {
    GetprofileDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="profile-container-flex">
      {loading ? (
        <div className="loader-wrapper">
          <Loader />
        </div>
      ) : (
        <>
          <div className="profile-image">
            <img src="/image/profile.png" alt="user profile" />
            <div className="profile-role">
              <h1>
                {user?.firstName} {user?.lastName}
              </h1>
            </div>
          </div>
          <div className="profile-div-section">
            <div className="profile-container">
              <label className="label">First Name*</label>
              <input
                type="text"
                name="firstName"
                value={user?.firstName}
                onChange={handleChange}
                disabled={!update}
                className="profile-input"
              />
              {errors.firstName && (
                <div className="error-text">{errors.firstName}</div>
              )}
            </div>
            <div className="profile-container">
              <label className="label">Middle Name</label>
              <input
                type="text"
                name="middleName"
                value={user?.middleName}
                onChange={handleChange}
                disabled={!update}
                className="profile-input"
              />
            </div>
          </div>
          <div className="profile-div-section">
            <div className="profile-container">
              <label className="label">Last Name*</label>
              <input
                type="text"
                name="lastName"
                value={user?.lastName}
                onChange={handleChange}
                disabled={!update}
                className="profile-input"
              />
              {errors.lastName && (
                <div className="error-text">{errors.lastName}</div>
              )}
            </div>
            <div className="profile-container">
              <label className="label">Date of Birth*</label>
              <input
                type="date"
                name="dateOfBirth"
                value={user?.dateOfBirth}
                onChange={handleChange}
                disabled={!update}
                className="profile-input"
              />
              {errors.dateOfBirth && (
                <div className="error-text">{errors.dateOfBirth}</div>
              )}
            </div>
          </div>
          <div className="profile-div-section">
            <div className="profile-container">
              <label className="label">Gender*</label>
              {/* <select
                name="gender"
                value={user?.gender || ""}
                onChange={handleChange}
                disabled={!update}
                className="profile-input"
              >
                <option value="" disabled>
                  Select Marital Status
                </option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select> */}
              <Select
                name="gender"
                value={user?.gender || ""}
                onChange={handleChange}
                disabled={!update}
                className="profile-input-dropdown"
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
                  Select Marital Status
                </MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
              {errors.gender && (
                <div className="error-text">{errors.gender}</div>
              )}
            </div>
            <div className="profile-container">
              <label className="label">Marital Status*</label>
              {/* <select
                name="maritalStatus"
                value={user?.maritalStatus || ""}
                onChange={handleChange}
                disabled={!update}
                className="profile-input"
              >
                <option value="" disabled>
                  Select Marital Status
                </option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select> */}
              <Select
                name="maritalStatus"
                value={user?.maritalStatus || ""}
                onChange={handleChange}
                disabled={!update}
                className="profile-input-dropdown"
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
                  Select Marital Status
                </MenuItem>
                <MenuItem value="Single">Single</MenuItem>
                <MenuItem value="Married">Married</MenuItem>
                <MenuItem value="Divorced">Divorced</MenuItem>
                <MenuItem value="Widowed">Widowed</MenuItem>
              </Select>
              {errors.maritalStatus && (
                <div className="error-text">{errors.maritalStatus}</div>
              )}
            </div>
          </div>
          <div className="profile-div-section">
            <div className="profile-container">
              <label className="label">Phone*</label>
              <input
                type="number"
                name="phone"
                value={user?.phone}
                onChange={handleChange}
                disabled={!update}
                className="profile-input"
              />
              {errors.phone && <div className="error-text">{errors.phone}</div>}
            </div>
            <div className="profile-container">
              <label className="label">Home Telephone</label>
              <input
                type="text"
                name="homeTelephone"
                value={user?.homeTelephone}
                onChange={handleChange}
                disabled={!update}
                className="profile-input"
              />
            </div>
          </div>

          <div className="profile-div-section">
            <div className="profile-container">
              <label className="label">Email*</label>
              <input
                type="text"
                name="email"
                value={user?.email}
                onChange={handleChange}
                disabled={!update}
                className="profile-input"
              />
              {errors.email && <div className="error-text">{errors.email}</div>}
            </div>
          </div>
          <div className="profile-div-section">
            {oldDocument?.length > 0 && (
              <div className="profile-document">
                <h2>Uploaded Document Details</h2>
                <CommonTable
                  headers={["Document Type", "Document Name"]}
                  data={oldDocument?.map((doc, id) => ({
                    _id: id,
                    name: doc.documentType,
                    document: doc.documentName,
                  }))}
                  actions={{
                    actionsList: actions,
                  }}
                  isPagination="false"
                  handleAction={handleAction}
                  isSearchQuery={false}
                />
              </div>
            )}
          </div>
          <div className="profile-div-section">
            <div className="profile-document-flex">
              {/* <h1>Document Details</h1> */}
              <div className="profile-document-section">
                <div className="profile-input-container">
                  <label className="label">Document Type</label>
                  {/* <select
                    name="documentType"
                    className="profile-input"
                    data-testid="documentType-select"
                    value={file?.documentType}
                    disabled={!update}
                    onChange={(e) =>
                      handleInputChange("documentType", e?.target?.value)
                    }
                  >
                    <option value="">Select Document Type</option>
                    <option value="ID Proof">ID Proof</option>
                    <option value="Immigration">Immigration</option>
                    <option value="Address Proof">Address Proof</option>
                    <option value="Passport">Passport</option>
                  </select> */}
                  <Select
                    name="documentType"
                    className="profile-input-dropdown"
                    data-testid="documentType-select"
                    value={file?.documentType}
                    displayEmpty
                    disabled={!update}
                    onChange={(e) =>
                      handleInputChange("documentType", e?.target?.value)
                    }
                    MenuProps={{
                      PaperProps: {
                        style: {
                          width: 200, // same as Select
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxHeight: 192,
                        },
                      },
                    }}
                  >
                    <MenuItem value="" disabled>
                      Select Document Type
                    </MenuItem>
                    <MenuItem value="ID Proof">ID Proof</MenuItem>
                    <MenuItem value="Immigration">Immigration</MenuItem>
                    <MenuItem value="Address Proof">Address Proof</MenuItem>
                    <MenuItem value="Passport">Passport</MenuItem>
                  </Select>
                  {errors?.documentType && (
                    <p className="error-text">{errors?.documentType}</p>
                  )}
                  {errors?.limit && (
                    <p className="error-text">{errors.limit}</p>
                  )}
                </div>
                <div className="profile-input-container">
                  <label className="label">Document</label>
                  <div className="profile-file-contract">
                    <label
                      htmlFor="file-upload"
                      className="profile-custom-file-upload"
                    >
                      Choose File
                    </label>
                    <input
                      type="file"
                      id="file-upload"
                      name="document"
                      data-testid="Document-select"
                      onChange={handleFileChange}
                      disabled={!update}
                      style={{ display: "none" }}
                      ref={fileInputRef}
                      multiple
                    />
                    {file?.document?.length > 0 && (
                      <div className="profile-fileupload-name">
                        {file?.document?.map((file, index) => (
                          <p key={index}>{file.name}</p>
                        ))}
                      </div>
                    )}
                  </div>
                  {errors?.document && (
                    <p className="error-text">{errors?.document}</p>
                  )}
                </div>
                <div className="profile-input-container profile-addDocument-flex">
                  <button
                    onClick={handleAddDocument}
                    className="profile-add-input profile-flex"
                    disabled={!update}
                  >
                    <IoAddOutline />
                  </button>
                </div>
              </div>
              {documentDetails?.length > 0 && (
                <div className="profile-document">
                  <h2>Upload Document Details</h2>
                  <CommonTable
                    headers={["Document Type", "Document Name", "Action"]}
                    data={documentDetails?.map((document, id) => ({
                      _id: id,
                      name: document.documentType,
                      document: document.documents.map(
                        (doc) => doc.documentName
                      ),
                      // isOldDocument: document.isOldDocument,
                    }))}
                    actions={{
                      actionsList: actions,
                    }}
                    isPagination="false"
                    handleAction={handleAction}
                    isSearchQuery={false}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="profile-actions">
            {!update ? (
              <CommonAddButton label="Edit" onClick={() => setupdate(true)} />
            ) : (
              <CommonAddButton label="Save" onClick={handleUpdateProfile} />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;
