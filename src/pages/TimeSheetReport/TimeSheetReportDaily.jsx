import React, { useEffect, useState } from "react";
import "./TimeSheetReport.css";
import JobTitleForm from "../../SeparateCom/RoleSelect";
// import { useLocation } from "react-router";
import { GetCall, PostCall } from "../../ApiServices";
import { showToast } from "../../main/ToastManager";
import Loader from "../Helper/Loader";
// import TimesheetTable from "../../SeparateCom/TimesheetTable";
import moment from "moment";
import { GrDocumentDownload } from "react-icons/gr";
import { useSelector } from "react-redux";
// import { CropLandscapeOutlined } from "@mui/icons-material";
import { Checkbox, MenuItem, Select, TextField } from "@mui/material";
import AssignClient from "../../SeparateCom/AssignClient";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { BsHourglassSplit } from "react-icons/bs";
import { data } from "react-router";

const TimeSheetReportDaily = () => {
  // const location = useLocation();
  // const queryParams = new URLSearchParams(location.search);
  // const EmployeeId = queryParams.get("EmployeeId");
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(50);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    format: "",
  });
  const [errors, setErrors] = useState({});
  const [openJobTitleModal, setOpenJobTitleModal] = useState(false);
  const [timesheetReportList, setTimesheetReportList] = useState([]);
  const [JobTitledata, setJobTitledata] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [clientList, setClientList] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState([]);
  const [selectedClient, setselectedClient] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [openClietnSelectModal, setopenClietnSelectModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [Clientdata, setClientdata] = useState([]);
  const startDate = process.env.REACT_APP_START_DATE || "2025-01-01";
  const startYear = moment(startDate).year();
  const currentYear = moment().year();
  const currentMonth = moment().month() + 1;
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [employeeClockinDropwdown, setEmployeeClockinDropwdown] =
    useState(false);
  const [employeeClockoutDropwdown, setEmployeeClockoutDropwdown] =
    useState(false);
  const today = moment().format("YYYY-MM-DD");
  const [totalTimesheet, settotalTimesheet] = useState([]);
  const [clockInData, setClockInData] = useState({
    date: moment().format("YYYY-MM-DD"),
    startTime: moment().format("HH:mm"),
  });
  const currentRole = useSelector((state) => state.userInfo.userInfo.role);
  const [clockOutData, setClockOutData] = useState({
    date: moment().format("YYYY-MM-DD"),
    endTime: moment().format("HH:mm"),
  });
  const [isWorkFromOffice, setIsWorkFromOffice] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const jobRoleisworkFromOffice = useSelector(
    (state) => state.jobRoleSelect.jobRoleSelect.isWorkFromOffice
  );
  const jobRoleId = useSelector(
    (state) => state.jobRoleSelect.jobRoleSelect.jobId
  );
  const companyId = useSelector((state) => state.companySelect.companySelect);
  const minDate = moment("2024-01-01").format("YYYY-MM-DD");
  const maxDate = moment().format("YYYY-MM-DD");
  const userRole = useSelector((state) => state.userInfo.userInfo.role);
  // const [selectedWeek, setSelectedWeek] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [appliedFilters, setAppliedFilters] = useState({
    year: currentYear,
    month: currentMonth,
    // week: "",
  });

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePerPageChange = (e) => {
    // setPerPage(parseInt(e.target.value, 10));
    setPerPage(e);
    setCurrentPage(1);
  };

  const handlePopupClose = () => {
    setOpenJobTitleModal(true);
  };

  const handleJobTitleSelect = (selectedTitle) => {
    setSelectedJobId(selectedTitle);
    const selectedJob = JobTitledata.find((job) => job.jobId === selectedTitle);
    if (selectedJob) {
      setIsWorkFromOffice(selectedJob.isWorkFromOffice);
      // console.log("setIsWorkFromOffice", selectedJob.isWorkFromOffice);
    }
    setOpenJobTitleModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }
    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }
    // if (!formData.format) {
    //   newErrors.format = "Format is required";
    // }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const downloadTimesheetReport = async () => {
    if (validate()) {
      const data = {
        ...formData,
        jobId: selectedJobId ? selectedJobId : jobRoleId,
        // userId: EmployeeId ? EmployeeId : "",
        userId: selectedEmployee,
      };
      try {
        setLoading(true);
        const response = await PostCall(`/downloadTimesheetReport`, data);
        const base64 =
          formData.format === "pdf"
            ? response?.data?.pdfBase64
            : response?.data?.excelbase64;
        // console.log("Base64 PDF:", base64);
        // console.log("response:", response);

        if (response?.data?.status === 200) {
          let fixedBase64 = base64?.replace(/-/g, "+")?.replace(/_/g, "/");

          while (fixedBase64?.length % 4 !== 0) {
            fixedBase64 += "=";
          }

          const binary = Uint8Array.from(atob(fixedBase64), (c) =>
            c.charCodeAt(0)
          );

          const blob = new Blob([binary], { type: response?.data?.mimeType });

          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = response?.data?.fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          showToast(response?.data?.message, "error");
        }
        setLoading(false);
      } catch (error) {
        console.log("Error while downloading timesheet report.", error);
        showToast("An error occurred while processing your request.", "error");
      }
    }
  };

  const handleEmployeeChange = (employeeId) => {
    setSelectedEmployee(employeeId);
    setSelectedClientId("");
    setSelectedJobId("");
  };

  const handleClientChange = (clientId) => {
    setselectedClient(clientId);
    console.log("clientid", clientId);
    setSelectedClientId("");
    setSelectedJobId("");
  };

  const GetTimesheetReport = async () => {
    try {
      setLoading(true);
      const filters = {
        jobId: selectedEmployee ? selectedJobId : jobRoleId,
        // userId: EmployeeId,
        clientId: selectedClientId,
        userId: selectedEmployee,
      };

      // console.log("filter", filters);

      const { year, month } = appliedFilters;

      const response = await PostCall(
        `/getTimesheetReport?page=${currentPage}&limit=${perPage}&year=${year}&month=${month}&search=${debouncedSearch}&clientId=${selectedClientId}`,
        filters
      );

      if (response?.data?.status === 200) {
        setTimesheetReportList(response?.data?.report);
        settotalTimesheet(response.data.totalReports);
        setTotalPages(response?.data?.totalPages);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const Getjobtitledata = async () => {
    try {
      let response;
      if (selectedEmployee) {
        response = await GetCall(
          `/getUserJobTitles?EmployeeId=${selectedEmployee}`
        );
      } else {
        response = await GetCall(`/getUserJobTitles`);
      }

      if (response?.data?.status === 200) {
        const { multipleJobTitle, jobTitles } = response?.data;
        setJobTitledata(jobTitles);

        if (multipleJobTitle) {
          setOpenJobTitleModal(false);
        } else {
          setSelectedJobId(jobTitles[0]?.jobId);
          setOpenJobTitleModal(true);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const applyFilters = () => {
    setAppliedFilters({
      year: selectedYear,
      month: selectedMonth,
      // week: selectedWeek,
    });
    setCurrentPage(1);
  };

  const months = moment
    .months()
    .map((month, index) => ({
      name: moment().month(index).format("MMM"),
      value: index + 1,
    }))
    .filter(
      (month) => selectedYear < currentYear || month.value <= currentMonth
    );

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // const weeks = Array.from({ length: 5 }, (_, i) => i + 1);

  const handleClockInDropdown = () => {
    setEmployeeClockinDropwdown((prev) => !prev);
  };

  const handleClockOutDropdown = () => {
    setEmployeeClockoutDropwdown((prev) => !prev);
  };

  const handleClockInChange = (e) => {
    const { name, value } = e.target;
    setClockInData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // console.log("value", clockInData);
  };

  const handleClockOutChange = (e) => {
    const { name, value } = e.target;
    setClockOutData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // console.log("value", clockOutData);
  };

  const handleClockInSubmit = async () => {
    const clockindata = {
      ...clockInData,
      userId: selectedEmployee,
      jobId: selectedJobId || jobRoleId,
      clientId: selectedClientId,
    };
    // console.log("clockindata", clockindata);
    try {
      const response = await PostCall(`/clockInForEmployee`, clockindata);
      if (response?.data?.status === 200) {
        showToast(response?.data?.message, "success");
        setEmployeeClockinDropwdown(false);
        GetTimesheetReport();
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (error) {
      console.error("Error fetching employee clockin:", error);
      showToast("Clock-in error", "error");
    }
  };

  const handleClockOutSubmit = async () => {
    const clockoutdata = {
      ...clockOutData,
      userId: selectedEmployee,
      jobId: selectedJobId || jobRoleId,
      clientId: selectedClientId,
    };
    // console.log("clockoutdata", clockoutdata);
    try {
      const response = await PostCall(`/clockOutForEmployee`, clockoutdata);
      if (response?.data?.status === 200) {
        showToast(response?.data?.message, "success");
        setEmployeeClockoutDropwdown(false);
        GetTimesheetReport();
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (err) {
      console.error("Clock-out error:", err);
      showToast("Clock-out error", "error");
    }
  };

  const handleClose = () => {
    setEmployeeClockinDropwdown(false);
    setEmployeeClockoutDropwdown(false);
  };

  useEffect(() => {
    if (selectedEmployee) {
      Getjobtitledata();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmployee]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const fetchEmployeeList = async () => {
    try {
      const response = await GetCall(
        `/getAllUsersAndClients?companyId=${companyId}`
      );
      if (response?.data?.status === 200) {
        setEmployeeList(response?.data?.users);
        setClientList(response?.data.clients);
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (error) {
      console.error("Error fetching employee list:", error);
    }
  };

  const GetClientdata = async () => {
    const payload = {
      jobId: selectedEmployee ? selectedJobId : jobRoleId,
      userId: selectedEmployee,
    };

    // if (userRole === "Superadmin" ) {
    // payload.userId = selectedEmployee;
    // }
    try {
      const response = await PostCall(`/getUsersAssignClients`, payload);

      if (response?.data?.status === 200) {
        const clientId = response.data.assignClients;
        // console.log("job title", clientId);
        setClientdata(clientId);

        if (clientId.length > 1) {
          setopenClietnSelectModal(false);
        } else {
          setSelectedClientId(clientId[0]?.clientId);
          setopenClietnSelectModal(true);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handlePopupCloseForclient = () => {
    setopenClietnSelectModal(true);
  };

  const handleClientSelect = (selectedTitle) => {
    setSelectedClientId(selectedTitle);
    console.log("clientid", selectedClientId);
    setopenClietnSelectModal(true);
  };

  useEffect(() => {
    userRole !== "Employee" && fetchEmployeeList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const handleFilter = () => {
    if (validate()) {
      console.log("Filtering with values:", {
        selectedEmployee,
        selectedClient,
        startDate: formData.startDate,
        endDate: formData.endDate,
      });
    }
  };

  useEffect(() => {
    const GetTimesheet =
      (selectedEmployee &&
        selectedJobId &&
        selectedClientId &&
        appliedFilters) ||
      (!selectedEmployee &&
        appliedFilters &&
        ((jobRoleId && jobRoleisworkFromOffice) ||
          (jobRoleId && !jobRoleisworkFromOffice && selectedClientId) ||
          (selectedJobId && !jobRoleisworkFromOffice && selectedClientId))) ||
      (selectedJobId && isWorkFromOffice);

    if (GetTimesheet) {
      GetTimesheetReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedEmployee,
    selectedJobId,
    selectedClientId,
    jobRoleId,
    isWorkFromOffice,
    jobRoleisworkFromOffice,
    appliedFilters,
  ]);

  useEffect(() => {
    const GetClientData =
      (selectedEmployee && selectedJobId && !isWorkFromOffice) ||
      (!selectedEmployee && jobRoleId && !jobRoleisworkFromOffice);

    if (GetClientData) {
      GetClientdata();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedEmployee,
    selectedJobId,
    jobRoleId,
    isWorkFromOffice,
    jobRoleisworkFromOffice,
    // selectedClientId,
  ]);

  return (
    <div className="timesheet-list-container">
      {/* {!openJobTitleModal && JobTitledata.length > 1 && (
        <JobTitleForm
          onClose={handlePopupClose}
          jobTitledata={JobTitledata}
          onJobTitleSelect={handleJobTitleSelect}
        />
      )}
      {!openClietnSelectModal && Clientdata.length > 1 && (
        <AssignClient
          onClose={handlePopupCloseForclient}
          Clientdata={Clientdata}
          onClientSelect={handleClientSelect}
        />
      )} */}
      <div className="timesheet-flex">
        <div className="timesheet-title">
          <h1>Time Sheet Report</h1>
          {/* <div className="timesheet-report-download-container">
            <div className="timesheet-input-container">
              <label className="label">Format</label>
              <Select
                name="format"
                className="timesheet-input-dropdown Download"
                value={formData?.format}
                onChange={handleChange}
                displayEmpty
                MenuProps={{
                  PaperProps: {
                    style: {
                      width: 120,
                      textOverflow: "ellipsis",
                      maxHeight: 200,
                      whiteSpace: "nowrap",
                    },
                  },
                }}
              >
                <MenuItem value="" disabled>
                  Select format
                </MenuItem>
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="excel">Excel</MenuItem>
              </Select>
              {errors?.format && <p className="error-text">{errors?.format}</p>}
            </div>
            <button onClick={downloadTimesheetReport}>
              <GrDocumentDownload />
            </button>
          </div> */}
        </div>
      </div>

      <div className="timesheet-report-filter-container">
        <div className="filter-timsheetreport-main">
          {userRole !== "Employee" && (
            <div className="filter-employee-selection">
              <label className="label">Employee</label>
              <Select
                className="timesheet-input-dropdown"
                value={selectedEmployee}
                onChange={(e) => handleEmployeeChange(e.target.value)}
                displayEmpty
                multiple
                renderValue={(selected) =>
                  selected.length === 0
                    ? "All Employee"
                    : employeeList
                        .filter((c) => selected.includes(c._id))
                        .map((c) => c.userName)
                        .join(", ")
                }
                MenuProps={{
                  PaperProps: {
                    style: {
                      width: 150,
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxHeight: 200,
                      scrollbarWidth: "thin",
                      overflowX: "auto",
                    },
                  },
                }}
              >
                {currentRole === "Superadmin" && (
                  <MenuItem value="Allemployee">All Employee</MenuItem>
                )}
                {employeeList.map((employee) => (
                  <MenuItem key={employee._id} value={employee._id}>
                    <Checkbox
                      checked={selectedEmployee.indexOf(employee._id) > -1}
                    />
                    {employee.userName}
                  </MenuItem>
                ))}
              </Select>
            </div>
          )}

          {userRole !== "Employee" && (
            <div className="filter-client-selection">
              <label className="label">Client</label>
              <Select
                className="timesheet-input-dropdown"
                multiple
                value={selectedClient}
                onChange={(e) => handleClientChange(e.target.value)}
                displayEmpty
                renderValue={(selected) =>
                  selected.length === 0
                    ? "All Clients"
                    : clientList
                        .filter((c) => selected.includes(c._id))
                        .map((c) => c.clientName)
                        .join(", ")
                }
                MenuProps={{
                  PaperProps: {
                    style: {
                      width: 150,
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxHeight: 200,
                      scrollbarWidth: "thin",
                      overflowX: "auto",
                    },
                  },
                }}
              >
                {clientList.map((client) => (
                  <MenuItem key={client._id} value={client._id}>
                    <Checkbox
                      checked={selectedClient.indexOf(client._id) > -1}
                    />
                    {client.clientName}
                  </MenuItem>
                ))}
              </Select>
            </div>
          )}

          <div className="timesheet-report-download-container">
            <div className="timesheet-input-container">
              <label className="label">Start Date</label>
              <input
                type="date"
                name="startDate"
                className="timesheet-input"
                value={formData?.startDate}
                onChange={handleChange}
                min={minDate}
                max={maxDate}
              />
              {errors?.startDate && (
                <p className="error-text">{errors?.startDate}</p>
              )}
            </div>
            <div className="timesheet-input-container">
              <label className="label">End Date</label>
              <input
                type="date"
                name="endDate"
                className="timesheet-input"
                value={formData?.endDate}
                onChange={handleChange}
                min={minDate}
                max={maxDate}
              />
              {errors?.endDate && (
                <p className="error-text">{errors?.endDate}</p>
              )}
            </div>
            <button onClick={handleFilter}>Filter</button>
          </div>
        </div>

        {userRole !== "Employee" ? (
          <div className="timesheet-button-container">
            <button
              onClick={handleClockInDropdown}
              className="timesheet-clock-in-btn"
            >
              Clock In
            </button>
            <button
              onClick={handleClockOutDropdown}
              className="timesheet-clock-out-btn"
            >
              Clock Out
            </button>
          </div>
        ) : null}
      </div>

      <div className="timesheetreport-searchbar-clockin">
        <TextField
          label="Search Timesheet"
          variant="outlined"
          size="small"
          value={searchQuery}
          className="common-searchbar"
          onChange={handleSearchChange}
        />
      </div>

      {loading ? (
        <div className="loader-wrapper">
          <Loader />
        </div>
      ) : (
        <>
          <TableContainer
            component={Paper}
            className="timesheetreport-custom-table"
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Job Role</TableCell>
                  <TableCell>Client Name</TableCell>
                  <TableCell>Check-in/Check-Out</TableCell>
                  <TableCell>Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {timesheetReportList.map((row, index) => {
                  const clockinTime =
                    row.data?.timesheetData?.clockinTime || [];

                  return (
                    <TableRow key={index}>
                      <TableCell>
                        {moment(row.date).format("DD/MM/YYYY")}
                      </TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.role}</TableCell>
                      <TableCell>{row.clientname}</TableCell>

                      <TableCell>
                        {clockinTime.length > 0
                          ? clockinTime.map((item, i) => (
                              <div key={i} className="timing-container">
                                <div className="timing-entry">
                                  <span className="clockin">
                                    {moment(item.clockIn).format("LT")} |{" "}
                                  </span>
                                  <span className="clockout">
                                    {item.clockOut[index] ? (
                                      <>
                                        {moment(item.clockOut).format("LT")} |{" "}
                                      </>
                                    ) : (
                                      <BsHourglassSplit />
                                    )}
                                  </span>
                                </div>
                              </div>
                            ))
                          : ""}
                      </TableCell>

                      <TableCell>
                        {row.data?.timesheetData?.totalHours}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </div>
  );
};

export default TimeSheetReportDaily;
