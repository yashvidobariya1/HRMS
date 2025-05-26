import React, { useState } from "react";
import "./RoleSelect.css";
import { MenuItem, Select } from "@mui/material";

const JobTitleForm = ({ onClose, jobTitledata, onJobTitleSelect }) => {
  const [jobTitle, setJobTitle] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!jobTitle) {
      setError("Please select a job title");
      return;
    }
    // console.log("Selected Job Title:", jobTitle);
    onJobTitleSelect(jobTitle);
    onClose();
  };

  return (
    <div className="roleselect-overlay">
      <form onSubmit={handleSubmit} className="roleselect-modal">
        <h1>Select Job Role</h1>
        <div className="jobtitleselect">
          {/* <select
            className="Roleselcet-input"
            value={jobTitle}
            onChange={(e) => {
              setJobTitle(e.target.value);
              setError("");
            }}
          >
            <option value="" disabled>
              Select a Job Title
            </option>
            {jobTitledata?.map((title, index) => (
              <option key={index} value={title.jobId}>
                {title.jobName}
              </option>
            ))}
          </select> */}
          <Select
            className="Roleselcet-input-dropdown"
            value={jobTitle}
            onChange={(e) => {
              setJobTitle(e.target.value);
              setError("");
            }}
            displayEmpty
            MenuProps={{
              PaperProps: {
                style: {
                  width: 200,
                  textOverflow: "ellipsis",
                  maxHeight: 200,
                  whiteSpace: "nowrap",
                  scrollbarWidth: "thin",
                  overflowX: "auto",
                },
              },
            }}
          >
            <MenuItem value="" disabled>
              Select a Job Title
            </MenuItem>
            {jobTitledata?.map((title, index) => (
              <MenuItem key={index} value={title.jobId}>
                {title.jobName}
              </MenuItem>
            ))}
          </Select>
          {error && <p className="error-text role-select-error">{error}</p>}
        </div>
        <button type="submit" className="rolemodal-buttons">
          Submit
        </button>
      </form>
    </div>
  );
};

export default JobTitleForm;
