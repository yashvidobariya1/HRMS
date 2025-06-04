// import React, { useState, useEffect } from "react";
// import { Calendar, momentLocalizer } from "react-big-calendar";
// // import moment from "moment";
// import "react-big-calendar/lib/css/react-big-calendar.css";
// import "./Viewhours.css";
// import { GetCall, PostCall } from "../../useApiServices";
// import Loader from "../Helper/Loader";
// import JobTitleForm from "../../SeparateCom/RoleSelect";
// import moment from "moment-timezone";
// import { useSelector } from "react-redux";
// import { useLocation } from "react-router";

// const Viewhours = () => {
//   moment.tz.setDefault("Europe/London");
//   const localizer = momentLocalizer(moment);
//   const [AlltimesheetList, setAlltimesheetList] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [openJobTitleModal, setOpenJobTitleModal] = useState(false);
//   const [JobTitledata, setJobTitledata] = useState([]);
//   const [selectedJobId, setSelectedJobId] = useState("");
//   const userRole = useSelector((state) => state.userInfo.userInfo.role);
//   const location = useLocation();
//   const queryParams = new URLSearchParams(location.search);
//   const EmployeeId = queryParams.get("EmployeeId");
//   console.log("employeeid", EmployeeId);
//   // const [calendarHeight, setCalendarHeight] = useState(700);
//   const [view, setView] = useState("month");
//   const jobRoleId = useSelector(
//     (state) => state.jobRoleSelect.jobRoleSelect.jobId
//   );

//   const getAlltimesheet = async () => {
//     try {
//       setLoading(true);

//       const filters = {
//         jobId:
//         EmployeeId
//         ? selectedJobId
//         : jobRoleId,
//         userId: EmployeeId,
//       };

//       console.log("filters", filters);
//       const response = await PostCall("/getAllTimesheets", filters);

//       if (response?.data?.status === 200) {
//         setAlltimesheetList(response?.data.timesheets);
//       }

//       setLoading(false);
//     } catch (error) {
//       console.error("Error fetching timesheets:", error);
//       setLoading(false);
//     }
//   };

//   const customEventRenderer = ({ event }) => {
//     return (
//       <>
//         <div className="Overtime-div">
//           <span>{event.title}</span>
//         </div>
//         {event.overtime && event.overtime !== "0h 0m 0s" && (
//           <div className="overtime-label" style={{ display: "block" }}>
//             {event.overtime}
//           </div>
//         )}
//       </>
//     );
//   };

