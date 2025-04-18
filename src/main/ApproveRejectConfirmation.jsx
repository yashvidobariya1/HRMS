import React from "react";
import "./ApproveRejectConfirmation.css";

const ApproveRejectConfirmation = ({
  title,
  message,
  placeholder,
  reason,
  setReason,
  onSubmit,
  onCancel,
  error,
  actionType,
  leaves,
  setLeaves,
  duration,
}) => {
  const handleChange = (index) => {
    const updatedLeaves = leaves?.map((leave, i) =>
      i === index ? { ...leave, isApproved: !leave?.isApproved } : leave
    );
    setLeaves(updatedLeaves);
  };

  return (
    <div className="approvereject-overlay">
      <div className="approvereject-modal">
        <h3>{title}</h3>
        <p>{message}</p>
        {actionType === "approve" && duration === "Multiple" && (
          <div className="leaves-table-container">
            <table className="leaves-common-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {leaves?.map((leave, i) => (
                  <tr key={i}>
                    <td>{leave?.leaveDate}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={leave?.isApproved || false}
                        onChange={() => handleChange(i)}
                      />
                      {leave?.isApproved}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <textarea
          type="text"
          placeholder={placeholder}
          className="approvereject-input"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows="4"
        />
        {error &&
          Object.entries(error)?.map(([key, value], index) => (
            <div key={index} className="error-text leave-error">
              {value}
            </div>
          ))}
        <div className="approvereject-modal-buttons">
          <button onClick={onSubmit}>{title.split(" ")[0]}</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ApproveRejectConfirmation;
