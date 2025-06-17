import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import useApiServices from "../../useApiServices";
import "./Viewhours.css";
import Loader from "../Helper/Loader";
import { showToast } from "../../main/ToastManager";
import { ListSubheader, MenuItem, Select, TextField } from "@mui/material";
import CommonTable from "../../SeparateCom/CommonTable";
import moment from "moment";

const MyViewHours = () => {
  const { GetCall, PostCall } = useApiServices();
  const [AlltimesheetList, setAlltimesheetList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clientList, setClientList] = useState([]);
  const [locationList, setLocationList] = useState([]);
  const minDate = moment("2024-01-01").format("YYYY-MM-DD");
  const maxDate = moment().format("YYYY-MM-DD");
  const companyId = useSelector((state) => state.companySelect.companySelect);
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
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [locationSearchTerm, setLocationSearchTerm] = useState("");
  const isWorkFromOffice = useSelector(
    (state) => state.jobRoleSelect.jobRoleSelect.isWorkFromOffice
  );
  const userId = useSelector((state) => state.userInfo.userInfo._id);

  const tableHeaders = isWorkFromOffice
    ? [
        "Employee Name",
        "Job Title",
        "Location Name",
        "Clock In",
        "Clock Out",
        "Total Hours",
      ]
    : [
        "Employee Name",
        "Job Title",
        "Client Name",
        "Clock In",
        "Clock Out",
        "Total Hours",
      ];

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

  const getAlltimesheet = async () => {
    try {
      setLoading(true);
      const filters = {
        userId,
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

  const getAllClientsOfUser = async () => {
    try {
      setLoading(true);
      const response = await GetCall(
        `/getAllClientsOfUser?companyId=${companyId}&userId=${userId}`
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

  const handleLocationChange = (value) => {
    setSelectedLocation(value);
  };

  const getUsersJobLocations = async () => {
    try {
      setLoading(true);
      const response = await GetCall(
        `/getUsersJobLocations?userId=${userId}&companyId=${companyId}`
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
    if (userId && !isWorkFromOffice) {
      getAllClientsOfUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, companyId]);

  useEffect(() => {
    if (userId && isWorkFromOffice) {
      getUsersJobLocations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, companyId, isWorkFromOffice]);

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
    userId,
    selectedClient,
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
        <h1>My View Hours</h1>
      </div>

      <div className="filter-timsheetreport-main">
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
              {filteredLocationList.map((location) => (
                <MenuItem
                  key={location._id}
                  value={location._id}
                  className="menu-item"
                >
                  {location.locationName}
                </MenuItem>
              ))}
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
            totalData={totalTimesheets}
          />
        </div>
      )}
    </div>
  );
};

export default MyViewHours;
