import { useNavigate, useLocation } from "react-router-dom";
import { AiOutlineWarning } from "react-icons/ai"; // Icon from react-icons
import "./Unauthorized.css"; // Create a separate CSS file for styling

const Unauthorized = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const goBack = () => {
    const previousPath = location.state?.from || "/dashboard";
    navigate(previousPath);
  };

  return (
    <div className="unauthorized-container">
      <AiOutlineWarning className="unauthorized-icon" />
      <h1 className="unauthorized-title">Access Denied</h1>
      <p className="unauthorized-message">
        You do not have permission to access this page.
      </p>
      <button className="unauthorized-button" onClick={goBack}>
        Go Back
      </button>
    </div>
  );
};

export default Unauthorized;
