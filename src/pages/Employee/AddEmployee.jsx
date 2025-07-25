import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { IoAddOutline } from "react-icons/io5";
import "./AddEmployee.css";
import useApiServices from "../../useApiServices";
import Loader from "../Helper/Loader";
import { showToast } from "../../main/ToastManager";
import { FaCheck } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import DeleteConfirmation from "../../main/DeleteConfirmation";
import CommonTable from "../../SeparateCom/CommonTable";
import countryNames from "../../Data/AllCountryList.json";
import VisaCategory from "../../Data/VisaCategory.json";
import { setEmployeeformFilled } from "../../store/EmployeeFormSlice";
import { MdCancel } from "react-icons/md";
import {
  Checkbox,
  ListSubheader,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import moment from "moment";

const AddEmployee = () => {
  const { GetCall, PostCall } = useApiServices();
  const navigate = useNavigate();
  const user = useSelector((state) => state.userInfo.userInfo);
  const [ShowdropwornAction, SetShowdropwornAction] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [jobId, setJobId] = useState("");
  const [jobName, setJobName] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [locations, setLocations] = useState([]);
  const [assignee, setAssignee] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [filteredAssignees, setFilteredAssignees] = useState([]);
  const [clients, setClients] = useState([]);
  // const [templates, setTemplates] = useState([]);
  const [documentDetails, setDocumentDetails] = useState([]);
  const [jobList, setJobList] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const fileInputRef = useRef(null);
  const { id } = useParams();
  const dispatch = useDispatch();
  // const location = useLocation();
  // const queryParams = new URLSearchParams(location.search);
  // const [companyId, setCompanyId] = useState(useSelector((state) => state.companySelect.companySelect));
  const companyId = useSelector((state) => state.companySelect.companySelect);
  const [isSaveForm, setIsSaveForm] = useState(false);
  const [isWorkFromOffice, setisWorkFromOffice] = useState(false);
  const userRole = useSelector((state) => state.userInfo.userInfo.role);
  const [file, setFile] = useState({
    documentType: "",
    files: [],
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  // const [sickLeaveType, setSickLeaveType] = useState("Day");
  // const [allowLeaveType, setallowLeaveType] = useState("Day");
  const [jobTitlesList, setjobTitlesList] = useState([]);
  const [jobtitlesearchTerm, setjobtitlesearchTerm] = useState("");
  const [locationsearchTerm, setlocationsearchTerm] = useState("");
  const [assignclientsearchTerm, setassignclientsearchTerm] = useState("");
  const [countrySearchTerm, setcountrySearchTerm] = useState("");
  const [nationalitysearchTerm, setnationalitysearchTerm] = useState("");
  const [visasearchTerm, setvisasearchTerm] = useState("");
  const [assignmaangersearchTerm, setassignmaangersearchTerm] = useState("");
  const [otherFormsave, setotherFormsave] = useState(false);
  const employeeFormFilled = useSelector(
    (state) => state.employeeformFilled.employeeformFilled
  );
  const AllowDate = moment().add(1, "day").format("YYYY-MM-DD");
  const [formData, setFormData] = useState({
    personalDetails: {
      firstName: "",
      middleName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "",
      maritalStatus: "",
      phone: "",
      homeTelephone: "",
      email: "",
      niNumber: "",
      // sendRegistrationLink: false,
    },
    addressDetails: {
      address: "",
      addressLine2: "",
      city: "",
      postCode: "",
    },
    kinDetails: {
      kinName: "",
      relationshipToYou: "",
      address: "",
      postCode: "",
      emergencyContactNumber: "",
      email: "",
    },
    financialDetails: {
      bankName: "",
      holderName: "",
      sortCode: "", //set validation
      accountNumber: "", //set validation
      payrollFrequency: "",
      pension: "optout",
    },
    jobDetails: [],
    immigrationDetails: {
      passportNumber: "",
      countryOfIssue: "",
      passportExpiry: "",
      nationality: "",
      visaCategory: "",
      visaValidFrom: "",
      visaValidTo: "",
      brpNumber: "",
      cosNumber: "",
      restriction: "",
      shareCode: "",
      rightToWorkCheckDate: "",
      rightToWorkEndDate: "",
    },
    contractDetails: {
      contractType: "",
      contractDocument: "",
    },
    companyId,
  });

  const [jobForm, setJobForm] = useState({
    jobTitle: "",
    jobDescription: "",
    annualSalary: "",
    hourlyRate: 0,
    weeklyWorkingHours: 0,
    weeklyWorkingHoursPattern: "",
    weeklySalary: 0,
    joiningDate: "",
    socCode: "", //set validation
    modeOfTransfer: "",
    sickLeavesAllow: { leaveType: "Day", allowedLeavesCounts: 0 },
    leavesAllow: { leaveType: "Day", allowedLeavesCounts: 0 },
    location: [],
    assignManager: "",
    assignClient: [],
    // templateId: "",
    role: "",
    isWorkFromOffice: isWorkFromOffice,
  });

  const filteredJobtitleList = useMemo(() => {
    return jobTitlesList?.filter((user) =>
      user?.name?.toLowerCase().includes(jobtitlesearchTerm.toLowerCase())
    );
  }, [jobtitlesearchTerm, jobTitlesList]);

  const filteredLocationsList = useMemo(() => {
    return locations?.filter((user) =>
      user?.locationName
        ?.toLowerCase()
        .includes(locationsearchTerm.toLowerCase())
    );
  }, [locationsearchTerm, locations]);

  const filteredassignClientList = useMemo(() => {
    return clients?.filter((user) =>
      user?.name?.toLowerCase().includes(assignclientsearchTerm.toLowerCase())
    );
  }, [assignclientsearchTerm, clients]);

  const filteredCountryList = useMemo(() => {
    return countryNames?.filter((user) =>
      user.toLowerCase().includes(countrySearchTerm.toLowerCase())
    );
  }, [countrySearchTerm, countryNames]);

  const filterednationalityList = useMemo(() => {
    return countryNames?.filter((user) =>
      user.toLowerCase().includes(nationalitysearchTerm.toLowerCase())
    );
  }, [nationalitysearchTerm, countryNames]);

  const filteredvisaList = useMemo(() => {
    return VisaCategory?.filter((user) =>
      user.toLowerCase().includes(visasearchTerm.toLowerCase())
    );
  }, [VisaCategory, visasearchTerm]);

  // const filteredAssigneesManager = useMemo(() => {
  //   return assignee.filter((user) =>
  //     user.name?.toLowerCase().includes(assignmaangersearchTerm.toLowerCase())
  //   );
  // }, [filteredAssignees, assignmaangersearchTerm]);

  const steps = [
    "Personal Details",
    "Job Details",
    "Address Details",
    "Kin Details",
    "Financial Details",
    "Immigration Details",
    "Document Details",
    "Contract Details",
  ];

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // const nextStep = async () => {
  //   const updatedDocumentDetails = await Promise.all(
  //     documentDetails?.map(async (doc) => {
  //       if (doc?.document instanceof File) {
  //         const base64Document = await convertFileToBase64(doc?.document);
  //         return {
  //           ...doc,
  //           document: base64Document,
  //         };
  //       }
  //       return doc;
  //     })
  //   );

  //   const isValid = validate();
  //   if (isValid) {
  //     const data = {
  //       ...formData,
  //       documentDetails: updatedDocumentDetails,
  //     };
  //     console.log("Data submitted:", data);

  //     if (currentStep === steps.length - 1) {
  //       try {
  //         setLoading(true);
  //         // console.log("data", data);
  //         let response;
  //         if (id) {
  //           response = await PostCall(`/updateUser/${id}`, data);
  //         } else {
  //           response = await PostCall("/addUser", data);
  //         }
  //         if (response?.data?.status === 200) {
  //           showToast(response?.data?.message, "success");
  //           navigate("/employees");
  //         } else {
  //           showToast(response?.data?.message, "error");
  //         }
  //         setLoading(false);
  //       } catch (error) {
  //         setLoading(false);
  //         showToast(error, "error");
  //       }
  //     } else {
  //       setCompletedSteps((prev) => {
  //         if (!prev.includes(currentStep)) {
  //           return [...prev, currentStep];
  //         }
  //         return prev;
  //       });
  //     }

  //     setCurrentStep(currentStep + 1);
  //   }
  // };

  const validateTwoStep = (stepName) => {
    let newErrors = {};
    const EMAIL_REGEX = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
    const NI_REGEX = /^[A-Z]{2} \d{2} \d{2} \d{2} [A-D]$/;

    switch (stepName) {
      case "Personal Details":
        newErrors.personalDetails = {};
        if (!formData?.personalDetails?.firstName?.trim()) {
          newErrors.personalDetails.firstName = "First Name is required";
        }
        if (!formData?.personalDetails?.lastName) {
          newErrors.personalDetails.lastName = "Last Name is required";
        }
        if (!formData.personalDetails?.dateOfBirth) {
          newErrors.personalDetails.dateOfBirth = "Date of Birth is required";
        }
        if (!formData.personalDetails?.gender) {
          newErrors.personalDetails.gender = "Gender is required";
        }
        if (!formData.personalDetails?.maritalStatus) {
          newErrors.personalDetails.maritalStatus =
            "Marital Status is required";
        }
        if (!formData?.personalDetails?.phone) {
          newErrors.personalDetails.phone = "Phone number is required";
        } else if (!/^\d+$/.test(formData?.personalDetails.phone)) {
          newErrors.personalDetails.phone =
            "Phone number must contain only numbers";
        } else if (!/^\d{11}$/.test(formData?.personalDetails.phone)) {
          newErrors.personalDetails.phone =
            "Phone number must be exactly 11 digits";
        }
        const phone = formData?.personalDetails?.homeTelephone;
        if (phone) {
          if (!/^\d+$/.test(phone)) {
            newErrors.personalDetails.homeTelephone =
              "Home telephone must contain only digits";
          } else if (phone.length !== 11) {
            newErrors.personalDetails.homeTelephone =
              "Home telephone must be exactly 11 digits";
          }
        }
        const email = formData?.personalDetails?.email;
        if (!email) {
          newErrors.personalDetails.email = "Email is required";
        } else if (!EMAIL_REGEX.test(email)) {
          newErrors.personalDetails.email = "Valid Email format is required";
        }
        const niNumber = formData?.personalDetails?.niNumber?.trim();
        if (niNumber && !NI_REGEX.test(niNumber)) {
          newErrors.personalDetails.niNumber =
            "Invalid NI Number format. Use format: QQ 88 77 77 A";
        }
        break;

      // case "Address Details":
      //   if (!formData?.jobList || formData.jobList.length === 0) {
      //     newErrors.jobList = "At least one job must be added";
      //   }
      //   break;

      default:
        break;
    }
    for (const section in newErrors) {
      if (Object.keys(newErrors[section]).length === 0) {
        delete newErrors[section];
      }
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors((prevErrors) => ({ ...prevErrors, ...newErrors }));
      return false;
    }
    return true;
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveClick = async () => {
    const step0Valid = validateTwoStep("Personal Details");
    const step1Valid = jobList.length > 0;
    if (!step0Valid || !step1Valid) {
      showToast(
        "Please fill out Step 1 and Step 2 before submitting.",
        "error"
      );
      return;
    }
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
    if (user.id !== id && otherFormsave) {
      const valid = validate();
      if (valid) {
        const data = {
          ...formData,
          documentDetails: updatedDocumentDetails,
          ...(isSaveForm && { isFormFilled: false }),
        };
        setLoading(true);
        try {
          const response = id
            ? await PostCall(`/updateUser/${id}`, data)
            : await PostCall("/addUser", data);

          if (response?.data?.status === 200) {
            showToast(response?.data?.message, "success");
            navigate("/employees");
          } else {
            showToast(response?.data?.message, "error");
          }
        } catch (error) {
          showToast(error, "error");
        } finally {
          setLoading(false);
        }
      }
    } else {
      const data = {
        ...formData,
        documentDetails: updatedDocumentDetails,
        ...(isSaveForm && { isFormFilled: false }),
      };
      setLoading(true);
      try {
        const response = id
          ? await PostCall(`/updateUser/${id}`, data)
          : await PostCall("/addUser", data);

        if (response?.data?.status === 200) {
          showToast(response?.data?.message, "success");
          navigate("/employees");
        } else {
          showToast(response?.data?.message, "error");
        }
      } catch (error) {
        showToast(error, "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const nextStep = async () => {
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
    const isValid = validate();
    if (isValid) {
      const data = {
        ...formData,
        documentDetails: updatedDocumentDetails,
      };

      if (currentStep === steps.length - 1) {
        if (userRole !== "Employee") {
          const step0Valid = validateTwoStep("Personal Details");
          const step1Valid = jobList.length > 0;
          if (!step0Valid || !step1Valid) {
            showToast(
              "Please fill out Step 1 and Step 2 before submitting.",
              "error"
            );
            return;
          }
        }
        try {
          setLoading(true);
          let response;
          if (id) {
            response = await PostCall(`/updateUser/${id}`, data);
            if (response?.data?.status === 200) {
              showToast(response?.data?.message, "success");
              if (id === user._id) {
                dispatch(
                  setEmployeeformFilled(
                    response?.data?.updatedUser?.isFormFilled
                  )
                );
                navigate("/dashboard");
              } else {
                navigate("/employees");
              }
            } else {
              showToast(response?.data?.message, "error");
            }
          } else {
            response = await PostCall("/addUser", data);
            if (response?.data?.status === 200) {
              showToast(response?.data?.message, "success");
              navigate("/employees");
            } else {
              showToast(response?.data?.message, "error");
            }
          }
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
    }
  };

  // const handleChange = (e) => {
  //   const { name, value, type, checked } = e.target;
  //   const isCheckbox = type === "checkbox";
  //   const sectionKeys = {
  //     0: "personalDetails",
  //     1: "addressDetails",
  //     2: "kinDetails",
  //     3: "financialDetails",
  //     4: "jobDetails",
  //     5: "immigrationDetails",
  //     6: "documentDetails",
  //     7: "contractDetails",
  //   };
  //   const sectionKey = sectionKeys[currentStep];
  //   // if (name === "location") {
  //   //   const selectedLocation = locations.find((loc) => loc._id === value); // Find the selected location by its ID
  //   //   if (selectedLocation) {
  //   //     setFormData((prevFormData) => ({
  //   //       ...prevFormData,
  //   //       [sectionKey]: {
  //   //         ...prevFormData[sectionKey],
  //   //         [name]: selectedLocation._id, // Set the location ID
  //   //       },
  //   //       locationId: selectedLocation._id,
  //   //     }));
  //   //   }
  //   //   return;
  //   // }
  //   console.log(formData[sectionKey]?.hasOwnProperty(name));
  //   if (sectionKey && formData[sectionKey]?.hasOwnProperty(name)) {
  //     setFormData((prevFormData) => ({
  //       ...prevFormData,
  //       [sectionKey]: {
  //         ...(prevFormData[sectionKey] || {}),
  //         [name]: isCheckbox ? checked : value,
  //       },
  //     }));
  //   } else {
  //     console.error(`Field ${name} not found in section ${sectionKey}`);
  //   }
  // };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const isCheckbox = type === "checkbox";
    const sectionKeys = {
      0: "personalDetails",
      1: "jobDetails",
      2: "addressDetails",
      3: "kinDetails",
      4: "financialDetails",
      5: "immigrationDetails",
      6: "documentDetails",
      7: "contractDetails",
    };
    const sectionKey = sectionKeys[currentStep];
    let updatedValue = isCheckbox ? checked : value;
    if (!sectionKey) {
      console.error(`Invalid section key for step: ${currentStep}`);
      return;
    }
    if (name === "niNumber") {
      const previousValue = formData?.[sectionKey]?.niNumber || "";
      const inputIsDeleting = value.length < previousValue.length;
      if (!inputIsDeleting) {
        let formattedValue = value
          .replace(/[^a-zA-Z0-9]/g, "")
          .toUpperCase()
          .slice(0, 9);
        if (formattedValue.length > 0) {
          formattedValue = formattedValue.replace(
            /(.{2})(.{0,2})(.{0,2})(.{0,2})(.*)/,
            (match, p1, p2, p3, p4, p5) =>
              [p1, p2, p3, p4, p5].filter(Boolean).join(" ")
          );
        }
        updatedValue = formattedValue;
      }
    }

    if (name === "sortCode") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 6);
      if (digitsOnly.length <= 2) {
        updatedValue = digitsOnly;
      } else if (digitsOnly.length <= 4) {
        updatedValue = `${digitsOnly.slice(0, 2)}-${digitsOnly.slice(2)}`;
      } else {
        updatedValue = `${digitsOnly.slice(0, 2)}-${digitsOnly.slice(
          2,
          4
        )}-${digitsOnly.slice(4)}`;
      }
    }
    setFormData((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [name]: updatedValue,
      },
    }));
    let fieldError = "";
    const EMAIL_REGEX = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
    const NI_REGEX = /^[A-Z]{2} \d{2} \d{2} \d{2} [A-D]$/;
    const displayName = name
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());

    switch (name) {
      case "firstName":
      case "lastName":
      case "gender":
      case "address":
      case "city":
      case "postCode":
      case "kinName":
      case "maritalStatus":
      case "nationality":
      case "countryOfIssue":
      case "passportNumber":
      case "rightToWorkCheckDate":
      case "bankName":
      case "holderName":
      case "payrollFrequency":
      case "dateOfBirth":
        if (!updatedValue.trim()) {
          fieldError = `${displayName} is required`;
        }
        break;

      case "email":
        if (sectionKey === "kinDetails") {
          if (updatedValue.trim() && !EMAIL_REGEX.test(updatedValue)) {
            fieldError = "Valid Email format is required";
          }
        } else {
          if (!updatedValue.trim()) {
            fieldError = "Email is required";
          } else if (!EMAIL_REGEX.test(updatedValue)) {
            fieldError = "Valid Email format is required";
          }
        }
        break;

      case "phone":
        if (!updatedValue.trim()) {
          fieldError = "Phone number is required";
        } else if (!/^\d+$/.test(updatedValue)) {
          fieldError = "Phone number must contain only numbers";
        } else if (!/^\d{11}$/.test(updatedValue)) {
          fieldError = "Phone number must be exactly 11 digits";
        }
        break;

      case "homeTelephone":
        if (updatedValue) {
          if (!/^\d+$/.test(updatedValue)) {
            fieldError = `${displayName} must contain only digits`;
          } else if (updatedValue.length !== 11) {
            fieldError = `${displayName} must be exactly 11 digits`;
          }
        }
        break;

      case "emergencyContactNumber":
        if (!updatedValue.trim()) {
          fieldError = `${displayName} is required`;
        } else if (!/^\d+$/.test(updatedValue)) {
          fieldError = `${displayName} must contain only digits`;
        } else if (updatedValue.length !== 11) {
          fieldError = `${displayName} must be exactly 11 digits`;
        }
        break;

      case "niNumber":
        if (updatedValue && !NI_REGEX.test(updatedValue)) {
          fieldError = "Invalid NI Number format. Use format: QQ 88 77 77 A";
        }
        break;

      case "sortCode":
        if (!updatedValue.trim()) {
          fieldError = "Sort code is required";
        } else if (!/^\d{2}-\d{2}-\d{2}$/.test(updatedValue)) {
          fieldError = "Valid sort code format is required (xx-xx-xx)";
        }
        break;

      case "accountNumber":
        if (!updatedValue.trim()) {
          fieldError = "Account Number is required";
        } else if (!/^\d{8}$/.test(updatedValue)) {
          fieldError = "Account Number must be exactly 8 digits";
        }
        break;

      case "passportExpiry":
        if (!updatedValue.trim()) {
          fieldError = "Passport Expiry is required";
        } else if (moment(updatedValue).isBefore(AllowDate, "day")) {
          fieldError = "Cannot enter a past date";
        }
        break;

      default:
        break;
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [sectionKey]: {
        ...prevErrors?.[sectionKey],
        [name]: fieldError,
      },
    }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFile((prevData) => ({
      ...prevData,
      files: [...prevData.files, ...selectedFiles],
    }));
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };

      if (selectedFiles.length > 0) {
        delete newErrors.document;
      } else {
        newErrors.document = "Please select at least one document.";
      }

      return newErrors;
    });
  };

  const handleDeleteFile = (indexToDelete) => {
    setFile((prevData) => ({
      ...prevData,
      files: prevData.files.filter((_, index) => index !== indexToDelete),
    }));
  };

  const handleInputChange = (field, value) => {
    setFile((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      if (value && newErrors[field]) {
        delete newErrors[field];
      }
      if (!value && field === "documentType") {
        newErrors[field] = "Please select a document type.";
      }
      return newErrors;
    });
  };

  // const handleJobChange = (e) => {
  //   const { name, value } = e.target;
  //   setJobForm((prev) => ({ ...prev, [name]: value }));
  // };

  // const handleJobChange = (e) => {
  //   const { name, value } = e.target;

  //   setJobForm((prev) => {
  //     let updatedForm = { ...prev, [name]: value };

  //     // Auto-update assignManager when role is changed
  //     if (name === "role") {
  //       updatedForm.assignManager = ""; // Reset assignManager when role changes
  //     }

  //     return updatedForm;
  //   });
  // };

  // const handleJobChange = (e) => {
  //   const { name, value } = e.target;

  //   setJobForm((prev) => {
  //     let updatedForm = { ...prev };

  //     if (name === "sickLeavesAllow") {
  //       updatedForm.sickLeavesAllow = {
  //         leaveType: sickLeaveType,
  //         allowedLeavesCounts: value,
  //       };
  //     } else if (name === "leavesAllow") {
  //       updatedForm.leavesAllow = {
  //         leaveType: allowLeaveType,
  //         allowedLeavesCounts: value,
  //       };
  //     } else {
  //       updatedForm[name] = value;
  //     }

  //     if (name === "role") {
  //       updatedForm.assignManager = ""; // Reset assignManager when role changes
  //     }

  //     return updatedForm;
  //   });
  // };

  // const handleJobChange = (e) => {
  //   const { name, value } = e.target;

  //   setJobForm((prev) => {
  //     const updatedForm = { ...prev };

  //     // Check for nested fields like "sickLeavesAllow.leaveType"
  //     if (name.includes(".")) {
  //       const [parentKey, childKey] = name.split(".");
  //       updatedForm[parentKey] = {
  //         ...prev[parentKey],
  //         [childKey]:
  //           childKey === "allowedLeavesCounts" ? Number(value) : value,
  //       };
  //     } else {
  //       updatedForm[name] = value;
  //     }

  //     if (name === "role") {
  //       updatedForm.assignManager = "";
  //     }

  //     return updatedForm;
  //   });
  // };

  const handleJobChange = (e) => {
    const { name, value, type } = e.target;

    setJobForm((prev) => {
      let updatedForm = { ...prev };
      let newErrors = { ...errors };

      if (name.includes(".")) {
        const [parent, child] = name.split(".");
        updatedForm[parent] = {
          ...prev[parent],
          [child]:
            type === "number" || child.includes("Counts")
              ? Number(value)
              : value,
        };
      } else {
        if (name === "role") {
          updatedForm[name] = value;
          updatedForm.assignManager = ""; // Reset assignManager
        } else {
          updatedForm[name] = value;
        }
      }
      let fieldError = "";

      switch (name) {
        case "jobTitle":
        case "joiningDate":
        case "role":
          if (!updatedForm[name]?.trim()) {
            fieldError = `${name
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase())} is required`;
          }
          break;

        case "annualSalary":
          if (value === "" || value === null) {
            fieldError = "Annual Salary is required";
          } else if (Number(value) < 1) {
            fieldError = "Annual salary must be greater than zero.";
          }
          break;

        case "weeklyWorkingHours":
          if (value === "" || value === null) {
            fieldError = "Weekly Working Hours are required";
          } else if (Number(value) < 1) {
            fieldError = "Weekly working hours must be greater than zero.";
          }
          break;

        case "location":
          if (updatedForm?.isWorkFromOffice && (!value || value.length === 0)) {
            fieldError = "Location is required when working from office";
          }
          break;

        case "assignClient":
          if (
            !updatedForm?.isWorkFromOffice &&
            (!value || value.length === 0)
          ) {
            fieldError = "Assign Client is required";
          }
          break;

        default:
          break;
      }

      if (fieldError) {
        newErrors[name] = fieldError;
      } else {
        delete newErrors[name];
      }

      setErrors(newErrors);
      return updatedForm;
    });
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    SetShowdropwornAction(null);
  };

  const handleAction = (id) => {
    SetShowdropwornAction(ShowdropwornAction === id ? null : id);
  };

  const showConfirmation = async (index, name) => {
    // console.log(name);
    setJobName(name);
    setJobId(index);
    setShowConfirm(true);
    SetShowdropwornAction(null);
  };

  const showConfirmationforDocuments = async (id, documentName) => {
    setDocumentName(documentName);
    setDocumentId(id);
    setShowConfirm(true);
    SetShowdropwornAction(null);
  };

  const handleAddDocument = async () => {
    let newErrors = {};
    if (!file.documentType) {
      newErrors.documentType = "Please select a document type.";
      setErrors(newErrors);
      return;
    }

    if (!file.files || file.files.length === 0) {
      newErrors.document = "Please select at least one document.";
      setErrors(newErrors);
      return;
    }

    try {
      const base64Files = await Promise.all(
        file.files.map((fileItem) => convertFileToBase64(fileItem))
      );

      const newDocument = {
        documentType: file.documentType,
        documents: file.files.map((fileItem, index) => ({
          documentName: fileItem.name,
          document: base64Files[index],
        })),
      };

      // console.log("newDocument", newDocument);
      setDocumentDetails((prevDocuments) => [...prevDocuments, newDocument]);

      setFile({
        documentType: "",
        files: [],
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setErrors({});
    } catch (error) {
      console.error("Error converting files to base64:", error);
    }
  };

  const handleRemoveDocument = (id) => {
    setDocumentDetails((prevDocuments) => {
      const updatedDocuments = prevDocuments.filter((_, i) => i !== id);
      return updatedDocuments;
    });
    setShowConfirm(false);
    SetShowdropwornAction(null);
  };

  const handleAddJob = () => {
    let newErrors = {};
    if (jobForm?.jobTitle === "") {
      newErrors.jobTitle = "Job Title is required";
    }
    if (jobForm?.joiningDate === "") {
      newErrors.joiningDate = "Joining Date is required";
    }
    if (jobForm?.annualSalary === "" || jobForm?.annualSalary === null) {
      newErrors.annualSalary = "Annual Salary is required";
    } else if (jobForm?.annualSalary < 1) {
      newErrors.annualSalary = "Annual salary must be greater than zero.";
    }
    if (
      jobForm?.weeklyWorkingHours === "" ||
      jobForm?.weeklyWorkingHours === null
    ) {
      newErrors.weeklyWorkingHours = "Weekly Working Hours are required";
    } else if (jobForm?.weeklyWorkingHours < 1) {
      newErrors.weeklyWorkingHours =
        "Weekly working hours must be greater than zero.";
    }
    if (jobForm?.role === "") {
      newErrors.role = "Role is required";
    }
    if (isWorkFromOffice && jobForm?.location.length === 0) {
      newErrors.location = "Location is required when working from office";
    }
    // if (jobForm?.assignManager === "") {
    //   newErrors.assignManager = "Assign Manager is required";
    // }
    if (!isWorkFromOffice && jobForm?.assignClient.length === 0) {
      newErrors.assignClient = "Assign Client is required";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const updatedJobList = [...jobList];

    if (editIndex !== null) {
      // Edit job in the jobList
      updatedJobList[editIndex] = jobForm;
      setEditIndex(null);
    } else {
      // Add a new job to the jobList
      updatedJobList.push(jobForm);
    }

    // Update the jobList state and formData.jobDetails
    setJobList(updatedJobList);

    setFormData((prev) => ({
      ...prev,
      jobDetails: updatedJobList, // Update jobDetails with the new job list
    }));

    // Clear the job form after adding/updating
    setJobForm({
      jobTitle: "",
      jobDescription: "",
      joiningDate: "",
      annualSalary: "",
      weeklyWorkingHours: "",
      weeklyWorkingHoursPattern: "",
      hourlyRate: "",
      weeklySalary: "",
      socCode: "",
      modeOfTransfer: "",
      sickLeavesAllow: { leaveType: "Day", allowedLeavesCounts: 0 },
      leavesAllow: { leaveType: "Day", allowedLeavesCounts: 0 },
      location: [],
      assignManager: "",
      assignClient: [],
      // templateId: "",
      role: "",
      isWorkFromOffice: false,
    });
    setisWorkFromOffice(false);
    setErrors({});
  };

  const handleEditJob = (index) => {
    const selectedJob = jobList[index];
    setisWorkFromOffice(selectedJob.isWorkFromOffice);
    // console.log("manager", assignee, jobForm);
    // setFormData({ jobDetails: { ...jobList[index] } });
    setJobForm(jobList[index]);
    setEditIndex(index);
    SetShowdropwornAction(null);
  };

  const handleRemoveJob = (index) => {
    const updatedJobList = jobList.filter((_, i) => i !== index);
    // setJobList((prevList) => prevList.filter((_, i) => i !== index));
    setJobList(updatedJobList);
    setFormData((prev) => ({
      ...prev,
      jobDetails: updatedJobList,
    }));
    setShowConfirm(false);
    SetShowdropwornAction(null);
  };

  // const handleEditJob = (index) => {
  //   console.log("manager", assignee, locations, jobForm);

  //   const selectedJob = jobList[index];
  //   const selectedLocation = locations.find(
  //     (location) => location._id === selectedJob.location
  //   );

  //   setJobForm(selectedJob); // Update jobForm with the selected job
  //   setAssignee(selectedLocation?.assignee || []); // Update assignee for the selected location
  //   setEditIndex(index);
  //   SetShowdropwornAction(null);
  // };

  const validate = () => {
    let newErrors = {};
    let invalidSteps = [];

    const shouldValidateAll = user.id !== id && otherFormsave;
    const stepsToValidate = shouldValidateAll ? steps : [steps[currentStep]];

    const EMAIL_REGEX = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
    const NI_REGEX = /^[A-Z]{2} \d{2} \d{2} \d{2} [A-D]$/;
    const SORT_CODE_REGEX = /^\d{2}-\d{2}-\d{2}$/;

    for (let stepName of stepsToValidate) {
      let stepHasError = false;

      switch (stepName) {
        case "Personal Details": {
          const pd = formData?.personalDetails || {};
          const errors = {};

          if (!pd.firstName?.trim())
            errors.firstName = "First Name is required";
          if (!pd.lastName?.trim()) errors.lastName = "Last Name is required";
          if (!pd.dateOfBirth) errors.dateOfBirth = "Date of Birth is required";
          if (!pd.gender) errors.gender = "Gender is required";
          if (!pd.maritalStatus)
            errors.maritalStatus = "Marital Status is required";

          if (!pd.phone) {
            errors.phone = "Phone number is required";
          } else if (!/^\d+$/.test(pd.phone)) {
            errors.phone = "Phone number must contain only numbers";
          } else if (!/^\d{11}$/.test(pd.phone)) {
            errors.phone = "Phone number must be exactly 11 digits";
          }

          if (pd.homeTelephone) {
            if (!/^\d+$/.test(pd.homeTelephone)) {
              errors.homeTelephone = "Home telephone must contain only digits";
            } else if (pd.homeTelephone.length !== 11) {
              errors.homeTelephone = "Home telephone must be exactly 11 digits";
            }
          }

          if (!pd.email) {
            errors.email = "Email is required";
          } else if (!EMAIL_REGEX.test(pd.email)) {
            errors.email = "Valid Email format is required";
          }

          if (pd.niNumber && !NI_REGEX.test(pd.niNumber.trim())) {
            errors.niNumber =
              "Invalid NI Number format. Use format: QQ 88 77 77 A";
          }

          if (Object.keys(errors).length) {
            newErrors.personalDetails = errors;
            stepHasError = true;
          }
          break;
        }

        case "Address Details": {
          const ad = formData?.addressDetails || {};
          const errors = {};

          if (!ad.address) errors.address = "Address is required";
          if (!ad.city) errors.city = "City is required";
          if (!ad.postCode) errors.postCode = "Post Code is required";

          if (Object.keys(errors).length) {
            newErrors.addressDetails = errors;
            stepHasError = true;
          }
          break;
        }

        case "Kin Details": {
          const kd = formData?.kinDetails || {};
          const errors = {};

          if (!kd.kinName) errors.kinName = "Kin name is required";
          if (!kd.postCode) errors.postCode = "Post Code is required";
          if (!kd.address) errors.address = "Address is required";

          if (!kd.emergencyContactNumber) {
            errors.emergencyContactNumber =
              "Emergency Contact Number is required";
          } else if (!/^\d+$/.test(kd.emergencyContactNumber)) {
            errors.emergencyContactNumber =
              "Emergency Contact Number must contain only numbers";
          } else if (!/^\d{11}$/.test(kd.emergencyContactNumber)) {
            errors.emergencyContactNumber =
              "Emergency Contact Number must be exactly 11 digits";
          }

          if (kd.email && !EMAIL_REGEX.test(kd.email)) {
            errors.email = "Valid Email format is required";
          }

          if (Object.keys(errors).length) {
            newErrors.kinDetails = errors;
            stepHasError = true;
          }
          break;
        }

        case "Financial Details": {
          const fd = formData?.financialDetails || {};
          const errors = {};

          if (!fd.bankName) errors.bankName = "Bank Name is required";
          if (!fd.holderName) errors.holderName = "Holder Name is required";

          if (!fd.sortCode) {
            errors.sortCode = "Sort code is required";
          } else if (!SORT_CODE_REGEX.test(fd.sortCode)) {
            errors.sortCode = "Valid sort code format is required (xx-xx-xx)";
          }

          if (!fd.accountNumber) {
            errors.accountNumber = "Account Number is required";
          } else if (!/^\d{8}$/.test(fd.accountNumber)) {
            errors.accountNumber = "Account Number must be exactly 8 digits";
          }

          if (!fd.payrollFrequency)
            errors.payrollFrequency = "Payroll Frequency is required";
          if (!fd.pension) errors.pension = "Pension option is required";

          if (Object.keys(errors).length) {
            newErrors.financialDetails = errors;
            stepHasError = true;
          }
          break;
        }

        case "Job Details": {
          const errors = {};
          if (jobList?.length <= 0) {
            errors.jobList = "At least one Job Type is required";
            stepHasError = true;
          }

          if (editIndex !== null) {
            errors.jobList = "Please update Job Details";
            showToast("Please update Job Details", "error");
            stepHasError = true;
          }

          if (Object.keys(errors).length) {
            newErrors.jobDetails = errors;
          }

          break;
        }

        case "Immigration Details": {
          const im = formData?.immigrationDetails || {};
          const errors = {};

          if (!im.passportNumber)
            errors.passportNumber = "Passport Number is required";
          if (!im.countryOfIssue)
            errors.countryOfIssue = "Country Of Issue is required";

          if (!im.passportExpiry) {
            errors.passportExpiry = "Passport Expiry is required";
          } else if (moment(im.passportExpiry).isBefore(AllowDate, "day")) {
            errors.passportExpiry = "Cannot enter a past date";
          }

          if (!im.nationality) errors.nationality = "Nationality is required";
          if (!im.rightToWorkCheckDate)
            errors.rightToWorkCheckDate =
              "Right To Work Check Date is required";

          if (Object.keys(errors).length) {
            newErrors.immigrationDetails = errors;
            stepHasError = true;
          }
          break;
        }

        default:
          break;
      }

      if (stepHasError) {
        if (!shouldValidateAll) {
          setErrors(newErrors);
          return false;
        }
        invalidSteps.push(stepName);
      }
    }

    if (Object.keys(newErrors).length && shouldValidateAll) {
      showToast(
        `Something is missing in following tab - ${invalidSteps.join(", ")}`,
        "error"
      );
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(
      (section) => Object.keys(section).length === 0
    );
  };

  const jobActions = [
    {
      label: "Edit",
      onClick: handleEditJob,
    },
    {
      label: "Delete",
      onClick: showConfirmation,
    },
  ];

  const documentActions = [
    {
      label: "Delete",
      onClick: showConfirmationforDocuments,
    },
  ];

  const GetjobTitles = async () => {
    try {
      setLoading(true);
      const response = await GetCall(`/getAllJobTitles`);

      if (response?.data?.status === 200) {
        setjobTitlesList(response?.data?.jobTitles);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const GetEmployeeDetails = async () => {
    try {
      setLoading(true);
      const User = await GetCall(`/getUser/${id}`);
      if (User?.data?.status === 200) {
        // GetAllLocations();
        setDocumentDetails(User?.data?.user?.documentDetails);
        setotherFormsave(User?.data?.user?.isFormFilled);
        setFormData(User?.data?.user);
        setJobList(User?.data?.user?.jobDetails);
        // setCompanyId(User?.data?.user?.companyId);
        // console.log("setCompanyId", setCompanyId);
      } else {
        showToast(User?.data?.message, "error");
      }
      setLoading(false);
      // console.log("User", User);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSalaryChange = (e) => {
    const { name, value } = e.target;
    const ValueRemove = value.replace(/[^0-9.]/g, "");

    setJobForm((prev) => {
      const updatedForm = {
        ...prev,
        [name]: ValueRemove,
      };

      let fieldError = "";
      if (!ValueRemove) {
        fieldError = "Annual Salary is required";
      } else if (Number(ValueRemove) < 1) {
        fieldError = "Annual salary must be greater than zero.";
      }

      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        if (fieldError) {
          newErrors[name] = fieldError;
        } else {
          delete newErrors[name];
        }
        return newErrors;
      });

      return updatedForm;
    });
  };

  const formatSalary = () => {
    const value = jobForm.annualSalary;
    const numericValue = parseFloat(value);
    const rawValue = isNaN(numericValue) ? "" : numericValue.toFixed(2);
    const formattedValue = rawValue ? `£${rawValue}` : "";

    setJobForm((prev) => ({
      ...prev,
      annualSalary: formattedValue,
    }));
  };

  const handleStepClick = (index) => {
    const isUpdateMode = !!id || userRole === "Superadmin";
    if (
      completedSteps.includes(index) ||
      index === currentStep ||
      isUpdateMode
    ) {
      setCurrentStep(index);
    }
  };

  useEffect(() => {
    if (id === user._id && employeeFormFilled) {
      return navigate("/dashboard");
    }
    if (id) {
      GetEmployeeDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (companyId && typeof companyId === "string") {
      GetAllLocations(companyId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  useEffect(() => {
    if (!companyId && !id) GetAllLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isWorkFromOffice) {
      setJobForm((prev) => ({
        ...prev,
        location: [],
      }));

      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors.location;
        return newErrors;
      });
    }
  }, [isWorkFromOffice]);

  useEffect(() => {
    if (isWorkFromOffice) {
      setJobForm((prev) => ({
        ...prev,
        assignClient: [],
      }));

      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors.assignClient;
        return newErrors;
      });
    }
  }, [isWorkFromOffice]);

  const GetAllLocations = async () => {
    try {
      setLoading(true);
      const Company = await GetCall(
        `/getCompanyLocations?companyId=${companyId}`
      );
      // }
      if (Company?.data?.status === 200) {
        setLocations(Company?.data?.companiesAllLocations);
        setContracts(Company?.data?.contracts);
        setClients(Company?.data?.clients);
        setAssignee(Company?.data?.assigneeAdminAndManager);
        // setTemplates(Company?.data?.templates);
      } else {
        showToast(Company?.data?.message, "error");
      }
      setLoading(false);
      // console.log("Company", Company);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // useEffect(() => {
  //   // console.log("called");
  //   const selectedLocation = locations.find(
  //     (location) => location._id === jobForm.location
  //   );

  //   setAssignee(selectedLocation?.assignee || []);

  //   // if (jobForm.location) {
  //   //   setJobForm((prev) => ({ ...prev, assignManager: "" }));
  //   // }
  // }, [jobForm.location, locations]);

  // useEffect(() => {
  //   let filtered = [];

  //   if (jobForm.role === "Employee") {
  //     filtered = assignee.filter((a) => a.role === "Manager");
  //   } else if (jobForm.role === "Manager") {
  //     filtered = assignee.filter((a) => a.role === "Administrator");
  //   } else if (jobForm.role === "Administrator") {
  //     filtered = assignee.filter((a) => a.role === "Superadmin");
  //   }

  //   setFilteredAssignees(filtered);
  // }, [jobForm.role, assignee]);

  useEffect(() => {
    if (!employeeFormFilled) {
      setCurrentStep(2);
    }
  }, [employeeFormFilled]);

  useEffect(() => {
    let filtered;
    if (jobForm.role === "Employee") {
      filtered = assignee?.filter(
        (a) =>
          a.role === "Superadmin" ||
          a.role === "Administrator" ||
          a.role === "Manager"
      );
    } else if (jobForm.role === "Manager") {
      filtered = assignee?.filter(
        (a) => a.role === "Superadmin" || a.role === "Administrator"
      );
    } else if (jobForm.role === "Administrator") {
      filtered = assignee?.filter((a) => a.role === "Superadmin");
    }
    setFilteredAssignees(filtered);
  }, [jobForm.role]);

  // useEffect(() => {
  //   if (!jobForm.location || !jobForm.role) return;

  //   const selectedLocation = locations.find(
  //     (location) => location._id === jobForm.location
  //   );

  //   const currentAssignees = selectedLocation?.assignee || [];
  //   console.log("CurrentAssignees", currentAssignees);
  //   setAssignee(currentAssignees);

  //   let filtered = [];

  //   if (jobForm.role === "Employee") {
  //     filtered = currentAssignees.filter(
  //       (a) =>
  //         a.role === "Superadmin" ||
  //         a.role === "Administrator" ||
  //         a.role === "Manager"
  //     );
  //   } else if (jobForm.role === "Manager") {
  //     filtered = currentAssignees.filter(
  //       (a) => a.role === "Superadmin" || a.role === "Administrator"
  //     );
  //   } else if (jobForm.role === "Administrator") {
  //     filtered = currentAssignees.filter((a) => a.role === "Superadmin");
  //   }

  //   console.log(filtered);

  //   setFilteredAssignees(filtered);

  //   if (filtered.length === 0) {
  //     showToast(
  //       "No assignee available for the selected role and location.",
  //       "error"
  //     );
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [jobForm.location, jobForm.role, locations]);

  useEffect(() => {
    GetjobTitles();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="Addemployee-container">
      <div className="Addemployee-stepper">
        {steps?.map((step, index) => (
          <div
            key={index}
            className={`addemployee-step ${
              index <= currentStep ? "active" : ""
            } ${completedSteps.includes(index) ? "completed" : ""}`}
            onClick={() => {
              if (employeeFormFilled || (!employeeFormFilled && index === 2)) {
                handleStepClick(index);
              }
            }}
            style={{
              cursor:
                employeeFormFilled || (!employeeFormFilled && index === 2)
                  ? "pointer"
                  : "not-allowed",
            }}
          >
            <div className="Addemployee-step-number">
              {completedSteps.includes(index) ? (
                <FaCheck className="checkmark-icon" />
              ) : (
                index + 1
              )}
            </div>
            <div className="Addemployee-step-label">{step}</div>
          </div>
        ))}
      </div>

      <div className="Addemployee-step-content">
        {currentStep === 0 && (
          <div className="addemployee-flex">
            <h1>Personal Details</h1>
            <div className="addemployee-section">
              <div className="addemployee-input-container">
                <label className="label">First Name*</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData?.personalDetails?.firstName}
                  onChange={handleChange}
                  className="addemployee-input"
                  placeholder="Enter FirstName"
                />
                {errors?.personalDetails?.firstName && (
                  <p className="error-text">
                    {errors?.personalDetails?.firstName}
                  </p>
                )}
              </div>
              <div className="addemployee-input-container">
                <label className="label">Middle Name</label>
                <input
                  type="text"
                  name="middleName"
                  className="addemployee-input"
                  value={formData?.personalDetails?.middleName}
                  onChange={handleChange}
                  placeholder="Enter middleName"
                />
              </div>
              <div className="addemployee-input-container">
                <label className="label">Last Name*</label>
                <input
                  type="text"
                  className="addemployee-input"
                  name="lastName"
                  value={formData?.personalDetails?.lastName}
                  onChange={handleChange}
                  placeholder="Enter lastName"
                />
                {errors?.personalDetails?.lastName && (
                  <p className="error-text">
                    {errors?.personalDetails?.lastName}
                  </p>
                )}
              </div>
            </div>

            <div className="addemployee-section">
              <div className="addemployee-input-container">
                <label className="label">Date of Birth*</label>
                <input
                  type="date"
                  className="addemployee-input"
                  name="dateOfBirth"
                  data-testid="dateofbirth"
                  value={formData?.personalDetails?.dateOfBirth}
                  onChange={handleChange}
                  placeholder="DD/MM/YYYY"
                />
                {errors?.personalDetails?.dateOfBirth && (
                  <p className="error-text">
                    {errors?.personalDetails?.dateOfBirth}
                  </p>
                )}
              </div>
              <div className="addemployee-input-container">
                <label className="label">Select Gender*</label>
                {/* <select
                  className="addemployee-input"
                  name="gender"
                  data-testid="gender-select"
                  value={formData?.personalDetails?.gender}
                  onChange={handleChange}
                >
                  <option value="" disabled>
                    Select Gender
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select> */}
                <Select
                  className="addemployee-input-dropdown"
                  name="gender"
                  data-testid="gender-select"
                  value={formData?.personalDetails?.gender}
                  onChange={handleChange}
                  displayEmpty
                  MenuProps={{
                    PaperProps: {
                      style: {
                        width: 200,
                        className: "custom-dropdown-menu",
                        overflowX: "auto",
                        scrollbarWidth: "thin",
                        maxHeight: 200,
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    Select Gender
                  </MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
                {errors?.personalDetails?.gender && (
                  <p className="error-text">
                    {errors?.personalDetails?.gender}
                  </p>
                )}
              </div>

              <div className="addemployee-input-container">
                <label className="label">Marital Status*</label>
                {/* <select
                  name="maritalStatus"
                  className="addemployee-input"
                  data-testid="marital Status"
                  value={formData?.personalDetails?.maritalStatus}
                  onChange={handleChange}
                  placeholder="Enter maritalStatus"
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
                  className="addemployee-input-dropdown"
                  data-testid="marital Status"
                  value={formData?.personalDetails?.maritalStatus}
                  onChange={handleChange}
                  placeholder="Enter maritalStatus"
                  displayEmpty
                  MenuProps={{
                    PaperProps: {
                      style: {
                        width: 200,
                        overflowX: "auto",
                        scrollbarWidth: "thin",
                        maxHeight: 200,
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
                {errors?.personalDetails?.maritalStatus && (
                  <p className="error-text">
                    {errors?.personalDetails?.maritalStatus}
                  </p>
                )}
              </div>
            </div>

            <div className="addemployee-section">
              <div className="addemployee-input-container">
                <label className="label">Phone*</label>
                <input
                  type="tel"
                  className="addemployee-input"
                  name="phone"
                  value={formData?.personalDetails?.phone}
                  onChange={handleChange}
                  placeholder="Enter phone"
                />
                {errors?.personalDetails?.phone && (
                  <p className="error-text">{errors?.personalDetails?.phone}</p>
                )}
              </div>
              <div className="addemployee-input-container">
                <label className="label">Home Telephone</label>
                <input
                  type="tel"
                  name="homeTelephone"
                  className="addemployee-input"
                  placeholder="Enter Telephone Number"
                  value={formData?.personalDetails?.homeTelephone}
                  onChange={handleChange}
                />
                {errors?.personalDetails?.homeTelephone && (
                  <p className="error-text">
                    {errors?.personalDetails?.homeTelephone}
                  </p>
                )}
              </div>
              <div className="addemployee-input-container">
                <label className="label">Email*</label>
                <input
                  type="email"
                  className="addemployee-input"
                  placeholder="Enter Email"
                  name="email"
                  value={formData?.personalDetails?.email}
                  onChange={handleChange}
                />
                {errors?.personalDetails?.email && (
                  <p className="error-text">{errors?.personalDetails?.email}</p>
                )}
              </div>
            </div>
            <div className="addemployee-section">
              <div className="addemployee-input-container">
                <label className="label">NI Number</label>
                <input
                  type="text"
                  name="niNumber"
                  className="addemployee-input addemployee-input-width"
                  value={formData?.personalDetails?.niNumber}
                  onChange={handleChange}
                  placeholder="Enter NI Number"
                />
                {errors?.personalDetails?.niNumber && (
                  <p className="error-text">
                    {errors?.personalDetails?.niNumber}
                  </p>
                )}
              </div>
              <div className="addemployee-input-container"></div>
              <div className="addemployee-input-container"></div>
            </div>

            {/* <div className="addemployee-registration-link">
              <input
                type="checkbox"
                data-testid="send-link"
                name="sendRegistrationLink"
                checked={formData?.personalDetails?.sendRegistrationLink}
                onChange={handleChange}
              />
              <label>Send Registration link to employee</label>
            </div>
            {errors?.sendRegistrationLink && (
              <p className="error-text">{errors?.sendRegistrationLink}</p>
            )} */}
          </div>
        )}

        {currentStep === 1 && (
          <div>
            <div className="addemployee-flex">
              <h1>Job Details</h1>
              <div className="addemployee-section">
                <div className="addemployee-input-container">
                  <label className="label">Job Title*</label>
                  {/* <input
                    type="text"
                    name="jobTitle"
                    value={jobForm?.jobTitle}
                    onChange={handleJobChange}
                    className="addemployee-input"
                    placeholder="Enter Job Title"
                  /> */}
                  <Select
                    name="jobTitle"
                    value={jobForm?.jobTitle}
                    onChange={handleJobChange}
                    className="addemployee-input-dropdown"
                    displayEmpty
                    MenuProps={{
                      disableAutoFocusItem: true,
                      PaperProps: {
                        style: {
                          maxWidth: 200,
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
                      if (!selected) return "Select Jobtitle";
                      const found = jobTitlesList.find(
                        (emp) => emp.name === selected
                      );
                      return found?.name || "Not found";
                    }}
                  >
                    <ListSubheader>
                      <TextField
                        size="small"
                        placeholder="Search Job Title"
                        fullWidth
                        className="search-textfield"
                        value={jobtitlesearchTerm}
                        onChange={(e) => setjobtitlesearchTerm(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </ListSubheader>
                    <MenuItem value="" disabled className="menu-item">
                      Select job Title
                    </MenuItem>
                    {filteredJobtitleList?.length > 0 ? (
                      filteredJobtitleList?.map((jobtitle, index) => (
                        <MenuItem
                          key={index}
                          value={jobtitle?.name}
                          className="menu-item"
                        >
                          {jobtitle.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="" disabled className="menu-item">
                        No found Job Title
                      </MenuItem>
                    )}
                  </Select>
                  {errors?.jobTitle && (
                    <p className="error-text">{errors?.jobTitle}</p>
                  )}
                </div>
                <div className="addemployee-input-container">
                  <label className="label">Job Description</label>
                  <input
                    type="text"
                    name="jobDescription"
                    className="addemployee-input"
                    value={jobForm?.jobDescription}
                    onChange={handleJobChange}
                    placeholder="Enter Job Description"
                  />
                </div>
                <div className="addemployee-input-container">
                  <label className="label">Joining Date*</label>
                  <input
                    type="date"
                    name="joiningDate"
                    className="addemployee-input"
                    data-testid="joiningdate-select"
                    value={jobForm?.joiningDate}
                    onChange={handleJobChange}
                  />
                  {errors?.joiningDate && (
                    <p className="error-text">{errors?.joiningDate}</p>
                  )}
                </div>
              </div>
              <div className="addemployee-section">
                <div className="addemployee-input-container">
                  <label className="label">Annual Salary(GBP)*</label>
                  {/* <NumericFormat
                    thousandSeparator={true}
                    prefix={"£"}
                    decimalScale={2}
                    fixedDecimalScale={true}
                    allowNegative={false}
                    name="annualSalary"
                    className="addemployee-input"
                    value={jobForm?.annualSalary}
                    onValueChange={(values) => {
                      const { value, formattedValue } = values;
                      setJobForm((prev) => ({
                        ...prev,
                        annualSalary: formattedValue,
                        annualSalaryRaw: value,
                      }));
                    }}
                    placeholder="Enter Annual Salary"
                  /> */}

                  <input
                    type="text"
                    name="annualSalary"
                    className="addemployee-input"
                    value={jobForm?.annualSalary}
                    onChange={handleSalaryChange}
                    onBlur={formatSalary}
                    placeholder="Enter Annual Salary"
                  />

                  {errors?.annualSalary && (
                    <p className="error-text">{errors?.annualSalary}</p>
                  )}
                </div>
                <div className="addemployee-input-container">
                  <label className="label">Weekly working Hours*</label>
                  <input
                    type="number"
                    name="weeklyWorkingHours"
                    className="addemployee-input"
                    value={jobForm?.weeklyWorkingHours}
                    onChange={handleJobChange}
                    placeholder="Enter weekly working Hours"
                  />
                  {errors?.weeklyWorkingHours && (
                    <p className="error-text">{errors?.weeklyWorkingHours}</p>
                  )}
                </div>
                <div className="addemployee-input-container">
                  <label className="label">Weekly working Hours Pattern</label>
                  <input
                    type="text"
                    name="weeklyWorkingHoursPattern"
                    className="addemployee-input"
                    value={jobForm?.weeklyWorkingHoursPattern}
                    onChange={handleJobChange}
                    placeholder="Enter weekly working Hours Pattern"
                  />
                </div>
              </div>
              <div className="addemployee-section">
                <div className="addemployee-input-container">
                  <label className="label">Hourly rate (GBP)</label>
                  <input
                    type="number"
                    name="hourlyRate"
                    className="addemployee-input"
                    value={jobForm?.hourlyRate}
                    onChange={handleJobChange}
                    placeholder="Enter Hourly rate"
                  />
                </div>
                <div className="addemployee-input-container">
                  <label className="label">Weekly Salary (GBP)</label>
                  <input
                    type="number"
                    name="weeklySalary"
                    className="addemployee-input"
                    value={jobForm?.weeklySalary}
                    onChange={handleJobChange}
                    placeholder="Enter Weekly Salary"
                  />
                </div>
                <div className="addemployee-input-container">
                  <label className="label">SOC Code</label>
                  <input
                    type="text"
                    name="socCode"
                    className="addemployee-input"
                    value={jobForm?.socCode}
                    onChange={handleJobChange}
                    placeholder="Enter SOC Code"
                  />
                </div>
              </div>
              <div className="addemployee-section">
                <div className="addemployee-input-container">
                  <label className="label">Mode Of Transfer</label>
                  {/* <select
                    name="modeOfTransfer"
                    data-testid="modeOfTransfer-select"
                    value={jobForm?.modeOfTransfer}
                    onChange={handleJobChange}
                    className="addemployee-input"
                  >
                    <option value="">Select Mode Of Transfer</option>
                    <option value="netbanking">Net Banking</option>
                    <option value="upi">UPI</option>
                    <option value="creditcard">Credit Card</option>
                  </select> */}
                  <Select
                    name="modeOfTransfer"
                    data-testid="modeOfTransfer-select"
                    value={jobForm?.modeOfTransfer}
                    onChange={handleJobChange}
                    className="addemployee-input-dropdown"
                    displayEmpty
                    MenuProps={{
                      PaperProps: {
                        style: {
                          width: 150,
                          overflowX: "auto",
                          scrollbarWidth: "thin",
                          maxHeight: 200,
                        },
                      },
                    }}
                  >
                    <MenuItem value="" disabled className="menu-item">
                      {" "}
                      Select Mode Of Transfe
                    </MenuItem>
                    <MenuItem value="netbanking" className="menu-item">
                      Net Banking
                    </MenuItem>
                    <MenuItem value="upi" className="menu-item">
                      UPI
                    </MenuItem>
                    <MenuItem value="creditcard" className="menu-item">
                      Credit Card
                    </MenuItem>
                  </Select>
                </div>
                <div className="addemployee-input-container">
                  <label className="label">No. Of sick leaves allowed</label>
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                    }}
                  >
                    <input
                      type="number"
                      name="sickLeavesAllow.allowedLeavesCounts"
                      className="addemployee-input"
                      value={jobForm?.sickLeavesAllow?.allowedLeavesCounts}
                      onChange={handleJobChange}
                      placeholder="Enter No. Of sick leaves allowed"
                    />
                    {/* <select
                      // value={sickLeaveType}
                      name="sickLeavesAllow.leaveType"
                      value={jobForm?.sickLeavesAllow?.leaveType}
                      // onChange={(e) => setSickLeaveType(e.target.value)}
                      onChange={handleJobChange}
                      className="addemployee-input"
                      style={{ width: "120px" }}
                    >
                      <option value="Day">Day</option>
                      <option value="Hour">Hour</option>
                    </select> */}
                    <Select
                      name="sickLeavesAllow.leaveType"
                      value={jobForm?.sickLeavesAllow?.leaveType}
                      // onChange={(e) => setSickLeaveType(e.target.value)}
                      onChange={handleJobChange}
                      className="addemployee-input-dropdown"
                      style={{ width: "120px" }}
                      displayEmpty
                      MenuProps={{
                        PaperProps: {
                          style: {
                            width: 150,
                            overflowX: "auto",
                            scrollbarWidth: "thin",
                            maxHeight: 200,
                          },
                        },
                      }}
                    >
                      <MenuItem value="Day" className="menu-item">
                        Day
                      </MenuItem>
                      <MenuItem value="Hour" className="menu-item">
                        Hour
                      </MenuItem>
                    </Select>
                  </div>
                </div>
                <div className="addemployee-input-container">
                  <label className="label">No. Of leaves allowed</label>
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                    }}
                  >
                    <input
                      type="number"
                      name="leavesAllow.allowedLeavesCounts"
                      className="addemployee-input"
                      value={jobForm?.leavesAllow?.allowedLeavesCounts}
                      onChange={handleJobChange}
                      placeholder="Enter No. Of leaves allowed"
                    />
                    {/* <select
                      name="leavesAllow.leaveType"
                      // value={allowLeaveType}
                      value={jobForm?.leavesAllow?.leaveType}
                      // onChange={(e) => setallowLeaveType(e.target.value)}
                      onChange={handleJobChange}
                      className="addemployee-input"
                      style={{ width: "120px" }}
                    >
                      <option value="Day">Day</option>
                      <option value="Hour">Hour</option>
                    </select> */}
                    <Select
                      name="leavesAllow.leaveType"
                      // value={allowLeaveType}
                      value={jobForm?.leavesAllow?.leaveType}
                      // onChange={(e) => setallowLeaveType(e.target.value)}
                      onChange={handleJobChange}
                      className="addemployee-input-dropdown"
                      style={{ width: "120px" }}
                      displayEmpty
                      MenuProps={{
                        PaperProps: {
                          style: {
                            width: 80,
                            overflowX: "auto",
                            scrollbarWidth: "thin",
                            maxHeight: 200,
                          },
                        },
                      }}
                    >
                      <MenuItem value="Day" className="menu-item">
                        Day
                      </MenuItem>
                      <MenuItem value="Hour" className="menu-item">
                        Hour
                      </MenuItem>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="addemployee-section">
                <div className="addemployee-input-container">
                  <label className="label">Role*</label>
                  {/* <select
                    name="role"
                    value={jobForm?.role}
                    onChange={handleJobChange}
                    data-testid="role-select"
                    className="addemployee-input"
                  >
                    <option value="" disabled>
                      Select Role
                    </option>
                    <option value="Employee">Employee</option>
                    {(user.role === "Superadmin" ||
                      user.role === "Administrator") && (
                      <option value="Manager">Manager</option>
                    )}
                    {user.role === "Superadmin" && (
                      <option value="Administrator">Administrator</option>
                    )}
                  </select> */}
                  <Select
                    id="role-select"
                    name="role"
                    value={jobForm?.role || ""}
                    onChange={handleJobChange}
                    data-testid="role-select"
                    className="addemployee-input-dropdown"
                    displayEmpty
                    MenuProps={{
                      PaperProps: {
                        style: {
                          width: 200,
                          overflowX: "auto",
                          scrollbarWidth: "thin",
                          maxHeight: 200,
                        },
                      },
                    }}
                  >
                    <MenuItem value="" disabled className="menu-item">
                      Select Role
                    </MenuItem>
                    <MenuItem value="Employee" className="menu-item">
                      Employee
                    </MenuItem>
                    {(user.role === "Superadmin" ||
                      user.role === "Administrator") && (
                      <MenuItem value="Manager" className="menu-item">
                        Manager
                      </MenuItem>
                    )}
                    {user.role === "Superadmin" && (
                      <MenuItem value="Administrator" className="menu-item">
                        Administrator
                      </MenuItem>
                    )}
                  </Select>
                  {errors?.role && <p className="error-text">{errors?.role}</p>}
                </div>
                <div className="addemployee-input-container">
                  <label className="label">
                    Location{isWorkFromOffice ? "*" : ""}
                  </label>
                  {/* <select
                    name="location"
                    value={jobForm?.location}
                    data-testid="location-select"
                    onChange={handleJobChange}
                    className="addemployee-input"
                  >
                    <option value="" disabled>
                      Select Location
                    </option>
                    {locations?.map((location) => (
                      <option value={location?._id} key={location?._id}>
                        {location?.locationName}
                      </option>
                    ))}
                  </select> */}
                  <Select
                    name="location"
                    multiple
                    disabled={!jobForm?.isWorkFromOffice}
                    value={jobForm?.location || []}
                    data-testid="location-select"
                    onChange={(event) => {
                      const value = event.target.value;
                      const allLocationIds = locations.map((c) => c._id);

                      if (value[value.length - 1] === "all") {
                        handleJobChange({
                          target: {
                            name: "location",
                            value:
                              jobForm?.location?.length === locations.length
                                ? []
                                : allLocationIds,
                          },
                        });
                        return;
                      }

                      handleJobChange({
                        target: {
                          name: "location",
                          value,
                        },
                      });
                    }}
                    className="addemployee-input-dropdown"
                    displayEmpty
                    MenuProps={{
                      disableAutoFocusItem: true,
                      PaperProps: {
                        style: {
                          maxWidth: 200,
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
                      if (selected.length === 0) {
                        return <>Select Location</>;
                      }
                      const selectedNames = locations
                        ?.filter((location) => selected.includes(location._id))
                        .map((location) => location.locationName)
                        .join(", ");
                      return selectedNames;
                    }}
                  >
                    <ListSubheader>
                      <TextField
                        size="small"
                        placeholder="Search Locations"
                        fullWidth
                        className="search-textfield"
                        value={locationsearchTerm}
                        onChange={(e) => setlocationsearchTerm(e.target.value)}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </ListSubheader>
                    {/* <MenuItem value="" disabled>
                      Select Location
                    </MenuItem> */}
                    {filteredLocationsList?.length > 0 && (
                      <MenuItem value="all">
                        <Checkbox
                          indeterminate={
                            jobForm?.location?.length > 0 &&
                            jobForm?.location?.length < locations.length
                          }
                          checked={
                            jobForm?.location?.length === locations.length
                          }
                        />
                        All Locations
                      </MenuItem>
                    )}
                    {filteredLocationsList.length > 0 ? (
                      filteredLocationsList?.map((location) => (
                        <MenuItem
                          value={location?._id}
                          key={location?._id}
                          className="menu-item"
                        >
                          <Checkbox
                            checked={jobForm?.location?.includes(location._id)}
                          />
                          {location?.locationName}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="" disabled className="menu-item">
                        No found Location
                      </MenuItem>
                    )}
                  </Select>
                  {errors?.location && (
                    <p className="error-text">{errors?.location}</p>
                  )}
                </div>
                <div className="addemployee-input-container">
                  <label className="label">Assign Manager</label>
                  {/* <select
                    name="assignManager"
                    value={jobForm?.assignManager}
                    onChange={handleJobChange}
                    className="addemployee-input"
                    data-testid="assignManager-select"
                    disabled={!jobForm?.location}
                  >
                    <option value="" disabled>
                      Select Manager
                    </option>
                    {filteredAssignees?.length > 0 ? (
                      filteredAssignees?.map((assignee) => (
                        <option value={assignee._id} key={assignee._id}>
                          {assignee.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No assignee available
                      </option>
                    )}
                  </select> */}
                  <Select
                    name="assignManager"
                    value={jobForm?.assignManager}
                    onChange={handleJobChange}
                    className="addemployee-input-dropdown"
                    data-testid="assignManager-select"
                    disabled={!jobForm?.location}
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
                      if (!selected) return "Select Assignee Manager";
                      const found = filteredAssignees?.find(
                        (loc) => loc._id === selected
                      );
                      return found?.name || "Not Found";
                    }}
                  >
                    <ListSubheader>
                      <TextField
                        size="small"
                        placeholder="Search Company"
                        fullWidth
                        className="search-textfield"
                        value={assignmaangersearchTerm}
                        onChange={(e) =>
                          setassignmaangersearchTerm(e.target.value)
                        }
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </ListSubheader>
                    {/* <MenuItem value="" disabled className="menu-item">
                      Select Manager
                    </MenuItem> */}

                    {/* {filteredAssigneesManager?.length > 0 ? (
                      filteredAssigneesManager.map((assignee) => (
                        <MenuItem value={assignee._id} key={assignee._id}>
                          {assignee.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="" disabled>
                        No assignee available
                      </MenuItem>
                    )} */}
                    {filteredAssignees?.length > 0 ? (
                      filteredAssignees?.map((assignee) => (
                        <MenuItem
                          value={assignee._id}
                          key={assignee._id}
                          className="menu-item"
                        >
                          {assignee.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="" disabled className="menu-item">
                        No assignee available
                      </MenuItem>
                    )}
                  </Select>
                  {errors?.assignManager && (
                    <p className="error-text">{errors?.assignManager}</p>
                  )}
                </div>
                {/* <div className="addemployee-input-container">
                  <label className="label">Role</label>
                  <select
                    name="role"
                    value={jobForm?.role}
                    onChange={handleJobChange}
                    className="addemployee-input"
                  >
                    <option value="" disabled>
                      Select Role
                    </option>
                    {console.log(user.role)}
                    <option value="Employee">Employee</option>
                    {(user.role === "Superadmin" ||
                      user.role === "Administrator") && (
                      <option value="Manager">Manager</option>
                    )}
                    {user.role === "Superadmin" && (
                      <option value="Administrator">Administrator</option>
                    )}
                  </select>
                </div> */}
              </div>
              <div className="addemployee-section">
                <div className="addemployee-input-container">
                  <label className="label">
                    Assign Client {!isWorkFromOffice ? "*" : ""}
                  </label>
                  {/* <select
                    name="assignClient"
                    value={jobForm?.assignClient}
                    onChange={handleJobChange}
                    data-testid="assignClient-select"
                    className="addemployee-input"
                  >
                    <option value="">Select Client</option>
                    {clients?.length > 0 ? (
                      clients?.map((client) => (
                        <option value={client._id} key={client._id}>
                          {client?.name}
                        </option>
                      ))
                    ) : (
                      <option value="">No clients available</option>
                    )}
                  </select> */}
                  <Select
                    name="assignClient"
                    multiple
                    disabled={jobForm?.isWorkFromOffice}
                    value={jobForm?.assignClient || []}
                    onChange={(event) => {
                      const value = event.target.value;
                      if (value[value.length - 1] === "all") {
                        const allClientIds = clients.map((c) => c._id);
                        handleJobChange({
                          target: {
                            name: "assignClient",
                            value:
                              jobForm?.assignClient?.length === clients.length
                                ? []
                                : allClientIds,
                          },
                        });
                        return;
                      }
                      handleJobChange({
                        target: {
                          name: "assignClient",
                          value,
                        },
                      });
                    }}
                    data-testid="assignClient-select"
                    className="addemployee-input-dropdown"
                    displayEmpty
                    renderValue={(selected) => {
                      if (selected.length === 0) {
                        return <>Select Client</>;
                      }
                      const selectedNames = clients
                        ?.filter((client) => selected?.includes(client._id))
                        .map((client) => client?.name)
                        .join(", ");
                      return selectedNames;
                    }}
                    MenuProps={{
                      disableAutoFocusItem: true,
                      PaperProps: {
                        style: {
                          maxWidth: 200,
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
                  >
                    <ListSubheader>
                      <TextField
                        size="small"
                        placeholder="Search Client"
                        fullWidth
                        className="search-textfield"
                        value={assignclientsearchTerm}
                        onChange={(e) =>
                          setassignclientsearchTerm(e.target.value)
                        }
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </ListSubheader>
                    {filteredassignClientList?.length > 0 && (
                      <MenuItem value="all">
                        <Checkbox
                          indeterminate={
                            jobForm?.assignClient?.length > 0 &&
                            jobForm?.assignClient?.length < clients.length
                          }
                          checked={
                            jobForm?.assignClient?.length === clients.length
                          }
                        />
                        All Clients
                      </MenuItem>
                    )}
                    {filteredassignClientList?.length > 0 ? (
                      filteredassignClientList?.map((client) => (
                        <MenuItem
                          value={client._id}
                          key={client._id}
                          className="menu-item"
                        >
                          <Checkbox
                            checked={jobForm?.assignClient?.includes(
                              client._id
                            )}
                          />
                          {client.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="" disabled className="menu-item">
                        No found clients
                      </MenuItem>
                    )}
                  </Select>

                  {errors?.assignClient && (
                    <p className="error-text">{errors?.assignClient}</p>
                  )}
                  <div className="addemployee-assign-check">
                    <input
                      type="checkbox"
                      checked={isWorkFromOffice}
                      name="isWorkFromOffice"
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setisWorkFromOffice(isChecked);

                        setJobForm((prevForm) => ({
                          ...prevForm,
                          isWorkFromOffice: isChecked,
                          assignClient: isChecked ? [] : prevForm.assignClient,
                        }));
                      }}
                    />
                    <p>Office Work?</p>
                  </div>
                </div>
                <div className="addemployee-input-container"></div>
                <div className="addemployee-input-container"></div>
                {/* <div className="addemployee-input-container">
                  <label className="label">Assign Template</label>
                  <select
                    name="templateId"
                    value={jobForm?.templateId}
                    onChange={handleJobChange}
                    className="addemployee-input"
                  >
                    <option value="">Select Template</option>
                    {templates?.length > 0 ? (
                      templates?.map((template) => (
                        <option value={template._id} key={template._id}>
                          {template?.templateName}
                        </option>
                      ))
                    ) : (
                      <option value="">No templates available</option>
                    )}
                  </select>
                  {errors?.templateId && (
                    <p className="error-text">{errors?.templateId}</p>
                  )}
                </div> */}
              </div>
              <div className="addemployee-next-button">
                <button onClick={handleAddJob}>
                  {editIndex !== null ? "Update Job" : "Add Job"}
                </button>
              </div>
              {errors?.jobList && (
                <p className="error-text">{errors?.jobList}</p>
              )}
            </div>
            <div className="job-table">
              <h3>Job List</h3>
              <CommonTable
                tableName="EmployeeJob"
                headers={[
                  "Job Title",
                  "Annual Salary",
                  "Joining Date",
                  "Action",
                ]}
                data={jobList?.map((job, i) => ({
                  _id: i,
                  Name: job.jobTitle,
                  annualSalary: job.annualSalary,
                  joiningDate: moment(job.joiningDate).format("DD/MM/YYYY"),
                }))}
                actions={{
                  // ShowdropwornAction,
                  // onAction: handleAction,
                  actionsList: jobActions,
                }}
                isPagination="false"
                handleAction={handleAction}
              />
              {showConfirm && (
                <DeleteConfirmation
                  confirmation={`Are you sure you want to delete the job detail titled <b>${jobName}</b>?`}
                  onConfirm={() => handleRemoveJob(jobId)}
                  onCancel={cancelDelete}
                />
              )}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="addemployee-flex">
            <h1>Address Details</h1>
            <div className="addemployee-section">
              <div className="addemployee-input-container">
                <label className="label">Address*</label>
                <textarea
                  type="text"
                  name="address"
                  value={formData?.addressDetails?.address}
                  onChange={handleChange}
                  className="addemployee-input"
                  placeholder="Enter Address"
                  rows="4"
                />
                {errors?.addressDetails?.address && (
                  <p className="error-text">
                    {errors?.addressDetails?.address}
                  </p>
                )}
              </div>
              <div className="addemployee-input-container">
                <label className="label">Address Line2</label>
                <input
                  type="text"
                  name="addressLine2"
                  className="addemployee-input"
                  value={formData?.addressDetails?.addressLine2}
                  onChange={handleChange}
                  placeholder="Enter Address Line 2"
                />
              </div>
            </div>

            <div className="addemployee-section">
              <div className="addemployee-input-container">
                <label className="label">City*</label>
                <input
                  type="text"
                  name="city"
                  className="addemployee-input"
                  value={formData?.addressDetails?.city}
                  onChange={handleChange}
                  placeholder="Enter City"
                />
                {errors?.addressDetails?.city && (
                  <p className="error-text">{errors?.addressDetails?.city}</p>
                )}
              </div>
              <div className="addemployee-input-container">
                <label className="label">Post Code*</label>
                <input
                  type="text"
                  name="postCode"
                  className="addemployee-input"
                  placeholder="Enter Post Code"
                  value={formData?.addressDetails?.postCode}
                  onChange={handleChange}
                />
                {errors?.addressDetails?.postCode && (
                  <p className="error-text">
                    {errors?.addressDetails?.postCode}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="addemployee-flex">
            <h1>Kin Details</h1>
            <div className="addemployee-section">
              <div className="addemployee-input-container">
                <label className="label">Kin Name*</label>
                <input
                  type="text"
                  name="kinName"
                  value={formData?.kinDetails?.kinName}
                  onChange={handleChange}
                  className="addemployee-input"
                  placeholder="Enter Kin Name"
                />
                {errors?.kinDetails?.kinName && (
                  <p className="error-text">{errors?.kinDetails?.kinName}</p>
                )}
              </div>
              <div className="addemployee-input-container">
                <label className="label">Relationship To You</label>
                {/* <input
                  type="text"
                  name="relationshipToYou"
                  className="addemployee-input"
                  value={formData?.kinDetails?.relationshipToYou}
                  onChange={handleChange}
                  placeholder="Enter Relationship"
                /> */}
                <Select
                  name="relationshipToYou"
                  data-testid="relationshipToYou-select"
                  className="addemployee-input-dropdown"
                  displayEmpty
                  value={formData?.kinDetails?.relationshipToYou || ""}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        width: 150,
                        overflowX: "auto",
                        scrollbarWidth: "thin",
                        maxHeight: 200,
                      },
                    },
                  }}
                  onChange={handleChange}
                >
                  <MenuItem value="" disabled className="menu-item">
                    Select Relationship Type
                  </MenuItem>
                  <MenuItem value="Spouse" className="menu-item">
                    Spouse
                  </MenuItem>
                  <MenuItem value="Child" className="menu-item">
                    Child
                  </MenuItem>
                  <MenuItem value="Friend" className="menu-item">
                    Friend
                  </MenuItem>
                  <MenuItem value="Siblings" className="menu-item">
                    Siblings
                  </MenuItem>
                </Select>
              </div>
              <div className="addemployee-input-container">
                <label className="label">Post Code*</label>
                <input
                  type="text"
                  name="postCode"
                  className="addemployee-input"
                  placeholder="Enter Post Code"
                  value={formData?.kinDetails?.postCode}
                  onChange={handleChange}
                />
                {errors?.kinDetails?.postCode && (
                  <p className="error-text">{errors?.kinDetails?.postCode}</p>
                )}
              </div>
            </div>

            <div className="addemployee-section">
              <div className="addemployee-input-container">
                <label className="label">Address*</label>
                <textarea
                  type="address"
                  name="address"
                  className="addemployee-input"
                  rows="3"
                  value={formData?.kinDetails?.address}
                  onChange={handleChange}
                  placeholder="Enter Address"
                />
                {errors?.kinDetails?.address && (
                  <p className="error-text">{errors?.kinDetails?.address}</p>
                )}
              </div>
              <div className="addemployee-input-container">
                <label className="label">Emergency Contact Number*</label>
                <input
                  type="tel"
                  name="emergencyContactNumber"
                  className="addemployee-input"
                  value={formData?.kinDetails?.emergencyContactNumber}
                  onChange={handleChange}
                  placeholder="Enter Emergency Contact Number"
                />
                {errors?.kinDetails?.emergencyContactNumber && (
                  <p className="error-text">
                    {errors?.kinDetails?.emergencyContactNumber}
                  </p>
                )}
              </div>
              <div className="addemployee-input-container">
                <label className="label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="addemployee-input"
                  value={formData?.kinDetails?.email}
                  onChange={handleChange}
                  placeholder="Enter Email"
                />
                {errors?.kinDetails?.email && (
                  <p className="error-text">{errors?.kinDetails?.email}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="addemployee-flex">
            <h1>Financial Details</h1>
            <div className="addemployee-section">
              <div className="addemployee-input-container">
                <label className="label">Bank Name*</label>
                <input
                  type="text"
                  name="bankName"
                  value={formData?.financialDetails?.bankName}
                  onChange={handleChange}
                  className="addemployee-input"
                  placeholder="Enter Bank Name"
                />
                {errors.financialDetails?.bankName && (
                  <p className="error-text">
                    {errors?.financialDetails?.bankName}
                  </p>
                )}
              </div>
              <div className="addemployee-input-container">
                <label className="label">Name Of Account Holder*</label>
                <input
                  type="text"
                  name="holderName"
                  className="addemployee-input"
                  value={formData?.financialDetails?.holderName}
                  onChange={handleChange}
                  placeholder="Enter Name Of Account Holder"
                />
                {errors?.financialDetails?.holderName && (
                  <p className="error-text">
                    {errors?.financialDetails?.holderName}
                  </p>
                )}
              </div>
              <div className="addemployee-input-container">
                <label className="label">Sort Code*</label>
                <input
                  type="text"
                  name="sortCode"
                  className="addemployee-input"
                  placeholder="Enter Sort Code"
                  value={formData?.financialDetails?.sortCode}
                  onChange={handleChange}
                />
                {errors?.financialDetails?.sortCode && (
                  <p className="error-text">
                    {errors?.financialDetails?.sortCode}
                  </p>
                )}
              </div>
            </div>

            <div className="addemployee-section">
              <div className="addemployee-input-container">
                <label className="label">Account Number*</label>
                <input
                  type="text"
                  name="accountNumber"
                  className="addemployee-input"
                  value={formData?.financialDetails?.accountNumber}
                  onChange={handleChange}
                  placeholder="Enter Account Number"
                />
                {errors?.financialDetails?.accountNumber && (
                  <p className="error-text">
                    {errors?.financialDetails?.accountNumber}
                  </p>
                )}
              </div>
              <div className="addemployee-input-container">
                <label className="label">Payroll Frequency*</label>
                {/* <select
                  name="payrollFrequency"
                  data-testid="payrollFrequency-select"
                  className="addemployee-input"
                  value={formData?.financialDetails?.payrollFrequency}
                  onChange={handleChange}
                >
                  <option value="">Select Payroll Frequency</option>
                  <option value="weekly">WEEKLY</option>
                  <option value="monthly">MONTHLY</option>
                  <option value="yearly">YEARLY</option>
                </select> */}
                <Select
                  name="payrollFrequency"
                  data-testid="payrollFrequency-select"
                  className="addemployee-input-dropdown"
                  value={formData?.financialDetails?.payrollFrequency}
                  onChange={handleChange}
                  displayEmpty
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxWidth: 200,
                        maxHeight: 200,
                        overflowX: "auto",
                        scrollbarWidth: "thin",
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled className="menu-item">
                    Select Payroll Frequency
                  </MenuItem>
                  <MenuItem value="weekly" className="menu-item">
                    WEEKLY
                  </MenuItem>
                  <MenuItem value="monthly" className="menu-item">
                    MONTHLY
                  </MenuItem>
                  <MenuItem value="yearly" className="menu-item">
                    YEARLY
                  </MenuItem>
                </Select>
                {errors?.financialDetails?.payrollFrequency && (
                  <p className="error-text">
                    {errors?.financialDetails?.payrollFrequency}
                  </p>
                )}
              </div>

              <div className="addemployee-input-container ">
                <label className="label">Pension*</label>
                <div className="addemployee-radio-flex">
                  <div className="pension-employee">
                    <label>Opt In</label>
                    <input
                      type="radio"
                      name="pension"
                      data-testid="Pension-select"
                      value="optin"
                      checked={formData?.financialDetails?.pension === "optin"}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="pension-employee">
                    <label>Opt Out</label>
                    <input
                      type="radio"
                      name="pension"
                      value="optout"
                      checked={formData?.financialDetails?.pension === "optout"}
                      onChange={handleChange}
                    />
                    {errors?.financialDetails?.pension && (
                      <p className="error-text">
                        {errors?.financialDetails?.pension}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="addemployee-flex">
            <h1>Immigration Details</h1>
            <div className="addemployee-section">
              <div className="addemployee-input-container">
                <label className="label">Passport Number*</label>
                <input
                  type="text"
                  name="passportNumber"
                  value={formData?.immigrationDetails?.passportNumber}
                  onChange={handleChange}
                  className="addemployee-input"
                  placeholder="Enter Passport Number"
                />
                {errors?.immigrationDetails?.passportNumber && (
                  <p className="error-text">
                    {errors?.immigrationDetails?.passportNumber}
                  </p>
                )}
              </div>
              <div className="addemployee-input-container">
                <label className="label">Country Of Issue*</label>
                {/* <select
                  name="countryOfIssue"
                  className="addemployee-input"
                  data-testid="countryOfIssue-select"
                  value={formData?.immigrationDetails?.countryOfIssue}
                  onChange={handleChange}
                >
                  <option value="" disabled>
                    Select Country Of Issue
                  </option>
                  {countryNames.map((country, index) => (
                    <option key={index} value={country}>
                      {country}
                    </option>
                  ))}
                </select> */}
                <Select
                  name="countryOfIssue"
                  className="addemployee-input-dropdown"
                  data-testid="countryOfIssue-select"
                  value={formData?.immigrationDetails?.countryOfIssue}
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
                      value={countrySearchTerm}
                      onChange={(e) => setcountrySearchTerm(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </ListSubheader>
                  <MenuItem value="" disabled>
                    Select Country
                  </MenuItem>
                  {filteredCountryList?.length > 0 ? (
                    filteredCountryList?.map((country, index) => (
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
                {errors?.immigrationDetails?.countryOfIssue && (
                  <p className="error-text">
                    {errors?.immigrationDetails?.countryOfIssue}
                  </p>
                )}
              </div>
              <div className="addemployee-input-container">
                <label className="label">Passport Expiry*</label>
                <input
                  type="date"
                  name="passportExpiry"
                  className="addemployee-input"
                  data-etstid="passportExpiry-select"
                  value={formData?.immigrationDetails?.passportExpiry}
                  onChange={handleChange}
                  placeholder="DD/MM/YYYY"
                />
                {errors?.immigrationDetails?.passportExpiry && (
                  <p className="error-text">
                    {errors?.immigrationDetails?.passportExpiry}
                  </p>
                )}
              </div>
            </div>
            <div className="addemployee-section">
              <div className="addemployee-input-container">
                <label className="label">Nationality*</label>
                {/* <select
                  name="nationality"
                  className="addemployee-input"
                  data-testid="nationality-select"
                  value={formData?.immigrationDetails?.nationality}
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
                  name="nationality"
                  className="addemployee-input-dropdown"
                  data-testid="nationality-select"
                  value={formData?.immigrationDetails?.nationality}
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
                    if (!selected) return "Select Nationality";
                    const found = countryNames.find((emp) => emp === selected);
                    return found || "No found";
                  }}
                >
                  <ListSubheader>
                    <TextField
                      size="small"
                      placeholder="Search Nationality"
                      fullWidth
                      className="search-textfield"
                      value={nationalitysearchTerm}
                      onChange={(e) => setnationalitysearchTerm(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </ListSubheader>
                  <MenuItem value="" disabled className="menu-item">
                    Select Nationality
                  </MenuItem>
                  {filterednationalityList.length > 0 ? (
                    filterednationalityList.map((country, index) => (
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
                      No Nationality found
                    </MenuItem>
                  )}
                </Select>
                {errors?.immigrationDetails?.nationality && (
                  <p className="error-text">
                    {errors?.immigrationDetails?.nationality}
                  </p>
                )}
              </div>
              <div className="addemployee-input-container">
                <label className="label">Visa Category</label>
                {/* <select
                  name="visaCategory"
                  className="addemployee-input"
                  data-testid="visaCategory-select"
                  value={formData?.immigrationDetails?.visaCategory}
                  onChange={handleChange}
                >
                  <option value="" disabled>
                    Select Visa Category
                  </option>
                  {VisaCategory.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select> */}
                <Select
                  name="visaCategory"
                  className="addemployee-input-dropdown"
                  data-testid="visaCategory-select"
                  value={formData?.immigrationDetails?.visaCategory}
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
                    if (!selected) return "Select Visa Category";
                    const found = VisaCategory.find((emp) => emp === selected);
                    return found || "No found";
                  }}
                >
                  <ListSubheader>
                    <TextField
                      size="small"
                      placeholder="Search Visa Category"
                      fullWidth
                      className="search-textfield"
                      value={visasearchTerm}
                      onChange={(e) => setvisasearchTerm(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </ListSubheader>
                  <MenuItem value="" disabled>
                    Select Visa Category
                  </MenuItem>
                  {filteredvisaList.length > 0 ? (
                    filteredvisaList.map((country) => (
                      <MenuItem
                        key={country}
                        value={country}
                        className="menu-item"
                      >
                        {country}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled className="menu-item">
                      No Visa Category found
                    </MenuItem>
                  )}
                </Select>
              </div>
              <div className="addemployee-input-container">
                <label className="label">BRP Number</label>
                <input
                  type="text"
                  name="brpNumber"
                  className="addemployee-input"
                  value={formData?.immigrationDetails?.brpNumber}
                  onChange={handleChange}
                  placeholder="Enter BRP Number"
                />
                {errors?.immigrationDetails?.brpNumber && (
                  <p className="error-text">
                    {errors?.immigrationDetails?.brpNumber}
                  </p>
                )}
              </div>
            </div>
            <div className="addemployee-section">
              <div className="addemployee-input-container">
                <label className="label">CoS Number</label>
                <input
                  type="text"
                  name="cosNumber"
                  className="addemployee-input"
                  value={formData?.immigrationDetails?.cosNumber}
                  onChange={handleChange}
                  placeholder="Enter CoS Number"
                />
                {errors?.immigrationDetails?.cosNumber && (
                  <p className="error-text">
                    {errors?.immigrationDetails?.cosNumber}
                  </p>
                )}
              </div>
              <div className="addemployee-input-container">
                <label className="label">Visa Valid From</label>
                <input
                  type="date"
                  name="visaValidFrom"
                  className="addemployee-input"
                  value={formData?.immigrationDetails?.visaValidFrom}
                  onChange={handleChange}
                  placeholder="Enter Visa Valid From"
                />
              </div>
              <div className="addemployee-input-container">
                <label className="label">Visa Valid To</label>
                <input
                  type="date"
                  name="visaValidTo"
                  className="addemployee-input"
                  value={formData?.immigrationDetails?.visaValidTo}
                  onChange={handleChange}
                  placeholder="Enter Visa Valid To"
                />
              </div>
            </div>
            <div className="addemployee-section">
              <div className="addemployee-input-container">
                <label className="label">Restriction</label>
                <input
                  type="text"
                  name="restriction"
                  value={formData?.immigrationDetails?.restriction}
                  onChange={handleChange}
                  className="addemployee-input"
                  placeholder="Enter Restriction"
                />
              </div>
              <div className="addemployee-input-container">
                <label className="label">Share Code</label>
                <input
                  type="text"
                  name="shareCode"
                  className="addemployee-input"
                  value={formData?.immigrationDetails?.shareCode}
                  onChange={handleChange}
                  placeholder="Enter Share Code"
                />
              </div>
              <div className="addemployee-input-container">
                <label className="label">Right To Work Check Date*</label>
                <input
                  type="date"
                  name="rightToWorkCheckDate"
                  className="addemployee-input"
                  value={formData?.immigrationDetails?.rightToWorkCheckDate}
                  onChange={handleChange}
                  placeholder="Enter Right To Work Check Date"
                />
                {errors?.immigrationDetails?.rightToWorkCheckDate && (
                  <p className="error-text">
                    {errors?.immigrationDetails?.rightToWorkCheckDate}
                  </p>
                )}
              </div>
            </div>
            <div className="addemployee-section">
              <div className="addemployee-input-container">
                <label className="label">Right To Work End Date</label>
                <input
                  type="date"
                  name="rightToWorkEndDate"
                  className="addemployee-input"
                  value={formData?.immigrationDetails?.rightToWorkEndDate}
                  onChange={handleChange}
                  placeholder="Enter Right To Work End Date"
                />
              </div>
              <div className="addemployee-input-container"></div>
              <div className="addemployee-input-container"></div>
            </div>
          </div>
        )}

        {currentStep === 6 && (
          <div className="addemployee-flex">
            <h1>Document Details</h1>
            <div className="addemployee-section">
              <div className="addemployee-input-container">
                <label className="label">Document Type</label>
                {/* <select
                  name="documentType"
                  className="addemployee-input"
                  data-testid="documentType-select"
                  value={file?.documentType}
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
                  className="addemployee-input-dropdown"
                  data-testid="documentType-select"
                  value={file?.documentType}
                  onChange={(e) =>
                    handleInputChange("documentType", e?.target?.value)
                  }
                  displayEmpty
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxWidth: 100,
                        maxHeight: 200,
                        overflowX: "auto",
                        scrollbarWidth: "thin",
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    Select Document Type
                  </MenuItem>
                  <MenuItem value="ID Proof" className="menu-item">
                    ID Proof
                  </MenuItem>
                  <MenuItem value="Immigration" className="menu-item">
                    Immigration
                  </MenuItem>
                  <MenuItem value="Address Proof" className="menu-item">
                    Address Proof
                  </MenuItem>
                  <MenuItem value="Passport" className="menu-item">
                    Passport
                  </MenuItem>
                </Select>
                {errors?.documentType && (
                  <p className="error-text">{errors?.documentType}</p>
                )}
              </div>
              <div className="addemployee-input-container">
                <label className="label">Document</label>
                {/* <input
                  type="file"
                  name="document"
                  data-testid="Document-select"
                  className="addemployee-input"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  multiple
                /> */}
                <div className="addemployee-file-contract">
                  <label
                    htmlFor="file-upload"
                    className="addemployee-custom-file-upload"
                  >
                    Choose File
                  </label>
                  <input
                    type="file"
                    id="file-upload"
                    name="document"
                    data-testid="Document-select"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    multiple
                    className="addemployee-input"
                    style={{ display: "none" }}
                  />
                </div>
                {file?.files?.length > 0 && (
                  <div className="addemployee-fileupload-frame">
                    <div className="addemployee-fileupload-name">
                      {file.files.map((fileItem, index) => (
                        <div key={index} className="uploadfile-flex">
                          <p>
                            {fileItem?.name.length > 15
                              ? `${fileItem.name.slice(0, 15)}...`
                              : fileItem.name}
                          </p>
                          <p>
                            <MdCancel
                              onClick={() => handleDeleteFile(index)}
                              className="File-upload-delete"
                            />
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {errors?.document && (
                  <p className="error-text">{errors?.document}</p>
                )}
              </div>
              <div className="addemployee-input-container addemploye-document-flex">
                <button
                  onClick={handleAddDocument}
                  className="addemployee-input flex"
                >
                  <IoAddOutline />
                </button>
              </div>
            </div>
            {documentDetails?.length > 0 && (
              <div className="employee-document">
                <h3>Upload Document Details</h3>
                <CommonTable
                  tableName="EmployeeDocument"
                  headers={["Document Type", "Document Name", "Action"]}
                  data={documentDetails?.map((document, id) => ({
                    _id: id,
                    Name: document.documentType,
                    document: document.documents.map((doc) => doc.documentName),
                  }))}
                  actions={{
                    // ShowdropwornAction,
                    // onAction: handleAction,
                    actionsList: documentActions,
                  }}
                  handleAction={handleAction}
                  isPagination="false"
                />
                {showConfirm && (
                  <DeleteConfirmation
                    confirmation={`Are you sure you want to delete the document titled <b>${documentName}</b>?`}
                    onConfirm={() => handleRemoveDocument(documentId)}
                    onCancel={cancelDelete}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {currentStep === 7 && (
          <div className="addemployee-flex">
            <h1>Contract Details</h1>
            {/* <div className="addemployee-section">
              <div className="addemployee-input-container">
                <label className="label">Contract Type</label>
                <select
                  className="addemployee-input"
                  name="contractType"
                  value={formData?.contractDetails?.contractType}
                  onChange={handleChange}
                >
                  <option value="">Select Contract Type</option>
                  {contracts?.map((contract) => (
                    <option value={contract?._id} key={contract?._id}>
                      {contract.contractType}
                    </option>
                  ))}
                  <option value="fulltime">Full Time</option>
                  <option value="parttime">Part Time</option>
                </select>
              </div>
              <div className="addemployee-input-container">
                <label className="label">Contract Document</label>
                <select
                  name="contractDocument"
                  className="addemployee-input"
                  value={formData?.contractDetails?.contractDocument}
                  onChange={handleChange}
                >
                  <option value="">Select Contract Document</option>
                  {contracts?.map((contract) => (
                    <option value={contract?._id} key={contract?._id}>
                      {contract.contractType}
                    </option>
                  ))}
                </select>
              </div>
            </div> */}
            <div className="addemployee-section">
              <div className="addemployee-input-container">
                <label className="label">Contract Type</label>
                {/* <select
                  className="addemployee-input"
                  name="contractType"
                  data-testid="contractType-select"
                  value={formData?.contractDetails?.contractType}
                  onChange={(e) => {
                    handleChange(e);
                    const selectedContract = contracts.find(
                      (contract) => contract._id === e.target.value
                    );
                    setFormData((prev) => ({
                      ...prev,
                      contractDetails: {
                        ...prev.contractDetails,
                        contractDocument: selectedContract
                          ? selectedContract.contractDocument
                          : "",
                      },
                    }));
                  }}
                >
                  <option value="">Select Contract Type</option>
                  {contracts?.map((contract) => (
                    <option value={contract?._id} key={contract?._id}>
                      {contract.contractType}
                    </option>
                  ))}
                </select> */}
                <Select
                  name="contractType"
                  data-testid="contractType-select"
                  className="addemployee-input-dropdown"
                  displayEmpty
                  value={formData?.contractDetails?.contractType || ""}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        width: 200,
                        overflowX: "auto",
                        scrollbarWidth: "thin",
                        maxHeight: 200,
                      },
                    },
                  }}
                  onChange={handleChange}
                >
                  <MenuItem value="" disabled className="menu-item">
                    Select Contract Type
                  </MenuItem>
                  <MenuItem value="FullTime" className="menu-item">
                    Full Time
                  </MenuItem>
                  <MenuItem value="PartTime" className="menu-item">
                    Part Time
                  </MenuItem>
                  <MenuItem value="FixTerm" className="menu-item">
                    Fix Term
                  </MenuItem>
                </Select>
              </div>

              <div className="addemployee-input-container">
                <label className="label">Contract Document</label>
                {/* <select
                  name="contractDocument"
                  className="addemployee-input"
                  data-testid="contractDocument-select"
                  value={formData?.contractDetails?.contractDocument}
                  // disabled={!formData?.contractDetails?.contractType}
                  disabled
                  onChange={handleChange}
                >
                  <option value="">Select Contract Document</option>
                  {contracts
                    ?.filter(
                      (contract) =>
                        contract._id === formData?.contractDetails?.contractType
                    )
                    ?.map((contract) => (
                      <option
                        value={contract.contractDocument}
                        key={contract._id}
                      >
                        {contract.contractDocument}
                      </option>
                    ))}
                </select> */}
                <Select
                  name="contractDocument"
                  className="addemployee-input-dropdown"
                  data-testid="contractDocument-select"
                  value={formData?.contractDetails?.contractDocument || ""}
                  displayEmpty
                  onChange={handleChange}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        width: 150,
                        overflowX: "auto",
                        scrollbarWidth: "thin",
                        maxHeight: 200,
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled>
                    Select Contract Document
                  </MenuItem>
                  {contracts?.map((contract) => (
                    <MenuItem value={contract?._id} key={contract?._id}>
                      {contract.contractType}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* <div className="addemployee-next-button">
        <button onClick={prevStep} disabled={currentStep === 0}>
          Previous
        </button>
        <button onClick={nextStep} data-testid="next-button">
          {currentStep === steps.length - 1 ? "Submit" : "Next"}
        </button>
      </div> */}

      {!id && currentStep !== 0 && currentStep !== steps.length - 1 && (
        <div className="addemployee-check-save">
          <input
            type="checkbox"
            checked={isSaveForm}
            onChange={(e) => setIsSaveForm(e.target.checked)}
          />
          <p>You want to save Form?</p>
        </div>
      )}

      {currentStep < steps.length && (
        <div className="addemployee-next-button">
          <button
            onClick={prevStep}
            disabled={
              (employeeFormFilled && currentStep < 1) ||
              (user._id === id && !employeeFormFilled && currentStep < 3)
            }
          >
            Previous
          </button>
          <button onClick={nextStep}>
            {currentStep === steps.length - 1
              ? id
                ? "Update"
                : "Submit"
              : "Next"}
          </button>
          {/* {currentStep !== 0 &&
            id &&
            currentStep !== steps.length - 1 &&
            employeeFormFilled && (
              <button onClick={handleSaveClick}>Save</button>
            )}
          {currentStep !== 0 &&
            currentStep !== steps.length - 1 &&
            !id &&
            employeeFormFilled && (
              <button onClick={handleSaveClick}>Save1</button>
            )} */}
          {/* {currentStep !== 0 &&
            currentStep !== steps.length - 1 &&
            employeeFormFilled && (
              <button onClick={handleSaveClick}>Save</button>
            )} */}
          {/* {((currentStep !== 0 &&
            currentStep !== steps.length - 1 &&
            employeeFormFilled) ||
            (currentStep === 0 && id && employeeFormFilled)) && (
            <button onClick={handleSaveClick}>Save</button>
          )} */}
          {((currentStep !== 0 &&
            currentStep !== steps.length - 1 &&
            employeeFormFilled) ||
            (currentStep === 0 && id && !isSaveForm)) && (
            <button
              onClick={handleSaveClick}
              disabled={!(isSaveForm || (id && employeeFormFilled))}
            >
              Save
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AddEmployee;
