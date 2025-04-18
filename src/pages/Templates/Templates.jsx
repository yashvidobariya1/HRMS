import React, { useState, useEffect, useRef } from "react";
import { AiOutlineUpload } from "react-icons/ai";
import Loader from "../Helper/Loader";
import "../Templates/Templates.css";
import CommonTable from "../../SeparateCom/CommonTable";
import { GetCall, PostCall } from "../../ApiServices";
import { showToast } from "../../main/ToastManager";
import DeleteConfirmation from "../../main/DeleteConfirmation";
// import Pagination from "../../main/Pagination";
import moment from "moment";
import CommonAddButton from "../../SeparateCom/CommonAddButton";
import { TextField } from "@mui/material";

const Templates = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    templateName: "",
    template: "",
    templateFileName: "no file chosen",
  });
  const [templateList, settemplateList] = useState([]);
  const [showDropdownAction, setShowDropdownAction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [templatePerPage, settemplatePerPage] = useState(50);
  const [error, setError] = useState({});
  // const [CompanyIddata, setCompanyIddata] = useState([]);
  // const [selectedCompany, setSelectedCompany] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [templateName, settemplateName] = useState("");
  const [templateId, settemplateId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const allowedFileTypes = [
    // "application/pdf",
    // "text/html",
    // "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const [totalPages, setTotalPages] = useState(0);
  const fileInputRef = useRef(null);
  const [totalTemplates, settotalTemplates] = useState([]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!allowedFileTypes.includes(file?.type)) {
      setError((prevErrors) => ({
        ...prevErrors,
        // template: "Please upload a valid template file (PDF, Word, or Text).",
        template: "Please upload a valid template file (Word, or doc).",
      }));
      return;
    } else {
      setError((prevErrors) => ({
        ...prevErrors,
        template: null,
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          templateFileName: file.name,
          template: reader.result,
        });
        // console.log("contractdata", formData);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    let newErrors = {};
    // if (!selectedCompany) {
    //   newErrors.companyName = "company Name is required";
    // }

    if (!formData.templateName) {
      newErrors.templateName = "template Name is required";
    }

    if (!formData.template) {
      newErrors.template = "template file is required";
    }
    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpload = async () => {
    if (validate()) {
      const data = {
        ...formData,
        // companyId: selectedCompany,
      };
      // console.log("data", data);
      try {
        setLoading(true);
        let response;
        if (templateId) {
          response = await PostCall(`/updateTemplate/${templateId}`, data);
          // console.log("update", data);
        } else {
          response = await PostCall("/addTemplate", data);
          // console.log("data add", data);
        }

        if (response?.data?.status === 200) {
          showToast(response?.data?.message, "success");
          await getTemplate();
          setFormData({
            templateName: "",
            template: "",
            templateFileName: "no file chosen",
            // companyName: "",
          });

          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }

          settemplateId("");
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

  const getTemplate = async () => {
    try {
      setLoading(true);
      const response = await GetCall(
        `/getAllTemplates?page=${currentPage}&limit=${templatePerPage}&search=${searchQuery}`
      );

      if (response?.data?.status === 200) {
        settemplateList(response?.data?.templates);
        settotalTemplates(response.data.totalTemplates);
        setTotalPages(response?.data?.totalPages);
        // console.log("data pagination", response?.data);
        // console.log("templatePerPage", templatePerPage);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching template:", error);
      setLoading(false);
      showToast("An error occurred while fetching template.", "error");
    }
  };

  const handleNameChange = (event) => {
    setFormData({
      ...formData,
      templateName: event.target.value,
    });
  };

  const tableHeaders = [
    "Template Name",
    "File name",
    "Uploaded By",
    "Updated Date",
    "Action",
  ];

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handletemplatePerPageChange = (e) => {
    settemplatePerPage(e);
    setCurrentPage(1);
  };

  // const HandleEditTemplate = async (id) => {
  //   settemplateId(id);
  //   try {
  //     const response = await GetCall(`/getTemplate/${id}`);
  //     if (response?.data?.status === 200) {
  //       setFormData(response?.data?.template);
  //       // setSelectedCompany(response?.data?.contract.companyId || "");
  //     } else {
  //       showToast(
  //         response?.data?.message || "Failed to fetch template",
  //         "error"
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Error fetching template data:", error);
  //     showToast("Error fetching template data.", "error");
  //   }
  // };

  const HandleDeletetemplate = (id, name) => {
    settemplateName(name);
    settemplateId(id);
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
      const response = await PostCall(`/deleteTemplate/${id}`);
      if (response?.data?.status === 200) {
        showToast(response?.data?.message, "success");
        settemplateList(templateList.filter((template) => template._id !== id));
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error deleting template:", error);
      showToast("An error occurred while deleting the template.", "error");
    }
  };

  const HandleDownload = async (id) => {
    try {
      const response = await GetCall(`/getTemplate/${id}`);
      if (response?.data?.status === 200) {
        const fileUrl = response?.data?.template?.template;
        const templateName =
          response?.data?.template?.templateName || "template";

        if (fileUrl) {
          const res = await fetch(fileUrl);
          const blob = await res.blob();
          const link = document.createElement("a");
          const objectURL = URL.createObjectURL(blob);
          link.href = objectURL;
          link.download = `${templateName}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(objectURL);
        } else {
          showToast("template file not available.", "error");
        }
      } else {
        showToast(
          response?.data?.message || "Failed to fetch template",
          "error"
        );
      }
    } catch (error) {
      console.error("Error fetching template data:", error);
      showToast("Error fetching template data.", "error");
    }
  };

  const templateActions = [
    // { label: "Edit", onClick: HandleEditTemplate },
    { label: "Delete", onClick: HandleDeletetemplate },
    { label: "Download", onClick: HandleDownload },
  ];

  const handleAction = (id) => {
    setShowDropdownAction(showDropdownAction === id ? null : id);
  };

  const cancelEdit = () => {
    setFormData({
      templateName: "",
      template: "",
      templateFileName: "no file chosen",
    });
    settemplateId("");
    // setSelectedCompany("");
  };

  // useEffect(() => {
  //   getCompanyId();
  // }, []);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {
    getTemplate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, templatePerPage, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="template-list-container">
      <div className="template-main-container">
        <div className="template-flex">
          <div className="template-title">
            <h1>Template</h1>
          </div>

          <div className="template-title">
            <div className="template-flex-file-action">
              {/* <div className="template-input">
                <select
                  name="companyName"
                  className="template-contract-input"
                  value={selectedCompany}
                  onChange={handleCompanyChange}
                >
                  <option value="" disabled>
                    Select Company
                  </option>
                  {CompanyIddata.map((company) => (
                    <option key={company._id} value={company._id}>
                      {company.companyDetails.businessName}
                    </option>
                  ))}
                </select>
                {error.companyName && (
                  <p className="error-text">{error.companyName}</p>
                )}
              </div> */}

              <div className="template-input">
                <input
                  type="text"
                  placeholder="Enter template Name"
                  className="template-contract-input"
                  name="templateName"
                  value={formData.templateName}
                  onChange={handleNameChange}
                />
                {error.templateName && (
                  <p className="error-text">{error.templateName}</p>
                )}
              </div>

              <div className="template-input">
                <div className="template-file-contract">
                  <label
                    htmlFor="file-upload"
                    className="template-custom-file-upload"
                  >
                    Choose File
                  </label>
                  <input
                    type="file"
                    id="file-upload"
                    name="templateFileName"
                    accept={allowedFileTypes}
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    multiple
                  />
                  {formData.templateFileName && (
                    <p className="template-fileupload-name">
                      {formData.templateFileName}
                    </p>
                  )}
                </div>

                {error.template && (
                  <p className="error-text">{error.template}</p>
                )}
              </div>

              <div className="Template-upload-main-div">
                <div className="template-upload">
                  <CommonAddButton
                    label={templateId ? "Update" : "Upload"}
                    icon={AiOutlineUpload}
                    onClick={handleUpload}
                  />

                  {templateId && (
                    <button
                      onClick={cancelEdit}
                      className="template-cancel-edit-btn"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <h5>
          Use following place holder in contract template: 'EMPLOYEE_NAME
          EMPLOYEE_EMAIL EMPLOYEE_CONTACT_NUMBER JOB_START_DATE
          EMPLOYEE_JOB_TITLE EMPLOYEE_JOB_ROLE WEEKLY_HOURS ANNUAL_SALARY
          COMPANY_NAME SIGNATURE'
        </h5>
      </div>
      <TextField
        label="Search Templates"
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
            data={templateList?.map((template) => ({
              _id: template._id,
              Name: template?.templateName,
              TemplateFileName: template?.templateFileName,
              UploadBy: template.uploadBy,
              CreatedAt: moment(template.createdAt).format("DD/MM/YYYY"),
            }))}
            actions={{
              // showDropdownAction,
              actionsList: templateActions,
              // onAction: handleAction,
            }}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showPerPage={templatePerPage}
            onPerPageChange={handletemplatePerPageChange}
            handleAction={handleAction}
            isPagination="true"
            searchQuery={searchQuery}
            isSearchQuery={true}
            totalData={totalTemplates}
          />
          {showConfirm && (
            <DeleteConfirmation
              confirmation={`Are you sure you want to delete template named <b>${templateName}</b>?`}
              onConfirm={() => confirmDelete(templateId)}
              onCancel={cancelDelete}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Templates;
