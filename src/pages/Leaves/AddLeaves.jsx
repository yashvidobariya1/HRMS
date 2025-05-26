import React, { useState, useEffect } from "react";
import Loader from "../Helper/Loader";
import { GetCall, PostCall } from "../../ApiServices";
import { showToast } from "../../main/ToastManager";
import { useNavigate, useParams } from "react-router";
import "./AddLeaves.css";
import moment from "moment";
import { useSelector } from "react-redux";
import { MenuItem, Select } from "@mui/material";
import AssignClient from "../../SeparateCom/AssignClient";

const AddLeaves = () => {
  const navigate = useNavigate();
  // const location = useLocation();
  // const queryParams = new URLSearchParams(location.search);
  // const jobId = queryParams.get("jobId");
  const jobId = useSelector((state) => state.jobRoleSelect.jobRoleSelect.jobId);
  const [calculatedDays, setCalculatedDays] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [type, setType] = useState("Day");
  // const currentDate = new Date().toISOString().split("T")[0];
  const currentDate = moment().format("YYYY-MM-DD");
  // console.log(currentDate);
  // console.log("jobId", jobId);
  const { id } = useParams();
  const Jobtitle = useSelector(
    (state) => state.jobRoleSelect.jobRoleSelect.jobName
  );
  const [openClietnSelectModal, setopenClietnSelectModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [Clientdata, setClientdata] = useState([]);
  const jobRoleId = useSelector(
    (state) => state.jobRoleSelect.jobRoleSelect.jobId
  );
  // console.log("Jobtitle", Jobtitle);

  const [formData, setformData] = useState({
    selectionDuration: "",
    startDate: "",
    endDate: "",
    leaveType: "",
    reasonOfLeave: "",
    jobTitle: Jobtitle,
  });
  const durationType = [
    { value: "Full-Day", label: "Full Day" },
    { value: "Multiple", label: "Multiple Days" },
    { value: "First-Half", label: "First Half" },
    { value: "Second-Half", label: "Second Half" },
  ];

  const getAllowLeaveCount = async () => {
    try {
      setLoading(true);
      const response = await PostCall("/getAllowLeaveCount", {
        jobId: jobId,
      });
      if (response?.data?.status === 200) {
        setLeaveTypes(response?.data.leaveCount);
        // console.log("response", response?.data.leaveCount);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching timesheets:", error);
    }
  };

  const GetClientdata = async () => {
    try {
      const response = await PostCall(`/getUsersAssignClients`, {
        jobId: jobRoleId,
      });

      if (response?.data?.status === 200) {
        const jobTitles = response.data.assignClients;
        // console.log("job title", jobTitles);
        setClientdata(jobTitles);

        if (jobTitles.length > 1) {
          setopenClietnSelectModal(false);
        } else {
          setSelectedClientId(jobTitles[0]?.clientId);
          setopenClietnSelectModal(true);
        }
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    getAllowLeaveCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setformData((prevFields) => ({
      ...prevFields,
      [name]: value,
    }));
    if (name === "leaveType") {
      const selected = leaveTypes.find((lt) => lt.leaveType === value);
      if (selected) {
        setType(selected.type);
      }
    }
  };

  const handlePopupClose = () => {
    setopenClietnSelectModal(true);
  };

  const handleClientSelect = (selectedTitle) => {
    setSelectedClientId(selectedTitle);
    setopenClietnSelectModal(true);
  };

  const validate = () => {
    let newErrors = {};

    if (!formData.leaveType) {
      newErrors.leaveType = "Leave type is required";
    }

    if (!formData.selectionDuration) {
      newErrors.selectionDuration = "Selection Duration is required";
    } else if (type === "Hour") {
      const isValidInteger = /^[1-9]\d*$/;
      if (!isValidInteger.test(formData.selectionDuration)) {
        newErrors.selectionDuration =
          "Only positive whole numbers are allowed for Hour";
      }
    }

    // if (!formData.reasonOfLeave) {
    //   newErrors.reasonOfLeave = "Reason of Leave is required";
    // }

    if (!formData.startDate) {
      newErrors.startDate = "start Date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    GetClientdata();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobRoleId]);

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = moment(formData.startDate);
      const end = moment(formData.endDate);
      const timeDiff = end - start;
      const days = timeDiff / (1000 * 3600 * 24) + 1;
      setCalculatedDays(days);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.startDate, formData.endDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const { selectionDuration, startDate, endDate, leaveType, reasonOfLeave } =
      formData;

    // let leaveDays = 0;
    let newformdata = {};

    // if (leaveType === "Sick" && leaveTypes.Sick < calculatedDays) {
    //   setErrors((prevErrors) => ({
    //     ...prevErrors,
    //     leaveType: `Your leave is only ${leaveTypes.Sick} days available for Sick leave.`,
    //   }));
    //   return;
    // }

    // if (leaveType === "Causal" && leaveTypes.Causal < calculatedDays) {
    //   setErrors((prevErrors) => ({
    //     ...prevErrors,
    //     leaveType: `Your leave is only ${leaveTypes.Causal} days available for Causal leave.`,
    //   }));
    //   return;
    // }

    // if (selectionDuration === "Multiple" && startDate && endDate) {
    //   const start = new Date(startDate);
    //   const end = new Date(endDate);
    //   leaveDays = (end - start) / (1000 * 60 * 60 * 24) + 1;
    //   console.log("leave day", leaveDays);

    //   newformdata = {
    //     leaveType,
    //     startDate,
    //     endDate,
    //     jobId,
    //     reasonOfLeave,
    //     selectionDuration,
    //     // leaveDays,
    //   };
    // } else if (
    //   selectionDuration === "Full-Day" ||
    //   selectionDuration === "First-Half" ||
    //   selectionDuration === "Second-Half"
    // ) {
    //   leaveDays = selectionDuration === "Full-Day" ? 1 : 0.5;
    //   setCalculatedDays(leaveDays);

    //   newformdata = {
    //     leaveType,
    //     startDate,
    //     jobId,
    //     reasonOfLeave,
    //     selectionDuration,
    //     // leaveDays,
    //   };
    // }

    newformdata = {
      leaveType,
      startDate,
      jobId,
      reasonOfLeave,
      selectionDuration,
    };
    if (selectionDuration === "Multiple") newformdata.endDate = endDate;

    // console.log("submit data", newformdata);

    try {
      setLoading(true);
      let response;
      if (id) {
        response = await PostCall(`/updateLeaveRequest/${id}`, formData);
      } else {
        response = await PostCall("/leaveRequest", {
          ...formData,
          jobId,
          clientId: selectedClientId,
        });
      }

      if (response?.data?.status === 200) {
        showToast(response?.data?.message, "success");
        navigate("/leaves");
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    if (id) {
      setLoading(true);
      GetCall(`/getLeaveRequest/${id}`)
        .then((response) => {
          if (response?.data?.status === 200) {
            setformData(response?.data?.leave);
          } else {
            showToast(response?.data?.message, "error");
          }
        })
        .catch((error) => console.error("Error fetching holiday:", error))
        .finally(() => setLoading(false));
    }
  }, [id]);

  // short code for handleSubmit (testing pending)
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   if (!validate()) return;

  //   const { selectionDuration, startDate, endDate, leaveType, reasonOfLeave } = formData;
  //   let leaveDays = 0;

  //   if (leaveTypes[leaveType] < calculatedDays) {
  //     return setErrors((prev) => ({
  //       ...prev,
  //       leaveType: `Your leave is only ${leaveTypes[leaveType]} days available for ${leaveType} leave.`,
  //     }));
  //   }

  //   let newformdata = {
  //     leaveType,
  //     reasonOfLeave,
  //     jobId,
  //     selectionDuration,
  //     leaveDays: selectionDuration === "Full-Day" ? 1 : selectionDuration.includes("Half") ? 0.5 : 0,
  //     ...(selectionDuration === "Multiple" && startDate && endDate
  //       ? { startDate, endDate, leaveDays: (new Date(endDate) - new Date(startDate)) / 86400000 + 1 }
  //       : { startDate }),
  //   };

  //   console.log("submit data", newformdata);

  //   try {
  //     setLoading(true);
  //     const response = await PostCall("/leaveRequest", newformdata);
  //     showToast(response?.data?.message, response?.data?.status === 200 ? "success" : "error");
  //     if (response?.data?.status === 200) navigate("/leaves");
  //   } catch (error) {
  //     console.log("error-text", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    GetClientdata();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobRoleId]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="Addleave-container">
      {!openClietnSelectModal && Clientdata.length > 1 && (
        <AssignClient
          onClose={handlePopupClose}
          Clientdata={Clientdata}
          onClientSelect={handleClientSelect}
        />
      )}
      <div className="Addleave-step-content">
        <form onSubmit={handleSubmit} className="addleave-flex">
          <div className="addleave-input-container date-group">
            <label className="label">Leave Type*</label>
            {/* <select
              className="addleave-input"
              name="leaveType"
              data-testid="leave-type"
              value={formData.leaveType}
              onChange={handleChange}
            >
              <option value="" disabled>
                Select Leave Type
              </option>
              {leaveTypes?.map((leaveType) => (
                <option key={leaveType.leaveType} value={leaveType.leaveType}>
                  {leaveType.leaveType} ({leaveType.count} {leaveType.type})
                </option>
              ))}
            </select> */}
            <Select
              className="addleave-input-dorpdown"
              name="leaveType"
              data-testid="leave-type"
              value={formData.leaveType}
              onChange={handleChange}
              displayEmpty
              MenuProps={{
                PaperProps: {
                  style: {
                    width: 200,
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxHeight: 200,
                    scrollbarWidth: "thin",
                    overflowX: "auto",
                  },
                },
              }}
            >
              <MenuItem value="" disabled>
                Select Leave
              </MenuItem>
              {leaveTypes.map((leaveType) => (
                <MenuItem key={leaveType.leaveType} value={leaveType.leaveType}>
                  {leaveType.leaveType} ({leaveType.count} {leaveType.type})
                </MenuItem>
              ))}
            </Select>
            {errors.leaveType && (
              <div className="error-text">{errors.leaveType}</div>
            )}
          </div>

          <div className="addleave-input-container">
            <label className="label">Select Duration*</label>
            {type === "Day" ? (
              <div className="addleave-radio-flex">
                {durationType?.map((option) => (
                  <div className="pension-contract" key={option.value}>
                    <input
                      type="radio"
                      name="selectionDuration"
                      value={option.value}
                      checked={formData.selectionDuration === option.value}
                      onChange={handleChange}
                    />
                    <label>{option.label}</label>
                  </div>
                ))}
              </div>
            ) : (
              <input
                type="number"
                name="selectionDuration"
                className="addleave-radio-flex"
                placeholder="Enter duration in hours"
                value={formData.selectionDuration}
                onChange={handleChange}
              />
            )}
            {errors.selectionDuration && (
              <div className="error-text">{errors.selectionDuration}</div>
            )}
          </div>

          <div className="addleave-input-container">
            {formData.selectionDuration === "Multiple" ? (
              <div className="date-input-flex">
                <div className="date-group">
                  <label className="label">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    className="addleave-input"
                    value={formData.startDate}
                    onChange={handleChange}
                    min={currentDate}
                  />
                  {errors.startDate && (
                    <div className="error-text">{errors.startDate}</div>
                  )}
                </div>
                <div className="addleave-date-group">
                  <label className="label">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    className="addleave-input"
                    value={formData.endDate}
                    onChange={handleChange}
                    min={currentDate}
                  />
                </div>
              </div>
            ) : (
              <div className="date-group">
                <label className="label">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  data-testid="start-date"
                  className="addleave-input"
                  value={formData.startDate}
                  onChange={handleChange}
                  min={currentDate}
                />
                {errors.startDate && (
                  <div className="error-text">{errors.startDate}</div>
                )}
              </div>
            )}
            {calculatedDays > 0 && (
              <div className="addleave-input-container selecte-date-addleave">
                <div className="error-text">
                  {calculatedDays} day{calculatedDays > 1 ? "s" : ""} Selected
                </div>
              </div>
            )}
          </div>

          <div className="addleave-input-container">
            <label className="label">Leave Of Absence*</label>
            <textarea
              type="text"
              rows="4"
              cols="2"
              name="reasonOfLeave"
              className="addleave-input-flex"
              placeholder="Enter reason of leave"
              value={formData.reasonOfLeave}
              onChange={handleChange}
            />
            {errors.reasonOfLeave && (
              <div className="error-text">{errors.reasonOfLeave}</div>
            )}
          </div>

          <button type="submit" className="save-button">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddLeaves;
