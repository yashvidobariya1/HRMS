import React from "react";
import "./DeleteConfirmationWithPermission.css";

const DeleteConfirmationWithPermission = ({
  confirmation,
  permissionMessage,
  isChecked,
  onCheckboxChange,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="overlay">
      <div className="modal">
        <p dangerouslySetInnerHTML={{ __html: confirmation }} />

        <div className="checkbox-container">
          <input
            type="checkbox"
            className="permission-checkbox"
            checked={isChecked}
            onChange={onCheckboxChange}
          />
          {permissionMessage && (
            <p className="permission-message">{permissionMessage}</p>
          )}
        </div>

        <div className="modal-buttons">
          <button onClick={onConfirm}>Yes</button>
          <button onClick={onCancel}>No</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationWithPermission;
