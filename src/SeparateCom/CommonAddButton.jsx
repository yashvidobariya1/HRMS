import React from "react";
import PropTypes from "prop-types";
import "./CommonAddButton.css";

const CommonAddButton = ({ label, onClick, icon: Icon }) => {
  return (
    <button className="common-button" onClick={onClick}>
      {Icon && <Icon className="common-button-icon" />}
      {label}
    </button>
  );
};

CommonAddButton.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  icon: PropTypes.elementType,
};

export default CommonAddButton;
