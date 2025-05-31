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
import {
  Checkbox,
  MenuItem,
  Select,
  TableFooter,
  TablePagination,
  TextField,
} from "@mui/material";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [timesheetReportList, setTimesheetReportList] = useState([]);
  const [isFromofficeWork, setisFromofficeWork] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const [clientList, setClientList] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("allUsers");
  const [selectedClient, setselectedClient] = useState("allClients");
  const [totalTimesheet, settotalTimesheet] = useState(0);
  const companyId = useSelector((state) => state.companySelect.companySelect);
  const minDate = moment("2024-01-01").format("YYYY-MM-DD");
  const maxDate = moment().format("YYYY-MM-DD");
  const userRole = useSelector((state) => state.userInfo.userInfo.role);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [totalHourCount, settotalHourCount] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "startDate") {
      setSelectedStartDate(value);
    } else if (name === "endDate") {
      setSelectedEndDate(value);
    }
  };

  const handleCheckboxChange = (event) => {
    const checked = event.target.checked;
    setisFromofficeWork(checked);
    setselectedClient("");
    setSelectedEmployee("");
    setSelectedStartDate("");
    setSelectedEndDate("");
  };

  const handleEmployeeChange = (value) => {
    setSelectedEmployee(value);
    if (!selectedClient && value !== "allUsers") {
      const formdata = {
        userId: value,
        isWorkFromOffice: isFromofficeWork,
      };
      getAllClientsOfUser(formdata);
    }
  };

  const getAllClientsOfUser = async (formdata) => {
    try {
      setLoading(true);
      const response = await PostCall(`/getAllClientsOfUser`, formdata);
      if (response?.data?.status === 200) {
        showToast(response?.data?.message, "error");
        setClientList(response.data.clients);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleClientChange = (value) => {
    setselectedClient(value);
    if (!selectedEmployee && value !== "allClients") {
      const formdata = {
        clientId: value,
        isWorkFromOffice: isFromofficeWork,
      };
      getAllUsersOfClient(formdata);
    }
  };

  const getAllUsersOfClient = async (formdata) => {
    try {
      setLoading(true);
      const response = await PostCall(`/getAllUsersOfClient`, formdata);
      if (response?.data?.status === 200) {
        showToast(response?.data?.message, "error");
        setEmployeeList(response?.data.users);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const GetTimesheetReport = async () => {
    try {
      setLoading(true);
      const filters = {
        userId: selectedEmployee,
        clientId: selectedClient,
      };

      console.log("filter", filters);
      const frequency = "Monthly";
      // const { year, month } = appliedFilters;
      const response = await PostCall(
        `/getTimesheetReport?page=${currentPage}&limit=${rowsPerPage}&startDate=${selectedStartDate}&endDate=${selectedEndDate}&search=${debouncedSearch}&timesheetFrequency=${frequency}&isWorkFromOffice=${isFromofficeWork}`,
        filters
      );

      if (response?.data?.status === 200) {
        setTimesheetReportList(response?.data?.reports);
        settotalTimesheet(response.data.totalReports);
        settotalHourCount(response.data.totalHours);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

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

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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

  useEffect(() => {
    userRole !== "Employee" && fetchEmployeeList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, isFromofficeWork]);

  useEffect(() => {
    if (selectedEmployee || selectedClient) {
      GetTimesheetReport();
    }
  }, [
    selectedClient,
    selectedEmployee,
    debouncedSearch,
    selectedStartDate,
    selectedEndDate,
    isFromofficeWork,
    rowsPerPage,
  ]);

  return (
    <div className="timesheet-list-container">
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
                MenuProps={{
                  PaperProps: {
                    style: {
                      width: 150,
                      maxHeight: 200,
                      overflowX: "auto",
                    },
                  },
                }}
              >
                <MenuItem value="" disabled>
                  Select Employee
                </MenuItem>
                {/* {!isFromofficeWork && ( */}
                <MenuItem value="allUsers">All Employees</MenuItem>
                {/* )} */}
                {employeeList.map((emp) => (
                  <MenuItem key={emp._id} value={emp._id}>
                    {emp.userName}
                  </MenuItem>
                ))}
              </Select>

              {errors?.selectedEmployee && (
                <p className="error-text">{errors.selectedEmployee}</p>
              )}
            </div>
          )}

          {userRole !== "Employee" && (
            <div className="filter-employee-selection">
              <label className="label">Client</label>
              <Select
                className="timesheet-input-dropdown"
                value={selectedClient}
                onChange={(e) => handleClientChange(e.target.value)}
                displayEmpty
                MenuProps={{
                  PaperProps: {
                    style: {
                      width: 150,
                      maxHeight: 200,
                      overflowX: "auto",
                    },
                  },
                }}
              >
                <MenuItem value="" disabled>
                  Select Clients
                </MenuItem>
                {/* {!isFromofficeWork && ( */}
                <MenuItem value="allClients">All Clients</MenuItem>
                {/* )} */}
                {clientList.map((client) => (
                  <MenuItem key={client._id} value={client._id}>
                    {client.clientName}
                  </MenuItem>
                ))}
              </Select>

              {errors?.selectedEmployee && (
                <p className="error-text">{errors.selectedEmployee}</p>
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

            {/* <button onClick={handleFilter}>Filter</button> */}
          </div>
        </div>
      </div>

      <div className="timesheetreport-officework">
        <div className="timesheetreport-isfromofficework">
          <input
            type="checkbox"
            data-testid="send-link"
            name="isFromofficeWork"
            checked={isFromofficeWork}
            onChange={handleCheckboxChange}
          />
        </div>
        <label>Office Work?</label>
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
                  <TableCell>
                    {isFromofficeWork ? "Location Name" : "Client Name"}{" "}
                  </TableCell>
                  <TableCell>Check-in/Check-Out</TableCell>
                  <TableCell>Working Hours</TableCell>
                  <TableCell>Over Time</TableCell>
                  <TableCell>Total Hours</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {timesheetReportList && timesheetReportList.length > 0 ? (
                  timesheetReportList.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {moment(row.date).format("DD/MM/YYYY")}
                      </TableCell>
                      <TableCell>{row.userName}</TableCell>
                      <TableCell>{row.jobRole}</TableCell>
                      <TableCell>
                        {isFromofficeWork ? row.locationName : row.clientName}
                      </TableCell>
                      <TableCell>
                        {row.clockinTime && row.clockinTime.length > 0
                          ? row.clockinTime.map((item, i) => (
                              <div key={i} className="timing-container">
                                <div className="timing-entry">
                                  <span className="clockin">
                                    {moment(item.clockIn).format("LT")} |{" "}
                                  </span>
                                  <span className="clockout">
                                    {item.clockOut ? (
                                      <>{moment(item.clockOut).format("LT")}</>
                                    ) : (
                                      <BsHourglassSplit />
                                    )}
                                  </span>
                                </div>
                              </div>
                            ))
                          : "-"}
                      </TableCell>
                      <TableCell>{row.workingHours}</TableCell>
                      <TableCell>{row.overTime}</TableCell>
                      <TableCell>{row.totalHours}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <p>No data found</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={10}>
                    <div className="timesheetreport-count">
                      <p>Total Hours: {totalHourCount}</p>
                      <TablePagination
                        component="div"
                        count={totalTimesheet}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[50, 100, 200]}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </TableContainer>
        </>
      )}
    </div>
  );
};

export default TimeSheetReportDaily;
