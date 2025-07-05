import React, { useState, useEffect, useRef } from "react";
import Loader from "../Helper/Loader";
import "../Templates/Templates.css";
import CommonTable from "../../SeparateCom/CommonTable";
import useApiServices from "../../useApiServices";
import { showToast } from "../../main/ToastManager";
import { TextField } from "@mui/material";
import { useSelector } from "react-redux";
import { FaDownload, FaEye } from "react-icons/fa";
import SignatureCanvas from "react-signature-canvas";
import CommonAddButton from "../../SeparateCom/CommonAddButton";
import { Select, MenuItem } from "@mui/material";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";

const MyTemplate = () => {
  const { PostCall } = useApiServices();
  const signatureRef = useRef(null);
  const [signatureBase64, setSignatureBase64] = useState("");
  const [loading, setLoading] = useState(false);
  const [templateList, setTemplateList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [userData, setUserData] = useState(null);
  const [templatePerPage, setTemplatePerPage] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState("");
  const [checked, setChecked] = useState(false);
  const [totalTemplates, setTotalTemplates] = useState([]);
  const [pendingTemplateList, setPendingTemplateList] = useState([]);
  const [popupLoading, setPopupLoading] = useState(false);
  const [template, setTemplate] = useState({});
  const [docxUrl, setDocxUrl] = useState(null);
  const [isSignatureSaved, setIsSignatureSaved] = useState(false);
  const [isSignatureRequired, setIsSignatureRequired] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const companyId = useSelector((state) => state.companySelect.companySelect);
  const userId = useSelector((state) => state.userInfo.userInfo._id);
  const userRole = useSelector((state) => state.userInfo.userInfo.role);
  const [docs, setDocs] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showFooter, setShowFooter] = useState(true);

  const getTemplate = async () => {
    try {
      setLoading(true);
      const response = await PostCall(
        `/getUserTemplates?page=${currentPage}&limit=${templatePerPage}&search=${debouncedSearch}&companyId=${companyId}`
      );
      if (response?.data?.status === 200) {
        setTemplateList(response?.data?.templates);
        setTotalTemplates(response?.data?.totalTemplates);
        setPendingTemplateList(response?.data?.pendingTemplates);
        setTotalPages(response?.data?.totalPages);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      showToast("An error occurred while fetching template.", "error");
    }
  };

  const tableHeaders = [
    " Employee Name",
    " Template Name",
    " File Name",
    "Status",
    " Assign by",
    " Assigned At",
    " Uploaded At",
    "Actions",
  ];

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleTemplatePerPageChange = (e) => {
    setTemplatePerPage(e);
    setCurrentPage(1);
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

  const handlePreview = (uploadedURL) => {
    try {
      setShowFooter(false);
      setDocxUrl(uploadedURL);
    } catch (error) {
      showToast("An error occurred while previewing the template.", "error");
    }
  };

  const fetchData = async (selectedTemplateId) => {
    setLoading(true);
    const response = await PostCall("/previewTemplate", {
      templateId: selectedTemplateId,
    });
    if (response?.data?.status === 200) {
      setDocxUrl(response?.data?.templateUrl);
      setUserData(response?.data?.userData);
      setIsSignatureRequired(response?.data?.isSignActionRequired);
      setIsReadOnly(response?.data?.isTemplateReadActionRequired);
    } else {
      showToast(response?.data?.message, "error");
    }
    setLoading(false);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleTemplateChange = (e) => {
    const selected = pendingTemplateList.find(
      (template) => template._id === e.target.value
    );
    setTemplate(selected);
    setUserData(selected?.userData);
    fetchData(selected?.templateId);
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

  const saveSignature = () => {
    try {
      if (!signatureRef.current || signatureRef.current.isEmpty()) {
        showToast("Please add a signature before saving", "error");
        return;
      }

      const dataURL = signatureRef.current.toDataURL("image/png");
      setIsSignatureSaved(true);
      setSignatureBase64(dataURL);
    } catch (error) {
      console.error("Error saving signature:", error);
    }
  };

  const submitSignedDocument = async () => {
    if (popupLoading) return;
    setPopupLoading(true);
    setLoading(true);
    if (!signatureBase64) {
      showToast("No signature available", "error");
      return;
    }

    try {
      const body = {
        signBase64: signatureBase64,
        templateId: template?.templateId,
      };

      const response = await PostCall("/signedTemplate", body);
      if (response?.data?.status === 200) {
        setIsOpen(false);
        setTemplate(null);
        setDocxUrl(null);
        setDocs([]);
        setUserData(null);
        setSignatureBase64("");
        setIsSignatureSaved(false);
        showToast("Document signed successfully", "success");
        getTemplate();
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (err) {
      console.error("Error in submitSignedDocument:", err);
      showToast("Failed to submit document", "error");
    } finally {
      setPopupLoading(false);
      setLoading(false);
    }
  };

  const submitReadOnlyDocument = async () => {
    if (popupLoading) return;
    setPopupLoading(true);
    setLoading(true);
    try {
      const response = await PostCall("/readTemplate", {
        templateId: template?.templateId,
      });
      if (response?.data?.status === 200) {
        showToast("Document saved successfully", "success");
        setIsOpen(false);
        setTemplate(null);
        setDocxUrl(null);
        setDocs([]);
        setUserData(null);
        setChecked(false);
        getTemplate();
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (err) {
      console.error("Error in submitReadOnlyDocument:", err);
    } finally {
      setLoading(false);
      setPopupLoading(false);
    }
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
    if (companyId) getTemplate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, templatePerPage, debouncedSearch, companyId, userId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    if (!docxUrl) return;
    loadDocx();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docxUrl]);

  return (
    <div className="template-list-container">
      {/* {loading ? (
        <div className="loader-wrapper">
          <Loader />
        </div>
      ) : (
        <> */}
      {isOpen && (
        <div className="fullscreen-overlay">
          <div className="fullscreen-modal">
            <button
              className="fullscreen-close-button"
              onClick={() => {
                setIsOpen(false);
                setDocxUrl(null);
                setDocs([]);
                setIsSignatureSaved(false);
                setTemplate({});
                setUserData(null);
                setShowFooter(true);
                setSignatureBase64("");
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
            {showFooter && (
              <div className="footer-main-div">
                <div className="preview-footer">
                  <div>
                    <strong>Employee Name: </strong>{" "}
                    {userData?.EMPLOYEE_NAME || ""}
                  </div>
                  <div>
                    <strong>Date: </strong> {userData?.DATE || ""}
                  </div>
                  {isSignatureSaved && (
                    <div className="signature-preview">
                      <strong>Signature: </strong>
                      <img
                        className="signature-image"
                        src={signatureBase64}
                        alt="Employee Signature"
                      />
                    </div>
                  )}
                </div>

                {isSignatureRequired && (
                  <>
                    {!isSignatureSaved ? (
                      <div>
                        <div className="preview-signature">
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
                            onClick={saveSignature}
                          />
                        </div>
                      </div>
                    ) : (
                      <CommonAddButton
                        label="Submit"
                        onClick={submitSignedDocument}
                      />
                    )}
                  </>
                )}

                {isReadOnly && (
                  <>
                    <div className="isReadOnly-container">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => setChecked(e.target.checked)}
                      />
                      <label>I read carefully.</label>
                    </div>

                    <button
                      className="read-button"
                      onClick={submitReadOnlyDocument}
                      disabled={!checked}
                    >
                      Read
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="template-main-container">
        <div className="template-flex">
          <div className="template-title">
            <h1>My Template</h1>
          </div>
        </div>
      </div>

      {userRole !== "Superadmin" && pendingTemplateList?.length > 0 && (
        <div className="template-profile-container">
          <h3>Pending Verifing Documents</h3>
          <div className="template-viewprofile">
            <Select
              displayEmpty
              defaultValue=""
              className="template-input-dropdown"
              value={template?._id || ""}
              onChange={handleTemplateChange}
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
              <MenuItem value="" disabled className="menu-item">
                Select a Template
              </MenuItem>
              {pendingTemplateList?.map((template) => (
                <MenuItem
                  key={template._id}
                  value={template._id}
                  className="menu-item"
                >
                  {template.templateName}
                </MenuItem>
              ))}
            </Select>
          </div>
        </div>
      )}

      <TextField
        placeholder="Search"
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
            tableName="MyTemplates"
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
                      template?.isTemplateUploaded ? "" : "disabled-icon"
                    }`}
                  >
                    <FaDownload
                      onClick={(event) =>
                        template?.isTemplateUploaded &&
                        handleDownload(event, template?.uploadedURL)
                      }
                      style={{
                        cursor: template?.isTemplateUploaded
                          ? "pointer"
                          : "not-allowed",
                      }}
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
        </>
      )}
      {/* </>
      )} */}
    </div>
  );
};

export default MyTemplate;
