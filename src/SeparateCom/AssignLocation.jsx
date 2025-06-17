import React, { useState } from "react";
import "./AssignClient.css";
import { MenuItem, Select } from "@mui/material";

const AssignLocation = ({ onClose, Locationdata, onLocationSelect }) => {
  const [assignLocation, setAssignLocation] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!assignLocation) {
      setError("Please select Assign Client");
      return;
    }
    // console.log("Selected location:", assignLocation);
    onLocationSelect(assignLocation);
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
        <h1>Select Assign Locatoin</h1>
        <div className="assignLocationselect">
          <Select
            className="ClientSelect-input-dropdown"
            value={assignLocation}
            onChange={(e) => {
              setAssignLocation(e.target.value);
              setError("");
            }}
            displayEmpty
            MenuProps={{
              PaperProps: {
                style: {
                  width: 200,
                  width: 150,
                  overflowX: "auto",
                  scrollbarWidth: "thin",
                  maxHeight: 200,
                },
              },
            }}
          >
            <MenuItem value="" disabled>
              Select a Assign Location
            </MenuItem>
            {Locationdata?.map((title, index) => (
              <MenuItem key={index} value={title.locationId}>
                {title.locationName}
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

export default AssignLocation;
