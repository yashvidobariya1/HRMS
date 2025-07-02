import React, { useState, useEffect, useMemo, useRef } from "react";
import Loader from "../Helper/Loader";
import "../Templates/Templates.css";
import CommonTable from "../../SeparateCom/CommonTable";
import useApiServices from "../../useApiServices";
import { showToast } from "../../main/ToastManager";
import { TextField } from "@mui/material";
import { Select, MenuItem, ListSubheader } from "@mui/material";
import { useSelector } from "react-redux";
import { FaDownload, FaEye, FaTrash } from "react-icons/fa";
import DeleteConfirmation from "../../main/DeleteConfirmation";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import SignatureCanvas from "react-signature-canvas";
import CommonAddButton from "../../SeparateCom/CommonAddButton";

const StaffTemplate = () => {
  const { GetCall, PostCall } = useApiServices();
  const [loading, setLoading] = useState(false);
  const [templateList, settemplateList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [templatePerPage, settemplatePerPage] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const companyId = useSelector((state) => state.companySelect.companySelect);
  const userRole = useSelector((state) => state.userInfo.userInfo.role);
  const [employeeList, setEmployeeList] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("allUsers");
  const [isuploaded, setisuploaded] = useState("allstatus");
  const [totalPages, setTotalPages] = useState(0);
  const [totalTemplates, settotalTemplates] = useState([]);
  const [EmployeeaName, setEmployeeaName] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [templateId, settemplateId] = useState("");
  const [userId, settuserId] = useState("");
  const [previewUserName, setpreviewUserName] = useState("");
  const [assignAt, setassignAt] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [docs, setDocs] = useState([]);
  const signatureRef = useRef(null);

  const filteredEmployeeList = useMemo(() => {
    return employeeList.filter((user) =>
      user.userName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, employeeList]);

  const getTemplate = async () => {
    try {
      setLoading(true);
      const response = await PostCall(
        `/getAllUsersTemplates?page=${currentPage}&userId=${selectedEmployee}&limit=${templatePerPage}&search=${debouncedSearch}&status=${isuploaded}&companyId=${companyId}`
      );

      if (response?.data?.status === 200) {
        settemplateList(response?.data?.templates);
        settotalTemplates(response?.data?.totalTemplates);
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
    "Employee Name",
    "Template Name",
    "File Name",
    "Status",
    "Assign by",
    "Assigned At",
    "Uploaded At",
    "Actions",
  ];

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handletemplatePerPageChange = (e) => {
    settemplatePerPage(e);
    setCurrentPage(1);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleEmployeeChange = (value) => {
    setSelectedEmployee(value);
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

  // const handlePreview = (uploadedURL) => {
  //   if (!uploadedURL) {
  //     showToast("not found Template", "error");
  //     return;
  //   }
  //   const extension = uploadedURL.split(".").pop().toLowerCase();
  //   if (["pdf", "jpg", "jpeg", "png", "gif", "webp"].includes(extension)) {
  //     window.open(uploadedURL, "_blank");
  //   } else if (extension === "docx") {
  //     const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(
  //       uploadedURL
  //     )}&embedded=true`;
  //     window.open(viewerUrl, "_blank");
  //   } else {
  //     showToast("Unsupported file type for preview", "error");
  //   }
  // };

  const handlePreview = (uploadedURL, userName, assignedAt, templateName) => {
    setpreviewUserName(userName);
    setassignAt(assignedAt);

    if (!uploadedURL) {
      alert("File not found");
      return;
    }

    const extension = uploadedURL.split(".").pop().toLowerCase();
    if (
      ["pdf", "docx", "jpg", "jpeg", "png", "gif", "webp"].includes(extension)
    ) {
      const encodedUrl = encodeURI(uploadedURL);
      setDocs([
        {
          uri: encodedUrl,
          fileType: extension,
          fileName: templateName,
        },
      ]);
      setIsOpen(true);
    } else {
      showToast("Unsupported file type for preview");
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
    settemplateId(templateId);
    setTemplateName(templateName);
    setEmployeeaName(employeeName);
    settuserId(userId);
    setShowConfirm(true);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
  };

  const confirmDelete = async (templateId, userId) => {
    try {
      setLoading(true);
      const data = {
        templateId: templateId,
        userId: userId,
      };
      console.log("data", data);
      const response = await PostCall(`/deleteSignedTemplateOfUser`, data);
      if (response?.data?.status === 200) {
        showToast(response?.data?.message, "success");
        setShowConfirm(false);
        settemplateId("");
        setTemplateName("");
        setEmployeeaName("");
        settuserId("");
        getTemplate();
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error deleting timesheets:", error);
      setLoading(false);
    }
  };

  const handleSaveSignature = () => {
    alert("save");
  };

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
    isuploaded,
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
                value={isuploaded}
                onChange={(e) => setisuploaded(e.target.value)}
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
              EmployeeName: template?.userName,
              Name: template?.templateName,
              TemplateFileName: template?.templateFileName,
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
                        handlePreview(
                          template?.uploadedURL,
                          template?.userName,
                          template?.assignedAt,
                          template?.templateName
                        )
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
                    className={`action-icon template-download ${
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
            onPerPageChange={handletemplatePerPageChange}
            isPagination="true"
            totalData={totalTemplates}
          />
          {showConfirm && (
            <DeleteConfirmation
              confirmation={`Are you sure you want to delete the <b>${templateName}</b> of <b>${EmployeeaName}</b>?`}
              onConfirm={() => confirmDelete(templateId, userId)}
              onCancel={cancelDelete}
            />
          )}
        </>
      )}
      {isOpen && (
        <div className="fullscreen-overlay">
          <div className="fullscreen-modal">
            <button
              className="fullscreen-close-button"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
            <div className="preview-doc-flex">
              <DocViewer
                documents={docs}
                pluginRenderers={DocViewerRenderers}
                style={{ height: "100%", width: "100%" }}
              />
            </div>
            <div className="footer-main-div">
              <div className="preview-footer">
                <div>
                  <strong>Employee Name: </strong> {previewUserName}
                </div>
                <div>
                  <strong>Date: </strong> {assignAt}
                </div>
              </div>
              <div className="preview-signture">
                <SignatureCanvas
                  ref={signatureRef}
                  canvasProps={{
                    className: "signature-canvas",
                  }}
                />
              </div>
              <div className="preview-submit">
                <CommonAddButton
                  label="Save Signature"
                  onClick={handleSaveSignature}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffTemplate;
