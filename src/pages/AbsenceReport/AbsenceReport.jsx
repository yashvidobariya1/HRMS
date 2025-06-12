import React, { useEffect, useMemo, useState } from "react";
import "./AbsenceReport.css";
import useApiServices from "../../useApiServices";
import { showToast } from "../../main/ToastManager";
import Loader from "../Helper/Loader";
import moment from "moment";
import { useSelector } from "react-redux";
import CommonTable from "../../SeparateCom/CommonTable";
import { ListSubheader, MenuItem, Select, TextField } from "@mui/material";

const AbsenceReport = () => {
  const { PostCall, GetCall } = useApiServices();
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(50);
  const [loading, setLoading] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const [clientList, setClientList] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("allUsers");
  const [selectedClient, setselectedClient] = useState("allClients");
  const [locationList, setlocationList] = useState([]);
  const [selectedLocation, setselectedLocation] = useState("allLocations");
  const [locationSearchTerm, setlocationSearchTerm] = useState("");
  const companyId = useSelector((state) => state.companySelect.companySelect);
  const [isWorkFromOffice, setisWorkFromOffice] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [absenceReportList, setAbsenceReportList] = useState([]);
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const minDate = moment("2024-01-01").format("YYYY-MM-DD");
  const maxDate = moment().format("YYYY-MM-DD");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [totalAbsencesheet, settotalAbsencesheet] = useState([]);
  const [searchTerm, setsearchTerm] = useState("");
  const userRole = useSelector((state) => state.userInfo.userInfo.role);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "startDate") {
      setSelectedStartDate(value);
    } else if (name === "endDate") {
      setSelectedEndDate(value);
    }
  };

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

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePerPageChange = (e) => {
    setPerPage(e);
    setCurrentPage(1);
  };

  const handleEmployeeChange = (employeeId) => {
    setSelectedEmployee(employeeId);
  };

  const handleCheckboxChange = (event) => {
    const checked = event.target.checked;
    setisWorkFromOffice(checked);
    setselectedClient("");
    setSelectedEmployee("");
    setSelectedStartDate("");
    setSelectedEndDate("");
    setselectedClient("allClients");
    setSelectedEmployee("allUsers");
    setselectedLocation("allLocations");
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const GetAbsenceReport = async () => {
    try {
      setLoading(true);
      const filters = {
        userId: selectedEmployee,
        [isWorkFromOffice ? "locationId" : "clientId"]: isWorkFromOffice
          ? selectedLocation
          : selectedClient,
      };

      const response = await PostCall(
        `/getAbsenceReport?page=${currentPage}&limit=${perPage}&companyId=${companyId}&search=${debouncedSearch}&startDate=${selectedStartDate}&endDate=${selectedEndDate}&isWorkFromOffice=${isWorkFromOffice}`,
        filters
      );

      if (response?.data?.status === 200) {
        setAbsenceReportList(response?.data?.reports);
        settotalAbsencesheet(response.data.totalReports);
        setTotalPages(response?.data?.totalPages);
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
  };

  const handleLocationChange = (value) => {
    setselectedLocation(value);
  };

  const getAllLocations = async () => {
    try {
      setLoading(true);
      const response = await GetCall(
        `/getUsersJobLocations?companyId=${companyId}&userId=${selectedEmployee}`
      );
      if (response?.data?.status === 200) {
        setlocationList(response?.data.locations);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getAllClientsOfUser = async () => {
    try {
      setLoading(true);
      const response = await GetCall(
        `/getAllClientsOfUser?companyId=${companyId}&userId=${selectedEmployee}&isWorkFromOffice=${isWorkFromOffice}`
      );
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

  const getAllUsersOfClientOrLocation = async () => {
    try {
      setLoading(true);
      // const formdata = {
      //   clientId: selectedClient,
      //   isWorkFromOffice: isWorkFromOffice,
      // };
      const response = await GetCall(
        `/getAllUsersOfClientOrLocation?companyId=${companyId}&clientId=${selectedClient}&isWorkFromOffice=${isWorkFromOffice}`
      );
      if (response?.data?.status === 200) {
        setEmployeeList(response?.data.users);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (selectedEmployee && isWorkFromOffice) {
      getAllLocations();
    }
  }, [isWorkFromOffice, selectedLocation, companyId, selectedEmployee]);

  useEffect(() => {
    if (selectedEmployee && !isWorkFromOffice) {
      getAllClientsOfUser();
    }
  }, [selectedEmployee, companyId]);

  useEffect(() => {
    if (selectedClient) {
      getAllUsersOfClientOrLocation();
    }
  }, [selectedClient, companyId]);

  // useEffect(() => {
  //   const AbsenceReport =
  //     (selectedEmployee &&
  //       selectedJobId &&
  //       selectedClientId &&
  //       appliedFilters) ||
  //     (!selectedEmployee &&
  //       appliedFilters &&
  //       ((jobRoleId && jobRoleisworkFromOffice) ||
  //         (jobRoleId && !jobRoleisworkFromOffice && selectedClientId) ||
  //         (selectedJobId && !jobRoleisworkFromOffice && selectedClientId))) ||
  //     (selectedJobId && isWorkFromOffice);

  //   if (AbsenceReport) {
  //     GetAbsenceReport();
  //   }
  // }, [
  //   selectedEmployee,
  //   selectedJobId,
  //   selectedClientId,
  //   jobRoleId,
  //   isWorkFromOffice,
  //   jobRoleisworkFromOffice,
  //   appliedFilters,
  // ]);

  useEffect(() => {
    // if (selectedEmployee || selectedClient) {
    GetAbsenceReport();
    // }
  }, [
    selectedClient,
    selectedEmployee,
    debouncedSearch,
    selectedStartDate,
    selectedEndDate,
    isWorkFromOffice,
    currentPage,
    perPage,
    selectedLocation,
    companyId,
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
    <div className="absencesheet-list-container">
      <div className="absencesheet-flex">
        <div className="absencesheet-title">
          <h1>Staff Absence Report</h1>
        </div>
      </div>

      <div className="absence-filter-container">
        <div className="absence-filter-timsheetreport-main">
          {userRole !== "Employee" && (
            <div className="absence-filter-employee-selection">
              <label className="label">Employee</label>
              <Select
                className="absence-input-dropdown"
                value={selectedEmployee}
                onChange={(e) => handleEmployeeChange(e.target.value)}
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
                  if (!selected) return "Select Employee";
                  if (selected === "allUsers") return "All Employees";
                  const found = employeeList.find(
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
                    onChange={(e) => setsearchTerm(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </ListSubheader>

                <MenuItem value="allUsers" className="menu-item">
                  All Employees
                </MenuItem>
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
                  <MenuItem disabled>Not Found</MenuItem>
                )}
              </Select>
            </div>
          )}

          {userRole !== "Employee" && !isWorkFromOffice && (
            <div className="filter-employee-selection">
              <label className="label">Client</label>
              <Select
                className="absence-input-dropdown"
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
                {filteredClientList.map((client) => (
                  <MenuItem
                    key={client._id}
                    value={client._id}
                    className="menu-item"
                  >
                    {client.clientName}
                  </MenuItem>
                ))}
              </Select>
            </div>
          )}

          {userRole !== "Employee" && isWorkFromOffice && (
            <div className="filter-employee-selection">
              <label className="label">Location</label>
              <Select
                className="absence-input-dropdown"
                value={selectedLocation}
                onChange={(e) => handleLocationChange(e.target.value)}
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
                  if (!selected) return "Select Locations";
                  if (selected === "allLocations") return "All Locations";
                  const found = locationList.find((c) => c._id === selected);
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
                  <MenuItem value="" className="menu-item" disabled>
                    No found Locations
                  </MenuItem>
                )}
              </Select>
            </div>
          )}

          <div className="absence-download-container">
            <div className="absence-input-container">
              <label className="label">Start Date</label>
              <input
                type="date"
                name="startDate"
                className="absence-input"
                value={selectedStartDate}
                onChange={handleChange}
                min={minDate}
                max={maxDate}
              />
            </div>

            <div className="absence-input-container">
              <label className="label">End Date</label>
              <input
                type="date"
                name="endDate"
                className="absence-input"
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

      <div className="absence-officework">
        <div className="absence-searchbar">
          <TextField
            placeholder="Search Absence Report"
            variant="outlined"
            size="small"
            value={searchQuery}
            className="common-searchbar"
            onChange={handleSearchChange}
          />
        </div>

        <div className="absence-isWorkFromOffice">
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
          <CommonTable
            headers={[
              "Absence Date",
              isWorkFromOffice ? "Location Name" : "Client Name",
              ,
              "Job Title",
              "Status",
            ]}
            data={absenceReportList?.map((absencesheet) => ({
              absencesheetdate: moment(absencesheet.date).format("DD/MM/YYYY"),
              absencelcaotionandorclientName: isWorkFromOffice
                ? absencesheet.locationName
                : absencesheet.clientName,
              jobRole: absencesheet.jobRole,
              absencesheetstatus: absencesheet.status,
            }))}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showPerPage={perPage}
            onPerPageChange={handlePerPageChange}
            isPagination="true"
            isSearchQuery={false}
            totalData={totalAbsencesheet}
          />

          {/* <AbsencesheetTable
            headers={["Date", "Status", "Timing", "Total Hours", "OverTime"]}
            absenceReportList={absenceReportList}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showPerPage={perPage}
            onPerPageChange={handlePerPageChange}
        /> */}
        </>
      )}
    </div>
  );
};

export default AbsenceReport;
