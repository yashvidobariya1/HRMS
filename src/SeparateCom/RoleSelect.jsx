import React, { useState } from "react";
import "./RoleSelect.css";

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
          <select
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
          </select>
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
