import React, { useEffect, useMemo, useRef, useState } from "react";
import { BiNotepad } from "react-icons/bi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { FaUsers, FaUserTie, FaUmbrellaBeach } from "react-icons/fa";
import { MdAddBusiness, MdOutlineNoteAlt } from "react-icons/md";
import { RiContractFill } from "react-icons/ri";
import { FaLocationDot, FaUserClock } from "react-icons/fa6";
import { HiMiniArrowLeftStartOnRectangle } from "react-icons/hi2";
import useApiServices from "../../useApiServices";
import { showToast } from "../../main/ToastManager";
import { IoIosArrowRoundUp, IoIosArrowRoundDown } from "react-icons/io";
import moment from "moment";
import "./Dashboard.css";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { CiSquareQuestion } from "react-icons/ci";
import Loader from "../Helper/Loader";
import { renderAsync } from "docx-preview";
import SignatureCanvas from "react-signature-canvas";
import htmlDocx from "html-docx-js/dist/html-docx";
import CommonAddButton from "../../SeparateCom/CommonAddButton";
import { setNotificationCount } from "../../store/notificationCountSlice";
import { useDispatch } from "react-redux";
import {
  Select,
  MenuItem,
  ListSubheader,
  TextField,
  Paper,
  TableContainer,
  TableHead,
  TableRow,
  Table,
  TableCell,
  TableBody,
  TablePagination,
  TableFooter,
} from "@mui/material";
import { BsHourglassSplit } from "react-icons/bs";
import CommonTable from "../../SeparateCom/CommonTable";

