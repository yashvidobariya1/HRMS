import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import useApiServices from "../../useApiServices";
import "./ViewTasks.css";
import moment from "moment";
import { showToast } from "../../main/ToastManager";
import Loader from "../Helper/Loader";
import CommonTable from "../../SeparateCom/CommonTable";
import { ListSubheader, Select, TextField, MenuItem } from "@mui/material";
import { FaEye, FaTrash } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import DeleteConfirmation from "../../main/DeleteConfirmation";
import CommonAddButton from "../../SeparateCom/CommonAddButton";
import { MdOutlineLocalPostOffice } from "react-icons/md";
import { useNavigate } from "react-router";

const ViewTasks = () => {
  const navigate = useNavigate();
  const { PostCall, GetCall } = useApiServices();
  const [taskList, setTaskList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clientList, setClientList] = useState([]);
  const userRole = useSelector((state) => state.userInfo.userInfo.role);
  const [employeeList, setEmployeeList] = useState([]);
  const companyId = useSelector((state) => state.companySelect.companySelect);
  const [searchTerm, setsearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("allUsers");
  const [selectedClient, setselectedClient] = useState("allClients");
  const [locationList, setlocationList] = useState([]);
  const [selectedLocation, setselectedLocation] = useState("allLocations");
  const [locationSearchTerm, setlocationSearchTerm] = useState("");
  const [isWorkFromOffice, setisWorkFromOffice] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  // const minDate = moment("2024-01-01").format("YYYY-MM-DD");
  // const maxDate = moment().format("YYYY-MM-DD");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [totalTask, settotalTask] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [perPage, setPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [ShowConfirm, setShowConfirm] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [taskDate, settaskDate] = useState("");
  const [taskName, settaskName] = useState("");

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "startDate") {
      setSelectedStartDate(value);
    } else if (name === "endDate") {
      setSelectedEndDate(value);
    }
  };

  const handlePerPageChange = (e) => {
    setPerPage(e);
    setCurrentPage(1);
  };

  const confirmDelete = async (id) => {
    try {
      setLoading(true);
      const response = await PostCall(`/cancelTask/${id}`);
      if (response?.data?.status === 200) {
        showToast(response?.data?.message, "success");
        setShowConfirm(false);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleDelete = (id, name, startdate) => {
    setTaskId(id);
    settaskName(name);
    settaskDate(startdate);
    setShowConfirm(true);
  };

  const cancelDelete = () => {
    setShowConfirm(false);
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

  const getAllTasks = async () => {
    try {
      setLoading(true);
      const filters = {
        userId: selectedEmployee,
        [isWorkFromOffice ? "locationId" : "clientId"]: isWorkFromOffice
          ? selectedLocation
          : selectedClient,
      };
      const response = await PostCall(
        `/getAllTasks?page=${currentPage}&limit=${perPage}&companyId=${companyId}&search=${debouncedSearch}&startDate=${selectedStartDate}&endDate=${selectedEndDate}&isWorkFromOffice=${isWorkFromOffice}`,
        filters
      );

      if (response?.data?.status === 200) {
        setTaskList(response?.data?.reports);
        settotalTask(response?.data?.totalReports);
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

  const handleEmployeeChange = (employeeId) => {
    setSelectedEmployee(employeeId);
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

  const handleView = (taskId) => {
    navigate(`/viewtask/taskdetails?taskId=${taskId}`);
  };

  const handleEdit = (id) => {
    console.log("id", id);
    navigate(`/viewtask/edittask/${id}`);
  };

  const getAllUsersOfClientOrLocation = async () => {
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

  const HandleAddJob = () => {
    navigate(`/viewtask/addtask`);
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
    if (selectedEmployee && isWorkFromOffice) {
      getAllLocations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWorkFromOffice, companyId, selectedEmployee]);

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
    getAllTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <div className="task-list-container">
      <div className="task-flex">
        <div className="task-title">
          <h1>Staff Rota Schedule</h1>
        </div>
        <CommonAddButton
          label="Add Task"
          icon={MdOutlineLocalPostOffice}
          onClick={HandleAddJob}
        />
      </div>

      <div className="task-filter-container">
        <div className="task-filter-alltask-main">
          {userRole !== "Employee" && (
            <div className="task-filter-employee-selection">
              <label className="label">Employee</label>
              <Select
                className="task-input-dropdown"
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
                // min={minDate}
                // max={maxDate}
              />
            </div>

            <div className="task-input-container">
              <label className="label">End Date</label>
              <input
                type="date"
                name="endDate"
                className="task-input"
                value={selectedEndDate}
                onChange={handleChange}
                // min={minDate}
                // max={maxDate}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="task-officework">
        <div className="task-searchbar">
          <TextField
            placeholder="Search"
            variant="outlined"
            size="small"
            value={searchQuery}
            className="common-searchbar"
            onChange={handleSearchChange}
          />
        </div>

        <div className="task-isWorkFromOffice">
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
              "Task Date",
              "Employee Name ",
              "Job Title ",
              isWorkFromOffice ? "Location Name " : "Client Name ",
              "Start Time",
              "End Time",
              "Actions",
            ]}
            data={taskList?.map((task) => ({
              taskdate: moment(task.taskDate).format("DD/MM/YYYY"),
              userName: task.userName,
              jobRole: task.jobRole,
              taskloctionandorclientName: isWorkFromOffice
                ? task.locationName
                : task.clientName,
              starttime: task.startTime,
              endtime: task.endTime,
              actions: (
                <div className="viewtask-action">
                  <span className="task-action-icon view-task-data">
                    <FaEye onClick={() => handleView(task._id, task.entryId)} />
                  </span>
                  <span className="task-action-icon edit-task-data">
                    <FaEdit
                      onClick={() => handleEdit(task._id, task.entryId)}
                    />
                  </span>
                  <span className="task-action-icon delete-task-data">
                    <FaTrash
                      onClick={() =>
                        handleDelete(task._id, task.userName, task.taskDate)
                      }
                    />
                  </span>
                </div>
              ),
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
          {ShowConfirm && (
            <DeleteConfirmation
              confirmation={`Are you sure you want to delete the task <b>${taskName}</b> on <b>${taskDate}</b>?`}
              onConfirm={() => confirmDelete(taskId)}
              onCancel={cancelDelete}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ViewTasks;
