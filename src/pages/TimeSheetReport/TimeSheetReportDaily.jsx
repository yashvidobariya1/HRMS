import React, { useEffect, useMemo, useState } from "react";
import "./TimeSheetReport.css";
import useApiServices from "../../useApiServices";
import { showToast } from "../../main/ToastManager";
import Loader from "../Helper/Loader";
import moment from "moment";
import { useSelector } from "react-redux";
import {
  ListSubheader,
  MenuItem,
  Select,
  TableFooter,
  TablePagination,
  TableSortLabel,
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
import CommonAddButton from "../../SeparateCom/CommonAddButton";

const TimeSheetReportDaily = () => {
  const { PostCall, GetCall } = useApiServices();
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  // const [errors, setErrors] = useState({});
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [timesheetReportList, setTimesheetReportList] = useState([]);
  const [isWorkFromOffice, setisWorkFromOffice] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const [clientList, setClientList] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("allUsers");
  const [selectedClient, setselectedClient] = useState("allClients");
  const [locationList, setlocationList] = useState([]);
  const [selectedLocation, setselectedLocation] = useState("allLocations");
  const [locationSearchTerm, setlocationSearchTerm] = useState("");
  const companyId = useSelector((state) => state.companySelect.companySelect);
  const userRole = useSelector((state) => state.userInfo.userInfo.role);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [totalHourCount, settotalHourCount] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [clientSearchTerm, setClientSearchTerm] = useState("");

  const filteredEmployeeList = useMemo(() => {
    return employeeList.filter((user) =>
      user.userName.toLowerCase().includes(searchTerm.toLowerCase())
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

  const [sortConfig, setSortConfig] = React.useState({
    key: "",
    direction: "asc",
  });

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
    setisWorkFromOffice(checked);
    setselectedClient("allClients");
    setSelectedEmployee("allUsers");
    setSelectedStartDate("");
    setSelectedEndDate("");
    setselectedLocation("allLocations");
  };

  const handleEmployeeChange = (value) => {
    setSelectedEmployee(value);
  };

  const getAllClientsOfUser = async () => {
    try {
      // setLoading(true);
      // const formdata = {
      //   userId: selectedEmployee,
      //   isWorkFromOffice: isWorkFromOffice,
      // };
      const response = await GetCall(
        `/getAllClientsOfUser?companyId=${companyId}&userId=${selectedEmployee}&isWorkFromOffice=${isWorkFromOffice}`
      );
      if (response?.data?.status === 200) {
        setClientList(response?.data.clients);
        showToast(response?.data?.message, "error");
      } else {
        showToast(response?.data?.message, "error");
      }
      // setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      // setLoading(false);
    }
  };

  const handleClientChange = (value) => {
    setselectedClient(value);
  };

  const handleLocationChange = (value) => {
    setselectedLocation(value);
  };

  const getAllUsersOfClientOrLocation = async () => {
    try {
      // setLoading(true);
      // const formdata = {
      //   clientId: selectedClient,
      //   isWorkFromOffice: isWorkFromOffice,
      // };
      const response = await GetCall(
        `/getAllUsersOfClientOrLocation?companyId=${companyId}&clientId=${selectedClient}&isWorkFromOffice=${isWorkFromOffice}&locationId=${selectedLocation}`
      );
      if (response?.data?.status === 200) {
        setEmployeeList(response?.data.users);
      } else {
        showToast(response?.data?.message, "error");
      }
      // setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      // setLoading(false);
    }
  };

  const getAllLocations = async () => {
    // setLoading(true);
    try {
      const response = await GetCall(
        `/getUsersJobLocations?companyId=${companyId}&userId=${selectedEmployee}`
      );
      if (response?.data?.status === 200) {
        setlocationList(response?.data.locations);
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      // setLoading(false);
    } finally {
      // setLoading(false);
    }
  };

  const GetTimesheetReport = async () => {
    setLoading(true);
    try {
      const filters = {
        userId: selectedEmployee,
        // locationId: selectedLocation,
        // clientId: selectedClient,
        [isWorkFromOffice ? "locationId" : "clientId"]: isWorkFromOffice
          ? selectedLocation
          : selectedClient,
      };

      // console.log("filter", filters);
      const frequency = "Daily";
      const response = await PostCall(
        `/getTimesheetReport?companyId=${companyId}&page=${currentPage}&limit=${rowsPerPage}&startDate=${selectedStartDate}&endDate=${selectedEndDate}&search=${debouncedSearch}&timesheetFrequency=${frequency}&isWorkFromOffice=${isWorkFromOffice}`,
        filters
      );

      if (response?.data?.status === 200) {
        setTimesheetReportList(response?.data?.reports);
        settotalHourCount(response.data.totalHours);
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePdfDownload = async () => {
    // setLoading(true);
    try {
      const filters = {
        userId: selectedEmployee,
        [isWorkFromOffice ? "locationId" : "clientId"]: isWorkFromOffice
          ? selectedLocation
          : selectedClient,
      };

      const frequency = "Daily";
      const response = await PostCall(
        `/downloadTimesheet?companyId=${companyId}&startDate=${selectedStartDate}&endDate=${selectedEndDate}&timesheetFrequency=${frequency}&isWorkFromOffice=${isWorkFromOffice}&format=pdf`,
        filters
      );
      if (response?.data?.status === 200) {
        let fixedBase64 = response?.data?.pdfBase64
          .replace(/-/g, "+")
          .replace(/_/g, "/");
        while (fixedBase64.length % 4 !== 0) {
          fixedBase64 += "=";
        }

        const binaryData = atob(fixedBase64);
        const byteArray = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
          byteArray[i] = binaryData.charCodeAt(i);
        }

        const blob = new Blob([byteArray], { type: response?.data?.mimeType });
        const blobUrl = URL.createObjectURL(blob);

        // Programmatically trigger download
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = response?.data?.fileName || "Employee Report List.pdf";
        a.style.display = "none";

        document.body.appendChild(a);
        a.click();

        // Cleanup
        URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      // setLoading(false);
    }
  };

  const handleXlsDownload = async () => {
    // setLoading(true);
    try {
      const filters = {
        userId: selectedEmployee,
        [isWorkFromOffice ? "locationId" : "clientId"]: isWorkFromOffice
          ? selectedLocation
          : selectedClient,
      };

      const frequency = "Daily";
      const response = await PostCall(
        `/downloadTimesheet?companyId=${companyId}&startDate=${selectedStartDate}&endDate=${selectedEndDate}&timesheetFrequency=${frequency}&isWorkFromOffice=${isWorkFromOffice}&format=xls`,
        filters
      );
      if (response?.data?.status === 200) {
        let fixedBase64 = response?.data?.excelbase64
          .replace(/-/g, "+")
          .replace(/_/g, "/");
        while (fixedBase64.length % 4 !== 0) {
          fixedBase64 += "=";
        }

        const binaryData = atob(fixedBase64);
        const byteArray = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
          byteArray[i] = binaryData.charCodeAt(i);
        }

        const blob = new Blob([byteArray], { type: response?.data?.mimeType });
        const blobUrl = URL.createObjectURL(blob);

        // Programmatically trigger download
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = response?.data?.fileName || "Timesheet Report List.xls";
        a.style.display = "none";

        document.body.appendChild(a);
        a.click();

        // Cleanup
        URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);
      } else {
        showToast(
          response?.data?.message || "Failed to download file",
          "error"
        );
      }
    } catch (error) {
      console.error("Error while downloading timesheet report:", error);
      showToast("An error occurred while processing your request.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // const fetchEmployeeList = async () => {
  //   try {
  //     const response = await GetCall(
  //       `/getAllUsersAndClients?companyId=${companyId}`
  //     );
  //     if (response?.data?.status === 200) {
  //       setEmployeeList(response?.data?.users);
  //       setClientList(response?.data.clients);
  //     } else {
  //       showToast(response?.data?.message, "error");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching employee list:", error);
  //   }
  // };

  const handleChangePage = (e) => {
    setCurrentPage(e);
  };

  const handleChangeRowsPerPage = (event) => {
    const value = parseInt(event.target.value, 10);
    setRowsPerPage(value);
  };

  const keyMap = {
    Date: "date",
    EmployeeName: "userName",
    JobRole: "jobRole",
    totalHours: "totalHours",
    overTime: "overTime",
    workingHours: "workingHours",
    clientName: "clientName",
    locationName: "locationName",
  };

  const handleSort = (key) => {
    const mappedKey = keyMap[key] || key;
    setSortConfig((prevSort) => {
      let direction = "asc";
      if (prevSort.key === mappedKey && prevSort.direction === "asc") {
        direction = "desc";
      }
      return { key: mappedKey, direction };
    });
  };

  const sortedData = React.useMemo(() => {
    if (!Array.isArray(timesheetReportList)) return [];
    if (!sortConfig.key) return [...timesheetReportList];
    return [...timesheetReportList].sort((a, b) => {
      const valueA = a[sortConfig.key] ?? "";
      const valueB = b[sortConfig.key] ?? "";
      // console.log("reportDetails", reportDetails);
      if (typeof valueA === "string") {
        return sortConfig.direction === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      } else {
        return sortConfig.direction === "asc"
          ? valueA - valueB
          : valueB - valueA;
      }
    });
  }, [timesheetReportList, sortConfig]);

  const filteredData = React.useMemo(() => {
    return sortedData.filter((item) =>
      Object.values(item).some(
        (value) => value?.toString().toLowerCase().includes
      )
    );
  }, [sortedData]);

  const paginatedRows = React.useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredData.slice(start, end);
  }, [filteredData, currentPage, rowsPerPage]);

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
    if (selectedEmployee && !isWorkFromOffice) {
      getAllClientsOfUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmployee, companyId]);

  useEffect(() => {
    getAllUsersOfClientOrLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClient, companyId, isWorkFromOffice, selectedLocation]);

  useEffect(() => {
    if (selectedEmployee && isWorkFromOffice) {
      getAllLocations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWorkFromOffice, companyId, selectedEmployee]);

  useEffect(() => {
    if (selectedStartDate && selectedEndDate) {
      const isInvalid = moment(selectedEndDate).isBefore(
        moment(selectedStartDate)
      );

      if (isInvalid) {
        showToast(
          "End date should be later than or equal to Start date",
          "error"
        );
        return;
      }
    }
    if (moment(selectedEndDate).isAfter(moment())) {
      showToast("End date should not later than current date", "error");
      return;
    }
    GetTimesheetReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedClient,
    selectedEmployee,
    debouncedSearch,
    selectedStartDate,
    selectedEndDate,
    isWorkFromOffice,
    rowsPerPage,
    selectedLocation,
    currentPage,
    companyId,
  ]);

  return (
    <div className="timesheet-list-container">
      <div className="timesheet-flex">
        <div className="timesheet-title">
          <h1>Daily Time Sheet Report</h1>
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
                  },
                }}
                renderValue={(selected) => {
                  if (!selected) return "Select Employee";
                  if (selected === "allUsers") return "All Employees";
                  const found = employeeList?.find(
                    (emp) => emp._id === selected
                  );
                  return found?.userName || "Select Employee";
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

                <MenuItem value="allUsers" className="menu-item">
                  All Employees
                </MenuItem>
                {filteredEmployeeList.length > 0 ? (
                  filteredEmployeeList?.map((emp) => (
                    <MenuItem
                      key={emp._id}
                      value={emp._id}
                      className="menu-item"
                    >
                      {emp.userName}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>Not Found</MenuItem>
                )}
              </Select>
              {/* {errors?.selectedEmployee && (
                <p className="error-text">{errors.selectedEmployee}</p>
              )} */}
            </div>
          )}

          {userRole !== "Employee" && !isWorkFromOffice && (
            <div className="filter-employee-selection">
              <label className="label">Client</label>
              <Select
                className="timesheet-input-dropdown"
                value={selectedClient}
                onChange={(e) => handleClientChange(e.target.value)}
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
                  },
                }}
                renderValue={(selected) => {
                  if (!selected) return "Select Client";
                  if (selected === "allClients") return "All Clients";
                  const found = clientList?.find((c) => c._id === selected);
                  return found?.clientName || "Select Clients";
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

                <MenuItem value="allClients" className="menu-item">
                  All Clients
                </MenuItem>
                {filteredClientList?.map((client) => (
                  <MenuItem
                    key={client._id}
                    value={client._id}
                    className="menu-item"
                  >
                    {client.clientName}
                  </MenuItem>
                ))}
              </Select>
              {/* {errors?.selectedEmployee && (
                <p className="error-text">{errors.selectedEmployee}</p>
              )} */}
            </div>
          )}

          {userRole !== "Employee" && isWorkFromOffice && (
            <div className="filter-employee-selection">
              <label className="label">Location</label>
              <Select
                className="timesheet-input-dropdown"
                value={selectedLocation}
                onChange={(e) => handleLocationChange(e.target.value)}
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
                  },
                }}
                renderValue={(selected) => {
                  if (!selected) return "Select Locations";
                  if (selected === "allLocations") return "All Locations";
                  const found = locationList?.find((c) => c._id === selected);
                  return found?.locationName || "All Locations";
                }}
              >
                <ListSubheader>
                  <TextField
                    size="small"
                    placeholder="Search Locations"
                    fullWidth
                    className="search-textfield"
                    value={locationSearchTerm}
                    onChange={(e) => setlocationSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </ListSubheader>

                <MenuItem value="allLocations" className="menu-item">
                  All Locations
                </MenuItem>
                {filteredLocationList?.length > 0 ? (
                  filteredLocationList?.map((location) => (
                    <MenuItem
                      key={location._id}
                      value={location._id}
                      className="menu-item"
                    >
                      {location.locationName}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="" className="menu-item" disabled>
                    No found Locations
                  </MenuItem>
                )}
              </Select>
            </div>
          )}

          <div className="timesheet-input-container">
            <label className="label">Start Date</label>
            <input
              type="date"
              name="startDate"
              className="timesheet-input"
              value={selectedStartDate}
              onChange={handleChange}
            />
          </div>

          <div className="timesheet-input-container">
            <label className="label">End Date</label>
            <input
              type="date"
              name="endDate"
              className="timesheet-input"
              value={selectedEndDate}
              onChange={handleChange}
            />
          </div>
        </div>
        <div>
          <div className="timesheet-report-list-action-button">
            <button
              className="timesheet-pdf-button"
              label="PDF"
              onClick={handlePdfDownload}
              disabled={loading}
            >
              PDF
            </button>
            <button
              className="timesheet-xls-button"
              label="XLS"
              onClick={handleXlsDownload}
              disabled={loading}
            >
              XLS
            </button>
          </div>
        </div>
      </div>

      <div className="timesheetreport-officework">
        <div className="timesheetreport-searchbar-clockin">
          <TextField
            placeholder="Search"
            variant="outlined"
            size="small"
            value={searchQuery}
            className="common-searchbar"
            onChange={handleSearchChange}
          />
        </div>
        <div className="timesheetreport-isWorkFromOffice">
          <input
            type="checkbox"
            data-testid="send-link"
            name="isWorkFromOffice"
            checked={isWorkFromOffice}
            onChange={handleCheckboxChange}
          />
          <label>Office Work?</label>
        </div>
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
                  <TableCell
                    sortDirection={
                      sortConfig.key === "date" ? sortConfig.direction : false
                    }
                  >
                    <TableSortLabel
                      active={sortConfig.key === "date"}
                      direction={sortConfig.direction}
                      onClick={() => handleSort("Date")}
                    >
                      Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === "Employee Name"}
                      direction={sortConfig.direction}
                      onClick={() => handleSort("EmployeeName")}
                    >
                      Employee Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === "jobRole"}
                      direction={sortConfig.direction}
                      onClick={() => handleSort("JobRole")}
                    >
                      Job Title
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={
                        sortConfig.key ===
                        (isWorkFromOffice ? "locationName" : "clientName")
                      }
                      direction={sortConfig.direction}
                      onClick={() =>
                        handleSort(
                          isWorkFromOffice ? "locationName" : "clientName"
                        )
                      }
                    >
                      {isWorkFromOffice ? "Location Name" : "Client Name"}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Check-in/Check-Out</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === "workingHours"}
                      direction={sortConfig.direction}
                      onClick={() => handleSort("workingHours")}
                    >
                      Working Hours
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === "overTime"}
                      direction={sortConfig.direction}
                      onClick={() => handleSort("overTime")}
                    >
                      Over Time
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === "totalHours"}
                      direction={sortConfig.direction}
                      onClick={() => handleSort("totalHours")}
                    >
                      Total Hours
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRows && paginatedRows.length > 0 ? (
                  paginatedRows?.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {moment(row.date).format("DD/MM/YYYY")}
                      </TableCell>
                      <TableCell>{row.userName}</TableCell>
                      <TableCell>{row.jobRole}</TableCell>
                      <TableCell>
                        {isWorkFromOffice ? row.locationName : row.clientName}
                      </TableCell>
                      <TableCell>
                        {row.clockinTime && row.clockinTime.length > 0
                          ? row.clockinTime?.map((item, i) => (
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
                        count={
                          Array.isArray(timesheetReportList)
                            ? timesheetReportList.length
                            : timesheetReportList
                        }
                        page={currentPage - 1}
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
