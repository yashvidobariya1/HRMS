// =========old code===================
// import React, { useState, useEffect } from "react";
// import { Calendar, momentLocalizer } from "react-big-calendar";
// import moment from "moment";
// import "react-big-calendar/lib/css/react-big-calendar.css";
// import "./Holidays.css";
// import { GetCall } from "../../useApiServices";
// import Loader from "../Helper/Loader";
// import CommonAddButton from "../../SeparateCom/CommonAddButton";
// import { MdRateReview } from "react-icons/md";
// import { useNavigate, useParams } from "react-router";
// import { useSelector } from "react-redux";
// import { showToast } from "../../main/ToastManager";

// const Holidays = () => {
//   const Navigate = useNavigate();
//   const localizer = momentLocalizer(moment);
//   const [AllholidayList, setAllholidayList] = useState([]);
//   const [loading, setLoading] = useState(false);
//   // const [calendarHeight, setCalendarHeight] = useState(700);
//   const [view, setView] = useState("month");
//   const [selectedYear, setSelectedYear] = useState(moment().year());
//   const [selectedMonth, setSelectedMonth] = useState(moment().month());
//   const startDate = process.env.REACT_APP_START_DATE || "2025-01-01";
//   const startYear = moment(startDate).year();
//   const currentYear = moment().year();
//   const allowedYears = Array.from(
//     { length: currentYear - startYear + 1 },
//     (_, i) => startYear + i
//   );
//   const userRole = useSelector((state) => state.userInfo.userInfo.role);
//   const { id } = useParams();
//   // const userRoleLocationid = useSelector((state) => state.userInfo);
//   // console.group("userRoleLocationid", userRoleLocationid);

//   const getAllHoliday = async () => {
//     try {
//       setLoading(true);
//       let response;
//       if (id) {
//         response = await GetCall(
//           `/getAllHolidays?locationId=${id}&year=${selectedYear}`
//         );
//       } else {
//         response = await GetCall(`/getAllHolidays?year=${selectedYear}`);
//       }
//       if (response?.data?.status === 200) {
//         setAllholidayList(response?.data.holidays);
//         // console.log("response", response?.data.holidays);
//       } else {
//         showToast(response?.data?.message, "error");
//       }
//       setLoading(false);
//     } catch (error) {
//       console.error("Error fetching timesheets:", error);
//     }
//   };

//   const customEventRenderer = ({ event }) => {
//     return (
//       <>
//         <div className="custom-event">
//           <span>{event.title}</span>
//         </div>
//       </>
//     );
//   };

//   const handleYearChange = (event) => {
//     setSelectedYear(parseInt(event.target.value, 10));
//     // console.log("select year", selectedYear);
//   };

//   const handleNavigate = (newDate) => {
//     setSelectedMonth(newDate.getMonth());
//     setSelectedYear(newDate.getFullYear());
//   };

//   const CustomToolbar = () => {
//     const isPrevDisabled = selectedYear === startYear && selectedMonth === 0;
//     const isNextDisabled = selectedYear === currentYear && selectedMonth === 11;
//     return (
//       <div className="rbc-toolbar holiday-custome-div">
//         <span className="custom-action">
//           <button
//             onClick={() => handleMonthNavigation("PREV")}
//             disabled={isPrevDisabled}
//             className={`${isPrevDisabled ? "disabled" : ""}`}
//           >
//             Back
//           </button>
//         </span>
//         <span className="rbc-toolbar-label">
//           {moment({ year: selectedYear, month: selectedMonth }).format(
//             "MMMM YYYY"
//           )}
//         </span>
//         <span className="custom-action">
//           <button
//             onClick={() => handleMonthNavigation("NEXT")}
//             disabled={isNextDisabled}
//             className={`${isNextDisabled ? "disabled" : ""}`}
//           >
//             Next
//           </button>
//         </span>
//       </div>
//     );
//   };

//   const handleMonthNavigation = (direction) => {
//     setSelectedMonth((prevMonth) => {
//       let newMonth = direction === "NEXT" ? prevMonth + 1 : prevMonth - 1;

//       if (newMonth > 11) {
//         const nextYear = selectedYear + 1;
//         if (allowedYears.includes(nextYear)) {
//           setSelectedYear(nextYear);
//           return 0;
//         } else {
//           return prevMonth;
//         }
//       }

//       if (newMonth < 0) {
//         const prevYear = selectedYear - 1;
//         if (allowedYears.includes(prevYear)) {
//           setSelectedYear(prevYear);
//           return 11;
//         } else {
//           return prevMonth;
//         }
//       }

//       return newMonth;
//     });
//   };

//   const handleViewHoliday = () => {
//     if (userRole === "Superadmin") {
//       Navigate(`/location/holidays/holidaylist/${id}`);
//     } else {
//       Navigate(`/holidays/holidaylist`);
//     }
//   };

