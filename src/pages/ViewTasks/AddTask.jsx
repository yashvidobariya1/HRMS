import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
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
  FormControl,
  InputLabel,
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
  const [clientList, setClientList] = useState([]);
  const { id } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [Assignuser, setAssignuser] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);
  const companyId = useSelector((state) => state.companySelect.companySelect);
  const [formData, setFormData] = useState({
    taskDate: "",
    taskName: "",
    taskDescription: "",
    startTime: "",
    endTime: "",
    // startDate: "",
    endDate: "",
  });

  const filterTask = useMemo(() => {
    if (!searchTerm) return Assignuser;

    return Assignuser.map((group) => {
      const filteredChildren = group.children.filter((child) =>
        child.jobname.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (
        group.jobname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        filteredChildren.length > 0
      ) {
        return {
          ...group,
          children: filteredChildren,
        };
      }

      return null;
    }).filter(Boolean);
  }, [searchTerm, Assignuser]);

  const validate = () => {
    let newErrors = {};

    if (!formData.taskDate) {
      newErrors.taskDate = "Job Date is required";
    }
    if (!formData.taskName) {
      newErrors.taskName = "Job Name is required";
    }
    if (!formData.taskDescription) {
      newErrors.taskDescription = "Job Description is required";
    }
    if (!formData.locationId) {
      newErrors.locationId = "location Id is required";
    }
    if (!formData.startTime) {
      newErrors.startTime = "start Time To is required";
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
          //   userId: selectedEmployee ? selectedEmployee : "",
          userId: "",
          //   jobId: selectedJobId ? selectedJobId : jobRoleId,
          jobId: "",
          //   clientId: selectedClientId,
          clientId: "",
        };
        let response;
        if (formData._id) {
          response = await PostCall(`/updateTask/${formData._id}`, data);
        } else {
          response = await PostCall("/createTask", data);
        }
        if (response?.data?.status === 200) {
          showToast(response?.data?.message, "success");
          //   setTaskList((prev) => {
          //     if (formData._id) {
          //       return prev.map((task) =>
          //         task._id === formData._id ? { ...task, ...formData } : task
          //       );
          //     } else {
          //       return [...prev, { ...formData, _id: response?.data?.taskId }];
          //     }
          //   });
          //   navigate(`/job`);
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
        const transformedData = response?.data?.data.map((user) => ({
          jobname: user.userName,
          children: user.jobRoles.map((job) => ({
            value: job.jobId,
            jobname: job.jobName,
          })),
        }));
        setAssignuser(transformedData);
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
    setSelectedValues(e.target.value);
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const GetJobDetails = async () => {
    try {
      setLoading(true);
      const response = await GetCall(`/getJobPost/${id}`);
      if (response?.data?.status === 200) {
        setFormData(response?.data?.jobPost);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    GetAssignuser();
  }, []);

  useEffect(() => {
    if (id) {
      GetJobDetails(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    GetLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const GetLocations = async () => {
    try {
      setLoading(true);

      const response = await GetCall(
        `/getCompanyLocationsForJobPost?companyId=${companyId}`
      );

      if (response?.data?.status === 200) {
        setClientList(response?.data?.clients);
      } else if (response?.data?.status === 404) {
        setClientList([]);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
      // console.log("Company", Company);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="Addjob-main-container">
      <form onSubmit={handleSubmit} aria-label="Job Form">
        <div className="AddJob-container">
          <div className="addjob-section">
            <div className="addjob-input-container">
              <label className="label">Job Date*</label>
              <input
                name="jobTitle"
                className="addjob-input"
                placeholder="Enter Job Title"
                value={formData?.taskDate}
                onChange={handleChange}
              />
              {errors?.taskDate && (
                <p className="error-text">{errors?.taskDate}</p>
              )}
            </div>

            <div className="addjob-input-container">
              <label className="label">task Name*</label>
              <input
                name="taskName"
                className="addjob-input"
                placeholder="Enter Job Title"
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
              {errors?.taskDate && (
                <p className="error-text">{errors?.taskDescription}</p>
              )}
            </div>
          </div>

          <div className="addjob-section">
            <div className="addjob-input-container">
              <label className="label">Assign Task*</label>
              <FormControl fullWidth>
                <Select
                  className="addemployee-input-dropdown"
                  multiple
                  MenuProps={{
                    disableAutoFocusItem: true,
                    PaperProps: {
                      style: {
                        maxWidth: 200,
                        maxHeight: 400,
                        overflowX: "auto",
                        scrollbarWidth: "thin",
                      },
                    },
                  }}
                  value={selectedValues}
                  onChange={handleChange}
                  renderValue={(selected) => {
                    if (!selected || selected.length === 0) {
                      return "Select Employee";
                    }

                    return (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((value) => {
                          const job = Assignuser.flatMap(
                            (group) => group.children
                          ).find((child) => child.value === value);

                          return (
                            <Chip
                              key={value}
                              label={job ? job.jobname : value}
                            />
                          );
                        })}
                      </Box>
                    );
                  }}
                >
                  <ListSubheader>
                    <TextField
                      size="small"
                      placeholder="Search Assign"
                      fullWidth
                      className="search-textfield"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </ListSubheader>
                  <MenuItem value="" disabled>
                    Select Assign Employee
                  </MenuItem>
                  {filterTask.map((group, groupIndex) => [
                    <ListSubheader key={`group-${groupIndex}`}>
                      {group.jobname}
                    </ListSubheader>,
                    group.children.map((child) => (
                      <MenuItem
                        key={child.value}
                        value={child.value}
                        className="menu-item"
                      >
                        <Checkbox
                          checked={selectedValues.includes(child.value)}
                        />
                        <ListItemText primary={child.jobname} />
                      </MenuItem>
                    )),
                  ])}
                </Select>
              </FormControl>
            </div>
            <div className="addjob-input-container">
              <label className="label">Start Time*</label>
              <input
                name="startTime"
                className="addjob-input"
                placeholder="Enter task Description"
                value={formData?.startTime}
                onChange={handleChange}
              />
              {errors?.startTime && (
                <p className="error-text">{errors?.startTime}</p>
              )}
            </div>

            <div className="addjob-input-container">
              <label className="label">End Time</label>
              <input
                name="endTime"
                className="addjob-input"
                placeholder="Enter task Description"
                value={formData?.endTime}
                onChange={handleChange}
              />
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