const Dashboard = () => {
  const { PostCall, GetCall } = useApiServices();
  const pdfRef = useRef(null);
  const containerRef = useRef(null);
  const signatureRef = useRef(null);
  const navigate = useNavigate();
  const [DashboardData, setDashboardData] = useState([]);
  const [AllholidayList, setAllholidayList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [calenderloading, setcalenderloading] = useState(false);
  const [selectedLocationName, setSelectedLocationName] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [selectedYear, setSelectedYear] = useState(moment().year());
  // const [selectedMonth, setSelectedMonth] = useState(moment().month() + 1);
  const currentYear = moment().year();
  // const currentYearEnd = moment().endOf("year").format("YYYY-MM-DD");
  // const currentYearEnd = "2027-01-01";
  // const [events, setEvents] = useState([]);
  const [locationList, setLocationList] = useState([]);
  // const [companyList, setcompanyList] = useState([]);
  // const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  // const selectedCompanyId = useSelector(
  //   (state) => state.companySelect.companySelect
  // );
  const [timeSheetData, setTimeSheetData] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [GraphData, setGraphData] = useState([]);
  const [templateList, setTemplateList] = useState([]);
  const [template, setTemplate] = useState({});
  const [isSignatureRequired, setIsSignatureRequired] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [checked, setChecked] = useState(false);
  // const [AvailableLeave, setAvailableLeave] = useState([]);
  // const [currentMonth, setCurrentMonth] = useState("");
  const user = useSelector((state) => state.userInfo.userInfo);
  const [showPopup, setShowPopup] = useState(true);
  const [error, setError] = useState(null);
  const [docxUrl, setDocxUrl] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isSignatureSaved, setIsSignatureSaved] = useState(false);
  // const [selectedMonth, setSelectedMonth] = useState(moment().month());
  const jobRoleId = useSelector(
    (state) => state.jobRoleSelect?.jobRoleSelect?.jobId
  );
  const companyId = useSelector((state) => state.companySelect.companySelect);
  const userRole = useSelector((state) => state.userInfo.userInfo.role);
  const dispatch = useDispatch();
  const startDate = process.env.REACT_APP_START_DATE || "2022-01-01";
  // const startDate = "2022-01-01";
  const startYear = moment(startDate).year();
  const calendarRef = useRef(null);
  const allowedYears = Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => startYear + i
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [holidayPerPage, setholidayPerPage] = useState(10);
  // const [totalPages, setTotalPages] = useState(0);
  const [totalHoliday, setTotalHoliday] = useState(0);

  const filteredLocationList = useMemo(() => {
    return locationList.filter((loc) =>
      loc?.locationName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, locationList]);

  const iconMap = {
    totalEmployees: <FaUsers />,
    totalCompanies: <MdAddBusiness />,
    totalClients: <FaUserTie />,
    totalContracts: <RiContractFill />,
    totalLocations: <FaLocationDot />,
    totalTemplates: <BiNotepad />,
    totalActiveUsers: <FaUserClock />,
    totalLeaveRequests: <HiMiniArrowLeftStartOnRectangle />,
    totalPendingLR: <MdOutlineNoteAlt />,
    totalHolidays: <FaUmbrellaBeach />,
    totalOwnLeaveRequests: <HiMiniArrowLeftStartOnRectangle />,
    absentInCurrentMonth: <FaUserTie />,
    currentMonthTotalOwnPendingLR: <CiSquareQuestion />,
  };

  const routeMap = {
    totalEmployees: "/employees",
    totalCompanies: "/company",
    totalClients: "/clients",
    totalContracts: "/employmentcontract",
    totalLocations: "/location",
    totalTemplates: "/templates",
    totalActiveUsers: "/employees",
    totalLeaveRequests:
      userRole === "Superadmin"
        ? "/leavesrequest"
        : `/leaves/leavesrequest`,
    totalPendingLR:
      userRole === "Superadmin"
        ? "/leavesrequest"
        : `/leaves/leavesrequest`,
    totalHolidays: "/holidays",
    totalOwnLeaveRequests: "/leaves",
    absentInCurrentMonth: "/timesheetreport",
    currentMonthTotalOwnPendingLR: "/leaves",
  };

  const dashboardgrowthItems = [
    {
      title: "Active User Growth",
      value: DashboardData.activeUsersGrowth,
      growth: DashboardData.currentMonthTotalActiveUsers,
    },
    {
      title: "Client Growth",
      value: DashboardData.clientGrowth,
      growth: DashboardData.currentYearTotalClients,
    },
    {
      title: "Company Growth",
      value: DashboardData.companyGrowth,
      growth: DashboardData.currentYearTotalCompanies,
    },
    {
      title: "Contract Growth",
      value: DashboardData.contractGrowth,
      growth: DashboardData.currentMonthTotalContracts,
    },
    {
      title: "Employee Growth",
      value: DashboardData.employeeGrowth,
      growth: DashboardData.currentMonthTotalEmployees,
    },
    {
      title: "Template Growth",
      value: DashboardData.templateGrowth,
      growth: DashboardData.currentMonthTotalTemplates,
    },
    {
      title: "Location Growth",
      value: DashboardData.locationGrowth,
      growth: DashboardData.currentMonthTotalLocations,
    },
    {
      title: "Leave Request Growth",
      value: DashboardData.totalOwnLeaveRequests,
      growth: DashboardData.currentMonthTotalOwnLeaveRequests,
    },
    {
      title: "Total Holidays",
      value: DashboardData.holidayGrowth,
      growth: DashboardData.currentMonthTotalHolidays,
    },
    {
      title: "Total Active Users",
      value: DashboardData.totalActiveUsers,
      growth: DashboardData.currentMonthTotalActiveUsers,
    },
    {
      title: "Total Active Users",
      value: DashboardData.totalActiveUsers,
      growth: DashboardData.currentMonthTotalActiveUsers,
    },
    {
      title: "Total Own Leave Requests",
      value: DashboardData.totalOwnLeaveRequests,
      growth: DashboardData.currentMonthTotalOwnLeaveRequests,
    },
  ];

  const dashboardItems = [
    { label: "Total Employees", APIvalue: "totalEmployees" },
    { label: "Total Companies", APIvalue: "totalCompanies" },
    { label: "Total Clients", APIvalue: "totalClients" },
    { label: "Total Contracts", APIvalue: "totalContracts" },
    { label: "Total Locations", APIvalue: "totalLocations" },
    { label: "Total Templates", APIvalue: "totalTemplates" },
    { label: "Total Active Users", APIvalue: "totalActiveUsers" },
    { label: "Total Leave Requests", APIvalue: "totalLeaveRequests" },
    { label: "Total Pending Leave Requests", APIvalue: "totalPendingLR" },
    { label: "Total Holidays", APIvalue: "totalHolidays" },
    { label: "Total Own Leave Request", APIvalue: "totalOwnLeaveRequests" },
    {
      label: "Total Own Pending Leave Request",
      APIvalue: "currentMonthTotalOwnPendingLR",
    },
    {
      label: "Total absent In Current Month",
      APIvalue: "absentInCurrentMonth",
    },
  ];

  // const employeeData = [
  //   { type: "Fulltime", percentage: 40, count: 112 },
  //   { type: "Contract", percentage: 20, count: 112 },
  //   { type: "Probation", percentage: 22, count: 12 },
  //   { type: "WFH", percentage: 20, count: 4 },
  // ];

  const saveSignature = () => {
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      showToast("Please add a signature before saving", "error");
      return;
    }

    const dataURL = signatureRef.current.toDataURL("image/png");
    setIsSignatureSaved(true);

    const previewContainer = containerRef.current;
    if (!previewContainer) {
      console.error("Preview container not found!");
      return;
    }

    const paragraphs = Array.from(previewContainer.getElementsByTagName("p"));

    const signatureParagraph = paragraphs.find((p) =>
      p.innerText.includes("SIGNATURE")
    );

    if (signatureParagraph) {
      let existingSignatureSpan = signatureParagraph.querySelector("span");

      if (existingSignatureSpan) {
        // If a signature span exists, replace its content
        existingSignatureSpan.innerHTML = `
                  <img src="${dataURL}" style="width:100px; height:30px; padding-left: 15px; display:inline;" />
              `;
      } else {
        // If no span exists, replace underscores or add a new span
        signatureParagraph.innerHTML = signatureParagraph.innerHTML.replace(
          /_+/,
          `<span style="display: inline-block; border-bottom: 2px solid black; white-space: normal;">
                      <img src="${dataURL}" style="width:100px; height:30px; padding-left: 15px; display:inline;" />
                  </span>`
        );
      }
    } else {
      console.error("Signature paragraph not found!");
    }
  };

  const getBase64FromBlob = (blob) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        resolve(reader.result);
      };
    });
  };

  const submitSignedDocument = async () => {
    setLoading(true);
    let htmlContent = `<html>
          <head>
              <style>
                  body { background: white !important; }
                  table, th, td, div, p, span { background: transparent !important; }
              </style>
          </head>
          <body>
              ${containerRef.current.innerHTML}
          </body>
      </html>`;

    const docxBlob = htmlDocx.asBlob(htmlContent);

    const base64Doc = await getBase64FromBlob(docxBlob);

    const body = {
      base64OfTemplate: base64Doc,
      // jobId: jobRoleId,
      templateId: template?.templateId,
    };

    const response = await PostCall("/signedTemplate", body);
    if (response?.data?.status === 200) {
      setShowPopup(true);
      setTemplate(null);
      showToast("Document signed successfully", "success");
      DashboarDetails();
    } else {
      showToast(response?.data?.message, "error");
    }
    setLoading(false);
  };

  const submitReadOnlyDocument = async () => {
    setLoading(true);
    const response = await PostCall("/readTemplate", {
      templateId: template?.templateId,
    });
    if (response?.data?.status === 200) {
      showToast("Document saved successfully", "success");
      setShowPopup(true);
      setTemplate(null);
      setChecked(false);
      DashboarDetails();
    } else {
      showToast(response?.data?.message, "error");
    }
    setLoading(false);
  };

  const loadDocx = async () => {
    try {
      const response = await fetch(docxUrl);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();

      if (containerRef.current) {
        containerRef.current.innerHTML = "";
        await renderAsync(arrayBuffer, containerRef.current);

        let content = containerRef.current.innerHTML;

        if (userData) {
          Object.keys(userData).forEach((key) => {
            // console.log("key", key, "value", userData[key]);
            content = content.replace(
              new RegExp(`{${key}}`, "g"),
              userData[key]
            );
          });
          containerRef.current.innerHTML = content;
        }
      }
    } catch (err) {
      console.log("Error rendering DOCX: ", err.message);
      setError(err.message);
    }
  };

  // const GetCompany = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await GetCall(`/getAllCompany`);

  //     if (response?.data?.status === 200) {
  //       const companies = response?.data?.companies;
  //       setcompanyList(companies);
  //       if (!selectedCompanyId && companies.length > 0) {
  //         const defaultCompanyId = companies[0]._id;
  //         // console.log("companyid", defaultCompanyId);
  //         setSelectedCompanyId(defaultCompanyId);
  //         DashboarDetails(defaultCompanyId);
  //       }
  //     } else {
  //       showToast(response?.data?.message, "error");
  //     }
  //   } catch (error) {
  //     console.error("Error fetching companies:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleCompanyChange = (e) => {
  //   const companyId = e.target.value;
  //   setSelectedCompanyId(companyId);
  //   DashboarDetails(companyId);
  // };

  const handleTempalateChange = (e) => {
    // console.log("template", e.target.value);
    const selected = templateList.find(
      (template) => template._id === e.target.value
    );
    // console.log("selected", selected);
    setTemplate(selected);
    setDocxUrl(selected?.templateUrl);
    setUserData(selected?.userData);
    fetchData(selected);
  };

  const DashboarDetails = async () => {
    const jobId = jobRoleId;
    try {
      setLoading(true);
      let response;
      if (userRole === "Superadmin") {
        response = await PostCall(`/dashboard?companyId=${companyId}`);
      } else {
        response = await PostCall(`/dashboard`, {
          jobId,
        });
      }

      if (response?.data?.status === 200) {
        setDashboardData(response?.data?.responseData);
        setUserGrowth(response?.data.responseData?.userGrowth);
        setGraphData(response?.data?.responseData?.totalHoursAndOverTime);
        setTimeSheetData(response?.data?.responseData?.todaysClocking);
        setTemplateList(response?.data?.responseData?.templates);
        setUserData(response?.data?.userData);
        // setAvailableLeave(response?.data?.responseData?.totalAvailableLeave);
        // console.log("timesheet", timeSheetData);
        // const signed = response?.data?.responseData?.isTemplateSigned;
        // console.log("signed", signed);
        // setShowPopup(signed);
        // if (!signed) {
        //   fetchData();
        // }
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (selectedTemplate) => {
    setLoading(true);
    // console.log("template", selectedTemplate);
    const response = await PostCall("/previewTemplate", {
      templateId: selectedTemplate?.templateId,
    });
    if (response?.data?.status === 200) {
      setDocxUrl(response?.data?.templateUrl);
      setUserData(response?.data?.userData);
      setIsSignatureRequired(response?.data?.isSignActionRequired);
      setIsReadOnly(response?.data?.isTemplateReadActionRequired);
      // setIsSignatureRequired(false);
      // setIsReadOnly(false);
      setShowPopup(false);
    } else {
      showToast(response?.data?.message, "error");
    }
    setLoading(false);
  };

  const getAllHoliday = async (id) => {
    try {
      // setLoading(true);
      let response;
      // console.log("locationId", id);
      if (userRole === "Superadmin" && id) {
        response = await GetCall(
          `/getAllHolidays?page=${currentPage}&limit=${holidayPerPage}&locationId=${id}&year=${selectedYear}&companyId=${companyId}`
        );
      } else {
        response = await GetCall(
          `/getAllHolidays?year=${selectedYear}&page=${currentPage}&limit=${holidayPerPage}`
        );
      }

      if (response?.data?.status === 200) {
        setAllholidayList(response?.data?.holidays);
        setTotalHoliday(response.data?.totalHolidays);
        // setTotalPages(response?.data?.totalPages);
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (error) {
      console.error("Error fetching holidays:", error);
    } finally {
      setcalenderloading(false);
    }
  };

  const handleYearChange = (event) => {
    const newYear = parseInt(event.target.value, 10);
    setSelectedYear(newYear);
  };

  // const handleTodayClick = () => {
  //   const now = moment();
  //   const currentYear = now.year();
  //   const currentMonth = now.month() + 1;
  //   setSelectedYear(currentYear);
  //   setSelectedMonth(currentMonth);

  //   if (calendarRef.current) {
  //     calendarRef.current.getApi().today();
  //     setSelectedYear(currentYear);
  //   }
  // };

  const previewClose = () => {
    setShowPopup(true);
    setTemplate(null);
    setChecked(false);
  };

  const handleLocation = (event) => {
    const selectedLocationName = event.target.value;
    setSelectedLocationName(selectedLocationName);
    // console.log("Selected Location Name:", selectedLocationName);

    const matchedLocation = locationList.find(
      (location) => location.locationName === selectedLocationName
    );

    if (matchedLocation) {
      const FindlocationId = matchedLocation._id;
      setSelectedLocationId(FindlocationId);
      // console.log("locationid", FindlocationId);
      if (userRole === "Superadmin") {
        getAllHoliday(FindlocationId);
      }
    } else {
      console.log("Location not found in locationList");
    }
  };

  const GetLocations = async () => {
    try {
      setLoading(true);
      const response = await GetCall(`/getAllLocation`);

      if (response?.data?.status === 200) {
        setLocationList(response?.data?.locations);
        // console.log("locationList", locationList);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const formattedData = GraphData?.map((item) => ({
    ...item,
    totalHours: parseFloat(item.totalHours),
    overTime: parseFloat(item.overTime),
  }));

  const GetNotification = async () => {
    try {
      setLoading(true);
      const response = await GetCall(`/getNotifications`);
      if (response?.data?.status === 200) {
        // setNotifications(response.data.notifications);
        // setTotalPages(response.data.totalPages);/
        const unreadCount = response?.data?.unreadNotificationsCount;
        // console.log("unreadCount", response.data.unreadNotificationsCount);
        dispatch(setNotificationCount(unreadCount));
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePerPageChange = (e) => {
    setholidayPerPage(parseInt(e.target.value, 10));
    // setholidayPerPage(e);
    setCurrentPage(1);
  };

  // useEffect(() => {
  //   const transformedEvents = AllholidayList.map((holiday) => ({
  //     title: holiday.occasion,
  //     start: holiday.date,
  //     allDay: true,
  //     classNames: ["dashboard-holiday-event"],
  //     extendedProps: {
  //       description: ` ${holiday.occasion}`,
  //     },
  //   }));

  //   setEvents(transformedEvents);
  // }, [AllholidayList]);

  useEffect(() => {
    if (selectedLocationId && userRole) {
      getAllHoliday(selectedLocationId);
    } else if (userRole !== "Superadmin") {
      getAllHoliday();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // selectedLocationId,
    userRole,
    selectedYear,
    currentPage,
    holidayPerPage,
  ]);

  useEffect(() => {
    if (userRole === "Superadmin") {
      GetLocations();
      // GetCompany();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole]);

  useEffect(() => {
    if (jobRoleId && userRole !== "Superadmin") {
      DashboarDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobRoleId]);

  useEffect(() => {
    if (
      typeof companyId === "string" &&
      companyId.trim() !== "" &&
      userRole === "Superadmin"
    ) {
      DashboarDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  // useEffect(() => {
  //   const filtered = UserGrowth?.filter(
  //     (item) => item.year.toString() === graphSelectedYear
  //   );
  //   console.log("filter", filtered);
  //   setFilteredData(filtered);
  // }, [graphSelectedYear, UserGrowth]);

  // useEffect(() => {
  //   setCurrentMonth(moment().format("MMMM"));
  // }, []);

  useEffect(() => {
    if (showPopup && pdfRef.current) {
      pdfRef.current.scrollTop = 0;
    }
  }, [showPopup]);

  useEffect(() => {
    // console.log(docxUrl);
    if (!docxUrl) return;

    loadDocx();

    const container = containerRef.current;

    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docxUrl, userData]);

  const HandleviewProfile = () => {
    navigate("/profile");
  };

  useEffect(() => {
    GetNotification();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="Dashboard-main">
      {loading ? (
        <div className="loader-wrapper">
          <Loader />
        </div>
      ) : (
        <>
          {!showPopup && userRole !== "Superadmin" && (
            <div className="popup-overlay" onClick={previewClose}>
              {loading ? (
                <div className="loader-wrapper">
                  <Loader />
                </div>
              ) : (
                <div
                  className="popup-content"
                  ref={pdfRef}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button className="close-btn" onClick={previewClose}>
                    ×
                  </button>
                  <div>
                    {error ? (
                      <p style={{ color: "red" }}>{error}</p>
                    ) : docxUrl && userData ? (
                      <div ref={containerRef} className="docs" />
                    ) : (
                      <p>Loading document...</p>
                    )}

                    {isSignatureRequired && (
                      <>
                        {!isSignatureSaved ? (
                          <div className="signature-container">
                            <SignatureCanvas
                              ref={signatureRef}
                              canvasProps={{
                                className: "signature-canvas",
                              }}
                            />
                            <CommonAddButton
                              label="Save Signature"
                              onClick={saveSignature}
                            />
                          </div>
                        ) : (
                          <div className="submit-signature-button">
                            <CommonAddButton
                              label="Submit"
                              onClick={submitSignedDocument}
                            />
                          </div>
                        )}
                      </>
                    )}

                    {isReadOnly && (
                      <>
                        <div className="isReadOnly-container">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => setChecked(e.target.checked)}
                          />
                          <label>I read carefully.</label>
                        </div>
                        <div className="save-readOnly">
                          <button
                            className="common-button"
                            onClick={submitReadOnlyDocument}
                            disabled={!checked}
                          >
                            Read
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===========welcome profile========================== */}
          <div className="dashboard-profile-container">
            <div className="dashboard-profile">
              <img
                src={process.env.PUBLIC_URL + "/image/profile.png"}
                alt="Profile"
              />
              <div className="dashboard-profile-content">
                <h1>{user?.personalDetails?.firstName}</h1>
                <p>{userRole}</p>
              </div>
            </div>
            <div className="dashboard-viewprofile">
              <button onClick={HandleviewProfile}>View Profile</button>
            </div>
          </div>

          {/* ===========Pending Templates========================== */}
          {userRole !== "Superadmin" && templateList.length > 0 && (
            <div className="dashboard-profile-container">
              <h3>Pending Verifing Documents</h3>
              <div className="dashboard-viewprofile">
                {/* <select
                  className="JobTitle-input"
                  value={template?._id || ""}
                  onChange={handleTempalateChange}
                >
                  <option value="" disabled>
                    Select a Template
                  </option>
                  {templateList?.map((template) => (
                    <option key={template._id} value={template._id}>
                      {template.templateName}
                    </option>
                  ))}
                </select> */}
                <Select
                  displayEmpty
                  defaultValue=""
                  className="dashboard-input-dropdown"
                  value={template?._id || ""}
                  onChange={handleTempalateChange}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        width: 80,
                        overflowX: "auto",
                        scrollbarWidth: "thin",
                        maxHeight: 80,
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled className="menu-item">
                    Select a Template
                  </MenuItem>
                  {templateList?.map((template) => (
                    <MenuItem
                      key={template._id}
                      value={template._id}
                      className="menu-item"
                    >
                      {template.templateName}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            </div>
          )}

          {/* ==================attendance============================ */}
          <div
            className={
              userRole === "Employee"
                ? "dashbaord-first-section-full-flex"
                : "dashbaord-first-section-flex"
            }
          >
            <div
              className={
                userRole === "Employee"
                  ? "dashboard-first-section-full-flex"
                  : "dashboard-first-section"
              }
            >
              {dashboardItems
                .filter((item) => DashboardData.hasOwnProperty(item.APIvalue))
                .map((item, index) => (
                  <div
                    className={`dashboard-overview-content${index + 1}`}
                    key={item.APIvalue}
                  >
                    <div className="dashboard-box">
                      <div className="dashboard-box-icon">
                        {iconMap[item.APIvalue]}
                      </div>
                      <div className="dashboard-heading">
                        <p>{item.label}</p>
                      </div>
                      <div className="dashboard-overview-score">
                        <p>{DashboardData[item.APIvalue]}</p>
                      </div>
                      <div
                        className="dashboard-overview-more"
                        onClick={() => navigate(routeMap[item.APIvalue] || "/")}
                      >
                        <p>View Details</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            {userRole !== "Employee" && (
              <div className="dashboard-overview-flex-2">
                <div className="dashboard-absence-today">
                  <div className="dashbaord-heading-flex">
                    <div className="dashbaord-absence-heading">
                      <h1>Absence Today</h1>
                    </div>
                  </div>
                  <div className="dashboard-absence-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {timeSheetData?.todaysClocking?.clockEntries?.length >
                        0 ? (
                          DashboardData?.absentUsers?.map((user) => (
                            <tr key={user._id}>
                              <td>{user?.name}</td>
                              <td>{user?.role}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="2" className="norecord">
                              No Records Found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* =======================employee status=============================== */}
          <div
            className={
              userRole === "Employee"
                ? "dashbaord-second-section-2flex"
                : "dashbaord-second-section-flex"
            }
          >
            {/* {userRole === "Superadmin" && (
              <div className="employee-status-container">
                <div className="header">
                  <h2>Employee Status</h2>
                  <button className="time-filter">This Week</button>
                </div>
                <div className="Total-employee">
                  <span>Total Employee</span>
                  <h1>154</h1>
                </div>
                <div
                  className="progress-bar"
                  style={{ display: "flex", width: "100%" }}
                >
                  {employeeData.map((employee, id) => (
                    <div
                      key={id}
                      style={{
                        background: employee.color,
                        flex: `${employee.percentage}%`,
                        // width:"100%",
                        height: "20px",
                      }}
                      className={`progress-bar ${employee.type.toLowerCase()}`}
                    ></div>
                  ))}
                </div>
                <div className="status-grid">
                  {employeeData.map((employee, index) => (
                    <div key={index} className="status-box">
                      <span className="status-content">
                        <span
                          className={`progress-bar progress-bar-content ${employee.type.toLowerCase()}`}
                        ></span>
                        {`${employee.type} (${employee.percentage}%)`}
                      </span>
                      <p>{employee.count}</p>
                    </div>
                  ))}
                </div>
                <button
                  className="view-all"
                  onClick={() => navigate("/employees")}
                >
                  {" "}
                  View All Employees
                </button>
              </div>
            )} */}

            {userRole !== "Superadmin" && (
              <div className="dashboard-overview-flex-2">
                <div className="dashboard-absence-today">
                  <div className="dashbaord-heading-flex">
                    <div className="dashbaord-absence-heading">
                      <h1>Time sheet</h1>
                    </div>
                  </div>

                  <div className="dashboard-absence-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Clock In</th>
                          <th>Clock Out</th>
                          <th>Working Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {timeSheetData?.length > 0 ? (
                          timeSheetData?.map((entry) =>
                            entry.clockEntries.map((clock, index) => (
                              <tr key={index}>
                                <td>
                                  {clock.clockIn
                                    ? moment(clock.clockIn).format(
                                        "DD/MM/YYYY h:mm:ss A"
                                      )
                                    : "-"}
                                </td>
                                <td>
                                  {clock.clockOut ? (
                                    moment(clock.clockOut).format(
                                      "DD/MM/YYYY h:mm:ss A"
                                    )
                                  ) : (
                                    <b className="active">Active</b>
                                  )}
                                </td>
                                <td>
                                  {clock.totalTiming !== "0" ? (
                                    clock.totalTiming
                                  ) : (
                                    <BsHourglassSplit />
                                  )}
                                </td>
                              </tr>
                            ))
                          )
                        ) : (
                          <tr>
                            <td colSpan="3" className="norecord">
                              No Records Found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    <button
                      className="apply-btn"
                      onClick={() => navigate("/clockin")}
                    >
                      View Clock In
                    </button>
                  </div>
                </div>
              </div>
            )}

            {userRole !== "Employee" && (
              <div className="employee-status-container">
                <div className="chart-container-flex">
                  <h2>User Growth Chart</h2>
                  {/* <select
                    value={graphSelectedYear}
                    onChange={(e) => setgraphSelectedYear(e.target.value)}
                  >
                    {allowedYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select> */}
                </div>
                {userGrowth?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={330}>
                    <BarChart data={userGrowth}>
                      <CartesianGrid strokeDasharray="2 2" />
                      <XAxis dataKey="month" tick={{ fontSize: 14 }} />
                      <YAxis tick={{ fontSize: 16 }} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="totalUsers"
                        name="Total Users"
                        fill="#20c997"
                        barSize={40}
                        radius={[10, 10, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="no-data-message">
                    <p>No data found for the selected year.</p>
                  </div>
                )}
              </div>
            )}

            {userRole !== "Superadmin" && (
              <div className="employee-status-container">
                <h1>Total Wroking Hours</h1>
                {formattedData?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={330}>
                    <BarChart data={formattedData}>
                      <CartesianGrid strokeDasharray="2 2" />
                      <XAxis dataKey="date" tick={{ fontSize: 14 }} />
                      <YAxis tick={{ fontSize: 16 }} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="overTime"
                        fill="#20c997"
                        barSize={40}
                        radius={[10, 10, 0, 0]}
                      />
                      <Bar
                        dataKey="totalHours"
                        fill="var(--sidebar-hover)"
                        barSize={40}
                        radius={[10, 10, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="no-data-message">
                    <p>No data found for the Working Hours</p>
                  </div>
                )}
              </div>
            )}
            {userRole !== "Employee" && (
              <div className="employee-status-container">
                <div className="header">
                  <h3>Attendance & Leaves</h3>
                </div>
                <div className="stats-grid">
                  {DashboardData?.totalLeaveRequests !== undefined && (
                    <div className="stat">
                      <span className="state-totalelave">
                        {DashboardData.totalLeaveRequests}
                      </span>
                      <p>Total Leaves</p>
                    </div>
                  )}

                  {DashboardData?.totalPendingLR !== undefined && (
                    <div className="stat">
                      <span className="state-totalpeding">
                        {DashboardData.totalPendingLR}
                      </span>
                      <p>Pending Leave Request</p>
                    </div>
                  )}

                  {DashboardData?.totalAvailableLeave?.totalSickLeave !==
                    undefined && (
                    <div className="stat">
                      <span className="state-sick-request">
                        {DashboardData?.totalAvailableLeave?.totalSickLeave}
                      </span>
                      <p>Total Available Sick Leave</p>
                    </div>
                  )}

                  {DashboardData.totalAvailableLeave?.availableLeave !==
                    undefined && (
                    <div className="stat">
                      <span className="state-avaiable-request">
                        {DashboardData.totalAvailableLeave?.availableLeave}
                      </span>
                      <p>Total Available Leave</p>
                    </div>
                  )}
                </div>

                {userRole && jobRoleId && (
                  <button
                    className="apply-btn"
                    onClick={() =>
                      navigate(
                        userRole === "Superadmin"
                          ? "/leavesrequest"
                          : `/leaves/addleaves?jobId=${jobRoleId}`
                      )
                    }
                  >
                    {userRole === "Superadmin"
                      ? "Leave Request List"
                      : "Apply Leave"}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* =========list================================= */}
          <div className="dashboard-overview-container">
            <div className="dashboard-overview-calender-flex">
              {calenderloading ? (
                <div className="loader-wrapper">
                  <Loader />
                </div>
              ) : (
                <div className="dashboard-calender">
                  <div className="dashboard-calender-selectoption">
                    {userRole === "Superadmin" && (
                      // <select
                      //   value={selectedLocationName}
                      //   onChange={handleLocation}
                      // >
                      //   <option value="">Select Location</option>
                      //   {locationList.map((location, index) => (
                      //     <option key={index} value={location?.id}>
                      //       {location?.locationName}
                      //     </option>
                      //   ))}
                      // </select>
                      <Select
                        className="dashboard-dropdown"
                        value={selectedLocationName}
                        onChange={handleLocation}
                        displayEmpty
                        MenuProps={{
                          disableAutoFocusItem: true,
                          PaperProps: {
                            style: {
                              width: 200,
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
                          const found = locationList.find(
                            (loc) => loc.locationName === selected
                          );
                          return found?.locationName || "Not Found";
                        }}
                      >
                        <ListSubheader>
                          <TextField
                            size="small"
                            placeholder="Search Locations"
                            fullWidth
                            className="search-textfield"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.stopPropagation()}
                          />
                        </ListSubheader>
                        <MenuItem value="" className="menu-item">
                          Select Location
                        </MenuItem>
                        {filteredLocationList?.length > 0 ? (
                          filteredLocationList?.map((location, index) => (
                            <MenuItem
                              key={index}
                              value={location?.locationName}
                              className="menu-item"
                            >
                              {location?.locationName}
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled className="menu-item">
                            No countries found
                          </MenuItem>
                        )}
                      </Select>
                    )}

                    {/* <select
                      id="dashboard-year-select"
                      value={selectedYear}
                      onChange={handleYearChange}
                      className="holiday-Year-select"
                    >
                      {allowedYears?.map((year, index) => (
                        <option key={index} value={year}>
                          {year}
                        </option>
                      ))}
                    </select> */}
                    <Select
                      id="dashboard-year-select"
                      value={selectedYear}
                      className="dashboard-dropdown"
                      onChange={handleYearChange}
                      displayEmpty
                      MenuProps={{
                        PaperProps: {
                          width: 100,
                          maxHeight: 100,
                          overflowX: "auto",
                          scrollbarWidth: "thin",
                        },
                      }}
                    >
                      <MenuItem value="" disabled className="menu-item">
                        Select year
                      </MenuItem>
                      {allowedYears.map((year, i) => (
                        <MenuItem key={i} value={year} className="menu-item">
                          {year}
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                  {/* <FullCalendar
                    key={selectedYear}
                    ref={calendarRef}
                    plugins={[dayGridPlugin, interactionPlugin]}
                    initialDate={moment(
                      `${selectedYear}-${String(selectedMonth).padStart(
                        2,
                        "0"
                      )}-01`
                    ).toDate()}
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
                    initialView="dayGridMonth"
                    events={events}
                    datesSet={(info) => {
                      // const currentYear = info.view.currentStart.getFullYear();
                      // const currentMonth =
                      //   info.view.currentStart.getMonth() + 1;

                      setSelectedMonth(selectedMonth);
                      setSelectedYear(selectedYear);
                    }}
                  /> */}
                  <div className="scrollable-table-wrapper">
                    <TableContainer>
                      <Table className="employeetimesheet-table">
                        <TableHead>
                          <TableRow>
                            <TableCell>Absence Date</TableCell>
                            {/* <TableCell>Company Name</TableCell> */}
                            <TableCell>Occasion</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {AllholidayList.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={3} align="center">
                                No data available
                              </TableCell>
                            </TableRow>
                          ) : (
                            AllholidayList.map((holiday, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  {moment(holiday.date).format("DD/MM/YYYY")}
                                </TableCell>
                                {/* <TableCell>{holiday.companyName}</TableCell> */}
                                <TableCell>{holiday.occasion}</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                        <TableFooter>
                          <TableRow>
                            <TableCell colSpan={4}>
                              <TablePagination
                                component="div"
                                count={
                                  Array.isArray(totalHoliday)
                                    ? totalHoliday.length
                                    : totalHoliday
                                }
                                page={currentPage - 1}
                                onPageChange={handlePageChange}
                                rowsPerPage={holidayPerPage}
                                onRowsPerPageChange={handlePerPageChange}
                                rowsPerPageOptions={[10, 15, 20]}
                              />
                            </TableCell>
                          </TableRow>
                        </TableFooter>
                      </Table>
                    </TableContainer>
                  </div>
                </div>
              )}
            </div>
            <div className="dashboard-overview-flex">
              {dashboardgrowthItems
                .filter(
                  (item) => item.value !== undefined && item.value !== null
                )
                .map((item, index) => {
                  const isPositive = item.value >= 0;
                  return (
                    <div
                      className="dashboard-overview-content-allrecord"
                      key={index}
                    >
                      <div className="dashboard-box-list">
                        <div className="dashboard-overview-list-flex">
                          <div className="dashboard-box-icon-list">
                            <BiNotepad />
                          </div>
                          <div className="dashboard-overview-list-score">
                            <div className="dashboard-heading">
                              <p>{item.title}</p>
                            </div>
                            <div className="dashboard-overview-score">
                              <p>{item.growth}</p>
                              <div className="dashboard-score-growth">
                                <div
                                  className={`dashboard-percentage ${
                                    isPositive
                                      ? "positive-growth"
                                      : "negative-growth"
                                  }`}
                                >
                                  {isPositive ? (
                                    <IoIosArrowRoundUp className="up-arrow" />
                                  ) : (
                                    <IoIosArrowRoundDown className="down-arrow" />
                                  )}
                                  <p>{`${Math.abs(item?.value)?.toFixed(
                                    2
                                  )}%`}</p>
                                </div>
                                <span>Than Last Month</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