//   useEffect(() => {
//     getAllHoliday();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedYear]);

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
//     <div className="View-holiday-main">
//       <div className="holiday-section">
//         <div className="holiday-select-year">
//           {(userRole === "Superadmin" || userRole === "Administrator") && (
//             <>
//               <select
//                 id="year-select"
//                 value={selectedYear}
//                 onChange={handleYearChange}
//                 className="holiday-Year-select"
//               >
//                 {allowedYears.map((year) => (
//                   <option key={year} value={year}>
//                     {year}
//                   </option>
//                 ))}
//               </select>
//             </>
//           )}
//         </div>
//         {/* <div className="holidaylist-calender">
//           <h1>Holiday Calender</h1>
//         </div> */}
//         <div className="indicate-color-holiday">
//           <CommonAddButton
//             label={"View Holiday"}
//             icon={MdRateReview}
//             onClick={handleViewHoliday}
//           />
//         </div>
//       </div>

//       {loading ? (
//         <div className="loader-wrapper">
//           <Loader />
//         </div>
//       ) : (
//         <Calendar
//           className="Calender-container-holiday"
//           localizer={localizer}
//           date={new Date(selectedYear, selectedMonth, 1)}
//           // const date = moment([selectedYear, selectedMonth, 1]);

//           onNavigate={handleNavigate}
//           events={AllholidayList.map((holiday) => ({
//             title: holiday.occasion,
//             start: moment(holiday.date),
//             end: moment(holiday.date),
//             allDay: true,
//             tooltip: `${holiday.occasion}`,
//           }))}
//           startAccessor="start"
//           endAccessor="end"
//           views={["month"]}
//           tooltipAccessor="tooltip"
//           components={{
//             event: customEventRenderer,
//             toolbar: CustomToolbar,
//           }}
//           // onView={(newView) => setView(newView)}
//         />
//       )}
//     </div>
//   );
// };

// export default Holidays;

// =================fullcalender=====================

import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import useApiServices from "../../useApiServices";
import "./Holidays.css";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import moment from "moment";
import { showToast } from "../../main/ToastManager";
import DeleteConfirmation from "../../main/DeleteConfirmation";
import CommonAddButton from "../../SeparateCom/CommonAddButton";
import Loader from "../Helper/Loader";
import { MenuItem, Select } from "@mui/material";

