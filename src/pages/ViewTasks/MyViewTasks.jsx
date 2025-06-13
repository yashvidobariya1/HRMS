import React, { useEffect, useMemo, useState } from "react";
import useApiServices from "../../useApiServices";
import { showToast } from "../../main/ToastManager";
import Loader from "../Helper/Loader";
import moment from "moment";
import { useSelector } from "react-redux";
import CommonTable from "../../SeparateCom/CommonTable";
import { ListSubheader, MenuItem, Select, TextField } from "@mui/material";

const MyViewTasks = () => {
  const { PostCall, GetCall } = useApiServices();
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(50);
  const [loading, setLoading] = useState(false);
  const [clientList, setClientList] = useState([]);
  const [selectedClient, setselectedClient] = useState("allClients");
  const [locationList, setlocationList] = useState([]);
  const [selectedLocation, setselectedLocation] = useState("allLocations");
  const [locationSearchTerm, setlocationSearchTerm] = useState("");
  const companyId = useSelector((state) => state.companySelect.companySelect);
  const isWorkFromOffice = useSelector(
    (state) => state.jobRoleSelect.jobRoleSelect.isWorkFromOffice
  );
  const [selectedStartDate, setSelectedStartDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [TaskList, setTaskList] = useState([]);
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const userId = useSelector((state) => state.userInfo.userInfo._id);
  const minDate = moment("2024-01-01").format("YYYY-MM-DD");
  const maxDate = moment().format("YYYY-MM-DD");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const userRole = useSelector((state) => state.userInfo.userInfo.role);
  const [totalTask, settotalTask] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "startDate") {
      setSelectedStartDate(value);
    } else if (name === "endDate") {
      setSelectedEndDate(value);
    }
  };

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

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const getAllTasks = async () => {
    try {
      setLoading(true);
      const filters = {
        userId: userId,
        [isWorkFromOffice ? "locationId" : "clientId"]: isWorkFromOffice
          ? selectedLocation
          : selectedClient,
      };
      const response = await PostCall(
        `/getAllTasks?page=${currentPage}&limit=${perPage}&companyId=${companyId}&search=${debouncedSearch}&startDate=${selectedStartDate}&endDate=${selectedEndDate}&isWorkFromOffice=${isWorkFromOffice}`,
        filters
      );

      if (response?.data?.status === 200) {
        setTaskList(response?.data?.tasks);
        settotalTask(response?.data?.reports);
        setTotalPages(response?.data?.totalPages);
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
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
        `/getUsersJobLocations?companyId=${companyId}&userId=${userId}`
      );
      if (response?.data?.status === 200) {
        setlocationList(response?.data?.locations);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const getAllClientsOfUser = async () => {
    try {
      setLoading(true);
      const response = await GetCall(
        `/getAllClientsOfUser?companyId=${companyId}&userId=${userId}&isWorkFromOffice=${isWorkFromOffice}`
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
    if (userId && isWorkFromOffice) {
      getAllLocations();
    }
  }, [isWorkFromOffice, companyId, userId]);

  useEffect(() => {
    if (userId && !isWorkFromOffice) {
      getAllClientsOfUser();
    }
  }, [userId, companyId]);

  useEffect(() => {
    // if (selectedEmployee || selectedClient) {
    getAllTasks();
    // }
  }, [
    selectedClient,
    userId,
    debouncedSearch,
    selectedStartDate,
    selectedEndDate,
    isWorkFromOffice,
    perPage,
    selectedLocation,
    currentPage,
    companyId,
  ]);

  return (
    <div className="task-list-container">
      <div className="task-flex">
        <div className="task-title">
          <h1>My Task List</h1>
        </div>
      </div>

      <div className="task-filter-container">
        <div className="task-filter-alltask-main">
          {!isWorkFromOffice && (
            <div className="task-filter-employee-selection">
              <label className="label">Client</label>
              <Select
                className="task-input-dropdown"
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
            <div className="task-filter-employee-selection">
              <label className="label">Location</label>
              <Select
                className="task-input-dropdown"
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

          <div className="task-download-container">
            <div className="task-input-container">
              <label className="label">Start Date</label>
              <input
                type="date"
                name="startDate"
                className="task-input"
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
                className="task-input"
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

      {/* <div className="timesheetreport-officework">
        <div className="timesheetreport-isWorkFromOffice">
          <input
            type="checkbox"
            data-testid="send-link"
            name="isWorkFromOffice"
            checked={isWorkFromOffice}
            onChange={handleCheckboxChange}
          />
        </div>
        <label>Office Work?</label>
      </div> */}

      <div className="task-searchbar">
        <TextField
          placeholder="Search Task"
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
          <CommonTable
            headers={[
              "Task Date",
              "Employee Name",
              "Job Title",
              isWorkFromOffice ? "Location Name" : "Client Name",
              "Start Time",
              "End Time",
            ]}
            data={TaskList?.map((task) => ({
              taskdate: moment(task.date).format("DD/MM/YYYY"),
              userName: task.userName,
              taskloctionandorclientName: isWorkFromOffice
                ? task.locationName
                : task.clientName,
              jobRole: task.jobRole,
              starttime: task.startTime,
              enddtime: task.endTime,
            }))}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showPerPage={perPage}
            onPerPageChange={handlePerPageChange}
            isPagination="true"
            isSearchQuery={false}
            totalData={totalTask}
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

export default MyViewTasks;
