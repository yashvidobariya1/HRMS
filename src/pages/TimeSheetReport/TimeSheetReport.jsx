import React, { useEffect, useState } from "react";
import "./TimeSheetReport.css";
import JobTitleForm from "../../SeparateCom/RoleSelect";
// import { useLocation } from "react-router";
import { GetCall, PostCall } from "../../ApiServices";
import { showToast } from "../../main/ToastManager";
import Loader from "../Helper/Loader";
// import TimesheetTable from "../../SeparateCom/TimesheetTable";
import moment from "moment";
import { GrDocumentDownload } from "react-icons/gr";
import CommonAddButton from "../../SeparateCom/CommonAddButton";
import { useSelector } from "react-redux";
import CommonTable from "../../SeparateCom/CommonTable";
// import { CropLandscapeOutlined } from "@mui/icons-material";
import { MenuItem, Select, TextField } from "@mui/material";
import AssignClient from "../../SeparateCom/AssignClient";
const TimeSheetReport = () => {
  // const location = useLocation();
  // const queryParams = new URLSearchParams(location.search);
  // const EmployeeId = queryParams.get("EmployeeId");
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(50);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    format: "",
  });
  const [errors, setErrors] = useState({});
  const [openJobTitleModal, setOpenJobTitleModal] = useState(false);
  const [timesheetReportList, setTimesheetReportList] = useState([]);
  const [JobTitledata, setJobTitledata] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("");
  const [openClietnSelectModal, setopenClietnSelectModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [Clientdata, setClientdata] = useState([]);
  const startDate = process.env.REACT_APP_START_DATE || "2025-01-01";
  const startYear = moment(startDate).year();
  const currentYear = moment().year();
  const currentMonth = moment().month() + 1;
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [employeeClockinDropwdown, setEmployeeClockinDropwdown] =
    useState(false);
  const [employeeClockoutDropwdown, setEmployeeClockoutDropwdown] =
    useState(false);
  const today = moment().format("YYYY-MM-DD");
  const [totalTimesheet, settotalTimesheet] = useState([]);
  const [clockInData, setClockInData] = useState({
    date: moment().format("YYYY-MM-DD"),
    startTime: moment().format("HH:mm"),
  });

  const [clockOutData, setClockOutData] = useState({
    date: moment().format("YYYY-MM-DD"),
    endTime: moment().format("HH:mm"),
  });

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const jobRoleId = useSelector(
    (state) => state.jobRoleSelect.jobRoleSelect.jobId
  );
  const companyId = useSelector((state) => state.companySelect.companySelect);
  const minDate = moment("2024-01-01").format("YYYY-MM-DD");
  const maxDate = moment().format("YYYY-MM-DD");
  const userRole = useSelector((state) => state.userInfo.userInfo.role);
  // const [selectedWeek, setSelectedWeek] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [appliedFilters, setAppliedFilters] = useState({
    year: currentYear,
    month: currentMonth,
    // week: "",
  });

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePerPageChange = (e) => {
    // setPerPage(parseInt(e.target.value, 10));
    setPerPage(e);
    setCurrentPage(1);
  };

  const handlePopupClose = () => {
    setOpenJobTitleModal(true);
  };

  const handleJobTitleSelect = (selectedTitle) => {
    setSelectedJobId(selectedTitle);
    setOpenJobTitleModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }
    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }
    if (!formData.format) {
      newErrors.format = "Format is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const downloadTimesheetReport = async () => {
    if (validate()) {
      const data = {
        ...formData,
        jobId: selectedJobId ? selectedJobId : jobRoleId,
        // userId: EmployeeId ? EmployeeId : "",
        userId: selectedEmployee,
      };
      try {
        setLoading(true);
        const response = await PostCall(`/downloadTimesheetReport`, data);
        const base64 =
          formData.format === "pdf"
            ? response?.data?.pdfBase64
            : response?.data?.excelbase64;
        // console.log("Base64 PDF:", base64);
        // console.log("response:", response);

        if (response?.data?.status === 200) {
          let fixedBase64 = base64?.replace(/-/g, "+")?.replace(/_/g, "/");

          while (fixedBase64?.length % 4 !== 0) {
            fixedBase64 += "=";
          }

          const binary = Uint8Array.from(atob(fixedBase64), (c) =>
            c.charCodeAt(0)
          );

          const blob = new Blob([binary], { type: response?.data?.mimeType });

          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = response?.data?.fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          showToast(response?.data?.message, "error");
        }
        setLoading(false);
      } catch (error) {
        console.log("Error while downloading timesheet report.", error);
        showToast("An error occurred while processing your request.", "error");
      }
    }
  };

  // const downloadTimesheetReport = async () => {
  //   try {
  //     const data = {
  //       ...formData,
  //       jobId: selectedJobId ? selectedJobId : jobRoleId,
  //       userId: EmployeeId ? EmployeeId : "",
  //     };
  //     const response = await axios.post(
  //       "http://localhost:5000/downloadTimesheetReport", // Change to your actual API endpoint
  //       data,
  //       { responseType: "blob" } // Ensure the response is treated as a file
  //     );
  //     console.log("response:", response);

  //     const fileExtension = formData.format === "pdf" ? "pdf" : "xlsx";
  //     const blob = new Blob([response.data], {
  //       type:
  //         formData.format === "pdf"
  //           ? "application/pdf"
  //           : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //     });

  //     const link = document.createElement("a");
  //     link.href = URL.createObjectURL(blob);
  //     link.download = `timesheet.${fileExtension}`;
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //   } catch (error) {
  //     console.error("Error downloading file:", error);
  //     alert("Failed to download file");
  //   }
  // };

  // const downloadTimesheetReport = async () => {
  //   const data = {
  //     ...formData,
  //     jobId: selectedJobId ? selectedJobId : jobRoleId,
  //     userId: EmployeeId ? EmployeeId : "",
  //   };
  //   if (validate()) {
  //     try {
  //       const response = await PostCall("/downloadTimesheetReport", data);

  //       const base64 =
  //         formData.format === "pdf"
  //           ? response?.data?.pdfBase64
  //           : response?.data?.excelbase64;
  //       console.log("Base64 PDF:", base64);
  //       console.log("response:", response);
  //       if (response?.data?.status === 200) {
  //         let fixedBase64 = base64?.replace(/-/g, "+")?.replace(/_/g, "/");

  //         while (fixedBase64?.length % 4 !== 0) {
  //           fixedBase64 += "=";
  //         }

  //         const binary = Uint8Array.from(atob(fixedBase64), (c) =>
  //           c.charCodeAt(0)
  //         );

  //         const blob = new Blob([binary], { type: response?.data?.mimeType });

  //         const link = document.createElement("a");
  //         link.href = URL.createObjectURL(blob);
  //         link.download = response?.data?.fileName;
  //         document.body.appendChild(link);
  //         link.click();
  //         document.body.removeChild(link);
  //       }
  //     } catch (error) {
  //       console.error("Error downloading file:", error);
  //       alert("Failed to download file");
  //     }
  //   }
  // };

  const GetTimesheetReport = async () => {
    try {
      setLoading(true);
      const filters = {
        jobId: selectedEmployee ? selectedJobId : jobRoleId,
        // userId: EmployeeId,
        userId: selectedEmployee,
      };

      // console.log("filter", filters);

      const { year, month } = appliedFilters;

      const response = await PostCall(
        `/getTimesheetReport?page=${currentPage}&limit=${perPage}&year=${year}&month=${month}&search=${debouncedSearch}`,
        filters
      );

      if (response?.data?.status === 200) {
        setTimesheetReportList(response?.data?.report);
        settotalTimesheet(response.data.totalReports);
        setTotalPages(response?.data?.totalPages);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
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
          setOpenJobTitleModal(true);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const applyFilters = () => {
    setAppliedFilters({
      year: selectedYear,
      month: selectedMonth,
      // week: selectedWeek,
    });
    setCurrentPage(1);
  };

  const months = moment
    .months()
    .map((month, index) => ({
      name: moment().month(index).format("MMM"),
      value: index + 1,
    }))
    .filter(
      (month) => selectedYear < currentYear || month.value <= currentMonth
    );

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // const weeks = Array.from({ length: 5 }, (_, i) => i + 1);

  const handleClockInDropdown = () => {
    setEmployeeClockinDropwdown((prev) => !prev);
  };

  const handleClockOutDropdown = () => {
    setEmployeeClockoutDropwdown((prev) => !prev);
  };

  const handleClockInChange = (e) => {
    const { name, value } = e.target;
    setClockInData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // console.log("value", clockInData);
  };

  const handleClockOutChange = (e) => {
    const { name, value } = e.target;
    setClockOutData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // console.log("value", clockOutData);
  };

  const handleClockInSubmit = async () => {
    const clockindata = {
      ...clockInData,
      userId: selectedEmployee,
      jobId: selectedJobId || jobRoleId,
      clientId: selectedClientId,
    };
    console.log("clockindata", clockindata);
    try {
      const response = await PostCall(`/clockInForEmployee`, clockindata);
      if (response?.data?.status === 200) {
        showToast(response?.data?.message, "success");
        setEmployeeClockinDropwdown(false);
        GetTimesheetReport();
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (error) {
      console.error("Error fetching employee clockin:", error);
      showToast("Clock-in error", "error");
    }
  };

  const handleClockOutSubmit = async () => {
    const clockoutdata = {
      ...clockOutData,
      userId: selectedEmployee,
      jobId: selectedJobId || jobRoleId,
      clientId: selectedClientId,
    };
    // console.log("clockoutdata", clockoutdata);
    try {
      const response = await PostCall(`/clockOutForEmployee`, clockoutdata);
      if (response?.data?.status === 200) {
        showToast(response?.data?.message, "success");
        setEmployeeClockoutDropwdown(false);
        GetTimesheetReport();
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (err) {
      console.error("Clock-out error:", err);
      showToast("Clock-out error", "error");
    }
  };

  const handleClose = () => {
    setEmployeeClockinDropwdown(false);
    setEmployeeClockoutDropwdown(false);
  };

  // const handleEmployeeChange = (e) => {
  //   console.log("template", e.target.value);
  //   const selected = employeeList.find(
  //     (template) => template._id === e.target.value
  //   );
  //   console.log("selected", selected);
  //   setTemplate(selected);
  //   setDocxUrl(selected?.templateUrl);
  //   setUserData(selected?.userData);
  //   fetchData(selected);
  // };

  useEffect(() => {
    if (selectedEmployee) {
      Getjobtitledata();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmployee]);

  useEffect(() => {
    if (selectedEmployee) {
      if (selectedJobId) {
        GetTimesheetReport();
      }
    } else {
      GetTimesheetReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedJobId,
    selectedEmployee,
    currentPage,
    perPage,
    jobRoleId,
    appliedFilters,
    debouncedSearch,
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

  const GetClientdata = async () => {
    try {
      const response = await PostCall(`/getUsersAssignClients`, {
        jobId: selectedJobId,
      });

      if (response?.data?.status === 200) {
        const clientId = response.data.assignClients;
        console.log("job title", clientId);
        setClientdata(clientId);

        if (clientId.length > 1) {
          setopenClietnSelectModal(false);
        } else {
          setSelectedClientId(clientId[0]?.clientId);
          setopenClietnSelectModal(true);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handlePopupCloseForclient = () => {
    setopenClietnSelectModal(true);
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
    if (selectedJobId) {
      GetClientdata();
    }
  }, [selectedJobId, jobRoleId]);

  return (
    <div className="timesheet-list-container">
      {!openJobTitleModal && JobTitledata.length > 1 && (
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
      )}
      <div className="timesheet-flex">
        <div className="timesheet-title">
          <h1>Time Sheet Report</h1>
          <div className="timesheet-report-download-container">
            <div className="timesheet-input-container">
              <label className="label">Start Date*</label>
              <input
                type="date"
                name="startDate"
                className="timesheet-input"
                value={formData?.startDate}
                onChange={handleChange}
                min={minDate}
                max={maxDate}
              />
              {errors?.startDate && (
                <p className="error-text">{errors?.startDate}</p>
              )}
            </div>
            <div className="timesheet-input-container">
              <label className="label">End Date*</label>
              <input
                type="date"
                name="endDate"
                className="timesheet-input"
                value={formData?.endDate}
                onChange={handleChange}
                min={minDate}
                max={maxDate}
              />
              {errors?.endDate && (
                <p className="error-text">{errors?.endDate}</p>
              )}
            </div>
            <div className="timesheet-input-container">
              <label className="label">Format*</label>
              {/* <select
                name="format"
                className="timesheet-input"
                value={formData?.format}
                onChange={handleChange}
              >
                <option value="" disabled>
                  Select format
                </option>
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
              </select> */}
              <Select
                name="format"
                className="timesheet-input-dropdown"
                value={formData?.format}
                onChange={handleChange}
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
                <MenuItem value="" disabled>
                  Select format
                </MenuItem>
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="excel">Excel</MenuItem>
              </Select>
              {errors?.format && <p className="error-text">{errors?.format}</p>}
            </div>
            <button onClick={downloadTimesheetReport}>
              <GrDocumentDownload />
            </button>
          </div>
        </div>
      </div>

      <div className="timesheet-report-filter-container">
        <div className="timesheet-report-filter">
          <div className="selection-wrapper">
            {/* <label>Year:</label> */}
            {/* <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
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
              className="timesheet-input-dropdown"
              value={selectedYear}
              displayEmpty
              onChange={(e) => setSelectedYear(e.target.value)}
              MenuProps={{
                PaperProps: {
                  style: {
                    width: 80,
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
            {/* <label>Month:</label> */}
            {/* <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="All">All</option>
              {months?.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.name}
                </option>
              ))}
            </select> */}
            <Select
              className="timesheet-input-dropdown"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <MenuItem value="All">All</MenuItem>
              {months?.map((month) => (
                <MenuItem key={month.value} value={month.value}>
                  {month.name}
                </MenuItem>
              ))}
            </Select>
          </div>

          {/* <div className="selection-wrapper">
          <label>Week:</label>
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
          >
            <option value="All">All</option>
            {weeks.map((week) => (
              <option key={week} value={week}>
                Week {week}
              </option>
            ))}
          </select>
        </div> */}

          <CommonAddButton
            label={"Filter"}
            // icon={MdRateReview}
            onClick={applyFilters}
          />
        </div>

        {userRole !== "Employee" && (
          // <select
          //   className="timeshet-employee-selection"
          //   value={selectedEmployee}
          //   onChange={(e) => setSelectedEmployee(e.target.value)}
          // >
          //   <option value="" disabled>
          //     Select Employee
          //   </option>
          //   {employeeList?.map((employee) => (
          //     <option key={employee._id} value={employee._id}>
          //       {employee.userName}
          //     </option>
          //   ))}
          // </select>

          <Select
            className="timesheet-input-dropdown"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
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
        )}
      </div>

      <div className="timesheetreport-searchbar-clockin">
        <TextField
          label="Search Timesheet"
          variant="outlined"
          size="small"
          value={searchQuery}
          className="common-searchbar"
          onChange={handleSearchChange}
        />
        {userRole !== "Employee" ? (
          <div className="timesheet-button-container">
            <button
              onClick={handleClockInDropdown}
              className="timesheet-clock-in-btn"
            >
              Clock In
            </button>
            <button
              onClick={handleClockOutDropdown}
              className="timesheet-clock-out-btn"
            >
              Clock Out
            </button>
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className="loader-wrapper">
          <Loader />
        </div>
      ) : (
        <>
          <CommonTable
            headers={[
              "Date",
              "Timesheet Status",
              "Timing",
              "Total Hours",
              "OverTime",
            ]}
            data={timesheetReportList.map((timesheet) => {
              const timesheetData = timesheet.data?.timesheetData;
              const holidayData = timesheet.data?.holidayData;
              const leaveData = timesheet.data?.leaveData;
              const clockinDetails = timesheetData?.clockinTime;
              const totalTiming = clockinDetails?.length
                ? clockinDetails.map((entry) => entry.totalTiming)
                : "";
              const clockIn = clockinDetails?.length
                ? clockinDetails.map((entry) => entry.clockIn)
                : "";
              const clockOut = clockinDetails?.length
                ? clockinDetails.map((entry) => entry.clockOut)
                : "";
              const Holidayoccsion = holidayData?.occasion || "";

              return {
                _id: timesheet._id,
                timesheetdate: timesheet.date,
                timesheetstatus: timesheet.status,
                totalTiming,
                Holidayoccsion,
                leaveReason: leaveData ? leaveData.reasonOfLeave : "",
                clockIn,
                clockOut,
                leave: timesheet.leave,
                holiday: timesheet.holiday,
                absent: timesheet.absent,
                totalHours: timesheetData?.totalHours || "",
                overTime: timesheetData?.overTime || "",
              };
            })}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showPerPage={perPage}
            onPerPageChange={handlePerPageChange}
            isPagination="true"
            searchQuery={searchQuery}
            isSearchQuery={true}
            totalData={totalTimesheet}
          />

          {/* <TimesheetTable
            headers={["Date", "Status", "Timing", "Total Hours", "OverTime"]}
            timesheetReportList={timesheetReportList}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showPerPage={perPage}
            onPerPageChange={handlePerPageChange}
        /> */}

          {employeeClockinDropwdown && (
            <div className="clock-in-form">
              <div className="clockin-model">
                <h1>Employee Clock In</h1>
                <TextField
                  type="date"
                  label="Date"
                  name="date"
                  value={clockInData.date}
                  onChange={handleClockInChange}
                  sx={{ marginBottom: 2 }}
                  inputProps={{ max: today }}
                />
                <TextField
                  type="time"
                  label="Start Time"
                  name="startTime"
                  value={clockInData.startTime}
                  onChange={handleClockInChange}
                  sx={{ marginBottom: 2 }}
                />
                <div className="clockin-out-action">
                  <button className="submit-btn" onClick={handleClockInSubmit}>
                    Submit
                  </button>
                  <button className="submit-btn" onClick={handleClose}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {employeeClockoutDropwdown && (
            <div className="clock-in-form">
              <div className="clockin-model">
                <h1>Employee Clock Out </h1>
                <TextField
                  type="date"
                  label="Date"
                  name="date"
                  value={clockOutData.date}
                  onChange={handleClockOutChange}
                  sx={{ marginBottom: 2 }}
                  inputProps={{ max: today }}
                />
                <TextField
                  type="time"
                  label="End Time"
                  name="endTime"
                  value={clockOutData.endTime}
                  onChange={handleClockOutChange}
                  sx={{ marginBottom: 2 }}
                />
                <div className="clockin-out-action">
                  <button className="submit-btn" onClick={handleClockOutSubmit}>
                    Submit
                  </button>
                  <button className="submit-btn" onClick={handleClose}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TimeSheetReport;
