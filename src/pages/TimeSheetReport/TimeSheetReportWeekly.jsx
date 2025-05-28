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
// import AssignClient from "../../SeparateCom/AssignClient";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { BsHourglassSplit } from "react-icons/bs";

const TimeSheetReportDaily = () => {
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(50);
  const [loading, setLoading] = useState(false);
  const startDate = moment().format("YYYY-MM-DD");
  const endDate = moment().format("YYYY-MM-DD");
  const [formData, setFormData] = useState({
    startDate: startDate,
    endDate: "",
  });
  const [selectedStartDate, setSelectedStartDate] = useState(
    moment().format("YYYY-MM-DD")
  );
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [errors, setErrors] = useState({});
  const [openJobTitleModal, setOpenJobTitleModal] = useState(false);
  const [timesheetReportList, setTimesheetReportList] = useState([]);
  const [JobTitledata, setJobTitledata] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [clientList, setClientList] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState([]);
  const [selectedClient, setselectedClient] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  // const [openClietnSelectModal, setopenClietnSelectModal] = useState(false);
  // const startYear = moment(startDate).year();
  const currentYear = moment().year();
  const currentMonth = moment().month() + 1;
  const [selectedYear, setSelectedYear] = useState(currentYear);
  // const [employeeClockinDropwdown, setEmployeeClockinDropwdown] =
  //   useState(false);
  // const [employeeClockoutDropwdown, setEmployeeClockoutDropwdown] =
  //   useState(false);
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
  // const [isWorkFromOffice, setIsWorkFromOffice] = useState("");
  // const [selectedMonth, setSelectedMonth] = useState(currentMonth);
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
  // const [appliedFilters, setAppliedFilters] = useState({
  //   year: currentYear,
  //   month: currentMonth,
  //   // week: "",
  // });

  // const handlePageChange = (pageNumber) => {
  //   setCurrentPage(pageNumber);
  // };

  // const handlePerPageChange = (e) => {
  //   // setPerPage(parseInt(e.target.value, 10));
  //   setPerPage(e);
  //   setCurrentPage(1);
  // };

  // const handlePopupClose = () => {
  //   setOpenJobTitleModal(true);
  // };

  // const handleJobTitleSelect = (selectedTitle) => {
  //   setSelectedJobId(selectedTitle);
  //   const selectedJob = JobTitledata.find((job) => job.jobId === selectedTitle);
  //   if (selectedJob) {
  //     setIsWorkFromOffice(selectedJob.isWorkFromOffice);
  //     // console.log("setIsWorkFromOffice", selectedJob.isWorkFromOffice);
  //   }
  //   setOpenJobTitleModal(true);
  // };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "startDate") {
      setSelectedStartDate(value);
    } else if (name === "endDate") {
      setSelectedEndDate(value);
    }
  };

  const validate = () => {
    let newErrors = {};

    if (!selectedStartDate) {
      newErrors.startDate = "Start date is required";
    }

    // if (!selectedEndDate) {
    //   newErrors.endDate = "End date is required";
    // }

    if (selectedEmployee.length === 0) {
      newErrors.selectedEmployee = "Please select at least one employee";
    }

    if (selectedClient.length === 0) {
      newErrors.selectedClient = "Please select at least one client";
    }

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

  const handleEmployeeChange = (value) => {
    const lastValue = value[value.length - 1];
    console.log("last value", lastValue);

    if (lastValue === "All employee") {
      if (selectedEmployee.length === employeeList.length) {
        setSelectedEmployee([]);
      } else {
        setSelectedEmployee(employeeList.map((e) => e._id));
      }
    } else {
      const filteredValue = value.filter((v) => v !== "All employee");
      setSelectedEmployee(filteredValue);
    }
  };

  const handleClientChange = (value) => {
    if (value[value.length - 1] === "Allclients") {
      if (selectedClient.length === clientList.length) {
        setselectedClient([]);
      } else {
        setselectedClient(clientList.map((c) => c._id));
      }
    } else {
      setselectedClient(value);
    }
  };

  const GetTimesheetReport = async () => {
    try {
      setLoading(true);
      const filters = {
        userIds: selectedEmployee,
        clientIds: selectedClient,
      };

      console.log("filter", filters);
      const frequency = "Daily";
      // const { year, month } = appliedFilters;
      const response = await PostCall(
        `/getTimesheetReport?page=${currentPage}&limit=${perPage}&startDate=${selectedStartDate}&endDate=${selectedEndDate}&search=${debouncedSearch}&timesheetFrequency=${frequency}`,
        filters
      );

      if (response?.data?.status === 200) {
        setTimesheetReportList(response?.data?.data);
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

  // const applyFilters = () => {
  //   setAppliedFilters({
  //     year: selectedYear,
  //     month: selectedMonth,
  //     // week: selectedWeek,
  //   });
  //   setCurrentPage(1);
  // };

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

  useEffect(() => {
    userRole !== "Employee" && fetchEmployeeList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const handleFilter = () => {
    if (validate()) {
      GetTimesheetReport();
    }
  };

  useEffect(() => {
    if (clientList.length > 0 && selectedClient.length === 0) {
      setselectedClient(clientList.map((c) => c._id));
    }
  }, [clientList]);

  useEffect(() => {
    if (employeeList.length > 0 && selectedEmployee.length === 0) {
      setSelectedEmployee(employeeList.map((e) => e._id));
    }
  }, [employeeList]);

  useEffect(() => {
    if (selectedEmployee?.length > 0 && selectedClient?.length > 0) {
      GetTimesheetReport();
    }
  }, [selectedClient, selectedEmployee]);

  // useEffect(() => {
  //   const GetClientData =
  //     (selectedEmployee && selectedJobId && !isWorkFromOffice) ||
  //     (!selectedEmployee && jobRoleId && !jobRoleisworkFromOffice);

  //   if (GetClientData) {
  //     GetClientdata();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [
  //   selectedEmployee,
  //   selectedJobId,
  //   jobRoleId,
  //   isWorkFromOffice,
  //   jobRoleisworkFromOffice,
  //   // selectedClientId,
  // ]);

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
                renderValue={(selected) => {
                  if (selected.length === 0) {
                    return <>Select Employee</>;
                  }
                  if (selected.length === employeeList.length) {
                    return "All Employee";
                  }
                  return employeeList
                    .filter((c) => selected.includes(c._id))
                    .map((c) => c.userName)
                    .join(", ");
                }}
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
                  <MenuItem value="All employee">
                    <Checkbox
                      checked={
                        selectedEmployee.length === employeeList.length &&
                        employeeList.length > 0
                      }
                    />
                    All Employee
                  </MenuItem>
                )}
                {employeeList.map((employee) => (
                  <MenuItem key={employee._id} value={employee._id}>
                    <Checkbox
                      checked={selectedEmployee.includes(employee._id)}
                    />
                    {employee.userName}
                  </MenuItem>
                ))}
              </Select>
              {errors?.selectedEmployee && (
                <p className="error-text">{errors.selectedEmployee}</p>
              )}
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
                renderValue={(selected) => {
                  if (selected.length === 0) {
                    return <>Select Client</>;
                  }
                  if (selected.length === clientList.length) {
                    return "All Clients";
                  }
                  return clientList
                    .filter((c) => selected.includes(c._id))
                    .map((c) => c.clientName)
                    .join(", ");
                }}
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
                <MenuItem value="Allclients">
                  <Checkbox
                    checked={
                      selectedClient.length === clientList.length &&
                      clientList.length > 0
                    }
                  />
                  All Clients
                </MenuItem>

                {clientList.map((client) => (
                  <MenuItem key={client._id} value={client._id}>
                    <Checkbox
                      checked={selectedClient.indexOf(client._id) > -1}
                    />
                    {client.clientName}
                  </MenuItem>
                ))}
              </Select>
              {errors?.selectedClient && (
                <p className="error-text">{errors.selectedClient}</p>
              )}
            </div>
          )}

          <div className="timesheet-report-download-container">
            <div className="timesheet-input-container">
              <label className="label">Start Date</label>
              <input
                type="date"
                name="startDate"
                className="timesheet-input"
                value={selectedStartDate}
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
                value={selectedEndDate}
                onChange={handleChange}
                min={minDate}
                max={maxDate}
              />
              {/* {errors?.endDate && (
                <p className="error-text">{errors?.endDate}</p>
              )} */}
            </div>

            <button onClick={handleFilter}>Filter</button>
          </div>
        </div>

        {userRole !== "Employee" ? (
          <div className="timesheet-button-container">
            <button
              // onClick={handleClockInDropdown}
              className="timesheet-clock-in-btn"
            >
              Clock In
            </button>
            <button
              // onClick={handleClockOutDropdown}
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
                  <TableCell>Name</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Client</TableCell>
                  {timesheetReportList?.map((day) => (
                    <TableCell key={day}>
                      {moment(day).format("DD/MM/YYYY (ddd)")}
                    </TableCell>
                  ))}
                  <TableCell>Total Hours</TableCell>
                  <TableCell>Total OverTime</TableCell>
                  <TableCell>Total Timing</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {/* {timesheetReportList?.clockinTime?.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.role}</TableCell>
                    <TableCell>{row.client}</TableCell>
                    {weekDays.map((day) => (
                      <TableCell key={day}></TableCell>
                    ))}
                  </TableRow>
                ))} */}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </div>
  );
};

export default TimeSheetReportDaily;
