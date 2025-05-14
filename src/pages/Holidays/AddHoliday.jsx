import React, { useState, useEffect } from "react";
import Loader from "../Helper/Loader";
import { GetCall, PostCall } from "../../ApiServices";
import { showToast } from "../../main/ToastManager";
import { useNavigate, useParams } from "react-router";
import "./AddHoliday.css";
// import moment from "moment";
import { useSelector } from "react-redux";
import moment from "moment";

const AddHoliday = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const currentDate = moment().format("YYYY-MM-DD");
  const companyId = useSelector((state) => state.companySelect.companySelect);
  const [formData, setFormData] = useState({
    date: "",
    occasion: "",
    companyId,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFields) => ({
      ...prevFields,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (id) {
      setLoading(true);
      GetCall(`/getHoliday/${id}`)
        .then((response) => {
          if (response?.data?.status === 200) {
            setFormData(response?.data?.holiday);
          } else {
            showToast(response?.data?.message, "error-text");
          }
        })
        .catch((error) => console.error("Error fetching holiday:", error))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const validate = () => {
    let newErrors = {};
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.occasion) newErrors.occasion = "Occasion is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      let response;
      if (id) {
        response = await PostCall(`/updateHoliday/${id}`, formData);
      } else {
        response = await PostCall("/addHoliday", formData);
      }

      if (response?.data?.status === 200) {
        showToast(response?.data?.message, "success");
        navigate(`/holidays/holidaylist`);
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="Addholiday-container">
      <div className="Addholiday-step-content">
        <form onSubmit={handleSubmit} className="Addholiday-flex">
          <div className="Addholiday-input-container date-group">
            <label className="label">Date*</label>
            <input
              type="date"
              className="Addholiday-input"
              name="date"
              value={formData.date}
              onChange={handleChange}
              placeholder="Enter Date"
              min={currentDate}
            />
            {errors.date && <div className="error-text">{errors.date}</div>}
          </div>

          <div className="Addholiday-input-container date-group">
            <label className="label">Occasion*</label>
            <input
              type="text"
              className="Addholiday-input"
              name="occasion"
              value={formData.occasion}
              onChange={handleChange}
              placeholder="Enter occasion"
            />
            {errors.occasion && (
              <div className="error-text">{errors.occasion}</div>
            )}
          </div>

          <button type="submit" className="save-button">
            {id ? "Update Holiday" : "Add Holiday"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddHoliday;
