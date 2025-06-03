import React, { useState } from "react";
import "./AssignClient.css";
import { MenuItem, Select } from "@mui/material";

const AssignClient = ({ onClose, Clientdata, onClientSelect }) => {
  const [AssignClient, setAssignClient] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!AssignClient) {
      setError("Please select Assign Client");
      return;
    }
    // console.log("Selected client:", AssignClient);
    onClientSelect(AssignClient);
    onClose(false);
  };

  const previewClose = () => {
    console.log("Preview close called");
    onClose(true);
  };

  return (
    <div className="clientSelect-overlay">
      <form onSubmit={handleSubmit} className="clientSelect-modal">
        <button className="clientSelect-close-btn" onClick={previewClose}>
          ×
        </button>
        <h1>Select Assign Client</h1>
        <div className="AssignClientselect">
          <Select
            className="ClientSelect-input-dropdown"
            value={AssignClient}
            onChange={(e) => {
              setAssignClient(e.target.value);
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
              Select a Assign Client
            </MenuItem>
            {Clientdata?.map((title, index) => (
              <MenuItem key={index} value={title.clientId}>
                {title.clientName}
              </MenuItem>
            ))}
          </Select>
          {error && <p className="error-text client-select-error">{error}</p>}
        </div>
        <button type="submit" className="assignclient-buttons">
          Submit
        </button>
      </form>
    </div>
  );
};

export default AssignClient;
