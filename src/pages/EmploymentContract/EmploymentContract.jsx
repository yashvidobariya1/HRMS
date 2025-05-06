import React, { useState, useEffect, useRef } from "react";
import { AiOutlineUpload } from "react-icons/ai";
import Loader from "../Helper/Loader";
import "../EmploymentContract/EmploymentContract.css";
import CommonTable from "../../SeparateCom/CommonTable";
import { GetCall, PostCall } from "../../ApiServices";
import { showToast } from "../../main/ToastManager";
import DeleteConfirmation from "../../main/DeleteConfirmation";
import moment from "moment";
import CommonAddButton from "../../SeparateCom/CommonAddButton";
import { TextField } from "@mui/material";
import { useSelector } from "react-redux";

const EmploymentContract = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    contractName: "",
    contract: "",
    contractFileName: "no file chosen",
  });
  const [contractList, setContractList] = useState([]);
  const [showDropdownAction, setShowDropdownAction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [contractsPerPage, setContractsPerPage] = useState(50);
  const [error, setError] = useState({});
  // const [CompanyIddata, setCompanyIddata] = useState([]);
  const companyId = useSelector((state) => state.companySelect.companySelect);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [contractName, setContractName] = useState("");
  const [contractId, setcontractId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [totalContracts, settotalContracts] = useState([]);
  const allowedFileTypes = [
    // "application/pdf",
    // "text/html",
    // "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const [totalPages, setTotalPages] = useState(0);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!allowedFileTypes.includes(file?.type)) {
      setError((prevErrors) => ({
        ...prevErrors,
        // contract: "Please upload a valid contract file (PDF, Word, or Text).",
        contract: "Please upload a valid contract file (Word, or doc).",
      }));
      return;
    } else {
      setError((prevErrors) => ({
        ...prevErrors,
        contract: null,
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          contractFileName: file.name,
          contract: reader.result,
        });
        // console.log("contractdata", formData);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.contractName) {
      newErrors.contractName = "Contract name is required";
    }

    if (!formData.contract) {
      newErrors.contract = "Contract file is required";
    }

    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpload = async () => {
    if (
      companyId === "" ||
      companyId === undefined ||
      companyId === null ||
      companyId === "allCompany"
    ) {
      showToast("Please select a specific company", "error");
      return;
    }
    if (validate()) {
      const data = {
        ...formData,
        companyId: companyId,
      };
      try {
        setLoading(true);
        let response;
        if (contractId) {
          response = await PostCall(`/updateContract/${contractId}`, data);
          // console.log("update", data);
        } else {
          response = await PostCall("/addContract", data);
          // console.log("data add", data);
        }

        if (response?.data?.status === 200) {
          showToast(response?.data?.message, "success");
          await getContracts();
          setFormData({
            contractName: "",
            contract: "",
            contractFileName: "no file chosen",
            companyName: "",
          });

          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }

          setcontractId("");
          // setSelectedCompany("");
        } else {
          showToast(response?.data?.message, "error");
        }
        setLoading(false);
      } catch (error) {
        showToast("An error occurred while processing your request.", "error");
      }
    }
  };

  const getContracts = async () => {
    try {
      setLoading(true);
      const response = await GetCall(
        `/getAllContract?page=${currentPage}&limit=${contractsPerPage}&search=${searchQuery}&companyId=${companyId}`
      );

      if (response?.data?.status === 200) {
        setContractList(response?.data?.contracts);
        setTotalPages(response?.data?.totalPages);
        settotalContracts(response.data.totalContracts);
        // console.log("data pagination", response?.data);
        // console.log("contractsPerPage", contractsPerPage);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      setLoading(false);
      showToast("An error occurred while fetching contracts.", "error");
    }
  };

  const handleNameChange = (event) => {
    setFormData({
      ...formData,
      contractName: event.target.value,
    });
  };

  // const getCompanyId = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await GetCall("/getAllCompany");
  //     if (response?.data?.status === 200) {
  //       setCompanyIddata(response?.data.companies);
  //     }
  //     setLoading(false);
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //     setLoading(false);
  //   }
  // };

  // const handleCompanyChange = (event) => {
  //   setSelectedCompany(event.target.value);
  // };

  const tableHeaders = [
    "Contract Name",
    "File name",
    "Company",
    "Uploaded By",
    "Updated Date",
    "Action",
  ];

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleContractPerPageChange = (e) => {
    setContractsPerPage(e);
    setCurrentPage(1);
  };

  // const HandleEditcontract = async (id) => {
  //   setcontractId(id);
  //   try {
  //     const response = await GetCall(`/getContract/${id}`);
  //     if (response?.data?.status === 200) {
  //       setFormData(response?.data?.contract);
  //       setSelectedCompany(response?.data?.contract.companyId || "");
  //     } else {
  //       showToast(
  //         response?.data?.message || "Failed to fetch contract",
  //         "error"
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Error fetching contract data:", error);
  //     showToast("Error fetching contract data.", "error");
  //   }
  // };

  const HandleDeletecontract = (id, name) => {
    setContractName(name);
    setcontractId(id);
    setShowConfirm(true);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setShowDropdownAction(null);
  };

  const confirmDelete = async (id) => {
    setShowConfirm(false);
    setShowDropdownAction(null);
    try {
      setLoading(true);
      const response = await PostCall(`/deleteContract/${id}`);
      if (response?.data?.status === 200) {
        showToast(response?.data?.message, "success");
        setContractList(contractList.filter((contract) => contract._id !== id));
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error deleting contract:", error);
      showToast("An error occurred while deleting the contract.", "error");
    }
  };

  const HandleDownload = async (id) => {
    try {
      const response = await GetCall(`/getContract/${id}`);
      if (response?.data?.status === 200) {
        const fileUrl = response?.data?.contract?.contract;
        const contractName =
          response?.data?.contract?.contractName || "contract";

        if (fileUrl) {
          const res = await fetch(fileUrl);
          const blob = await res.blob();
          const extension = fileUrl.substring(fileUrl.lastIndexOf("."));
          const link = document.createElement("a");
          const objectURL = URL.createObjectURL(blob);
          link.href = objectURL;
          link.download = `${contractName}${extension}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(objectURL);
        } else {
          showToast("Contract file not available.", "error");
        }
      } else {
        showToast(
          response?.data?.message || "Failed to fetch contract",
          "error"
        );
      }
    } catch (error) {
      console.error("Error fetching contract data:", error);
      showToast("Error fetching contract data.", "error");
    }
  };

  const ContractActions = [
    // { label: "Edit", onClick: HandleEditcontract },
    { label: "Delete", onClick: HandleDeletecontract },
    { label: "Download", onClick: HandleDownload },
  ];

  const handleAction = (id) => {
    setShowDropdownAction(showDropdownAction === id ? null : id);
  };

  // const cancelEdit = () => {
  //   setFormData({
  //     contractName: "",
  //     contract: "",
  //     contractFileName: "no file chosen",
  //   });
  //   setcontractId("");
  //   setSelectedCompany("");
  // };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // useEffect(() => {
  //   getCompanyId();
  // }, []);

  useEffect(() => {
    getContracts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, contractsPerPage, searchQuery, companyId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="employee-contract-list-container">
      <div className="employee-main-container">
        <div className="employeecontract-flex">
          <div className="employeecontract-title">
            <h1>Employee Contract</h1>
          </div>

          <div className="employeecontract-title">
            <div className="Employee-flex-file-action">
              {/* <div className="Employeecontract-input">
                <select
                  name="companyName"
                  className="employee-contract-input"
                  value={selectedCompany}
                  onChange={handleCompanyChange}
                >
                  <option value="" disabled>
                    Select Company
                  </option>
                  {CompanyIddata?.map((company) => (
                    <option key={company._id} value={company._id}>
                      {company.companyDetails.businessName}
                    </option>
                  ))}
                </select>
                {error.companyName && (
                  <p className="error-text">{error.companyName}</p>
                )}
              </div> */}
              <div className="Employeecontract-input">
                <input
                  type="text"
                  placeholder="Enter contract Name"
                  className="employee-contract-input"
                  value={formData.contractName}
                  onChange={handleNameChange}
                />
                {error.contractName && (
                  <p className="error-text">{error.contractName}</p>
                )}
              </div>
              <div className="Employeecontract-input ">
                <div className="file-contract">
                  <label
                    htmlFor="file-upload"
                    className="contract-custom-file-upload"
                  >
                    Choose File
                  </label>
                  <input
                    type="file"
                    id="file-upload"
                    accept={allowedFileTypes}
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    multiple
                  />
                  {formData.contractFileName && (
                    <p className="contract-fileupload-name">
                      {formData.contractFileName}
                    </p>
                  )}
                </div>

                {error.contract && (
                  <p className="error-text">{error.contract}</p>
                )}
              </div>
              <div className="employeecontract-upload-main-div">
                <div className="employeecontract-upload">
                  <CommonAddButton
                    // label={contractId ? "Update" : "Upload"}
                    label="Upload"
                    icon={AiOutlineUpload}
                    onClick={handleUpload}
                  />

                  {/* {contractId && (
                    <button onClick={cancelEdit} className="cancel-edit-btn">
                      Cancel
                    </button>
                  )} */}
                </div>
              </div>
            </div>
          </div>
        </div>

        <h5>
          Use following place holder in Employee contract : {process.env.REACT_APP_EMPLOYEE_CONTRACT_PLACEHOLDERS}
        </h5>
      </div>
      <TextField
        label="Search Contract"
        variant="outlined"
        size="small"
        value={searchQuery}
        className="common-searchbar"
        onChange={handleSearchChange}
      />

      {loading ? (
        <div className="loader-wrapper">
          <Loader />
        </div>
      ) : (
        <>
          <CommonTable
            headers={tableHeaders}
            data={contractList?.map((contract) => ({
              _id: contract._id,
              Name: contract?.contractName,
              ContractFileName: contract?.contractFileName,
              CompanyName: contract?.companyName,
              UploadBy: contract.uploadBy,
              CreatedAt: moment(contract.createdAt).format("DD/MM/YYYY"),
            }))}
            actions={{
              // showDropdownAction,
              actionsList: ContractActions,
              // onAction: handleAction,
            }}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showPerPage={contractsPerPage}
            onPerPageChange={handleContractPerPageChange}
            handleAction={handleAction}
            isPagination="true"
            searchQuery={searchQuery}
            isSearchQuery={true}
            totalData={totalContracts}
          />

          {showConfirm && (
            <DeleteConfirmation
              confirmation={`Are you sure you want to delete Contract named <b>${contractName}</b>?`}
              onConfirm={() => confirmDelete(contractId)}
              onCancel={cancelDelete}
            />
          )}
        </>
      )}
    </div>
  );
};

export default EmploymentContract;
