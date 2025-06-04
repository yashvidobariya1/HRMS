import React, { useEffect, useMemo, useState } from "react";
import "./TimeSheetReport.css";
import { GetCall, PostCall } from "../../ApiServices";
import { showToast } from "../../main/ToastManager";
import Loader from "../Helper/Loader";
import moment from "moment";
import { useSelector } from "react-redux";
import {
  Checkbox,
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

const TimesheetReportMy = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [timesheetReportList, setTimesheetReportList] = useState([]);
  const [isFromofficeWork, setisFromofficeWork] = useState(false);
  const [clientList, setClientList] = useState([]);
  const [selectedClient, setselectedClient] = useState("allClients");
  const userId = useSelector((state) => state.userInfo.userInfo._id);
  const companyId = useSelector((state) => state.companySelect.companySelect);
  const minDate = moment("2024-01-01").format("YYYY-MM-DD");
  const maxDate = moment().format("YYYY-MM-DD");
  const userRole = useSelector((state) => state.userInfo.userInfo.role);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [totalHourCount, settotalHourCount] = useState("");
  const [errors, setErrors] = useState({});
  const [sortConfig, setSortConfig] = React.useState({
    key: "",
    direction: "asc",
  });

  const filteredClientList = useMemo(() => {
    return clientList.filter((client) =>
      client.clientName.toLowerCase().includes(clientSearchTerm.toLowerCase())
    );
  }, [clientList, clientSearchTerm]);

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
    setSelectedStartDate("");
    setSelectedEndDate("");
  };

  const handleClientChange = (value) => {
    setselectedClient(value);
  };

  const GetTimesheetReport = async () => {
    try {
      setLoading(true);
      const filters = {
        userId: userId,
        clientId: selectedClient,
      };

      console.log("filter", filters);
      const frequency = "Daily";
      const response = await PostCall(
        `/getTimesheetReport?page=${currentPage}&limit=${rowsPerPage}&startDate=${selectedStartDate}&endDate=${selectedEndDate}&search=${debouncedSearch}&timesheetFrequency=${frequency}&isWorkFromOffice=${isFromofficeWork}`,
        filters
      );

      if (response?.data?.status === 200) {
        setTimesheetReportList(response?.data?.reports);
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

  const keyMap = {
    Date: "date",
    Name: "userName",
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
    userRole !== "Employee" && !isFromofficeWork && fetchEmployeeList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId, isFromofficeWork]);

  useEffect(() => {
    if (userId || selectedClient) {
      GetTimesheetReport();
    }
  }, [
    selectedClient,
    userId,
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
          {userRole !== "Employee" && !isFromofficeWork && (
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
                  return found?.clientName || "Unknown";
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

                <MenuItem value="allClients">All Clients</MenuItem>
                {filteredClientList.map((client) => (
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
          placeholder="Search Timesheet"
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
                      active={sortConfig.key === "userName"}
                      direction={sortConfig.direction}
                      onClick={() => handleSort("Name")}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortConfig.key === "jobRole"}
                      direction={sortConfig.direction}
                      onClick={() => handleSort("JobRole")}
                    >
                      Job Role
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={
                        sortConfig.key ===
                        (isFromofficeWork ? "locationName" : "clientName")
                      }
                      direction={sortConfig.direction}
                      onClick={() =>
                        handleSort(
                          isFromofficeWork ? "locationName" : "clientName"
                        )
                      }
                    >
                      {isFromofficeWork ? "Location Name" : "Client Name"}
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
                  paginatedRows.map((row, index) => (
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

export default TimesheetReportMy;
