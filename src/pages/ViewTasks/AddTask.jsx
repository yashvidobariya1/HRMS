import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import "./AddTask.css";
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
  const todayDate = moment().format("YYYY-MM-DD");
  const companyId = useSelector((state) => state.companySelect.companySelect);
  const [formData, setFormData] = useState({
    startDate: "",
    taskName: "",
    taskDescription: "",
    startTime: "",
    endTime: "",
    taskDate: "",
    endDate: "",
    userName: "",
    jobName: "",
  });

  const filteredAssignUser = useMemo(() => {
    return Assignuser.filter((user) =>
      user.userName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, Assignuser]);

  const validate = () => {
    let newErrors = {};

    // if (!formData.taskName) {
    //   newErrors.taskName = "Task Name is required";
    // }
    // if (!formData.taskDescription) {
    //   newErrors.taskDescription = "Task Description is required";
    // }
    if (!formData.startTime) {
      newErrors.startTime = "Start Time is required";
    }
    if (!formData.endTime) {
      newErrors.endTime = "End Time is required";
    }

    if (formData.startTime && formData.endTime) {
      const start = moment(formData.startTime, "HH:mm");
      const end = moment(formData.endTime, "HH:mm");

      if (!end.isAfter(start)) {
        newErrors.endTime = "End Time must be greater than Start Time";
      }
    }

    if (!(taskId || id)) {
      if (!formData.startDate) {
        newErrors.startDate = "Start Date is required";
      }

      if (formData.startDate && formData.endDate) {
        const start = moment(formData.startDate, "YYYY-MM-DD");
        const end = moment(formData.endDate, "YYYY-MM-DD");
        if (start > end) {
          newErrors.endDate = "End Date cannot be before Start Date";
        }
      }

      if (!selectedValues || selectedValues.length === 0) {
        newErrors.assignUsers = "At least one employee role must be selected";
      }
    } else {
      if (!formData.taskDate) {
        newErrors.taskDate = "Task Date is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      try {
        setLoading(true);
        const data = {
          taskName: formData.taskName,
          taskDescription: formData.taskDescription,
          startTime: formData.startTime,
          endTime: formData.endTime,
          assignUsers: selectedValues,
          startDate: formData.startDate,
          endDate: formData.endDate,
        };
        let response;
        if (id) {
          response = await PostCall(`/updateTask/${id}`, data);
        } else {
          response = await PostCall("/createTask", data);
        }
        if (response?.data?.status === 200) {
          showToast(response?.data?.message, "success");
          navigate("/stafftask");
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
        setAssignuser(response?.data?.data);
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
  };

  const handleInputchange = (event) => {
    const value = event.target.value;
    setSelectedValues(typeof value === "string" ? value.split(",") : value);
  };

  const GetTaskDetails = async (taskid) => {
    try {
      setLoading(true);
      const response = await GetCall(`/getTask/${taskid}`);
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

  const handleDeleteChip = (tokenToDelete) => {
    console.log(tokenToDelete);
    setSelectedValues((prevSelected) =>
      prevSelected.filter((token) => token !== tokenToDelete)
    );
  };

  const handleReset = () => {
    setFormData({
      startDate: "",
      taskName: "",
      taskDescription: "",
      startTime: "",
      endTime: "",
      taskDate: "",
      endDate: "",
    });
    setSelectedValues([]);
  };

  const handleBack = () => {
    navigate("/stafftask");
  };

  useEffect(() => {
    GetAssignuser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const Taskid = id || taskId;
    if (Taskid) {
      GetTaskDetails(Taskid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, taskId]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="Addtask-main-container">
      {!taskId && (
        <div className="Addtask-container">
          <div className="addtask-section">
            <div className="addtask-input-container">
              <label className="label">Task Name</label>
              <input
                name="taskName"
                className="addtask-input"
                placeholder="Enter Task Name"
                value={formData?.taskName}
                onChange={handleChange}
                disabled={taskId}
              />
              {/* {errors?.taskName && (
                <p className="error-text">{errors?.taskName}</p>
              )} */}
            </div>
            <div className="addtask-input-container">
              <label className="label">Start Time*</label>
              <input
                type="time"
                name="startTime"
                className="addtask-input"
                placeholder="Enter Start Time"
                value={formData?.startTime}
                onChange={handleChange}
                disabled={taskId}
              />
              {errors?.startTime && (
                <p className="error-text">{errors?.startTime}</p>
              )}
            </div>

            <div className="addtask-input-container">
              <label className="label">End Time*</label>
              <input
                type="time"
                name="endTime"
                className="addtask-input"
                placeholder="Enter End Time"
                value={formData?.endTime}
                onChange={handleChange}
                disabled={taskId}
              />
              {errors?.endTime && (
                <p className="error-text">{errors?.endTime}</p>
              )}
            </div>
          </div>

          <div className="addtask-section">
            {!(taskId || id) && (
              <>
                <div className="addtask-input-container">
                  <label className="label">Start Date*</label>
                  <input
                    type="date"
                    name="startDate"
                    className="addtask-input"
                    placeholder="Start Date"
                    value={formData?.startDate}
                    onChange={handleChange}
                    disabled={taskId}
                    // min={todayDate}
                  />
                  {errors?.startDate && (
                    <p className="error-text">{errors?.startDate}</p>
                  )}
                </div>

                <div className="addtask-input-container">
                  <label className="label">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    className="addtask-input"
                    placeholder="End Date"
                    value={formData?.endDate}
                    onChange={handleChange}
                    disabled={taskId}
                    // min={todayDate}
                  />
                  {errors?.endDate && (
                    <p className="error-text">{errors?.endDate}</p>
                  )}
                </div>
              </>
            )}

            {(taskId || id) && (
              <div className="addtask-input-container">
                <label className="label">Task Date*</label>
                <input
                  type="date"
                  name="taskDate"
                  className="addtask-input Disable-addtask"
                  placeholder="Start Date"
                  value={formData?.taskDate}
                  onChange={handleChange}
                  disabled={id || taskId}
                />
                {errors?.taskdate && (
                  <p className="error-text">{errors?.taskDate}</p>
                )}
              </div>
            )}

            <div className="addtask-input-container">
              <label className="label">Task Description</label>
              <textarea
                name="taskDescription"
                className="addtask-input"
                placeholder="Enter task Description"
                rows={3}
                value={formData?.taskDescription}
                onChange={handleChange}
                disabled={taskId}
              />
              {/* {errors?.taskDescription && (
                <p className="error-text">{errors?.taskDescription}</p>
              )} */}
            </div>
          </div>

          {!(taskId || id) ? (
            <div className="addtask-section">
              <div className="addtask-input-container">
                <label>Assign Employee*</label>
                <Select
                  multiple
                  displayEmpty
                  value={selectedValues}
                  className="addtask-input-dropdown"
                  onChange={handleInputchange}
                  MenuProps={{
                    disableAutoFocusItem: true,
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
                              label={selectedJob?.jobName || ""}
                              onMouseDown={(e) => e.stopPropagation()}
                              onDelete={() => handleDeleteChip(token)}
                            />
                          );
                        })}
                      </Box>
                    );
                  }}
                >
                  <ListSubheader
                    sx={{
                      position: "sticky",
                      top: 0,
                      zIndex: 2,
                      backgroundColor: "#fff",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <TextField
                      fullWidth
                      placeholder="Search Employee"
                      className="search-textfield"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </ListSubheader>
                  {filteredAssignUser?.map((user) => {
                    const userRoleTokens =
                      user?.jobRoles?.map((role) => role.token) || [];
                    const allSelected = userRoleTokens.every((token) =>
                      selectedValues.includes(token)
                    );
                    const handleUserAllSelect = () => {
                      if (allSelected) {
                        setSelectedValues((prev) =>
                          prev.filter(
                            (token) => !userRoleTokens.includes(token)
                          )
                        );
                      } else {
                        setSelectedValues((prev) => [
                          ...prev,
                          ...userRoleTokens.filter(
                            (token) => !prev.includes(token)
                          ),
                        ]);
                      }
                    };

                    return [
                      <ListSubheader key={`${user.userId}`}>
                        <Checkbox
                          checked={allSelected}
                          onChange={handleUserAllSelect}
                          onClick={(e) => e.stopPropagation()}
                          sx={{
                            p: { xs: 0.5, sm: 1 },
                            "& .MuiSvgIcon-root": {
                              fontSize: { xs: 18, sm: 22 },
                            },
                          }}
                        />
                        <span>{user.userName}</span>
                      </ListSubheader>,
                      ...user?.jobRoles?.map((role) => (
                        <MenuItem
                          key={role.token}
                          value={role.token}
                          className="menu-item"
                        >
                          <Checkbox
                            checked={selectedValues.includes(role.token)}
                            sx={{
                              p: { xs: 0.5, sm: 1 },
                              "& .MuiSvgIcon-root": {
                                fontSize: { xs: 18, sm: 22 },
                              },
                            }}
                          />
                          <ListItemText
                            primary={role.jobName}
                            primaryTypographyProps={{
                              sx: {
                                fontSize: { xs: "12px", sm: "14px" },
                                ml: { xs: 0.5, sm: 1 },
                              },
                            }}
                          />
                        </MenuItem>
                      )),
                    ];
                  })}
                </Select>
                {errors?.assignUsers && (
                  <p className="error-text">{errors?.assignUsers}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="addtask-section">
              <div className="addtask-input-container">
                <label className="label">Employee Name</label>
                <input
                  type="text"
                  name="userName"
                  className="addtask-input Disable-addtask"
                  disabled
                  value={formData?.userName}
                />
              </div>

              <div className="addtask-input-container">
                <label className="label">Job Title Name</label>
                <input
                  type="text"
                  name="jobName"
                  className="addtask-input Disable-addtask"
                  disabled
                  value={formData?.jobName}
                />
              </div>
            </div>
          )}

          <div className="addtask-reset-button">
            {!taskId && (
              <button
                type="submit"
                className="save-button"
                onClick={handleSubmit}
              >
                {id ? "Update" : "Submit"}
              </button>
            )}
            {!taskId && !id && (
              <button
                type="submit"
                className="save-button reset-addtask"
                onClick={handleReset}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}

      {taskId && (
        <div className="Addtask-container">
          <div className="viewtask-back-button">
            <button onClick={handleBack}>Back</button>
          </div>

          <div className="addtask-section">
            <div className="addtask-input-container">
              <label className="label task-details">Employee Name</label>
              <p>{formData.userName}</p>
            </div>
            <div className="addtask-input-container">
              <label className="label task-details">Job Title</label>
              <p>{formData.jobName}</p>
            </div>

            <div className="addtask-input-container">
              <label className="label task-details">Task Name</label>
              <p>{formData.taskName}</p>
            </div>
          </div>

          <div className="addtask-section">
            <div className="addtask-input-container">
              <label className="label task-details">Task Date</label>
              <p>
                {formData?.taskDate
                  ? moment(formData.taskDate).format("DD/MM/YYYY")
                  : ""}
              </p>
            </div>
            <div className="addtask-input-container">
              <label className="label task-details">Start Time</label>
              <p>{formData.startTime}</p>
            </div>
            <div className="addtask-input-container">
              <label className="label task-details">End Time</label>
              <p>{formData.endTime}</p>
            </div>
          </div>

          <div className="addtask-section">
            <div className="addtask-input-container">
              <label className="label task-details">Task Description</label>
              <p>{formData.taskDescription}</p>
            </div>
            <div className="addtask-input-container"></div>
            <div className="addtask-input-container"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddTask;
