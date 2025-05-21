import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
// import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { GetCall, PostCall } from "../../ApiServices";
import "./ViewTasks.css";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import moment from "moment";
import { showToast } from "../../main/ToastManager";
import DeleteConfirmation from "../../main/DeleteConfirmation";
import CommonAddButton from "../../SeparateCom/CommonAddButton";
import JobTitleForm from "../../SeparateCom/RoleSelect";
import Loader from "../Helper/Loader";
import { MenuItem, Select } from "@mui/material";
import AssignClient from "../../SeparateCom/AssignClient";

const ViewTasks = () => {
  // const Navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [taskList, setTaskList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedYear, setSelectedYear] = useState(moment().year());
  const [selectedMonth, setSelectedMonth] = useState(moment().month() + 1);
  const currentYearEnd = moment().endOf("year").format("YYYY-MM-DD");
  // const currentMonthEnd = moment().endOf("month").format("YYYY-MM-DD");
  const [showConfirm, setShowConfirm] = useState(false);
  const [taskId, setTaskId] = useState("");
  const [openJobTitleModal, setOpenJobTitleModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [JobTitledata, setJobTitledata] = useState([]);
  const [openClietnSelectModal, setopenClietnSelectModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [Clientdata, setClientdata] = useState([]);
  const todayDate = new Date().toISOString().split("T")[0];
  const jobRoleId = useSelector(
    (state) => state.jobRoleSelect.jobRoleSelect.jobId
  );
  const jobRoleisworkFromOffice = useSelector(
    (state) => state.jobRoleSelect.jobRoleSelect.isWorkFromOffice
  );
  const [isWorkFromOffice, setIsWorkFromOffice] = useState("");
  const AllowstartDate = "2022-01-01";
  const startYear = moment(AllowstartDate).year();
  const currentYear = moment().year();
  const userRole = useSelector((state) => state.userInfo.userInfo.role);
  const [employeeList, setEmployeeList] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const companyId = useSelector((state) => state.companySelect.companySelect);
  // const location = useLocation();
  // const searchParams = new URLSearchParams(location.search);
  // const EmployeeId = searchParams.get("EmployeeId");
  const [appliedFilters, setAppliedFilters] = useState({
    year: moment().year(),
    month: moment().month() + 1,
  });

  const applyFilters = () => {
    setAppliedFilters({
      year: selectedYear,
      month: selectedMonth,
    });
  };

  const months = moment
    .months()
    .map((month, index) => ({
      name: moment().month(index).format("MMM"),
      value: index + 1,
    }))
    .filter(
      (month) =>
        selectedYear < currentYear || month.value <= moment().month() + 1
    );

  const [formData, setFormData] = useState({
    taskDate: "",
    taskName: "",
    taskDescription: "",
    startTime: "",
    endTime: "",
    startDate: "",
    endDate: "",
  });

  const handleDateClick = (info) => {
    console.log("save click");
    setFormData({
      taskDate: "",
      taskName: "",
      taskDescription: "",
      startTime: "",
      endTime: "",
    });
    const clickedDate = moment(info.dateStr).format("YYYY-MM-DD");
    const todayDate = moment().format("YYYY-MM-DD");

    if (moment(clickedDate).isBefore(todayDate)) {
      showToast("You can not select past dates", "error");
      return;
    }

    if (clickedDate === todayDate) {
      showToast("You can not select today's date", "error");
      return;
    }

    const existingEvent = taskList.find(
      (task) => moment(task.taskDate).format("YYYY-MM-DD") === clickedDate
    );

    if (existingEvent) {
      setFormData({
        _id: existingEvent._id,
        taskDate: existingEvent.taskDate,
        taskDescription: existingEvent.taskDescription,
        taskName: existingEvent.taskName,
        startTime: existingEvent.startTime,
        endTime: existingEvent.endTime,
      });
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        taskDate: clickedDate,
      }));
    }
    setIsPopupOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const GetClientdata = async () => {
    const payload = {
      jobId: selectedEmployee ? selectedJobId : jobRoleId,
      userId: selectedEmployee,
    };

    try {
      const response = await PostCall(`/getUsersAssignClients`, payload);

      if (response?.data?.status === 200) {
        const jobTitles = response.data.assignClients;
        console.log("job title", jobTitles);
        setClientdata(jobTitles);

        if (jobTitles.length > 1) {
          setopenClietnSelectModal(false);
        } else {
          setSelectedClientId(jobTitles[0]?.clientId);
          setopenClietnSelectModal(true);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleClientPopupClose = () => {
    setopenClietnSelectModal(true);
  };

  const handleClientSelect = (selectedTitle) => {
    console.log("setSelectedClientId", selectedClientId);
    setSelectedClientId(selectedTitle);
    setopenClietnSelectModal(true);
  };

  const validate = () => {
    let newErrors = {};
    if (formData._id && !formData.taskDate) {
      newErrors.taskDate = "Task Date is required";
    }
    // if (!formData.taskName) newErrors.taskName = "Task Name is required";
    // if (!formData.taskDescription)
    //   newErrors.taskDescription = "Task Description is required";
    if (!formData._id) {
      if (!formData.startDate) newErrors.startDate = "Start Date is required";
      if (!formData.endDate) newErrors.endDate = "End Date is required";
    }
    if (formData.startDate && formData.endDate) {
      const start = moment(formData.startDate, "YYYY-MM-DD");
      const end = moment(formData.endDate, "YYYY-MM-DD");

      if (start.isAfter(end)) {
        newErrors.startDate = "Start Date cannot be after End Date";
        newErrors.endDate = "End Date cannot be before Start Date";
      }
    }
    if (!formData.startTime) newErrors.startTime = "Start Time is required";
    if (!formData.endTime) newErrors.endTime = "End Time is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTask = async (e) => {
    console.log("handle add task", e, selectedJobId);
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      let response;
      const data = {
        ...formData,
        userId: selectedEmployee ? selectedEmployee : "",
        jobId: selectedJobId ? selectedJobId : jobRoleId,
        clientId: selectedClientId,
      };
      // console.log("formData", formData);
      if (formData._id) {
        response = await PostCall(`/updateTask/${formData._id}`, data);
      } else {
        response = await PostCall("/createTask", data);
      }
      if (response?.data?.status === 200) {
        showToast(response?.data?.message, "success");
        // console.log("formdata", formData);

        setTaskList((prev) => {
          if (formData._id) {
            return prev.map((task) =>
              task._id === formData._id ? { ...task, ...formData } : task
            );
          } else {
            return [...prev, { ...formData, _id: response?.data?.taskId }];
          }
        });
        getAllTasks();
        setIsPopupOpen(false);
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("An error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async (id) => {
    // console.log("id", id);
    try {
      setLoading(true);
      const response = await PostCall(`/cancelTask/${id}`);
      if (response?.data?.status === 200) {
        showToast(response?.data?.message, "success");
        setIsPopupOpen(false);
        setShowConfirm(false);
        // navigate(`/location/tasks/tasklist/${locationId}`);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
      setIsPopupOpen(false);
    } catch (error) {
      console.log("error", error);
    }
    getAllTasks();
  };

  const handleDeleteTask = async (id) => {
    // console.log("delete task id", id);
    setTaskId(id);
    setShowConfirm(true);
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
    setErrors({});
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    // setShowDropdownAction(null);
  };

  const handleJobPopupClose = () => {
    setOpenJobTitleModal(true);
  };

  const handleJobTitleSelect = (selectedTitle) => {
    setSelectedJobId(selectedTitle);
    const selectedJob = JobTitledata.find((job) => job.jobId === selectedTitle);
    if (selectedJob) {
      setIsWorkFromOffice(selectedJob.isWorkFromOffice);
      console.log("setIsWorkFromOffice", selectedJob.isWorkFromOffice);
    }
    setOpenJobTitleModal(true);
  };

  // const handleViewTasks = () => {
  //   if (userRole === "Superadmin") {
  //     Navigate(`/location/tasks/tasklist/${EmployeeId}`);
  //   } else {
  //     Navigate(`/tasks/tasklist`);
  //   }
  // };

  const fetchEmployeeList = async () => {
    try {
      const response = await GetCall(`/getUsers?companyId=${companyId}`);
      if (response?.data?.status === 200) {
        setEmployeeList(response?.data?.users);
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (error) {
      console.error("Error fetching employee list:", error);
    }
  };

  const GetJobTitleData = async () => {
    try {
      let response;
      // console.log("EmployeeId", EmployeeId);
      if (selectedEmployee) {
        response = await GetCall(
          `/getUserJobTitles?EmployeeId=${selectedEmployee}`
        );
      } else {
        response = await GetCall(`/getUserJobTitles`);
      }

      if (response?.data?.status === 200) {
        const { multipleJobTitle, jobTitles } = response?.data;
        setJobTitledata(jobTitles);

        if (multipleJobTitle) {
          setOpenJobTitleModal(false);
        } else {
          setSelectedJobId(jobTitles[0]?.jobId);
          setOpenJobTitleModal(true);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleEmployeeChange = (employeeId) => {
    setSelectedYear(moment().year());
    setSelectedMonth(moment().month() + 1);
    setSelectedEmployee(employeeId);
    setSelectedClientId("");
    setSelectedJobId("");
    setAppliedFilters({
      year: moment().year(),
      month: moment().month() + 1,
    });
  };

  const getAllTasks = async () => {
    try {
      setLoading(true);
      const data = {
        jobId: selectedEmployee ? selectedJobId : jobRoleId,
        userId: selectedEmployee,
        clientId: selectedClientId,
      };
      const { year, month } = appliedFilters;
      const response = await PostCall(
        `/getAllTasks?year=${year}&month=${month}`,
        data
      );

      if (response?.data?.status === 200) {
        setTaskList(response?.data.tasks);
        console.log("response:", response?.data.tasks);
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const GetTimesheet =
      (selectedEmployee &&
        selectedJobId &&
        selectedClientId &&
        appliedFilters) ||
      (!selectedEmployee &&
        appliedFilters &&
        ((jobRoleId && jobRoleisworkFromOffice) ||
          (jobRoleId && !jobRoleisworkFromOffice && selectedClientId) ||
          (selectedJobId && !jobRoleisworkFromOffice && selectedClientId))) ||
      (selectedJobId && isWorkFromOffice);

    if (GetTimesheet) {
      getAllTasks();
    }
  }, [
    selectedEmployee,
    selectedJobId,
    selectedClientId,
    jobRoleId,
    isWorkFromOffice,
    jobRoleisworkFromOffice,
    appliedFilters,
  ]);

  useEffect(() => {
    const GetClientData =
      (selectedEmployee && selectedJobId && !isWorkFromOffice) ||
      (!selectedEmployee && jobRoleId && !jobRoleisworkFromOffice);

    if (GetClientData) {
      GetClientdata();
    }
  }, [
    selectedEmployee,
    selectedJobId,
    jobRoleId,
    isWorkFromOffice,
    jobRoleisworkFromOffice,
  ]);

  useEffect(() => {
    userRole !== "Employee" && fetchEmployeeList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  useEffect(() => {
    console.log("tasklist", taskList);
    const transformedEvents = taskList.map((task) => ({
      title: task.taskName,
      start: task.taskDate,
      allDay: true,
      classNames: ["task-event"],
      extendedProps: {
        description: `${task.taskDescription} ${task.startTime} - ${task.endTime}`,
      },
    }));

    setEvents(transformedEvents);
  }, [taskList]);

  useEffect(() => {
    if (selectedEmployee) {
      GetJobTitleData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmployee]);

  return (
    <div className="View-task-main">
      {!openJobTitleModal && JobTitledata.length > 1 && (
        <JobTitleForm
          onClose={handleJobPopupClose}
          jobTitledata={JobTitledata}
          onJobTitleSelect={handleJobTitleSelect}
        />
      )}
      {!openClietnSelectModal && Clientdata.length > 1 && (
        <AssignClient
          onClose={handleClientPopupClose}
          Clientdata={Clientdata}
          onClientSelect={handleClientSelect}
        />
      )}
      <div className="View-task-list">
        <h1 className="view-task-title">Tasks</h1>
        {/* <div className="indicate-color-task">
          <CommonAddButton
            label={"View Tasks"}
            //  icon={MdRateReview}
            onClick={handleViewTasks}
          />
        </div> */}
        <div className="view-task-filter-container">
          <div className="selection-wrapper">
            {/* <select
              value={selectedYear}
              onChange={(e) => {
                // console.log("year", e.target.value);
                setSelectedYear(e.target.value);
              }}
            >
              {[...Array(currentYear - startYear + 1)].map((_, index) => {
                const year = startYear + index;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select> */}

            <Select
              className="viewtask-dropdown"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              displayEmpty
              MenuProps={{
                PaperProps: {
                  style: {
                    width: 120,
                    textOverflow: "ellipsis",
                    maxHeight: 200,
                    whiteSpace: "nowrap",
                  },
                },
              }}
            >
              {[...Array(currentYear - startYear + 1)].map((_, index) => {
                const year = startYear + index;
                return (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                );
              })}
            </Select>
          </div>

          <div className="selection-wrapper">
            {/* <select
              value={selectedMonth}
              onChange={(e) => {
                // console.log("month", e.target.value);
                setSelectedMonth(e.target.value);
              }}
            >
              {months?.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.name}
                </option>
              ))}
            </select> */}
            <Select
              value={selectedMonth}
              className="viewtask-dropdown"
              onChange={(e) => {
                const value = parseInt(e.target.value, 10);
                console.log("month", value);
                setSelectedMonth(value);
              }}
              displayEmpty
              MenuProps={{
                PaperProps: {
                  style: {
                    width: 120,
                    textOverflow: "ellipsis",
                    maxHeight: 200,
                    whiteSpace: "nowrap",
                  },
                },
              }}
            >
              {months?.map((month) => (
                <MenuItem key={month.value} value={month.value}>
                  {month.name}
                </MenuItem>
              ))}
            </Select>
          </div>

          <CommonAddButton
            label={"Filter"}
            // icon={MdRateReview}
            onClick={applyFilters}
          />
        </div>
      </div>

      {userRole != "Employee" && (
        <div className="viewhour-employee-list">
          <Select
            className="viewtask-input-dropdown"
            value={selectedEmployee}
            onChange={(e) => handleEmployeeChange(e.target.value)}
            displayEmpty
            MenuProps={{
              PaperProps: {
                style: {
                  width: 150,
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxHeight: 200,
                },
              },
            }}
          >
            <MenuItem value="" disabled>
              Select Employee
            </MenuItem>
            {employeeList.map((employee) => (
              <MenuItem key={employee._id} value={employee._id}>
                {employee.userName}
              </MenuItem>
            ))}
          </Select>
        </div>
      )}

      {loading ? (
        <div className="loader-wrapper">
          <Loader />
        </div>
      ) : (
        <div>
          <FullCalendar
            key={selectedYear}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            initialDate={moment(`${selectedYear}-${selectedMonth}`).toDate()}
            dateClick={(info) => {
              if (
                (userRole === "Manager" ||
                  userRole === "Administrator" ||
                  userRole === "Superadmin") &&
                selectedEmployee
              ) {
                handleDateClick(info);
              }
            }}
            headerToolbar={{
              right: "next today",
              center: "title",
              left: "prev",
            }}
            buttonText={{
              today: "Today",
            }}
            validRange={{
              start: AllowstartDate,
              end: currentYearEnd,
            }}
            events={events}
            height="75vh"
            eventDidMount={(info) => {
              tippy(info.el, {
                content: info.event.extendedProps.description,
                placement: "top",
                theme: "light-border",
                animation: "fade",
                delay: [100, 200],
              });
            }}
            datesSet={(info) => {
              const currentYear = info.view.currentStart.getFullYear();
              const currentMonth = info.view.currentStart.getMonth() + 1;
              setSelectedYear(currentYear);
              setSelectedMonth(currentMonth);
            }}
          />
        </div>
      )}
      {isPopupOpen && (
        <div className="task-popup-overlay">
          <div className="task-popup-box">
            <button className="task-close-button" onClick={handlePopupClose}>
              ×
            </button>

            <h3>{formData._id ? "Update" : "Add"} Task</h3>
            {formData._id && (
              <div className="addtask-input-container">
                <label className="label">Date*</label>
                <input
                  type="date"
                  name="taskDate"
                  value={formData.taskDate}
                  className="addtask-input"
                  onChange={handleChange}
                  min={todayDate}
                />
                {errors?.taskDate && (
                  <div className="error-text">{errors?.taskDate}</div>
                )}
              </div>
            )}

            <div className="addtask-input-container">
              <label className="label">Task Name</label>
              <input
                type="text"
                name="taskName"
                value={formData.taskName}
                className="addtask-input"
                onChange={handleChange}
              />
              {/* {errors?.taskName && (
                <div className="error-text">{errors?.taskName}</div>
              )} */}
            </div>
            <div className="addtask-input-container">
              <label className="label">Task Description</label>
              <textarea
                name="taskDescription"
                value={formData.taskDescription}
                className="addtask-input"
                onChange={handleChange}
              />
              {/* {errors?.taskDescription && (
                <div className="error-text">{errors?.taskDescription}</div>
              )} */}
            </div>
            {!formData._id && (
              <>
                <div className="addtask-input-container">
                  <label className="label">Start Date*</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    className="addtask-input"
                    onChange={handleChange}
                    min={todayDate}
                  />
                  {errors?.startDate && (
                    <div className="error-text">{errors?.startDate}</div>
                  )}
                </div>
                <div className="addtask-input-container">
                  <label className="label">End Date*</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    className="addtask-input"
                    onChange={handleChange}
                    min={todayDate}
                  />
                  {errors?.endDate && (
                    <div className="error-text">{errors?.endDate}</div>
                  )}
                </div>
              </>
            )}

            <div className="addtask-input-container">
              <label className="label">Start Time*</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                className="addtask-input"
                onChange={handleChange}
              />
              {errors?.startTime && (
                <div className="error-text">{errors?.startTime}</div>
              )}
            </div>
            <div className="addtask-input-container">
              <label className="label">End Time*</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                className="addtask-input"
                onChange={handleChange}
              />
              {errors?.endTime && (
                <div className="error-text">{errors?.endTime}</div>
              )}
            </div>

            <button onClick={handleAddTask} className="task-modal-buttons">
              {formData._id ? "Update" : "Add"}
            </button>

            {formData._id && (
              <button
                onClick={() => handleDeleteTask(formData._id)}
                className="task-modal-buttons"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )}
      {showConfirm && (
        <DeleteConfirmation
          confirmation={`Are you sure you want to delete task on date <b>${formData.taskDate}</b>?`}
          onConfirm={() => confirmDelete(taskId)}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
};

export default ViewTasks;
