import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { IoAddOutline } from "react-icons/io5";
import "./AddEmployee.css";
import { GetCall, PostCall } from "../../ApiServices";
import Loader from "../Helper/Loader";
import { showToast } from "../../main/ToastManager";
import { FaCheck } from "react-icons/fa";
import { useSelector } from "react-redux";
import DeleteConfirmation from "../../main/DeleteConfirmation";
import CommonTable from "../../SeparateCom/CommonTable";
import countryNames from "../../Data/AllCountryList.json";

const AddEmployee = () => {
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
  const [templates, setTemplates] = useState([]);
  const [documentDetails, setDocumentDetails] = useState([]);
  const [jobList, setJobList] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const fileInputRef = useRef(null);
  const { id } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [companyId, setCompanyId] = useState(queryParams.get("companyId"));
  const [file, setFile] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
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
      sendRegistrationLink: false,
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
    // companyId,
  });

  const [jobForm, setJobForm] = useState({
    jobTitle: "",
    jobDescription: "",
    annualSalary: 0,
    hourlyRate: 0,
    weeklyWorkingHours: 0,
    weeklyWorkingHoursPattern: "",
    weeklySalary: 0,
    joiningDate: "",
    socCode: "", //set validation
    modeOfTransfer: "",
    sickLeavesAllow: 0,
    leavesAllow: 0,
    location: "",
    assignManager: "",
    assignClient: "",
    templateId: "",
    role: "",
  });

  const steps = [
    "Personal Details",
    "Address Details",
    "Kin Details",
    "Financial Details",
    "Job Details",
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
        try {
          setLoading(true);
          let response;
          if (id) {
            response = await PostCall(`/updateUser/${id}`, data);
          } else {
            response = await PostCall("/addUser", data);
          }

          if (response?.data?.status === 200) {
            showToast(response?.data?.message, "success");
            navigate("/employees");
          } else {
            showToast(response?.data?.message, "error");
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

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveClick = async () => {
    const isValid = validate();
    if (isValid) {
      const data = {
        ...formData,
      };
      setLoading(true);
      try {
        const response = await PostCall(`/updateUser/${id}`, data);
        if (response?.data?.status === 200) {
          showToast(response?.data?.message, "success");
        } else {
          showToast(response?.data?.message, "error");
        }
        // navigate("/employees");
      } catch (error) {
        showToast(error, "error");
      } finally {
        setLoading(false);
      }
    } else {
      console.log("Validation failed for current step");
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
      1: "addressDetails",
      2: "kinDetails",
      3: "financialDetails",
      4: "jobDetails",
      5: "immigrationDetails",
      6: "documentDetails",
      7: "contractDetails",
    };

    const sectionKey = sectionKeys[currentStep];

    if (!sectionKey) {
      console.error(`Invalid section key for step: ${currentStep}`);
      return;
    }

    let updatedValue = isCheckbox ? checked : value;

    if (name === "sortCode") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 6);

      if (digitsOnly.length <= 2) {
        updatedValue = digitsOnly;
        // console.log("updatedValue", updatedValue);
      } else if (digitsOnly.length <= 4) {
        updatedValue = `${digitsOnly.slice(0, 2)}-${digitsOnly.slice(2)}`;
      } else {
        updatedValue = `${digitsOnly.slice(0, 2)}-${digitsOnly.slice(
          2,
          4
        )}-${digitsOnly.slice(4)}`;
      }
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      [sectionKey]: {
        ...prevFormData[sectionKey],
        [name]: updatedValue,
      },
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile((prevData) => ({
        ...prevData,
        document: file,
        fileName: file.name,
      }));
    }
  };

  const handleInputChange = (field, value) => {
    setFile({ ...file, [field]: value });
  };

  // const handleJobChange = (e) => {
  //   const { name, value } = e.target;
  //   setJobForm((prev) => ({ ...prev, [name]: value }));
  // };

  const handleJobChange = (e) => {
    const { name, value } = e.target;

    setJobForm((prev) => {
      let updatedForm = { ...prev, [name]: value };

      // Auto-update assignManager when role is changed
      if (name === "role") {
        updatedForm.assignManager = ""; // Reset assignManager when role changes
      }

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

  const handleAddDocument = () => {
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

    const newDocument = {
      // id: Date.now(),
      documentType: file?.documentType,
      document: file?.document,
      documentName: file?.fileName,
    };

    setDocumentDetails((prevDocuments) => [...prevDocuments, newDocument]);
    if (file.documentType) {
      file.documentType = "";
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      file.document = "";
    }

    setErrors({});
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
    if (jobForm?.location === "") {
      newErrors.location = "Location is required";
    }
    if (jobForm?.assignManager === "") {
      newErrors.assignManager = "Assign Manager is required";
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
      sickLeavesAllow: "",
      leavesAllow: "",
      location: "",
      assignManager: "",
      assignClient: "",
      templateId: "",
      role: "",
    });
    setErrors({});
  };

  const handleEditJob = (index) => {
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
    const currentStepName = steps[currentStep];
    // const sortCodeError = /^\d{2}-\d{2}-\d{2}$/;
    const EMAIL_REGEX = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    //const NI_REGEX = /^[A-Z]{2}\d{6}[A-Z]?$/;
    // console.log("validate current step", currentStepName);

    switch (currentStepName) {
      case "Personal Details":
        if (!formData?.personalDetails?.firstName?.trim()) {
          newErrors.firstName = "First Name is required";
        }
        if (!formData?.personalDetails?.lastName) {
          newErrors.lastName = "Last Name is required";
        }
        if (!formData.personalDetails?.dateOfBirth) {
          newErrors.dateOfBirth = "Date of Birth is required";
        }
        if (!formData.personalDetails?.gender) {
          newErrors.gender = "Gender is required";
        }
        if (!formData.personalDetails?.maritalStatus) {
          newErrors.maritalStatus = "Marital Status is required";
        }
        if (!formData?.personalDetails?.phone) {
          newErrors.phone = "Phone number is required";
        } else if (!/^\d+$/.test(formData.personalDetails.phone)) {
          newErrors.phone = "Phone number must contain only numbers";
        } else if (!/^\d{11}$/.test(formData.personalDetails.phone)) {
          newErrors.phone = "Phone number must be exactly 11 digits";
        }
        const email = formData?.personalDetails?.email;
        if (!email) {
          newErrors.email = "Email is required";
        } else if (!EMAIL_REGEX.test(email)) {
          newErrors.email = "Valid Email format is required";
        }
        if (!formData.personalDetails?.sendRegistrationLink) {
          newErrors.sendRegistrationLink =
            "Please check the box to send the registration link.";
        }
        break;

      case "Address Details":
        if (!formData?.addressDetails?.address) {
          newErrors.address = "Address is required";
        }
        if (!formData?.addressDetails?.city) {
          newErrors.city = "City is required";
        }
        if (!formData?.addressDetails?.postCode) {
          newErrors.postCode = "Post Code is required";
        }
        break;

      case "Kin Details":
        if (!formData?.kinDetails?.kinName) {
          newErrors.kinName = "Kin name is required";
        }
        if (!formData?.kinDetails?.postCode) {
          newErrors.kinPostCode = "Post Code is required";
        }
        if (!formData?.kinDetails?.address) {
          newErrors.kinAddress = "Address is required";
        }
        if (!formData?.kinDetails?.emergencyContactNumber) {
          newErrors.emergencyContactNumber =
            "Emergency Contact Number is required";
        } else if (
          !/^\d+$/.test(formData?.kinDetails?.emergencyContactNumber)
        ) {
          newErrors.emergencyContactNumber =
            "Emergency Contact Number must contain only numbers";
        } else if (
          !/^\d{11}$/.test(formData?.kinDetails?.emergencyContactNumber)
        ) {
          newErrors.emergencyContactNumber =
            "Emergency Contact Number must be exactly 11 digits";
        }
        break;

      case "Financial Details":
        if (!formData.financialDetails?.bankName) {
          newErrors.bankName = "Bank Name is required";
        }
        if (!formData.financialDetails?.holderName) {
          newErrors.holderName = "Holder Name is required";
        }

        const sortCode = formData?.financialDetails?.sortCode;
        const sortCodeError = /^\d{2}-\d{2}-\d{2}$/;

        if (!sortCode) {
          newErrors.sortCode = "Sort code is required";
        } else if (!sortCodeError.test(sortCode)) {
          newErrors.sortCode = "Valid sort code format is required (xx-xx-xx)";
        }

        // if (!formData.financialDetails?.sortCode) {
        //   newErrors.sortCode = "Sort Code is required";
        // }
        const accountNumber = formData.financialDetails?.accountNumber;
        if (!accountNumber) {
          newErrors.accountNumber = "Account Number is required";
        } else if (!/^\d{8}$/.test(accountNumber)) {
          newErrors.accountNumber = "Account Number must be exactly 8 digits";
        }

        if (!formData.financialDetails?.payrollFrequency) {
          newErrors.payrollFrequency = "Payroll Frequency is required";
        }
        if (!formData.financialDetails?.pension) {
          newErrors.pension = "Pension option is required";
        }
        break;

      case "Job Details":
        if (jobList.length <= 0) {
          newErrors.jobList = "Atleast one Jobtype is required";
          showToast("Atleast one Jobtype is required", "error");
        }
        if (editIndex !== null) {
          newErrors.jobList = "Please update Job Details";
          showToast("Please update Job Details", "error");
        }
        break;

      case "Immigration Details":
        if (!formData.immigrationDetails?.passportNumber) {
          newErrors.passportNumber = "Passport Number is required";
        }
        if (!formData.immigrationDetails?.countryOfIssue) {
          newErrors.countryOfIssue = "Country Of Issue is required";
        }
        if (!formData.immigrationDetails?.passportExpiry) {
          newErrors.passportExpiry = "Passport Expiry is required";
        }
        if (!formData.immigrationDetails?.nationality) {
          newErrors.nationality = "Nationality is required";
        }
        if (!formData.immigrationDetails?.rightToWorkCheckDate) {
          newErrors.rightToWorkCheckDate =
            "Right To WorkCheck Date is required";
        }
        break;

      default:
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const GetEmployeeDetails = async (id) => {
    try {
      setLoading(true);
      const User = await GetCall(`/getUser/${id}`);
      if (User?.data?.status === 200) {
        // GetAllLocations();
        setDocumentDetails(User?.data?.user?.documentDetails);
        setFormData(User?.data?.user);
        setJobList(User?.data?.user?.jobDetails);
        setCompanyId(User?.data?.user?.companyId);
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
    // console.log("ValueRemove", ValueRemove);
    setJobForm((prev) => ({
      ...prev,
      [name]: ValueRemove,
    }));
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

  useEffect(() => {
    if (id) {
      GetEmployeeDetails(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (companyId) {
      GetAllLocations(companyId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  useEffect(() => {
    if (!companyId && !id) GetAllLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const GetAllLocations = async () => {
    try {
      setLoading(true);
      let Company;
      if (companyId) {
        Company = await GetCall(`/getCompanyLocations?companyId=${companyId}`);
      } else {
        Company = await GetCall(`/getCompanyLocations`);
      }
      if (Company?.data?.status === 200) {
        setLocations(Company?.data?.companiesAllLocations);
        setContracts(Company?.data?.contracts);
        setClients(Company?.data?.clients);
        setTemplates(Company?.data?.templates);
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
    if (!jobForm.location || !jobForm.role) return;

    const selectedLocation = locations.find(
      (location) => location._id === jobForm.location
    );

    const currentAssignees = selectedLocation?.assignee || [];
    setAssignee(currentAssignees);

    let filtered = [];

    if (jobForm.role === "Employee") {
      filtered = currentAssignees.filter((a) => a.role === "Manager");
    } else if (jobForm.role === "Manager") {
      filtered = currentAssignees.filter((a) => a.role === "Administrator");
    } else if (jobForm.role === "Administrator") {
      filtered = currentAssignees.filter((a) => a.role === "Superadmin");
    }

    setFilteredAssignees(filtered);

    if (filtered.length === 0) {
      showToast(
        "No assignee available for the selected role and location.",
        "error"
      );
    }
  }, [jobForm.location, jobForm.role, locations]);

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
                {errors?.firstName && (
                  <p className="error-text">{errors?.firstName}</p>
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
                {errors.lastName && (
                  <p className="error-text">{errors.lastName}</p>
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
                {errors?.dateOfBirth && (
                  <p className="error-text">{errors?.dateOfBirth}</p>
                )}
              </div>
              <div className="addemployee-input-container">
                <label className="label">Select Gender*</label>
                <select
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
                </select>
                {errors?.gender && (
                  <p className="error-text">{errors?.gender}</p>
                )}
              </div>

              <div className="addemployee-input-container">
                <label className="label">Marital Status*</label>
                <select
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
                </select>
                {errors?.maritalStatus && (
                  <p className="error-text">{errors?.maritalStatus}</p>
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
                {errors?.phone && <p className="error-text">{errors?.phone}</p>}
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
                {errors?.homeTelephone && (
                  <p className="error-text">{errors?.homeTelephone}</p>
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
                {errors?.email && <p className="error-text">{errors?.email}</p>}
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
                {errors?.niNumber && (
                  <p className="error-text">{errors?.niNumber}</p>
                )}
              </div>
              <div className="addemployee-input-container"></div>
              <div className="addemployee-input-container"></div>
            </div>

            <div className="addemployee-registration-link">
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
            )}
          </div>
        )}

        {currentStep === 1 && (
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
                {errors?.address && (
                  <p className="error-text">{errors?.address}</p>
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
                {errors?.city && <p className="error-text">{errors?.city}</p>}
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
                {errors?.postCode && (
                  <p className="error-text">{errors?.postCode}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
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
                {errors?.kinName && (
                  <p className="error-text">{errors?.kinName}</p>
                )}
              </div>
              <div className="addemployee-input-container">
                <label className="label">Relationship To You</label>
                <input
                  type="text"
                  name="relationshipToYou"
                  className="addemployee-input"
                  value={formData?.kinDetails?.relationshipToYou}
                  onChange={handleChange}
                  placeholder="Enter Relationship"
                />
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
                {errors?.kinPostCode && (
                  <p className="error-text">{errors?.kinPostCode}</p>
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
                {errors?.kinAddress && (
                  <p className="error-text">{errors?.kinAddress}</p>
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
                {errors.emergencyContactNumber && (
                  <p className="error-text">{errors?.emergencyContactNumber}</p>
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
                {errors?.kinemail && (
                  <p className="error-text">{errors?.kinemail}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
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
                {errors.bankName && (
                  <p className="error-text">{errors?.bankName}</p>
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
                {errors?.holderName && (
                  <p className="error-text">{errors?.holderName}</p>
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
                {errors?.sortCode && (
                  <p className="error-text">{errors?.sortCode}</p>
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
                {errors?.accountNumber && (
                  <p className="error-text">{errors?.accountNumber}</p>
                )}
              </div>
              <div className="addemployee-input-container">
                <label className="label">Payroll Frequency*</label>
                <select
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
                </select>
                {errors?.payrollFrequency && (
                  <p className="error-text">{errors?.payrollFrequency}</p>
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
                    {errors?.pension && (
                      <p className="error-text">{errors?.pension}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div>
            <div className="addemployee-flex">
              <h1>Job Details</h1>
              <div className="addemployee-section">
                <div className="addemployee-input-container">
                  <label className="label">Job Title*</label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={jobForm?.jobTitle}
                    onChange={handleJobChange}
                    className="addemployee-input"
                    placeholder="Enter Job Title"
                  />
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
                  <label className="label">Mode Of Transfe</label>
                  <select
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
                  </select>
                </div>
                <div className="addemployee-input-container">
                  <label className="label">No. Of sick leaves allowed</label>
                  <input
                    type="number"
                    name="sickLeavesAllow"
                    className="addemployee-input"
                    value={jobForm?.sickLeavesAllow}
                    onChange={handleJobChange}
                    placeholder="Enter No. Of sick leaves allowed"
                  />
                </div>
                <div className="addemployee-input-container">
                  <label className="label">No. Of leaves allowed</label>
                  <input
                    type="number"
                    name="leavesAllow"
                    className="addemployee-input"
                    value={jobForm?.leavesAllow}
                    onChange={handleJobChange}
                    placeholder="Enter No. Of leaves allowed"
                  />
                </div>
              </div>
              <div className="addemployee-section">
                <div className="addemployee-input-container">
                  <label className="label">Role*</label>
                  <select
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
                  </select>
                  {errors?.role && <p className="error-text">{errors?.role}</p>}
                </div>
                <div className="addemployee-input-container">
                  <label className="label">Location*</label>
                  <select
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
                  </select>
                  {errors?.location && (
                    <p className="error-text">{errors?.location}</p>
                  )}
                </div>
                <div className="addemployee-input-container">
                  <label className="label">Assign Manager*</label>
                  <select
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
                  </select>
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
                  <label className="label">Assign Client</label>
                  <select
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
                  </select>
                  {/* {errors?.assignClient && (
                    <p className="error-text">{errors?.assignClient}</p>
                  )} */}
                </div>
                <div className="addemployee-input-container">
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
                  {/* {errors?.templateId && (
                    <p className="error-text">{errors?.templateId}</p>
                  )} */}
                </div>
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
                headers={[
                  "Job Title",
                  "Annual Salary",
                  "Joining Date",
                  "Action",
                ]}
                data={jobList?.map((job, i) => ({
                  _id: i,
                  name: job.jobTitle,
                  annualSalary: job.annualSalary,
                  joiningDate: job.joiningDate,
                }))}
                actions={{
                  // ShowdropwornAction,
                  // onAction: handleAction,
                  actionsList: jobActions,
                }}
                isPagination="false"
                handleAction={handleAction}
                isSearchQuery={false}
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
                {errors?.passportNumber && (
                  <p className="error-text">{errors?.passportNumber}</p>
                )}
              </div>
              <div className="addemployee-input-container">
                <label className="label">Country Of Issue*</label>
                <select
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
                </select>
                {errors?.countryOfIssue && (
                  <p className="error-text">{errors?.countryOfIssue}</p>
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
                {errors?.passportExpiry && (
                  <p className="error-text">{errors?.passportExpiry}</p>
                )}
              </div>
            </div>
            <div className="addemployee-section">
              <div className="addemployee-input-container">
                <label className="label">Nationality*</label>
                <select
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
                </select>
                {errors?.nationality && (
                  <p className="error-text">{errors?.nationality}</p>
                )}
              </div>
              <div className="addemployee-input-container">
                <label className="label">Visa Category</label>
                <select
                  name="visaCategory"
                  className="addemployee-input"
                  data-testid="visaCategory-select"
                  value={formData?.immigrationDetails?.visaCategory}
                  onChange={handleChange}
                >
                  <option value="" disabled>
                    Select Visa Category
                  </option>
                  {countryNames.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
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
                {errors?.brpNumber && (
                  <p className="error-text">{errors?.brpNumber}</p>
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
                {errors?.cosNumber && (
                  <p className="error-text">{errors?.cosNumber}</p>
                )}
              </div>
              <div className="addemployee-input-container">
                <label className="label">visa Valid From</label>
                <input
                  type="date"
                  name="visaValidFrom"
                  className="addemployee-input"
                  value={formData?.immigrationDetails?.visaValidFrom}
                  onChange={handleChange}
                  placeholder="Enter visa Valid From"
                />
              </div>
              <div className="addemployee-input-container">
                <label className="label">visa Valid To</label>
                <input
                  type="date"
                  name="visaValidTo"
                  className="addemployee-input"
                  value={formData?.immigrationDetails?.visaValidTo}
                  onChange={handleChange}
                  placeholder="Enter visa Valid To"
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
                {errors?.rightToWorkCheckDate && (
                  <p className="error-text">{errors?.rightToWorkCheckDate}</p>
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
                <select
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
                </select>
                {errors?.documentType && (
                  <p className="error-text">{errors?.documentType}</p>
                )}
              </div>
              <div className="addemployee-input-container">
                <label className="label">Document</label>
                <input
                  type="file"
                  name="document"
                  data-testid="Document-select"
                  className="addemployee-input"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  multiple
                />
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
                  headers={["Document Type", "Document Name", "Action"]}
                  data={documentDetails?.map((document, id) => ({
                    _id: id,
                    name: document.documentType,
                    document: document.documentName,
                  }))}
                  actions={{
                    // ShowdropwornAction,
                    // onAction: handleAction,
                    actionsList: documentActions,
                  }}
                  handleAction={handleAction}
                  isPagination="false"
                  isSearchQuery={false}
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
                <select
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
                </select>
              </div>

              <div className="addemployee-input-container">
                <label className="label">Contract Document</label>
                <select
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
                </select>
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

      {currentStep < steps.length && (
        <div className="addemployee-next-button">
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

export default AddEmployee;
