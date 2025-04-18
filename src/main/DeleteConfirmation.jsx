import React from "react";
import "./DeleteConfirmation.css";

const DeleteConfirmation = ({ confirmation, onConfirm, onCancel }) => {
  return (
    <div className="overlay">
      <div className="modal">
        <p dangerouslySetInnerHTML={{ __html: confirmation }} />
        <div className="modal-buttons">
          <button onClick={onConfirm}>Yes</button>
          <button onClick={onCancel}>No</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
