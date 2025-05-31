import React, { useEffect, useState } from "react";
import "./TimeSheetReport.css";
import { GetCall, PostCall } from "../../ApiServices";
import { showToast } from "../../main/ToastManager";
import Loader from "../Helper/Loader";
import moment from "moment";
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
  const [totalTimesheet, settotalTimesheet] = useState(0);
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

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData((prevData) => ({
  //     ...prevData,
  //     [name]: value,
  //   }));
  // };

  // const validate = () => {
  //   let newErrors = {};
  //   if (!formData.startDate) {
  //     newErrors.startDate = "Start date is required";
  //   }
  //   if (!formData.endDate) {
  //     newErrors.endDate = "End date is required";
  //   }
  //   if (!formData.format) {
  //     newErrors.format = "Format is required";
  //   }
  //   setErrors(newErrors);
  //   return Object.keys(newErrors).length === 0;
  // };

  // const downloadTimesheetReport = async () => {
  //   if (validate()) {
  //     const data = {
  //       ...formData,
  //       jobId: selectedJobId ? selectedJobId : jobRoleId,
  //       // userId: EmployeeId ? EmployeeId : "",
  //       userId: selectedEmployee,
  //     };
  //     try {
  //       setLoading(true);
  //       const response = await PostCall(`/downloadTimesheetReport`, data);
  //       const base64 =
  //         formData.format === "pdf"
  //           ? response?.data?.pdfBase64
  //           : response?.data?.excelbase64;
  //       // console.log("Base64 PDF:", base64);
  //       // console.log("response:", response);

  //       if (response?.data?.status === 200) {
  //         let fixedBase64 = base64?.replace(/-/g, "+")?.replace(/_/g, "/");

  //         while (fixedBase64?.length % 4 !== 0) {
  //           fixedBase64 += "=";
  //         }

  //         const binary = Uint8Array.from(atob(fixedBase64), (c) =>
  //           c.charCodeAt(0)
  //         );

  //         const blob = new Blob([binary], { type: response?.data?.mimeType });

  //         const link = document.createElement("a");
  //         link.href = URL.createObjectURL(blob);
  //         link.download = response?.data?.fileName;
  //         document.body.appendChild(link);
  //         link.click();
  //         document.body.removeChild(link);
  //       } else {
  //         showToast(response?.data?.message, "error");
  //       }
  //       setLoading(false);
  //     } catch (error) {
  //       console.log("Error while downloading timesheet report.", error);
  //       showToast("An error occurred while processing your request.", "error");
  //     }
  //   }
  // };

  const GetTimesheetReport = async () => {
    try {
      setLoading(true);
      const filters = {
        userId: selectedEmployee,
        clientId: selectedClient,
      };

      console.log("filter", filters);
      const frequency = "Weekly";
      // const { year, month } = appliedFilters;
      const response = await PostCall(
        `/getTimesheetReport?page=${currentPage}&limit=${rowsPerPage}&weeklyDate=${selectedWeekStart}&search=${debouncedSearch}&timesheetFrequency=${frequency}&isWorkFromOffice=${isFromofficeWork}`,
        filters
      );

      if (response?.data?.status === 200) {
        setTimesheetReportList(response?.data?.reports);
        settotalTimesheet(response.data.totalReports);
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

  // const weeks = Array.from({ length: 5 }, (_, i) => i + 1);

  // const handleClockInDropdown = () => {
  //   setEmployeeClockinDropwdown((prev) => !prev);
  // };

  // const handleClockOutDropdown = () => {
  //   setEmployeeClockoutDropwdown((prev) => !prev);
  // };

  // const handleClockInChange = (e) => {
  //   const { name, value } = e.target;
  //   setClockInData((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  //   // console.log("value", clockInData);
  // };

  // const handleClockOutChange = (e) => {
  //   const { name, value } = e.target;
  //   setClockOutData((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  //   // console.log("value", clockOutData);
  // };

  // const handleClockInSubmit = async () => {
  //   const clockindata = {
  //     ...clockInData,
  //     userId: selectedEmployee,
  //     jobId: selectedJobId || jobRoleId,
  //     clientId: selectedClientId,
  //   };
  //   // console.log("clockindata", clockindata);
  //   try {
  //     const response = await PostCall(`/clockInForEmployee`, clockindata);
  //     if (response?.data?.status === 200) {
  //       showToast(response?.data?.message, "success");
  //       setEmployeeClockinDropwdown(false);
  //       GetTimesheetReport();
  //     } else {
  //       showToast(response?.data?.message, "error");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching employee clockin:", error);
  //     showToast("Clock-in error", "error");
  //   }
  // };

  // const handleClockOutSubmit = async () => {
  //   const clockoutdata = {
  //     ...clockOutData,
  //     userId: selectedEmployee,
  //     jobId: selectedJobId || jobRoleId,
  //     clientId: selectedClientId,
  //   };
  //   // console.log("clockoutdata", clockoutdata);
  //   try {
  //     const response = await PostCall(`/clockOutForEmployee`, clockoutdata);
  //     if (response?.data?.status === 200) {
  //       showToast(response?.data?.message, "success");
  //       setEmployeeClockoutDropwdown(false);
  //       GetTimesheetReport();
  //     } else {
  //       showToast(response?.data?.message, "error");
  //     }
  //   } catch (err) {
  //     console.error("Clock-out error:", err);
  //     showToast("Clock-out error", "error");
  //   }
  // };

  // const handleClose = () => {
  //   setEmployeeClockinDropwdown(false);
  //   setEmployeeClockoutDropwdown(false);
  // };

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

  // const GetClientdata = async () => {
  //   const payload = {
  //     jobId: selectedEmployee ? selectedJobId : jobRoleId,
  //     userId: selectedEmployee,
  //   };

  //   // if (userRole === "Superadmin" ) {
  //   // payload.userId = selectedEmployee;
  //   // }
  //   try {
  //     const response = await PostCall(`/getUsersAssignClients`, payload);

  //     if (response?.data?.status === 200) {
  //       const clientId = response.data.assignClients;
  //       // console.log("job title", clientId);
  //       setClientdata(clientId);

  //       if (clientId.length > 1) {
  //         setopenClietnSelectModal(false);
  //       } else {
  //         setSelectedClientId(clientId[0]?.clientId);
  //         setopenClietnSelectModal(true);
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   }
  // };

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
    console.log("value", value);
    if (!selectedClient && value !== "allUsers") {
      const formdata = {
        userId: value,
        isWorkFromOffice: isFromofficeWork,
      };
      getAllClientsOfUser(formdata);
    }
  };

  const handleClientChange = (value) => {
    setselectedClient(value);
    console.log("value", value);
    if (!selectedEmployee && value !== "allClients") {
      const formdata = {
        clientId: value,
        isWorkFromOffice: isFromofficeWork,
      };
      getAllUsersOfClient(formdata);
    }
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

  const selectedDate = weekDateanddayShow.startDate;
  const weekStart = moment(selectedDate).startOf("week").add(1, "days");
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    moment(weekStart).add(i, "days")
  );

  useEffect(() => {
    userRole !== "Employee" && fetchEmployeeList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  useEffect(() => {
    if (selectedEmployee || selectedClient) {
      console.log("selectedEmployee", selectedEmployee);
      console.log("selectedClient", selectedClient);
      GetTimesheetReport();
    }
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
                {timesheetReportList.map((row, index) => (
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
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={14}>
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

export default TimeSheetReportWeekly;
