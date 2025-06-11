import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
// import "./AddJob.css";
import useApiServices from "../../useApiServices";
import Loader from "../Helper/Loader";
import { showToast } from "../../main/ToastManager";
import moment from "moment";
import { useSelector } from "react-redux";
import {
  Checkbox,
  Select,
  MenuItem,
  ListSubheader,
  ListItemText,
  Chip,
  Box,
  TextField,
} from "@mui/material";

const AddTask = () => {
  const { GetCall, PostCall } = useApiServices();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [Assignuser, setAssignuser] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const taskId = queryParams.get("taskId");
  console.log("taskid", taskId);
  const todayDate = moment().format("YYYY-MM-DD");
  const companyId = useSelector((state) => state.companySelect.companySelect);
  const [formData, setFormData] = useState({
    startDate: "",
    taskName: "",
    taskDescription: "",
    startTime: "",
    endTime: "",
    // assignUsers: [],
    endDate: "",
  });

  const filteredAssignUser = useMemo(() => {
    return Assignuser.filter((user) =>
      user.userName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, Assignuser]);

  const validate = () => {
    let newErrors = {};

    if (!formData.startDate) {
      newErrors.startDate = "Start Date is required";
    }
    if (!formData.endDate) {
      newErrors.endDate = "End Date is required";
    }
    if (!formData.taskName) {
      newErrors.taskName = "Task Name is required";
    }
    if (!formData.taskDescription) {
      newErrors.taskDescription = "Task Description is required";
    }
    if (!formData.startTime) {
      newErrors.startTime = "Start Time To is required";
    }
    if (!formData.endTime) {
      newErrors.endTime = "End Time To is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validate()) {
      // console.log("Form Data Submitted:", formData);
      try {
        setLoading(true);
        const data = {
          ...formData,
          assignUsers: selectedValues,
        };
        let response;
        if (id) {
          response = await PostCall(`/updateTask/${id}`, data);
        } else {
          response = await PostCall("/createTask", data);
        }
        if (response?.data?.status === 200) {
          showToast(response?.data?.message, "success");
          navigate("/viewtask/stafftask");
        } else {
          showToast(response?.data?.message, "error");
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log("error", error);
      }
    }
  };

  const GetAssignuser = async () => {
    try {
      setLoading(true);
      const response = await GetCall(
        `/getAllUsersWithJobRoles?companyId=${companyId}`
      );
      if (response?.data?.status === 200) {
        setAssignuser(response.data.data);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    console.log("formdata", formData);
  };

  // const handleInputchange = (e) => {
  //   console.log("e", e);
  //   setSelectedValues(e.target.value);
  // };

  const handleInputchange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedValues(typeof value === "string" ? value.split(",") : value);
  };

  console.log("select value", selectedValues);

  const GetTaskDetails = async () => {
    try {
      setLoading(true);
      const response = await GetCall(`/getTask/${id}`);
      if (response?.data?.status === 200) {
        setFormData(response?.data?.task);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // const handleChipDelete = (tokenToDelete) => {
  //   setSelectedValues((prev) =>
  //     prev.filter((token) => token !== tokenToDelete)
  //   );
  // };

  const handleDeleteChip = (tokenToDelete) => {
    console.log(tokenToDelete);
    setSelectedValues((prevSelected) =>
      prevSelected.filter((token) => token !== tokenToDelete)
    );
  };

  useEffect(() => {
    GetAssignuser();
  }, []);

  useEffect(() => {
    if (id) {
      GetTaskDetails(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="Addjob-main-container">
      <form onSubmit={handleSubmit} aria-label="Job Form">
        <div className="AddJob-container">
          <div className="addjob-section">
            <div className="addjob-input-container">
              <label className="label">task Name*</label>
              <input
                name="taskName"
                className="addjob-input"
                placeholder="Enter Task Name"
                value={formData?.taskName}
                onChange={handleChange}
              />
              {errors?.taskName && (
                <p className="error-text">{errors?.taskName}</p>
              )}
            </div>

            <div className="addjob-input-container">
              <label className="label">Task Description*</label>
              <textarea
                name="taskDescription"
                className="addjob-input"
                placeholder="Enter task Description"
                rows={1}
                value={formData?.taskDescription}
                onChange={handleChange}
              />
              {errors?.taskDescription && (
                <p className="error-text">{errors?.taskDescription}</p>
              )}
            </div>

            <div className="addjob-input-container">
              <label className="label">Start Time*</label>
              <input
                type="time"
                name="startTime"
                className="addjob-input"
                placeholder="Enter Start Time"
                value={formData?.startTime}
                onChange={handleChange}
              />
              {errors?.startTime && (
                <p className="error-text">{errors?.startTime}</p>
              )}
            </div>
          </div>

          <div className="addjob-section">
            <div className="addjob-input-container">
              <label className="label">End Time*</label>
              <input
                type="time"
                name="endTime"
                className="addjob-input"
                placeholder="Enter End Time"
                value={formData?.endTime}
                onChange={handleChange}
              />
              {errors?.endTime && (
                <p className="error-text">{errors?.endTime}</p>
              )}
            </div>

            <>
              <div className="addjob-input-container">
                <label className="label">Start Date*</label>
                <input
                  type="date"
                  name="startDate"
                  className="addjob-input"
                  placeholder="Start Date"
                  value={formData?.startDate}
                  disabled={id}
                  onChange={handleChange}
                />
                {errors?.startDate && (
                  <p className="error-text">{errors?.startDate}</p>
                )}
              </div>

              <div className="addjob-input-container">
                <label className="label">End Date*</label>
                <input
                  type="date"
                  name="endDate"
                  className="addjob-input"
                  placeholder="End Date"
                  value={formData?.endDate}
                  disabled={id}
                  onChange={handleChange}
                />
                {errors?.endDate && (
                  <p className="error-text">{errors?.endDate}</p>
                )}
              </div>
            </>
          </div>

          <div className="addjob-section">
            <div className="addjob-input-container">
              <label>Assign Employee*</label>
              <Select
                multiple
                displayEmpty
                value={selectedValues}
                className="addemployee-input-dropdown"
                onChange={handleInputchange}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 400,
                      overflowX: "auto",
                      maxWidth: 200,
                    },
                  },
                  MenuListProps: {
                    onMouseDown: (e) => {
                      if (e.target.closest(".search-textfield")) {
                        e.stopPropagation();
                      }
                    },
                  },
                }}
                renderValue={(selected) => {
                  if (selected.length === 0) {
                    return "Select Employee";
                  }
                  return (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((token) => {
                        const selectedJob = Assignuser?.flatMap((user) =>
                          user.jobRoles?.map((role) => ({
                            token: role.token,
                            jobName: role.jobName,
                          }))
                        ).find((r) => r.token === token);

                        return (
                          <Chip
                            key={token}
                            label={selectedJob?.jobName || token}
                            onMouseDown={(e) => e.stopPropagation()}
                            onDelete={() => handleDeleteChip(token)}
                          />
                        );
                      })}
                    </Box>
                  );
                }}
              >
                <ListSubheader>
                  <TextField
                    fullWidth
                    placeholder="Search Employee"
                    className="search-textfield"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </ListSubheader>
                {filteredAssignUser?.map((user) => [
                  <ListSubheader key={`header-${user.userId}`}>
                    {user.userName}
                  </ListSubheader>,
                  ...user?.jobRoles?.map((role) => (
                    <MenuItem
                      key={role.token}
                      value={role.token}
                      className="menu-item"
                    >
                      <Checkbox checked={selectedValues.includes(role.token)} />
                      <ListItemText primary={role.jobName} />
                    </MenuItem>
                  )),
                ])}
              </Select>
            </div>
          </div>
          <button type="submit" className="save-button">
            {id ? "Update" : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTask;