const Holidays = () => {
  const { GetCall, PostCall } = useApiServices();
  const [events, setEvents] = useState([]);
  const [AllholidayList, setAllholidayList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(moment().year());
  const [errors, setErrors] = useState({});
  const currentYearEnd = moment().endOf("year").format("YYYY-MM-DD");
  const [showConfirm, setShowConfirm] = useState(false);
  const [holidayId, setholidayId] = useState("");
  // const startDate = "2022-01-01";
  const startDate = process.env.REACT_APP_START_DATE || "2025-01-01";
  const [selectedMonth, setSelectedMonth] = useState(moment().month() + 1);
  const startYear = moment(startDate).year();
  const currentYear = moment().year();
  const calendarRef = useRef(null);
  const allowedYears = Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => startYear + i
  );
  const userRole = useSelector((state) => state.userInfo.userInfo.role);
  const companyId = useSelector((state) => state.companySelect.companySelect);
  const Navigate = useNavigate();

  const [formData, setFormData] = useState({
    date: "",
    occasion: "",
    companyId,
  });

  const getAllHoliday = async () => {
    try {
      setLoading(true);
      const response = await GetCall(
        `/getAllHolidays?companyId=${companyId}&year=${selectedYear}`
      );
      if (response?.data?.status === 200) {
        setAllholidayList(response?.data.holidays);
      } else if (response?.data?.status === 400) {
        showToast(response?.data?.message, "warning");
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (error) {
      console.error("Error fetching holidays:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (info) => {
    const clickedDate = moment(info.dateStr).format("YYYY-MM-DD");
    const todayDate = moment().format("YYYY-MM-DD");

    if (moment(clickedDate).isBefore(todayDate)) {
      showToast("Cannot select past dates", "error");
      return;
    }

    if (clickedDate === todayDate) {
      showToast("Cannot select today's date", "error");
      return;
    }

    const existingEvent = AllholidayList.find(
      (holiday) => moment(holiday.date).format("YYYY-MM-DD") === clickedDate
    );

    if (existingEvent) {
      setFormData({
        _id: existingEvent._id,
        companyId: existingEvent.companyId,
        date: existingEvent.date,
        occasion: existingEvent.occasion,
      });
    } else {
      setFormData({
        _id: "",
        date: clickedDate,
        occasion: "",
        companyId,
      });
    }

    setIsPopupOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.occasion) newErrors.occasion = "Occasion is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      let response;
      // console.log("formData", formData);
      if (formData._id) {
        response = await PostCall(`/updateHoliday/${formData._id}`, formData);
      } else {
        response = await PostCall("/addHoliday", formData);
      }
      if (response?.data?.status === 200) {
        showToast(response?.data?.message, "success");
        // console.log("formdata", formData);

        setAllholidayList((prev) => {
          if (formData._id) {
            return prev.map((holiday) =>
              holiday._id === formData._id
                ? { ...holiday, ...formData }
                : holiday
            );
          } else {
            return [...prev, { ...formData, _id: response?.data?.holidayId }];
          }
        });
        await getAllHoliday();
        setIsPopupOpen(false);
        setFormData({ date: "", occasion: "" });
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("An error occurred while fetching holidays", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (event) => {
    // console.log("event", event.target.value);
    const newYear = parseInt(event.target.value, 10);
    setSelectedYear(newYear);
    // console.log("newYear", newYear);
  };

  const confirmDelete = async (id) => {
    // console.log("id", id);
    try {
      setLoading(true);
      const response = await PostCall(`/deleteHoliday/${id}`);
      if (response?.data?.status === 200) {
        showToast(response?.data?.message, "success");
        setIsPopupOpen(false);
        setShowConfirm(false);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
      setIsPopupOpen(false);
    } catch (error) {
      console.log("error", error);
    }
    getAllHoliday();
  };

  const handleDeleteholiday = async (id) => {
    setholidayId(id);
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

  const handleViewHoliday = () => {
    Navigate(`/holidays/holidaylist`);
  };

  const handleTodayClick = () => {
    const now = moment();
    const currentYear = now.year();
    const currentMonth = now.month() + 1;
    setSelectedYear(currentYear);
    setSelectedMonth(currentMonth);

    if (calendarRef.current) {
      calendarRef.current.getApi().today();
      setSelectedYear(currentYear);
    }
  };

  useEffect(() => {
    getAllHoliday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, companyId]);

  useEffect(() => {
    const transformedEvents = AllholidayList.map((holiday) => ({
      title: holiday.occasion,
      start: holiday.date,
      allDay: true,
      classNames: ["holiday-event"],
      extendedProps: {
        description: ` ${holiday.occasion}`,
      },
    }));

    setEvents(transformedEvents);
  }, [AllholidayList]);

  return (
    <div className="View-holiday-main">
      {(userRole === "Superadmin" || userRole === "Administrator") && (
        <div className="View-holiday-list">
          <div className="Holiday-select-dopdown">
            {/* <select
              id="year-select"
              value={selectedYear}
              onChange={handleYearChange}
              className="holiday-Year-select"
            >
              {allowedYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select> */}
            <Select
              id="year-select"
              value={selectedYear}
              onChange={handleYearChange}
              className="holiday-year-dropdown"
              displayEmpty
              MenuProps={{
                PaperProps: {
                  style: {
                    width: 100,
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxHeight: 200,
                  },
                },
              }}
            >
              <MenuItem value="" disabled>
                Select year
              </MenuItem>
              {allowedYears.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </div>

          <div className="indicate-color-holiday">
            <CommonAddButton
              label={"View Holiday"}
              //  icon={MdRateReview}
              onClick={handleViewHoliday}
            />
          </div>
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
            ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialDate={moment(
              `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`
            ).toDate()}
            initialView="dayGridMonth"
            dateClick={(info) => {
              if (userRole === "Superadmin" || userRole === "Administrator") {
                handleDateClick(info);
              }
              // else {
              //   alert("You do not have permission to select a date.");
              // }
            }}
            headerToolbar={{
              right: "next today",
              center: "title",
              left: "prev",
            }}
            validRange={{
              start: startDate,
              end: currentYearEnd,
            }}
            customButtons={{
              today: {
                text: "Today",
                click: handleTodayClick,
              },
            }}
            buttonText={{
              today: "Today",
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
              // const currentYear = info.view.currentStart.getFullYear();
              setSelectedYear(selectedYear);
              setSelectedMonth(selectedMonth);
            }}
          />
        </div>
      )}
      {isPopupOpen && (
        <div className="popup-overlay">
          <div className="popup-box">
            <button className="close-button" onClick={handlePopupClose}>
              ×
            </button>

            <h3>{formData._id ? "Update" : "Add"} Holiday</h3>
            <div className="Addholiday-input-container">
              <label className="label">Date*</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                className="Addholiday-input"
                onChange={handleChange}
              />
              {errors.date && <div className="error-text">{errors.date}</div>}
            </div>
            <div className="Addholiday-input-container">
              <label className="label">Occasion*</label>
              <textarea
                name="occasion"
                value={formData.occasion}
                className="Addholiday-input"
                onChange={handleChange}
              />
              {errors.occasion && (
                <div className="error-text">{errors.occasion}</div>
              )}
            </div>

            <button
              onClick={handleAddHoliday}
              className="holiday-modal-buttons"
            >
              {formData._id ? "Update" : "Add"}
            </button>

            {formData._id && (
              <button
                onClick={() => handleDeleteholiday(formData._id)}
                className="holiday-modal-buttons"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )}
      {showConfirm && (
        <DeleteConfirmation
          confirmation={`Are you sure you want to delete holiday on <b>${formData.occasion}</b>?`}
          onConfirm={() => confirmDelete(holidayId)}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
};

export default Holidays;
