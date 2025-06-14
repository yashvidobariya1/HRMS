import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import "./AddJobTitles.css";
import useApiServices from "../../useApiServices";
import Loader from "../Helper/Loader";
import { showToast } from "../../main/ToastManager";
// import { useSelector } from "react-redux";

const AddjobtitleTitles = () => {
  const { GetCall, PostCall } = useApiServices();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  // const companyId = useSelector((state) => state.companySelect.companySelect);
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: "",
  });

  const validate = () => {
    let newErrors = {};

    if (!formData.name) {
      newErrors.name = "Job Name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validate()) {
      try {
        setLoading(true);
        let response;
        if (id) {
          // console.log("id", id);
          response = await PostCall(`/updateJobTitle/${id}`, formData);
        } else {
          response = await PostCall(`/createJobTitle`, formData);
          // console.log("formdata", formData);
        }
        if (response?.data?.status === 200) {
          showToast(response?.data?.message, "success");
          navigate("/jobtitles");
        } else {
          showToast(response?.data?.message, "error");
        }
        setLoading(false);
      } catch (error) {
        console.log("error", error);
      }
    }
  };

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData(function (prev) {
      return { ...prev, [name]: value };
    });
  }

  useEffect(() => {
    const GetClientDetails = async () => {
      try {
        setLoading(true);
        const response = await GetCall(`/getJobTitle/${id}`);
        if (response?.data?.status === 200) {
          setFormData(response?.data?.jobTitle);
        } else {
          showToast(response?.data?.message, "error");
        }
        setLoading(false);
        // console.log("response", response);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    if (id) {
      GetClientDetails(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return <Loader />;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="Addjobtitle-container">
        <div className="Addjobtitle-step-content">
          <div className="Addjobtitle-flex">
            <div className="Addjobtitle-section">
              <div className="Addjobtitle-input-container">
                <label className="label">Job Name*</label>
                <input
                  name="name"
                  className="Addjobtitle-input"
                  placeholder="Enter Job Name"
                  value={formData?.name}
                  onChange={handleChange}
                />
                {errors?.name && <p className="error-text">{errors?.name}</p>}
              </div>
            </div>
            <button type="submit" className="save-button">
              {id ? "Update" : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default AddjobtitleTitles;
