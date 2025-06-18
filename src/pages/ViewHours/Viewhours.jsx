import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import useApiServices from "../../useApiServices";
import "./Viewhours.css";
import Loader from "../Helper/Loader";
import { showToast } from "../../main/ToastManager";
import { ListSubheader, MenuItem, Select, TextField } from "@mui/material";
import CommonTable from "../../SeparateCom/CommonTable";
import moment from "moment";
import { FaEye, FaTrash } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import CommonAddButton from "../../SeparateCom/CommonAddButton";
import { useNavigate } from "react-router";
import DeleteConfirmation from "../../main/DeleteConfirmation";

const Viewhours = () => {
  const { GetCall, PostCall } = useApiServices();
  const navigate = useNavigate();
  const [AlltimesheetList, setAlltimesheetList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isWorkFromOffice, setIsWorkFromOffice] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const [clientList, setClientList] = useState([]);
  const [locationList, setLocationList] = useState([]);
  // const [errors, setErrors] = useState({});
  const minDate = moment("2024-01-01").format("YYYY-MM-DD");
  const maxDate = moment().format("YYYY-MM-DD");
  const companyId = useSelector((state) => state.companySelect.companySelect);
  const [selectedEmployee, setSelectedEmployee] = useState("allUsers");
  const [selectedClient, setSelectedClient] = useState("allClients");
  const [selectedLocation, setSelectedLocation] = useState("allLocations");
  const [showDropdownAction, setShowDropdownAction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [timesheetEntryPerPage, setTimesheetEntryPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(0);
  const [totalTimesheets, setTotalTimesheets] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [selectedStartDate, setSelectedStartDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [locationSearchTerm, setLocationSearchTerm] = useState("");
  const [employeeName, setEmployeeaName] = useState("");
  const [timesheetId, setTimesheetId] = useState("");
  const [entryId, setEntryId] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const tableHeaders = isWorkFromOffice
    ? [
        "Employee Name ",
        "Job Title",
        "Location Name  ",
        "Clock In",
        "Clock Out",
        "Total Hours",
        "Actions",
      ]
    : [
        "Employee Name ",
        "Job Title",
        "Client Name  ",
        "Clock In",
        "Clock Out",
        "Total Hours",
        "Actions",
      ];

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "startDate") {
      setSelectedStartDate(value);
    } else if (name === "endDate") {
      setSelectedEndDate(value);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleTimesheetEntryPerPageChange = (e) => {
    setTimesheetEntryPerPage(e);
    setCurrentPage(1);
  };

  const handleAction = (id) => {
    setShowDropdownAction(showDropdownAction === id ? null : id);
  };

  const HandleAttendanceForm = () => {
    navigate("/staffviewhours/attendanceform");
  };

  const handleView = (id, entryId) => {
    navigate(`/staffviewhours/viewattendanceform/${id}/${entryId}`);
  };

  const handleEdit = (id, entryId) => {
    navigate(`/staffviewhours/editattendanceform/${id}/${entryId}`);
  };

  const handleDelete = (employeeName, timesheetId, entryId) => {
    setEmployeeaName(employeeName);
    setTimesheetId(timesheetId);
    setEntryId(entryId);
    setShowConfirm(true);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setShowDropdownAction(null);
  };

  const confirmDelete = async (timesheetId, entryId) => {
    try {
      setLoading(true);
      const response = await PostCall(
        `/deleteTimesheetEntry?timesheetId=${timesheetId}&entryId=${entryId}`
      );
      if (response?.data?.status === 200) {
        showToast(response?.data?.message, "success");
        setShowConfirm(false);
        getAlltimesheet();
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error deleting timesheets:", error);
      setLoading(false);
    }
  };

  const getAlltimesheet = async () => {
    try {
      setLoading(true);
      // console.log("setSelectedEmployee", selectedEmployee);
      const filters = {
        userId: selectedEmployee,
        clientId: selectedClient,
      };

      const response = await PostCall(
        `/getAllTimesheets?companyId=${companyId}&isWorkFromOffice=${isWorkFromOffice}&page=${currentPage}&limit=${timesheetEntryPerPage}&search=${debouncedSearch}&startDate=${selectedStartDate}&endDate=${selectedEndDate}`,
        filters
      );
      if (response?.data?.status === 200) {
        setAlltimesheetList(response?.data.timesheets);
        setTotalTimesheets(response.data.totalTimesheets);
        setTotalPages(response?.data?.totalPages);
      } else {
        showToast(response?.data?.message, "error");
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching timesheets:", error);
      setLoading(false);
    }
  };

  const handleCheckboxChange = (event) => {
    const checked = event.target.checked;
    setIsWorkFromOffice(checked);
    setSelectedClient("allClients");
    setSelectedEmployee("allUsers");
    setSelectedStartDate("");
    setSelectedEndDate("");
  };

  const handleEmployeeChange = (value) => {
    setSelectedEmployee(value);
  };

  const getAllClientsOfUser = async () => {
    try {
      setLoading(true);
      const response = await GetCall(
        `/getAllClientsOfUser?companyId=${companyId}&userId=${selectedEmployee}`
      );
      if (response?.data?.status === 200) {
        setClientList(response?.data?.clients);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleClientChange = (value) => {
    setSelectedClient(value);
  };

  const getAllUsersOfClient = async () => {
    try {
      setLoading(true);
      const response = await GetCall(
        `/getAllUsersOfClientOrLocation?companyId=${companyId}&clientId=${selectedClient}&isWorkFromOffice=${isWorkFromOffice}&locationId=${selectedLocation}`
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

  const handleLocationChange = (value) => {
    setSelectedLocation(value);
  };

  const getUsersJobLocations = async () => {
    try {
      setLoading(true);
      const response = await GetCall(
        `/getUsersJobLocations?userId=${selectedEmployee}&companyId=${companyId}`
      );
      if (response?.data?.status === 200) {
        setLocationList(response?.data.locations);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    if (selectedEmployee && !isWorkFromOffice) {
      getAllClientsOfUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmployee, companyId]);

  useEffect(() => {
    if (selectedEmployee && isWorkFromOffice) {
      getUsersJobLocations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmployee, companyId, isWorkFromOffice]);

  useEffect(() => {
    if (selectedClient) {
      getAllUsersOfClient();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClient, selectedLocation, companyId, isWorkFromOffice]);

  // useEffect(() => {
  //   setSelectedClient("allClients");
  //   setSelectedLocation("allLocations");
  //   setSelectedStartDate("");
  //   setSelectedEndDate("");
  // }, [selectedEmployee]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  useEffect(() => {
    getAlltimesheet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedEmployee,
    selectedClient,
    selectedLocation,
    isWorkFromOffice,
    selectedStartDate,
    selectedEndDate,
    debouncedSearch,
    currentPage,
    timesheetEntryPerPage,
  ]);

  return (
    <div className="View-hour-main">
      <div className="viewhour-section">
        <h1>Staff View Hours</h1>
        <div className="indicate-color">
          <CommonAddButton
            label="Mark Attendance"
            onClick={HandleAttendanceForm}
          />
        </div>
      </div>

      <div className="filter-timsheetreport-main">
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
              const found = employeeList.find((emp) => emp._id === selected);
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

            <MenuItem value="allUsers" className="menu-item">
              All Employees
            </MenuItem>
            {filteredEmployeeList.length > 0 ? (
              filteredEmployeeList.map((emp) => (
                <MenuItem key={emp._id} value={emp._id} className="menu-item">
                  {emp.userName}
                </MenuItem>
              ))
            ) : (
              <MenuItem value="" disabled className="menu-item">
                No found Employee
              </MenuItem>
            )}
          </Select>
        </div>

        {!isWorkFromOffice && (
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

              <MenuItem value="allClients" className="menu-item">
                All Clients
              </MenuItem>
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
          </div>
        )}

        {isWorkFromOffice && (
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
                if (!selected) return "Select Location";
                if (selected === "allLocations") return "All Locations";
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
                <MenuItem className="menu-item">Not found Locations</MenuItem>
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
      </div>

      <div className="viewhour-searchbar-main">
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={searchQuery}
          className="common-searchbar"
          onChange={handleSearchChange}
        />
        <div className="viewhours-officework">
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
        <div>
          <CommonTable
            headers={tableHeaders}
            data={AlltimesheetList?.map((timesheet) => {
              const dynamicKey =
                isWorkFromOffice === false ? "ClientName" : "LocationName";
              return {
                _id: timesheet._id,
                Name: timesheet?.userName,
                jobTitle: timesheet?.jobTitle,
                [dynamicKey]:
                  isWorkFromOffice === false
                    ? timesheet?.clientName
                    : timesheet?.locationName,
                in: `${moment(timesheet?.clockIn).format(
                  "DD-MM-YYYY HH:mm:ss"
                )}`,
                out: `${moment(timesheet?.clockOut).format(
                  "DD-MM-YYYY HH:mm:ss"
                )}`,
                totalHours: timesheet?.totalTiming,
                actions: (
                  <div className="viewhour-action">
                    <span className="action-icon view-timesheet-data">
                      <FaEye
                        onClick={() =>
                          handleView(timesheet._id, timesheet.entryId)
                        }
                      />
                    </span>
                    <span className="action-icon edit-timesheet-data">
                      <FaEdit
                        onClick={() =>
                          handleEdit(timesheet._id, timesheet.entryId)
                        }
                      />
                    </span>
                    <span className="action-icon delete-timesheet-data">
                      <FaTrash
                        onClick={() =>
                          handleDelete(
                            `${timesheet?.userName}'s ${moment(
                              timesheet?.clockIn
                            ).format("DD-MM-YYYY HH:mm:ss")} - ${moment(
                              timesheet?.clockOut
                            ).format("DD-MM-YYYY HH:mm:ss")}`,
                            timesheet._id,
                            timesheet.entryId
                          )
                        }
                      />
                    </span>
                  </div>
                ),
              };
            })}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showPerPage={timesheetEntryPerPage}
            onPerPageChange={handleTimesheetEntryPerPageChange}
            handleAction={handleAction}
            isPagination="true"
            isSearchQuery={true}
            // searchQuery={searchQuery}
            totalData={totalTimesheets}
          />
          {showConfirm && (
            <DeleteConfirmation
              confirmation={`Are you sure you want to delete the ClockIn entry of <b>${employeeName}</b>?`}
              onConfirm={() => confirmDelete(timesheetId, entryId)}
              onCancel={cancelDelete}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Viewhours;
