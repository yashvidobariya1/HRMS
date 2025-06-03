import React, { useState, useEffect, useRef, useMemo } from "react";
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
import { Chip, FormControlLabel, TextField } from "@mui/material";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Select,
  MenuItem,
  FormControl,
  // InputLabel,
  Checkbox,
  ListItemText,
  ListSubheader,
} from "@mui/material";
import { useSelector } from "react-redux";

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
  const [showAssignPopup, setShowAssignPopup] = useState(false);
  const [selectedAssignuser, setSelectedAssignuser] = useState([]);
  const [assignUser, setassignUser] = useState([]);
  const [signatureRequired, setSignatureRequired] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const companyId = useSelector((state) => state.companySelect.companySelect);
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
  const filteredUsers = useMemo(() => {
    return assignUser.filter((user) =>
      user.userName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, assignUser]);

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
        `/getAllTemplates?page=${currentPage}&limit=${templatePerPage}&search=${debouncedSearch}`
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
    "File Name",
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
          const extension = fileUrl.substring(fileUrl.lastIndexOf("."));
          const link = document.createElement("a");
          const objectURL = URL.createObjectURL(blob);
          link.href = objectURL;
          link.download = `${templateName}${extension}`;
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

  const HandleAssigntemplate = async (id) => {
    try {
      const response = await GetCall(`/getAllUsers?companyId=${companyId}`);

      if (response?.data?.status === 200) {
        setassignUser(response?.data?.users);
        settemplateId(id);
        setShowAssignPopup(true);
        setSelectedAssignuser([]);
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleAssignUser = async (templateId, userIds) => {
    try {
      setLoading(true);
      const data = {
        templateId,
        userIds,
        signatureRequired: signatureRequired,
      };
      const response = await PostCall(`/assignTemplate`, data);

      if (response?.data?.status === 200) {
        showToast(response?.data?.message, "success");
        setShowAssignPopup(false);
        setSelectedAssignuser([]);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleClosePopup = () => {
    setShowAssignPopup(false);
    setSelectedAssignuser([]);
  };

  const templateActions = [
    // { label: "Edit", onClick: HandleEditTemplate },
    { label: "Delete", onClick: HandleDeletetemplate },
    { label: "Download", onClick: HandleDownload },
    { label: "Assign Template", onClick: (id) => HandleAssigntemplate(id) },
  ];

  const handleAction = (id) => {
    setShowDropdownAction(showDropdownAction === id ? null : id);
  };

  // const cancelEdit = () => {
  //   setFormData({
  //     templateName: "",
  //     template: "",
  //     templateFileName: "no file chosen",
  //   });
  //   settemplateId("");
  //   // setSelectedCompany("");
  // };

  // useEffect(() => {
  //   getCompanyId();
  // }, []);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  useEffect(() => {
    getTemplate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, templatePerPage, debouncedSearch]);

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
                    // label={templateId ? "Update" : "Upload"}
                    label="Upload"
                    icon={AiOutlineUpload}
                    onClick={handleUpload}
                  />

                  {/* {templateId && (
                    <button
                      onClick={cancelEdit}
                      className="template-cancel-edit-btn"
                    >
                      Cancel
                    </button>
                  )} */}
                </div>
              </div>
            </div>
          </div>
        </div>

        <h5>
          Use following place holder in Template :{" "}
          {process.env.REACT_APP_TEMPLATE_PLACEHOLDERS}
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

      {showAssignPopup && (
        <div className="assignuser">
          <Dialog
            open={showAssignPopup}
            onClose={handleClosePopup}
            PaperProps={{ className: "custom-dialog" }}
          >
            <DialogTitle>Assign Template</DialogTitle>
            <DialogContent>
              <FormControl fullWidth>
                <Select
                  multiple
                  value={selectedAssignuser}
                  className="template-input-dropdwon"
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.includes("all")) {
                      if (selectedAssignuser.length === assignUser.length) {
                        setSelectedAssignuser([]);
                      } else {
                        setSelectedAssignuser(assignUser.map((u) => u._id));
                      }
                    } else {
                      setSelectedAssignuser(value);
                    }
                  }}
                  displayEmpty
                  MenuProps={{
                    disableAutoFocusItem: true,
                    PaperProps: {
                      className: "custom-select-menu",
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
                      return <strong>Select User</strong>;
                    }
                    return (
                      <div className="Template-selection-chip">
                        {selected.map((id) => {
                          const user = assignUser.find((u) => u._id === id);
                          return (
                            <Chip key={id} label={user ? user.userName : ""} />
                          );
                        })}
                      </div>
                    );
                  }}
                >
                  <ListSubheader>
                    <TextField
                      size="small"
                      placeholder="Search User"
                      fullWidth
                      className="search-textfield"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </ListSubheader>

                  <MenuItem value="all">
                    <Checkbox
                      checked={selectedAssignuser.length === assignUser.length}
                      indeterminate={
                        selectedAssignuser.length > 0 &&
                        selectedAssignuser.length < assignUser.length
                      }
                    />
                    <ListItemText primary="All" />
                  </MenuItem>

                  {filteredUsers.map((user) => (
                    <MenuItem
                      key={user._id}
                      value={user._id}
                      className="custom-select"
                    >
                      <Checkbox
                        checked={selectedAssignuser.includes(user._id)}
                      />
                      <ListItemText primary={user.userName} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={signatureRequired}
                    onChange={(e) => setSignatureRequired(e.target.checked)}
                    name="signatureRequired"
                    color="primary"
                  />
                }
                label="Signature Require?"
                style={{ marginTop: "16px" }}
              />
            </DialogContent>

            <DialogActions>
              <Button onClick={handleClosePopup}>Cancel</Button>
              <Button
                onClick={() => handleAssignUser(templateId, selectedAssignuser)}
                color="primary"
              >
                Assign
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default Templates;