//   const Getjobtitledata = async () => {
//     try {
//       let response;
//       if (EmployeeId) {
//         response = await GetCall(`/getUserJobTitles?EmployeeId=${EmployeeId}`);
//       } else {
//         response = await GetCall(`/getUserJobTitles`);
//       }
//       if (response?.data?.status === 200) {
//         const { multipleJobTitle, jobTitles } = response?.data;
//         setJobTitledata(jobTitles);
//         if (multipleJobTitle) {
//           setOpenJobTitleModal(false);
//         } else {
//           setSelectedJobId(jobTitles[0]?.jobId);
//           setOpenJobTitleModal(true);
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   const handlePopupClose = () => {
//     setOpenJobTitleModal(true);
//   };

//   const handleJobTitleSelect = (selectedTitle) => {
//     // console.log("selecttitle", selectedTitle);
//     setSelectedJobId(selectedTitle);
//     setOpenJobTitleModal(true);
//   };

//   useEffect(() => {
//     if (  EmployeeId ) {
//       console.log("dropdown");
//       Getjobtitledata();
//     }
//   }, [userRole]);

//   useEffect(() => {
//     if (EmployeeId ) {
//       if (selectedJobId) {
//         getAlltimesheet();
//       }
//     } else {
//       getAlltimesheet();
//     }
//   }, [openJobTitleModal, EmployeeId, jobRoleId]);

//   // useEffect(() => {
//   //   const handleResize = () => {
//   //     if (window.innerWidth < 768) {
//   //       setCalendarHeight(450);
//   //     } else {
//   //       setCalendarHeight(700);
//   //     }
//   //   };

//   //   window.addEventListener("resize", handleResize);
//   //   handleResize();

//   //   return () => window.removeEventListener("resize", handleResize);
//   // }, []);

//   return (
//     <div className="View-hour-main">
//       {!openJobTitleModal && JobTitledata.length > 1 && (
//         <JobTitleForm
//           onClose={handlePopupClose}
//           jobTitledata={JobTitledata}
//           onJobTitleSelect={handleJobTitleSelect}
//         />
//       )}

//       <div className="viewhour-section">
//         <h1>Working Hours</h1>
//         <div className="indicate-color">
//           <p>
//             <span className="color-box black-box"></span>Total Hour
//           </p>
//           <p>
//             <span className="color-box green-box"></span>Overtime
//           </p>
//         </div>
//       </div>

//       {loading ? (
//         <div className="loader-wrapper">
//           <Loader />
//         </div>
//       ) : (
//         <Calendar
//           className="Calender-container"
//           localizer={localizer}
//           events={AlltimesheetList.flatMap((timesheet) => {
//             // {
//             //   console.log("event", events);
//             // }
//             if (view === "month") {
//               return [
//                 {
//                   title: `${timesheet.totalHours}`,
//                   start: timesheet.clockinTime?.[0]?.clockIn
//                     ? moment(timesheet.clockinTime[0].clockIn).toDate()
//                     : null,
//                   end: timesheet.clockinTime?.[0]?.clockOut
//                     ? moment(timesheet.clockinTime[0].clockOut).toDate()
//                     : null,
//                   overtime: timesheet.overTime,
//                   tooltip: `${timesheet.overTime}`,
//                 },
//               ];
//             }

//             if (view === "week" || view === "day") {
//               return (
//                 timesheet.clockinTime?.map((clock) => {
//                   const eventStart = clock.clockIn
//                     ? moment(clock.clockIn).toDate()
//                     : null;
//                   const eventEnd = clock.clockOut
//                     ? moment(clock.clockOut).toDate()
//                     : null;

//                   const clockInFormatted = clock.clockIn
//                     ? moment(clock.clockIn).format("hh:mm A")
//                     : "";
//                   const clockOutFormatted = clock.clockOut
//                     ? moment(clock.clockOut).format("hh:mm A")
//                     : "";
//                   const duration =
//                     clock.clockIn && clock.clockOut
//                       ? moment.duration(
//                           moment(clock.clockOut).diff(moment(clock.clockIn))
//                         )
//                       : null;

//                   const totalDuration = duration
//                     ? `${Math.floor(
//                         duration.asHours()
//                       )}h ${duration.minutes()}m`
//                     : "0h 0m";

//                   return {
//                     title: `${clockInFormatted} - ${clockOutFormatted} (${totalDuration} Total Hours)`,
//                     start: eventStart,
//                     end: eventEnd,
//                     overtime: timesheet.overTime,
//                     tooltip: `${timesheet.overTime}`,
//                   };
//                 }) || []
//               );
//             }
//             return [];
//           })}
//           startAccessor="start"
//           endAccessor="end"
//           views={["month", "week", "day"]}
//           tooltipAccessor="tooltip"
//           components={{
//             event: customEventRenderer,
//           }}
//           onView={(newView) => setView(newView)}
//         />
//       )}
//     </div>
//   );
// };

// export default Viewhours;

// =========full calender======

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import useApiServices from "../../useApiServices";
import JobTitleForm from "../../SeparateCom/RoleSelect";
import "./Viewhours.css";
import "tippy.js/dist/tippy.css";
import Loader from "../Helper/Loader";
import AssignClient from "../../SeparateCom/AssignClient";
import { showToast } from "../../main/ToastManager";
import { MenuItem, Select } from "@mui/material";
import CommonTable from "../../SeparateCom/CommonTable";

const Viewhours = () => {
  const { GetCall, PostCall } = useApiServices();
  // const [events, setEvents] = useState([]);
  const [AlltimesheetList, setAlltimesheetList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openJobTitleModal, setOpenJobTitleModal] = useState(false);
  const [JobTitledata, setJobTitledata] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  // const [viewMode, setViewMode] = useState("dayGridMonth");
  const userRole = useSelector((state) => state.userInfo.userInfo.role);
  const [openClietnSelectModal, setopenClietnSelectModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [Clientdata, setClientdata] = useState([]);
  const [isWorkFromOffice, setIsWorkFromOffice] = useState(false);
  const [employeeList, setEmployeeList] = useState([]);
  const jobRoleId = useSelector(
    (state) => state.jobRoleSelect.jobRoleSelect.jobId
  );
  const companyId = useSelector((state) => state.companySelect.companySelect);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const jobRoleisworkFromOffice = useSelector(
    (state) => state.jobRoleSelect.jobRoleSelect.isWorkFromOffice
  );
  const [showDropdownAction, setShowDropdownAction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [clientPerPage, setClientPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalClient, setTotalClient] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [selectedStartDate, setSelectedStartDate] = useState("");
  const [selectedEndDate, setSelectedEndDate] = useState("");
  const actions = [];

  const tableHeaders = [
    "Client Name",
    "Email",
    "City",
    "Mobile Number",
    "Active QR",
    "Action",
  ];

  const handleEmployeeChange = (employeeId) => {
    setSelectedEmployee(employeeId);
    setSelectedClientId("");
    setSelectedJobId("");
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleClientPerPageChange = (e) => {
    setClientPerPage(e);
    setCurrentPage(1);
  };

  const handleAction = (id) => {
    setShowDropdownAction(showDropdownAction === id ? null : id);
  };

  const getAlltimesheet = async () => {
    try {
      setLoading(true);
      // console.log("setSelectedEmployee", selectedEmployee);
      const filters = {
        // jobId: selectedEmployee ? selectedJobId : jobRoleId,
        userId: selectedEmployee,
        clientId: selectedClientId,
      };

      const response = await PostCall(
        `/getAllTimesheets?isWorkFromOffice=${isWorkFromOffice}&page=${currentPage}&limit=${clientPerPage}&search=${debouncedSearch}&startDate=${selectedStartDate}&endDate=${selectedEndDate}`,
        filters
      );
      if (response?.data?.status === 200) {
        setAlltimesheetList(response?.data.timesheets);
      } else {
        showToast(response?.data?.message, "error");
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching timesheets:", error);
      setLoading(false);
    }
  };

  const Getjobtitledata = async () => {
    try {
      let response;
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
          // setIsWorkFromOffice(jobTitles[0]?.isWorkFromOffice);
          getAlltimesheet();
          setOpenJobTitleModal(true);
        }
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handlePopupClose = (value) => {
    setOpenJobTitleModal(true);
    if (value) {
      setSelectedJobId("");
      // setIsWorkFromOffice(false);
      setSelectedClientId("");
      setSelectedEmployee("");
      setAlltimesheetList([]);
      // setEvents([]);
    }
  };

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

  const handleJobTitleSelect = (selectedTitle) => {
    setSelectedJobId(selectedTitle);
    // const selectedJob = JobTitledata.find((job) => job.jobId === selectedTitle);
    // if (selectedJob) {
    //   setIsWorkFromOffice(selectedJob.isWorkFromOffice);
    //   // console.log("setIsWorkFromOffice", selectedJob.isWorkFromOffice);
    // }
    setOpenJobTitleModal(true);
  };

  const GetClientdata = async () => {
    const payload = {
      jobId: selectedEmployee ? selectedJobId : jobRoleId,
      userId: selectedEmployee,
    };

    try {
      const response = await PostCall(`/getUsersAssignClients`, payload);

      if (response?.data?.status === 200) {
        const clientId = response.data.assignClients;
        // console.log("job title", clientId);
        setClientdata(clientId);

        if (clientId.length > 1) {
          setopenClietnSelectModal(false);
        } else {
          setSelectedClientId(clientId[0]?.clientId);
          console.log("selected client id", selectedClientId);
          setopenClietnSelectModal(true);
        }
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handlePopupCloseForclient = (value) => {
    setopenClietnSelectModal(true);
    if (value) {
      setSelectedClientId("");
      setSelectedJobId("");
      // setIsWorkFromOffice(false);
      setSelectedEmployee("");
      setAlltimesheetList([]);
      // setEvents([]);
    }
  };

  const handleClientSelect = (selectedTitle) => {
    setSelectedClientId(selectedTitle);
    setopenClietnSelectModal(true);
  };

  useEffect(() => {
    userRole !== "Employee" && fetchEmployeeList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  useEffect(() => {
    if (selectedEmployee) {
      Getjobtitledata();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmployee]);

  useEffect(() => {
    // const GetTimesheet =
    //   (selectedEmployee && selectedJobId && selectedClientId) ||
    //   (!selectedEmployee &&
    //     ((jobRoleId && jobRoleisworkFromOffice) ||
    //       (jobRoleId && !jobRoleisworkFromOffice && selectedClientId) ||
    //       (selectedJobId && !jobRoleisworkFromOffice && selectedClientId))) ||
    //   (selectedJobId && isWorkFromOffice);

    // if (GetTimesheet) {
    // console.log("timesheet api call");
    getAlltimesheet();
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedEmployee,
    selectedJobId,
    selectedClientId,
    jobRoleId,
    isWorkFromOffice,
    jobRoleisworkFromOffice,
  ]);

  useEffect(() => {
    const GetClientData =
      (selectedEmployee && selectedJobId && !isWorkFromOffice) ||
      (!selectedEmployee && jobRoleId && !jobRoleisworkFromOffice);

    if (GetClientData) {
      GetClientdata();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedEmployee,
    selectedJobId,
    jobRoleId,
    isWorkFromOffice,
    jobRoleisworkFromOffice,
  ]);

  // useEffect(() => {
  //   const transformedEvents = AlltimesheetList.flatMap((timesheet) => {
  //     const clockEvents = timesheet.clockinTime.map((clock) => ({
  //       title: `Clock-In: ${new Date(clock.clockIn).toLocaleTimeString()}`,
  //       start: clock.clockIn,
  //       end: clock.clockOut || undefined,
  //       color: clock.clockOut ? "#20c997" : "#dc3545",
  //       extendedProps: {
  //         description: `Clock In: ${new Date(
  //           clock.clockIn
  //         ).toLocaleTimeString()} - Clock Out: ${
  //           clock.clockOut
  //             ? new Date(clock.clockOut).toLocaleTimeString()
  //             : "N/A"
  //         }`,
  //       },
  //     }));

  //     const totalHoursEvent = {
  //       title: `${timesheet.totalHours} Total Hours`,
  //       start: timesheet.date,
  //       allDay: true,
  //       classNames: ["viewhour-event"],
  //       extendedProps: {
  //         description: `${timesheet.totalHours} Total Hours`,
  //       },
  //     };

  //     const OvertimeEvent = {
  //       title: `${timesheet.overTime} Overtime`,
  //       start: timesheet.date,
  //       allDay: true,
  //       classNames: ["viewhour-overtime"],
  //       extendedProps: {
  //         description: `${timesheet.overTime} Overtime`,
  //       },
  //     };
  //     // console.log("OvertimeEvent", OvertimeEvent);

  //     if (viewMode === "dayGridMonth") {
  //       return [totalHoursEvent, OvertimeEvent];
  //     }

  //     if (viewMode === "timeGridWeek" || "timeGridDay") {
  //       return [...clockEvents, OvertimeEvent, totalHoursEvent];
  //     }
  //     return [];
  //   });

  //   setEvents(transformedEvents);
  // }, [AlltimesheetList, viewMode]);

  return (
    <div className="View-hour-main">
      {/* {!openJobTitleModal && JobTitledata.length > 1 && (
        <JobTitleForm
          onClose={handlePopupClose}
          jobTitledata={JobTitledata}
          onJobTitleSelect={handleJobTitleSelect}
        />
      )}
      {!openClietnSelectModal && Clientdata.length > 1 && (
        <AssignClient
          onClose={handlePopupCloseForclient}
          Clientdata={Clientdata}
          onClientSelect={handleClientSelect}
        />
      )} */}
      <div className="viewhour-section">
        <h2>Working Hours</h2>
        <div className="indicate-color">
          {/* <p>
            <span className="color-box black-box"></span>Total Hour
          </p>
          <p>
            <span className="color-box green-box"></span>Overtime
          </p> */}
        </div>
      </div>
      {userRole !== "Employee" && (
        <div className="viewhour-employee-list">
          <Select
            className="View-hour-input-dropdown"
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
          {/* <FullCalendar
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              listPlugin,
              interactionPlugin,
            ]}
            initialView="dayGridMonth"
            // selectable={true}
            // select={handleSelect}
            headerToolbar={{
              left: "prev next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
            }}
            buttonText={{
              today: "Today",
              month: "Month",
              week: "Week",
              day: "Day",
              list: "List",
            }}
            // allDaySlot={false}
            events={events}
            height="75vh"
            viewDidMount={(viewInfo) => setViewMode(viewInfo.view.type)}
            eventDidMount={(info) => {
              tippy(info.el, {
                content: info.event.extendedProps.description,
                placement: "top",
                theme: "light-border",
                animation: "fade",
                delay: [100, 200],
              });
            }}
          /> */}
          <CommonTable
            headers={tableHeaders}
            data={AlltimesheetList?.map((timesheet) => ({
              _id: timesheet._id,
              Name: timesheet?.userName,
              Role: timesheet?.jobTitle,
              City: timesheet?.city,
              contactNumber: timesheet?.contactNumber,
              latestQRCode: timesheet?.latestQRCode,
              qrValue: timesheet?.qrValue,
            }))}
            actions={{
              actionsList: actions,
            }}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showPerPage={clientPerPage}
            onPerPageChange={handleClientPerPageChange}
            handleAction={handleAction}
            isPagination="true"
            isSearchQuery={true}
            searchQuery={searchQuery}
            totalData={totalClient}
          />
        </div>
      )}
    </div>
  );
};

export default Viewhours;
