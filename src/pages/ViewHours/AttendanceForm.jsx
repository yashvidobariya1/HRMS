import { useEffect, useMemo, useState } from "react";
import "./AttendanceForm.css";
import useApiServices from "../../useApiServices";
import { showToast } from "../../main/ToastManager";
import { ListSubheader, MenuItem, Select, TextField } from "@mui/material";
import { useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router";
import Loader from "../Helper/Loader";
import CommonAddButton from "../../SeparateCom/CommonAddButton";

const AttendanceForm = () => {
  const { GetCall, PostCall } = useApiServices();
  const { id, entryId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const formMode = location.pathname.split("/")[2];
  const companyId = useSelector((state) => state.companySelect.companySelect);
  const [loading, setLoading] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const [clientList, setClientList] = useState([]);
  const [locationList, setLocationList] = useState([]);
  const [jobTitleList, setJobTitleList] = useState([]);
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [jobTitleSearchTerm, setJobTitleSearchTerm] = useState("");
  const [locationSearchTerm, setLocationSearchTerm] = useState("");
  const [isWorkFromOffice, setIsWorkFromOffice] = useState(false);

  const [formData, setFormData] = useState({
    userId: "",
    clientId: "",
    locationId: "",
    jobId: "",
    clockIn: "",
    clockOut: "",
    comment: "",
  });

  const filteredEmployeeList = useMemo(() => {
    return employeeList.filter((user) =>
      user?.userName?.toLowerCase()?.includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, employeeList]);

  const filteredClientList = useMemo(() => {
    return clientList.filter((client) =>
      client.clientName.toLowerCase().includes(clientSearchTerm.toLowerCase())
    );
  }, [clientList, clientSearchTerm]);

  const filteredLocationList = useMemo(() => {
    return locationList.filter((location) =>
      location.locationName
        .toLowerCase()
        .includes(locationSearchTerm.toLowerCase())
    );
  }, [locationList, locationSearchTerm]);

  const filteredJobTitleList = useMemo(() => {
    return jobTitleList.filter((jobTitle) =>
      jobTitle.jobName.toLowerCase().includes(jobTitleSearchTerm.toLowerCase())
    );
  }, [jobTitleList, jobTitleSearchTerm]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Remove error message if user corrects the input
    if (errors[field] && value) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // Special logic: update isWorkFromOffice when job title changes
    if (field === "jobId") {
      const selectedJob = jobTitleList.find((job) => job.jobId === value);
      setIsWorkFromOffice(selectedJob?.isWorkFromOffice || false);
    }
  };

  const validate = () => {
    const newError = {};
    if (!formData.userId) newError.userId = "Employee is required";
    if (!formData.clientId && !isWorkFromOffice)
      newError.clientId = "Client is required";
    if (!formData.locationId && isWorkFromOffice)
      newError.locationId = "Location is required";
    if (!formData.jobId) newError.jobId = "Job Title is required";
    if (!formData.clockIn) newError.clockIn = "ClockIn is required";
    if (!formData.clockOut) newError.clockOut = "ClockOut is required";

    setErrors(newError);
    return Object.keys(newError).length === 0;
  };

  const handleAttendanceSubmit = async () => {
    if (validate()) {
      try {
        setLoading(true);
        const payload = {
          userId: formData.userId,
          clientId: formData.clientId,
          locationId: formData.locationId,
          isWorkFromOffice,
          jobId: formData.jobId,
          clockIn: formData.clockIn.replace("T", " "),
          clockOut: formData.clockOut.replace("T", " "),
          comment: formData.comment,
          // clockIn: moment(formData.clockIn).utc().format(),
          // clockOut: moment(formData.clockOut).utc().format(),
        };

        let response;
        if (id && entryId) {
          response = await PostCall(
            `/updateTimesheetEntry?timesheetId=${id}&entryId=${entryId}`,
            payload
          );
        } else {
          response = await PostCall("/addTimesheetEntry", payload);
        }

        if (response?.data?.status === 200) {
          showToast(response?.data?.message, "success");
          navigate("/staffviewhours");
        } else {
          showToast(response?.data?.message, "error");
        }
      } catch (error) {
        console.error("Error submitting attendance:", error);
        showToast("Failed to submit attendance. Please try again.", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  // const handleLocationChange = (value) => {
  //   setSelectedLocation(value);
  // };

  const handleReset = () => {
    setFormData({
      userId: "",
      clientId: "",
      locationId: "",
      jobId: "",
      clockIn: "",
      clockOut: "",
      comment: "",
    });
  };

  const getAllClientsOfUser = async () => {
    try {
      setLoading(true);
      const response = await GetCall(
        `/getAllClientsOfUser?companyId=${companyId}&userId=${formData?.userId}`
      );
      if (response?.data?.status === 200) {
        setClientList(response?.data?.clients);
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast("Getting Error while fetch Clients.", "error");
    } finally {
      setLoading(false);
    }
  };

  const getAllUsersOfClient = async () => {
    console.log(companyId);
    try {
      setLoading(true);
      const response = await GetCall(
        `/getAllUsersOfClientOrLocation?companyId=${companyId}`
      );
      if (response?.data?.status === 200) {
        setEmployeeList(response?.data.users);
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast("Getting error while fetch Employees.", "error");
    } finally {
      setLoading(false);
    }
  };

  const GetJobTitleData = async () => {
    try {
      setLoading(true);
      const response = await GetCall(
        `/getUserJobTitles?EmployeeId=${formData?.userId}`
      );

      if (response?.data?.status === 200) {
        setJobTitleList(response?.data?.jobTitles);
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast("Getting error while fetch Job titles.", "error");
    } finally {
      setLoading(false);
    }
  };

  const GetUsersJobLocations = async () => {
    try {
      const response = await GetCall(
        `/getUsersJobLocations?userId=${formData?.userId}&jobId=${formData?.jobId}`
      );

      if (response?.data?.status === 200) {
        setLocationList(response?.data?.locations);
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast("Getting error while fetch Locations.", "error");
    } finally {
      setLoading(false);
    }
  };

  const GetEnteryData = async () => {
    try {
      setLoading(true);
      const response = await GetCall(
        `/getTimesheetEntryData?timesheetId=${id}&entryId=${entryId}`
      );

      if (response?.data?.status === 200) {
        setFormData(response?.data?.timesheetData);
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && entryId) GetEnteryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, entryId]);

  useEffect(() => {
    if (formData?.jobId !== "" && !isWorkFromOffice) getAllClientsOfUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData?.jobId, companyId]);

  useEffect(() => {
    getAllUsersOfClient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  useEffect(() => {
    console.log(formData.userId);
    if (formData?.userId) GetJobTitleData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData?.userId, companyId]);

  useEffect(() => {
    if (!formData?.jobId && isWorkFromOffice) GetUsersJobLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData?.jobId]);

  useEffect(() => {
    setFormData({
      userId: "",
      clientId: "",
      locationId: "",
      jobId: "",
      clockIn: "",
      clockOut: "",
      comment: "",
    });
  }, [companyId]);

  useEffect(() => {
    if (formData.userId && !id && !entryId) {
      setIsWorkFromOffice(false);
      setFormData((prev) => ({
        ...prev,
        clientId: "",
        locationId: "",
        jobId: "",
        clockIn: "",
        clockOut: "",
        comment: "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData?.userId]);

  return (
    <>
      {loading ? (
        <div className="loader-wrapper">
          <Loader />
        </div>
      ) : (
        <div className="attendanceform-container">
          <div className="attendanceForm-heading">
            <h1>
              {formMode === "viewattendanceform"
                ? "View Attendance"
                : formMode === "editattendanceform"
                ? "Edit Attendance"
                : "Mark Attendance"}
            </h1>
            <CommonAddButton
              label="Back"
              onClick={() => navigate("/staffviewhours")}
            />
          </div>
          <div className="attendanceform-section">
            <div className="attendanceform-input-container">
              <label>Select Employee*</label>
              <Select
                className={`attendanceform-input-dropdown ${
                  formMode === "viewattendanceform" ||
                  formMode === "editattendanceform"
                    ? "Disable-addtask"
                    : ""
                }`}
                disabled={
                  formMode === "viewattendanceform" ||
                  formMode === "editattendanceform"
                }
                value={formData?.userId || ""}
                onChange={(e) => handleChange("userId", e.target.value)}
                displayEmpty
                MenuProps={{
                  disableAutoFocusItem: true,
                  PaperProps: {
                    style: {
                      width: 150,
                      overflowX: "auto",
                      scrollbarWidth: "thin",
                      maxHeight: 300,
                    },
                  },
                  MenuListProps: {
                    onMouseDown: (e) => {
                      if (e.target.closest(".search-textfield")) {
                        e.stopPropagation();
                      }
                    },
                    onClick: (e) => {
                      if (e.target.closest(".search-textfield")) {
                        e.stopPropagation();
                      }
                    },
                  },
                }}
                renderValue={(selected) => {
                  if (!selected) return "Select Employee";
                  // if (selected === "allUsers") return "All Employees";
                  const found = employeeList.find(
                    (emp) => emp._id === selected
                  );
                  return found?.userName || "All Employees";
                }}
              >
                <ListSubheader>
                  <TextField
                    size="small"
                    placeholder="Search Employee"
                    fullWidth
                    className="search-textfield"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </ListSubheader>
                {filteredEmployeeList.length > 0 ? (
                  filteredEmployeeList.map((emp) => (
                    <MenuItem
                      key={emp._id}
                      value={emp._id}
                      className="menu-item"
                    >
                      {emp.userName}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="" disabled className="menu-item">
                    No found Employee
                  </MenuItem>
                )}
              </Select>
              {errors.userId && <p className="error-text">{errors.userId}</p>}
            </div>

            <div className="attendanceform-input-container">
              <label>Select Job Title*</label>
              <Select
                className={`attendanceform-input-dropdown ${
                  formMode === "viewattendanceform" ||
                  formMode === "editattendanceform"
                    ? "Disable-addtask"
                    : ""
                }`}
                disabled={
                  formMode === "viewattendanceform" ||
                  formMode === "editattendanceform"
                }
                value={formData?.jobId || ""}
                onChange={(e) => handleChange("jobId", e.target.value)}
                displayEmpty
                MenuProps={{
                  disableAutoFocusItem: true,
                  PaperProps: {
                    style: {
                      width: 150,
                      overflowX: "auto",
                      scrollbarWidth: "thin",
                      maxHeight: 200,
                    },
                  },
                  MenuListProps: {
                    onMouseDown: (e) => {
                      if (e.target.closest(".search-textfield")) {
                        e.stopPropagation();
                      }
                    },
                    onClick: (e) => {
                      if (e.target.closest(".search-textfield")) {
                        e.stopPropagation();
                      }
                    },
                  },
                }}
                renderValue={(selected) => {
                  if (!selected) return "Select Job Title";
                  // if (selected === "allUsers") return "All Employees";
                  const found = jobTitleList.find(
                    (job) => job.jobId === selected
                  );
                  return found?.jobName || "All Job Titles";
                }}
              >
                <ListSubheader>
                  <TextField
                    size="small"
                    placeholder="Search Job Title"
                    fullWidth
                    className="search-textfield"
                    value={jobTitleSearchTerm}
                    onChange={(e) => setJobTitleSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </ListSubheader>
                {filteredJobTitleList.length > 0 ? (
                  filteredJobTitleList.map((job, i) => (
                    <MenuItem
                      key={job.jobId}
                      value={job.jobId}
                      className="menu-item"
                    >
                      {job.jobName}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="" disabled className="menu-item">
                    No found Job Title
                  </MenuItem>
                )}
              </Select>
              {errors.jobId && <p className="error-text">{errors.jobId}</p>}
            </div>

            {!isWorkFromOffice && (
              <div className="attendanceform-input-container">
                <label>Select Client*</label>
                <Select
                  className={`attendanceform-input-dropdown ${
                    formMode === "viewattendanceform" ||
                    formMode === "editattendanceform"
                      ? "Disable-addtask"
                      : ""
                  }`}
                  disabled={
                    formMode === "viewattendanceform" ||
                    formMode === "editattendanceform"
                  }
                  value={formData?.clientId || ""}
                  onChange={(e) => handleChange("clientId", e.target.value)}
                  displayEmpty
                  MenuProps={{
                    disableAutoFocusItem: true,
                    PaperProps: {
                      style: {
                        width: 150,
                        maxHeight: 200,
                        overflowX: "auto",
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
                    if (!selected) return "Select Client";
                    if (selected === "allClients") return "All Clients";
                    const found = clientList.find((c) => c._id === selected);
                    return found?.clientName || "All Clients";
                  }}
                >
                  <ListSubheader>
                    <TextField
                      size="small"
                      placeholder="Search Client"
                      fullWidth
                      className="search-textfield"
                      value={clientSearchTerm}
                      onChange={(e) => setClientSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </ListSubheader>

                  {filteredClientList.length > 0 ? (
                    filteredClientList.map((client) => (
                      <MenuItem
                        key={client._id}
                        value={client._id}
                        className="menu-item"
                      >
                        {client.clientName}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="" disabled className="menu-item">
                      No found Client
                    </MenuItem>
                  )}
                </Select>
                {errors.clientId && (
                  <p className="error-text">{errors.clientId}</p>
                )}
              </div>
            )}

            {isWorkFromOffice && (
              <div className="attendanceform-input-container">
                <label>Select Location*</label>
                <Select
                  className={`attendanceform-input-dropdown ${
                    formMode === "viewattendanceform" ||
                    formMode === "editattendanceform"
                      ? "Disable-addtask"
                      : ""
                  }`}
                  disabled={formMode === "viewattendanceform"}
                  value={formData?.locationId || ""}
                  onChange={(e) => handleChange("locationId", e.target.value)}
                  displayEmpty
                  MenuProps={{
                    disableAutoFocusItem: true,
                    PaperProps: {
                      style: {
                        width: 150,
                        maxHeight: 200,
                        overflowX: "auto",
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
                    if (!selected) return "Select Location";
                    // if (selected === "allClients") return "All Clients";
                    const found = locationList.find((c) => c._id === selected);
                    return found?.locationName || "All Locations";
                  }}
                >
                  <ListSubheader>
                    <TextField
                      size="small"
                      placeholder="Search Location"
                      fullWidth
                      className="search-textfield"
                      value={locationSearchTerm}
                      onChange={(e) => setLocationSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </ListSubheader>
                  {filteredLocationList.length > 0 ? (
                    filteredLocationList.map((location) => (
                      <MenuItem
                        key={location._id}
                        value={location._id}
                        className="menu-item"
                      >
                        {location.locationName}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="" disabled className="menu-item">
                      No found Location
                    </MenuItem>
                  )}
                </Select>
                {errors.locationId && (
                  <p className="error-text">{errors.locationId}</p>
                )}
              </div>
            )}
          </div>
          <div className="attendanceform-section">
            <div className="attendanceform-input-container">
              <label>ClockIn-Time*</label>
              <input
                type="datetime-local"
                name="clockInTime"
                className="attendanceform-input"
                value={formData?.clockIn}
                onChange={(e) => handleChange("clockIn", e.target.value)}
                min="1900-01-01T00:00"
                max="9999-12-31T23:59"
                disabled={formMode === "viewattendanceform"}
              />
              {errors.clockIn && <p className="error-text">{errors.clockIn}</p>}
            </div>

            <div className="attendanceform-input-container">
              <label>ClockOut-Time*</label>
              <input
                type="datetime-local"
                name="clockOutTime"
                className="attendanceform-input"
                value={formData?.clockOut}
                onChange={(e) => handleChange("clockOut", e.target.value)}
                min="1900-01-01T00:00"
                max="9999-12-31T23:59"
                disabled={formMode === "viewattendanceform"}
              />
              {errors.clockOut && (
                <p className="error-text">{errors.clockOut}</p>
              )}
            </div>

            <div className="attendanceform-input-container">
              <label className="label">Comment</label>
              <textarea
                name="comment"
                value={formData?.comment}
                className="attendanceform-input"
                onChange={(e) => handleChange("comment", e.target.value)}
              />
            </div>
          </div>

          {formMode !== "viewattendanceform" && (
            <div className="timesheet-button-container">
              <button onClick={handleAttendanceSubmit} className="save-button">
                {formMode !== "editattendanceform" ? "Submit" : "Update"}
              </button>
              {formMode !== "editattendanceform" && (
                <button
                  onClick={handleReset}
                  className="save-button reset-addtask"
                >
                  Reset
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default AttendanceForm;
