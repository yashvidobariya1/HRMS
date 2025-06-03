import React, { useEffect, useState } from "react";
import "./TimeSheetReport.css";
import { GetCall, PostCall } from "../../ApiServices";
import { showToast } from "../../main/ToastManager";
import Loader from "../Helper/Loader";
import moment, { weekdays } from "moment";
import { useSelector } from "react-redux";
import {
  MenuItem,
  Select,
  TableFooter,
  TablePagination,
  TextField,
} from "@mui/material";
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

const TimeSheetReportWeekly = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [timesheetReportList, setTimesheetReportList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("allUsers");
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [selectedClient, setselectedClient] = useState("allClients");
  const [isFromofficeWork, setisFromofficeWork] = useState(false);
  const companyId = useSelector((state) => state.companySelect.companySelect);
  const userRole = useSelector((state) => state.userInfo.userInfo.role);
  const [searchQuery, setSearchQuery] = useState("");
  const [clientList, setClientList] = useState([]);
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [selectedWeekStart, setSelectedWeekStart] = useState("");
  const [weekDateanddayShow, setweekDateanddayShow] = useState([]);
  const [page, setPage] = useState(0);
  const [totalHourCount, settotalHourCount] = useState("");

  const GetTimesheetReport = async () => {
    try {
      setLoading(true);
      const filters = {
        userId: selectedEmployee,
        clientId: selectedClient,
      };

      console.log("filter", filters);
      const frequency = "Weekly";
      const response = await PostCall(
        `/getTimesheetReport?page=${currentPage}&limit=${rowsPerPage}&weekDate=${selectedWeekStart}&search=${debouncedSearch}&timesheetFrequency=${frequency}&isWorkFromOffice=${isFromofficeWork}`,
        filters
      );

      if (response?.data?.status === 200) {
        setTimesheetReportList(response?.data?.reports);
        setweekDateanddayShow(response.data);
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

  const handleEmployeeChange = (value) => {
    setSelectedEmployee(value);
  };

  const handleClientChange = (value) => {
    setselectedClient(value);
  };

  const handleCheckboxChange = (event) => {
    const checked = event.target.checked;
    setisFromofficeWork(checked);
    setselectedClient("");
    setSelectedEmployee("");
    setSelectedWeekStart("");
  };

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const selectedDate = selectedWeekStart;

  const weekStart = moment(selectedDate, "YYYY-MM-DD", true).isValid()
    ? moment(selectedDate).startOf("week").add(1, "days")
    : moment().startOf("week").add(1, "days");

  const weekDays = Array.from({ length: 7 }, (_, i) =>
    moment(weekStart).add(i, "days")
  );

  useEffect(() => {
    userRole !== "Employee" && fetchEmployeeList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  useEffect(() => {
    if (
      selectedEmployee &&
      selectedEmployee !== "allUsers" &&
      !isFromofficeWork
    ) {
      const formdata = {
        userId: selectedEmployee,
        isWorkFromOffice: isFromofficeWork,
      };
      getAllClientsOfUser(formdata);
    }
  }, [selectedEmployee]);

  useEffect(() => {
    if (selectedClient && selectedClient !== "allClients") {
      const formdata = {
        clientId: selectedClient,
        isWorkFromOffice: isFromofficeWork,
      };
      getAllUsersOfClient(formdata);
    }
  }, [selectedClient]);

  useEffect(() => {
    // if (selectedEmployee || selectedClient) {
    GetTimesheetReport();
    // }
  }, [
    selectedClient,
    selectedEmployee,
    debouncedSearch,
    selectedWeekStart,
    isFromofficeWork,
    rowsPerPage,
  ]);

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
                <MenuItem value="allUsers">All Employees</MenuItem>
                {employeeList.map((emp) => (
                  <MenuItem key={emp._id} value={emp._id}>
                    {emp.userName}
                  </MenuItem>
                ))}
              </Select>
            </div>
          )}

          {userRole !== "Employee" && !isFromofficeWork && (
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
                <MenuItem value="allClients">All Clients</MenuItem>
                {clientList.map((client) => (
                  <MenuItem key={client._id} value={client._id}>
                    {client.clientName}
                  </MenuItem>
                ))}
              </Select>
            </div>
          )}

          <div className="timesheet-report-download-container">
            <div className="timesheet-input-container">
              <label className="label">Week Date</label>
              <TextField
                type="date"
                value={selectedWeekStart}
                onChange={(e) => setSelectedWeekStart(e.target.value)}
              />
            </div>
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
                  <TableCell>Name</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>
                    {isFromofficeWork ? "Location Name" : "Client Name"}{" "}
                  </TableCell>
                  {weekDays.map((day) => (
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
                {timesheetReportList && timesheetReportList.length > 0 ? (
                  timesheetReportList.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.userName}</TableCell>
                      <TableCell>{row.jobRole}</TableCell>
                      <TableCell>
                        {isFromofficeWork ? row.locationName : row.clientName}
                      </TableCell>
                      {weekDays.map((day) => {
                        const formattedDate = moment(day).format("YYYY-MM-DD");
                        const dayEntry = row.weeklyDate.find(
                          (entry) => entry.date === formattedDate
                        );

                        return (
                          <TableCell key={formattedDate}>
                            {dayEntry && dayEntry.clockinTime.length > 0 ? (
                              <>
                                {dayEntry.clockinTime.map((item, i) => (
                                  <div key={i} className="timing-container">
                                    <div className="timing-entry">
                                      <span className="clockin">
                                        {moment(item.clockIn).format("LT")} |{" "}
                                      </span>
                                      <span className="clockout">
                                        {item.clockOut ? (
                                          <>
                                            {moment(item.clockOut).format("LT")}
                                          </>
                                        ) : (
                                          <BsHourglassSplit />
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </>
                            ) : (
                              ""
                            )}
                          </TableCell>
                        );
                      })}

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
                  <TableCell colSpan={14}>
                    <div className="timesheetreport-count">
                      <p>Total Hours: {totalHourCount}</p>
                      <TablePagination
                        component="div"
                        count={
                          Array.isArray(timesheetReportList)
                            ? timesheetReportList.length
                            : timesheetReportList
                        }
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

export default TimeSheetReportWeekly;
