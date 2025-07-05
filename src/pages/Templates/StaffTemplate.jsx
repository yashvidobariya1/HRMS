import React, { useState, useEffect, useMemo } from "react";
import Loader from "../Helper/Loader";
import "../Templates/Templates.css";
import CommonTable from "../../SeparateCom/CommonTable";
import useApiServices from "../../useApiServices";
import { showToast } from "../../main/ToastManager";
import { TextField } from "@mui/material";
import { Select, MenuItem, ListSubheader } from "@mui/material";
import { useSelector } from "react-redux";
import { FaDownload, FaEye, FaTrash } from "react-icons/fa";
import DeleteConfirmationWithPermission from "../../main/DeleteConfirmationWithPermission";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";

const StaffTemplate = () => {
  const { GetCall, PostCall } = useApiServices();
  const [loading, setLoading] = useState(false);
  const [templateList, setTemplateList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [templatePerPage, setTemplatePerPage] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const companyId = useSelector((state) => state.companySelect.companySelect);
  const userRole = useSelector((state) => state.userInfo.userInfo.role);
  const [employeeList, setEmployeeList] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("allUsers");
  const [isUploaded, setIsUploaded] = useState("allstatus");
  const [totalPages, setTotalPages] = useState(0);
  const [totalTemplates, setTotalTemplates] = useState([]);
  const [employeeName, setEmployeeName] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [userId, setUserId] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isReAssignTemplate, setIsReAssignTemplate] = useState(false);
  const [docxUrl, setDocxUrl] = useState(null);
  const [docs, setDocs] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const filteredEmployeeList = useMemo(() => {
    return employeeList.filter((user) =>
      user.userName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, employeeList]);

  const getTemplate = async () => {
    try {
      setLoading(true);
      const response = await PostCall(
        `/getAllUsersTemplates?page=${currentPage}&userId=${selectedEmployee}&limit=${templatePerPage}&search=${debouncedSearch}&status=${isUploaded}&companyId=${companyId}`
      );

      if (response?.data?.status === 200) {
        setTemplateList(response?.data?.templates);
        setTotalTemplates(response?.data?.totalTemplates);
        setTotalPages(response?.data?.totalPages);
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

  const tableHeaders = [
    "Employee Name   ",
    "Template Name ",
    "File Name  ",
    "Status",
    "Assign by",
    "Assigned At",
    "Uploaded At",
    "Actions",
  ];

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleTemplatePerPageChange = (e) => {
    setTemplatePerPage(e);
    setCurrentPage(1);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleEmployeeChange = (value) => {
    setSelectedEmployee(value);
  };

  const handleCheckboxChange = (e) => {
    setIsReAssignTemplate(e.target.checked);
  };

  const getAllUsersOfClientOrLocation = async () => {
    try {
      setLoading(true);
      const response = await GetCall(
        `/getAllUsersOfClientOrLocation?companyId=${companyId}`
      );
      if (response?.data?.status === 200) {
        setEmployeeList(response?.data.users);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handlePreview = (uploadedURL) => {
    try {
      setDocxUrl(uploadedURL);
    } catch (error) {
      showToast("An error occurred while previewing the template.", "error");
    }
  };

  const handleDownload = (e, uploadedURL) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = uploadedURL;

    link.setAttribute("download", "");

    link.setAttribute("target", "_blank");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (templateId, templateName, employeeName, userId) => {
    setTemplateId(templateId);
    setTemplateName(templateName);
    setEmployeeName(employeeName);
    setUserId(userId);
    setShowConfirm(true);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
  };

  const confirmDelete = async (templateId, userId) => {
    setLoading(true);
    try {
      const data = {
        templateId: templateId,
        userId: userId,
        isReassign: isReAssignTemplate,
      };
      const response = await PostCall(`/deleteSignedTemplateOfUser`, data);
      if (response?.data?.status === 200) {
        showToast(response?.data?.message, "success");
        setShowConfirm(false);
        setTemplateId("");
        setTemplateName("");
        setEmployeeName("");
        setUserId("");
        getTemplate();
        setIsReAssignTemplate(false);
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (error) {
      console.error("Error deleting timesheets:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDocx = async () => {
    try {
      if (!docxUrl) {
        showToast("File not found", "error");
        return;
      }

      const extension = docxUrl.split(".").pop().toLowerCase();
      if (
        ["pdf", "docx", "jpg", "jpeg", "png", "gif", "webp"].includes(extension)
      ) {
        const encodedUrl = encodeURI(docxUrl);
        const templateName = docxUrl.split("/").pop();
        setDocs([
          {
            uri: encodedUrl,
            fileType: extension,
            fileName: templateName,
          },
        ]);
        setIsOpen(true);
      } else {
        showToast("Unsupported file type for preview", "error");
      }
    } catch (err) {
      console.log("Error rendering DOCX: ", err.message);
      setError("Error rendering document.");
    }
  };

  useEffect(() => {
    if (!docxUrl) return;
    loadDocx();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docxUrl]);

  useEffect(() => {
    getAllUsersOfClientOrLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  useEffect(() => {
    getTemplate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    templatePerPage,
    debouncedSearch,
    isUploaded,
    selectedEmployee,
    companyId,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  return (
    <div className="template-list-container">
      {/* {loading ? (
        <div className="loader-wrapper">
          <Loader />
        </div>
      ) : ( */}
      {/* <> */}
      {isOpen && (
        <div className="fullscreen-overlay">
          <div className="fullscreen-modal">
            <button
              className="fullscreen-close-button"
              onClick={() => {
                setIsOpen(false);
                setDocxUrl(null);
                setDocs([]);
              }}
            >
              ×
            </button>
            <div className="preview-doc-flex">
              <DocViewer
                documents={docs}
                pluginRenderers={DocViewerRenderers}
                config={{
                  header: {
                    disableDownload: true,
                    disablePrint: true,
                  },
                }}
                style={{ height: "100%", width: "100%" }}
              />
            </div>
            {error && <p className="error-message">{error}</p>}
          </div>
        </div>
      )}
      <div className="template-main-container">
        <div className="template-flex">
          <div className="template-title">
            <h1>Staff Templates</h1>
          </div>
        </div>
        <div className="template-filter-container">
          <div className="filter-template-main">
            {userRole !== "Employee" && (
              <div className="filter-employee-selection">
                <label className="label">Employee</label>
                <Select
                  className="template-input-dropdown"
                  value={selectedEmployee}
                  onChange={(e) => handleEmployeeChange(e.target.value)}
                  displayEmpty
                  MenuProps={{
                    disableAutoFocusItem: true,
                    PaperProps: {
                      style: {
                        width: 150,
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
                    if (!selected) return "Select Employee";
                    if (selected === "allUsers") return "All Employees";
                    const found = employeeList?.find(
                      (emp) => emp._id === selected
                    );
                    return found?.userName || "Select Employee";
                  }}
                >
                  <ListSubheader>
                    <TextField
                      size="small"
                      placeholder="Search Employee"
                      fullWidth
                      className="search-textfield"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </ListSubheader>

                  <MenuItem value="allUsers" className="menu-item">
                    All Employees
                  </MenuItem>
                  {filteredEmployeeList.length > 0 ? (
                    filteredEmployeeList?.map((emp) => (
                      <MenuItem
                        key={emp._id}
                        value={emp._id}
                        className="menu-item"
                      >
                        {emp.userName}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>Not Found</MenuItem>
                  )}
                </Select>
              </div>
            )}

            <div className="filter-employee-selection">
              <label className="label">Status</label>
              <Select
                className="template-input-dropdown"
                value={isUploaded}
                onChange={(e) => setIsUploaded(e.target.value)}
                displayEmpty
              >
                <MenuItem value="" disabled className="menu-item">
                  Select Status
                </MenuItem>
                <MenuItem value="allstatus" className="menu-item">
                  All
                </MenuItem>
                <MenuItem value="true" className="menu-item">
                  Uploaded
                </MenuItem>
                <MenuItem value="false" className="menu-item">
                  Pending
                </MenuItem>
              </Select>
            </div>
          </div>
        </div>
      </div>
      <div className="template-searchbar">
        <TextField
          placeholder="Search"
          variant="outlined"
          size="small"
          value={searchQuery}
          className="common-searchbar"
          onChange={handleSearchChange}
        />
      </div>

      {loading ? (
        <div className="loader-wrapper">
          <Loader />
        </div>
      ) : (
        <>
          <CommonTable
            headers={tableHeaders}
            tableName="StaffTemplates"
            data={templateList?.map((template) => ({
              _id: template?.templateId,
              Employeename: template?.userName,
              templatename: template?.templateName,
              templatefilename: template?.templateFileName,
              uploadStatus: template?.isTemplateUploaded
                ? "Uploaded"
                : "Pending",
              AssignBy: template?.assignedBy,
              AssignAt: template?.assignedAt,
              uploadedAt: template?.uploadedAt,
              actions: (
                <div className="viewhour-action">
                  <span
                    className={`action-icon template-preview ${
                      !template?.isTemplateUploaded ? "disabled-icon" : ""
                    }`}
                  >
                    <FaEye
                      onClick={() =>
                        template?.isTemplateUploaded &&
                        handlePreview(template?.uploadedURL)
                      }
                      style={{
                        cursor: template?.isTemplateUploaded
                          ? "pointer"
                          : "not-allowed",
                      }}
                    />
                  </span>
                  <span
                    className={`action-icon template-download ${
                      template.isTemplateUploaded ? "" : "disabled-icon"
                    }`}
                  >
                    <FaDownload
                      onClick={(event) =>
                        template.isTemplateUploaded &&
                        handleDownload(event, template?.uploadedURL)
                      }
                      style={{
                        cursor: template.isTemplateUploaded
                          ? "pointer"
                          : "not-allowed",
                      }}
                    />
                  </span>
                  <span
                    className={`action-icon template-delete ${
                      template.isTemplateUploaded ? "" : "disabled-icon"
                    }`}
                  >
                    <FaTrash
                      onClick={() =>
                        template.isTemplateUploaded &&
                        handleDelete(
                          template?.templateId,
                          template?.templateName,
                          template?.userName,
                          template?.userId
                        )
                      }
                    />
                  </span>
                </div>
              ),
            }))}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showPerPage={templatePerPage}
            onPerPageChange={handleTemplatePerPageChange}
            isPagination="true"
            totalData={totalTemplates}
          />
          {showConfirm && (
            <DeleteConfirmationWithPermission
              confirmation={`Are you sure you want to delete <b>${templateName}</b> of <b>${employeeName}</b>?`}
              onConfirm={() => confirmDelete(templateId, userId)}
              onCancel={cancelDelete}
              permissionMessage="Do you Re-assign the template to employee?"
              isChecked={isReAssignTemplate}
              onCheckboxChange={handleCheckboxChange}
            />
          )}
        </>
      )}
      {/* </> */}
      {/* )} */}
    </div>
  );
};

export default StaffTemplate;
