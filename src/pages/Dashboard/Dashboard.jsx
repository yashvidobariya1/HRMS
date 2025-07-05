import React, { useEffect, useRef, useState } from "react";
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
import SignatureCanvas from "react-signature-canvas";
import CommonAddButton from "../../SeparateCom/CommonAddButton";
import { setNotificationCount } from "../../store/notificationCountSlice";
import { useDispatch } from "react-redux";
import {
  Select,
  MenuItem,
  TableContainer,
  TableHead,
  TableRow,
  Table,
  TableCell,
  TableBody,
  TablePagination,
  TableFooter,
  TableSortLabel,
  IconButton,
} from "@mui/material";
import { BsHourglassSplit } from "react-icons/bs";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";

const Dashboard = () => {
  const { PostCall, GetCall } = useApiServices();
  const signatureRef = useRef(null);
  const navigate = useNavigate();
  const [DashboardData, setDashboardData] = useState([]);
  const [AllholidayList, setAllholidayList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [calenderloading, setcalenderloading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(moment().year());
  const currentYear = moment().year();
  const [timeSheetData, setTimeSheetData] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [GraphData, setGraphData] = useState([]);
  const [templateList, setTemplateList] = useState([]);
  const [template, setTemplate] = useState({});
  const [isSignatureRequired, setIsSignatureRequired] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [checked, setChecked] = useState(false);
  const user = useSelector((state) => state.userInfo.userInfo);
  const [error, setError] = useState(null);
  const [docxUrl, setDocxUrl] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isSignatureSaved, setIsSignatureSaved] = useState(false);
  const jobRoleId = useSelector(
    (state) => state.jobRoleSelect?.jobRoleSelect?.jobId
  );
  const companyId = useSelector((state) => state.companySelect.companySelect);
  const userRole = useSelector((state) => state.userInfo.userInfo.role);
  const dispatch = useDispatch();
  const startDate = process.env.REACT_APP_START_DATE || "2022-01-01";
  const startYear = moment(startDate).year();
  const allowedYears = Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => startYear + i
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [holidayPerPage, setholidayPerPage] = useState(5);
  const [totalHoliday, setTotalHoliday] = useState(0);
  const [Totalabsencereport, setTotalabsencereport] = useState(0);
  const [absencecurrentPage, setabsencecurrentPage] = useState(1);
  const [absencePerPage, setabsencePerPage] = useState(5);
  const [signatureBase64, setSignatureBase64] = useState("");
  const [docs, setDocs] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showFooter, setShowFooter] = useState(true);
  const [popupLoading, setPopupLoading] = useState(false);
  const [AbsenceData, setAbsenceData] = useState([]);
  const [sortConfig, setSortConfig] = React.useState({
    key: "",
    direction: "asc",
  });
  const [sortConfigholiday, setsortConfigholiday] = React.useState({
    key: "",
    direction: "asc",
  });
  const [sortConfigtimesheet, setSortConfigtimesheet] = React.useState({
    key: "",
    direction: "asc",
  });
  // const filteredLocationList = useMemo(() => {
  //   return locationList.filter((loc) =>
  //     loc?.locationName?.toLowerCase().includes(searchTerm.toLowerCase())
  //   );
  // }, [searchTerm, locationList]);

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
      userRole === "Superadmin" ? "/leavesrequest" : `/leaves/leavesrequest`,
    totalPendingLR:
      userRole === "Superadmin" ? "/leavesrequest" : `/leaves/leavesrequest`,
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

  const saveSignature = () => {
    try {
      if (!signatureRef.current || signatureRef.current.isEmpty()) {
        showToast("Please add a signature before saving", "error");
        return;
      }

      const dataURL = signatureRef.current.toDataURL("image/png");
      setIsSignatureSaved(true);
      setSignatureBase64(dataURL);
    } catch (error) {
      console.error("Error saving signature:", error);
    }
  };

  const submitSignedDocument = async () => {
    if (popupLoading) return;
    setPopupLoading(true);
    setLoading(true);
    if (!signatureBase64) {
      showToast("No signature available", "error");
      return;
    }

    try {
      const body = {
        signBase64: signatureBase64,
        templateId: template?.templateId,
      };

      const response = await PostCall("/signedTemplate", body);
      if (response?.data?.status === 200) {
        setIsOpen(false);
        setTemplate(null);
        setDocxUrl(null);
        setDocs([]);
        setUserData(null);
        setSignatureBase64("");
        setIsSignatureSaved(false);
        showToast("Document signed successfully", "success");
        DashboarDetails();
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (err) {
      console.error("Error in submitSignedDocument:", err);
      showToast("Failed to submit document", "error");
    } finally {
      setPopupLoading(false);
      setLoading(false);
    }
  };

  const submitReadOnlyDocument = async () => {
    if (popupLoading) return;
    setPopupLoading(true);
    setLoading(true);
    try {
      const response = await PostCall("/readTemplate", {
        templateId: template?.templateId,
      });
      if (response?.data?.status === 200) {
        showToast("Document saved successfully", "success");
        setIsOpen(false);
        setTemplate(null);
        setDocxUrl(null);
        setDocs([]);
        setUserData(null);
        setChecked(false);
        DashboarDetails();
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (err) {
      console.error("Error in submitReadOnlyDocument:", err);
    } finally {
      setLoading(false);
      setPopupLoading(false);
    }
  };

  const loadDocx = async () => {
    try {
      if (!docxUrl) {
        showToast("File not found", "error");
        return;
      }

      const extension = docxUrl.split(".").pop().toLowerCase();
      if (
        ["pdf", "docx", "jpg", "jpeg", "png", "gif", "webp"].includes(extension)
      ) {
        const encodedUrl = encodeURI(docxUrl);
        const templateName = docxUrl.split("/").pop();
        setDocs([
          {
            uri: encodedUrl,
            fileType: extension,
            fileName: templateName,
          },
        ]);
        setIsOpen(true);
      } else {
        showToast("Unsupported file type for preview", "error");
      }
    } catch (err) {
      console.log("Error rendering DOCX: ", err.message);
      setError("Error rendering document.", "error");
    }
  };

  const handleTemplateChange = (e) => {
    const selected = templateList.find(
      (template) => template._id === e.target.value
    );
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
    const response = await PostCall("/previewTemplate", {
      templateId: selectedTemplate?.templateId,
    });
    if (response?.data?.status === 200) {
      setDocxUrl(response?.data?.templateUrl);
      setUserData(response?.data?.userData);
      setIsSignatureRequired(response?.data?.isSignActionRequired);
      setIsReadOnly(response?.data?.isTemplateReadActionRequired);
    } else {
      showToast(response?.data?.message, "error");
    }
    setLoading(false);
  };

  const getAllHoliday = async (id) => {
    setcalenderloading(true);
    try {
      let response;
      response = await GetCall(
        `/getAllHolidays?year=${selectedYear}&page=${currentPage}&limit=${holidayPerPage}&companyId=${companyId}`
      );

      if (response?.data?.status === 200) {
        setAllholidayList(response?.data?.holidays);
        setTotalHoliday(response.data?.totalHolidays);
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (error) {
      console.error("Error fetching holidays:", error);
    } finally {
      setcalenderloading(false);
    }
  };

  const getTodayAbsenceReport = async () => {
    try {
      let response;
      response = await GetCall(
        `/getTodaysAbsentUsers?page=${absencecurrentPage}&limit=${absencePerPage}&companyId=${companyId}`
      );

      if (response?.data?.status === 200) {
        setAbsenceData(response?.data?.absentUser);
        setTotalabsencereport(response.data?.totalAbsentUsers);
        // setabsenceTotalPages(response?.data?.totalPages);
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
        const unreadCount = response?.data?.unreadNotificationsCount;
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

  const handlePerPageChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setCurrentPage(1);
    setholidayPerPage(value);
  };

  const handleabsencePerPageChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setabsencecurrentPage(1);
    setabsencePerPage(value);
  };

  const handleAbsencePageChange = (_, newPage) => {
    setabsencecurrentPage(newPage + 1);
  };

  useEffect(() => {
    if (companyId && typeof companyId === "string") getAllHoliday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // selectedLocationId,
    // userRole,
    selectedYear,
    currentPage,
    holidayPerPage,
    companyId,
  ]);

  useEffect(() => {
    if (companyId && typeof companyId === "string") getTodayAbsenceReport();
  }, [absencecurrentPage, absencePerPage, companyId]);

  // useEffect(() => {
  //   if (userRole === "Superadmin") {
  //     GetLocations();
  //     // GetCompany();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [userRole, companyId]);

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

  useEffect(() => {
    if (!docxUrl) return;
    loadDocx();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docxUrl]);

  const HandleviewProfile = () => {
    navigate("/profile");
  };

  const keyMap = {
    "Absent Date": "date",
    "Employee Name": "userName",
    "client Name": "clientName",
    "Location Name": "locationName",
    totalWorkingHours: "totalWorkingHours",
    "Job Title": "jobTitle",
    status: "status",
  };

  const HolidaykeyMap = {
    "Company Name": "companyName",
    Date: "date",
    Occasion: "occasion",
    Day: "date",
  };

  const timesheetkeyMap = {
    "Clock in": "companyName",
    "Clock Out": "date",
    "Total Timing": "occasion",
  };

  const handleSort = (key) => {
    const mappedKey = keyMap[key] || key;
    // console.log("Sorting by:", mappedKey);

    setSortConfig((prevSort) => {
      let direction = "asc";
      if (prevSort.key === mappedKey && prevSort.direction === "asc") {
        direction = "desc";
      }
      return { key: mappedKey, direction };
    });
  };

  const sortedData = React.useMemo(() => {
    if (!Array.isArray(AbsenceData)) return [];
    if (!sortConfig.key) return [...AbsenceData];
    return [...AbsenceData].sort((a, b) => {
      const valueA = a[sortConfig.key] ?? "";
      const valueB = b[sortConfig.key] ?? "";
      console.log("AbsenceData", AbsenceData);
      if (typeof valueA === "string") {
        return sortConfig.direction === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      } else {
        return sortConfig.direction === "asc"
          ? valueA - valueB
          : valueB - valueA;
      }
    });
  }, [AbsenceData, sortConfig]);

  const filteredData = React.useMemo(() => {
    return sortedData.filter((item) =>
      Object.values(item).some(
        (value) => value?.toString().toLowerCase().includes
      )
    );
  }, [sortedData]);

  const paginatedRows = React.useMemo(() => {
    return filteredData;
  }, [filteredData]);

  const handleSortholiday = (key) => {
    const mappedKey = HolidaykeyMap[key] || key;
    console.log("Sorting by:", mappedKey);

    setsortConfigholiday((prevSort) => {
      let direction = "asc";
      if (prevSort.key === mappedKey && prevSort.direction === "asc") {
        direction = "desc";
      }
      return { key: mappedKey, direction };
    });
  };

  const sortedDataholiday = React.useMemo(() => {
    if (!Array.isArray(AllholidayList)) return [];
    if (!sortConfigholiday.key) return [...AllholidayList];
    return [...AllholidayList].sort((a, b) => {
      const valueA = a[sortConfigholiday.key] ?? "";
      const valueB = b[sortConfigholiday.key] ?? "";
      // console.log("statusList", statusList);
      if (typeof valueA === "string") {
        return sortConfigholiday.direction === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      } else {
        return sortConfigholiday.direction === "asc"
          ? valueA - valueB
          : valueB - valueA;
      }
    });
  }, [AllholidayList, sortConfigholiday]);

  const filteredDataholiday = React.useMemo(() => {
    return sortedDataholiday.filter((item) =>
      Object.values(item).some(
        (value) => value?.toString().toLowerCase().includes
      )
    );
  }, [sortedDataholiday]);

  // const paginatedRowsholiday = React.useMemo(() => {
  //   const start = (currentPage - 1) * holidayPerPage;
  //   const end = start + holidayPerPage;
  //   return filteredDataholiday.slice(start, end);
  // }, [filteredDataholiday, currentPage, holidayPerPage]);

  const paginatedRowsholiday = React.useMemo(() => {
    return filteredDataholiday;
  }, [filteredDataholiday]);

  const handleSorttimesheet = (key) => {
    const mappedKey = keyMap[key] || key;
    // console.log("Sorting by:", mappedKey);

    setSortConfigtimesheet((prevSort) => {
      let direction = "asc";
      if (prevSort.key === mappedKey && prevSort.direction === "asc") {
        direction = "desc";
      }
      return { key: mappedKey, direction };
    });
  };

  const sortedDatatimesheet = React.useMemo(() => {
    if (!Array.isArray(timeSheetData)) return [];
    if (!sortConfigtimesheet.key) return [...timeSheetData];
    return [...timeSheetData].sort((a, b) => {
      const valueA = a[sortConfigtimesheet.key] ?? "";
      const valueB = b[sortConfigtimesheet.key] ?? "";
      // console.log("timeSheetData", timeSheetData);
      if (typeof valueA === "string") {
        return sortConfigtimesheet.direction === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      } else {
        return sortConfigtimesheet.direction === "asc"
          ? valueA - valueB
          : valueB - valueA;
      }
    });
  }, [timeSheetData, sortConfigtimesheet]);

  const filteredDatatimesheet = React.useMemo(() => {
    return sortedDatatimesheet.filter((item) =>
      Object.values(item).some(
        (value) => value?.toString().toLowerCase().includes
      )
    );
  }, [sortedData]);

  const paginatedRowstimesheet = React.useMemo(() => {
    return filteredDatatimesheet;
  }, [filteredDatatimesheet]);

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
          {isOpen && (
            <div className="fullscreen-overlay">
              <div className="fullscreen-modal">
                <button
                  className="fullscreen-close-button"
                  onClick={() => {
                    setIsOpen(false);
                    setDocxUrl(null);
                    setDocs([]);
                    setIsSignatureSaved(false);
                    setTemplate({});
                    setUserData(null);
                    setShowFooter(true);
                    setSignatureBase64("");
                  }}
                >
                  ×
                </button>
                <div className="preview-doc-flex">
                  <DocViewer
                    documents={docs}
                    pluginRenderers={DocViewerRenderers}
                    config={{
                      header: {
                        disableDownload: true,
                        disablePrint: true,
                      },
                    }}
                    style={{ height: "100%", width: "100%" }}
                  />
                </div>
                {error && <p className="error-message">{error}</p>}
                {showFooter && (
                  <div className="footer-main-div">
                    <div className="preview-footer">
                      <div>
                        <strong>Employee Name: </strong>{" "}
                        {userData?.EMPLOYEE_NAME || ""}
                      </div>
                      <div>
                        <strong>Date: </strong> {userData?.DATE || ""}
                      </div>
                      {isSignatureSaved && (
                        <div className="signature-preview">
                          <strong>Signature: </strong>
                          <img
                            className="signature-image"
                            src={signatureBase64}
                            alt="Employee Signature"
                          />
                        </div>
                      )}
                    </div>

                    {isSignatureRequired && (
                      <>
                        {!isSignatureSaved ? (
                          <div>
                            <div className="preview-signature">
                              <SignatureCanvas
                                ref={signatureRef}
                                canvasProps={{
                                  className: "signature-canvas",
                                }}
                              />
                            </div>
                            <div className="preview-submit">
                              <CommonAddButton
                                label="Save Signature"
                                onClick={saveSignature}
                              />
                            </div>
                          </div>
                        ) : (
                          <CommonAddButton
                            label="Submit"
                            onClick={submitSignedDocument}
                          />
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

                        <button
                          className="read-button"
                          onClick={submitReadOnlyDocument}
                          disabled={!checked}
                        >
                          Read
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
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
          {userRole !== "Superadmin" && templateList?.length > 0 && (
            <div className="dashboard-profile-container">
              <h3>Pending Verifing Documents</h3>
              <div className="dashboard-viewprofile">
                {/* <select
                  className="JobTitle-input"
                  value={template?._id || ""}
                  onChange={handleTemplateChange}
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
                  onChange={handleTemplateChange}
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

                  {loading ? (
                    <div className="loader-wrapper">
                      <Loader />
                    </div>
                  ) : (
                    <div className="scrollable-table-wrapper">
                      <TableContainer>
                        <Table className="employeetimesheet-table">
                          <TableHead>
                            <TableRow>
                              <TableCell
                                sortDirection={
                                  sortConfig.key === "Absent Date"
                                    ? sortConfig.direction
                                    : false
                                }
                              >
                                <TableSortLabel
                                  active={sortConfig.key === "Absent Date"}
                                  direction={
                                    sortConfig.key === "Absent Date"
                                      ? sortConfig.direction
                                      : "asc"
                                  }
                                  onClick={() => handleSort("Absent Date")}
                                >
                                  Absent Date
                                </TableSortLabel>
                              </TableCell>
                              <TableCell
                                sortDirection={
                                  sortConfig.key === "Employee Name"
                                    ? sortConfig.direction
                                    : false
                                }
                              >
                                <TableSortLabel
                                  active={sortConfig.key === "Employee Name"}
                                  direction={
                                    sortConfig.key === "Employee Name"
                                      ? sortConfig.direction
                                      : "asc"
                                  }
                                  onClick={() => handleSort("Employee Name")}
                                >
                                  Employee Name
                                </TableSortLabel>
                              </TableCell>
                              <TableCell
                                sortDirection={
                                  sortConfig.key === "client Name"
                                    ? sortConfig.direction
                                    : false
                                }
                              >
                                <TableSortLabel
                                  active={sortConfig.key === "client Name"}
                                  direction={
                                    sortConfig.key === "client Name"
                                      ? sortConfig.direction
                                      : "asc"
                                  }
                                  onClick={() => handleSort("client Name")}
                                >
                                  Client Name
                                </TableSortLabel>
                              </TableCell>
                              <TableCell
                                sortDirection={
                                  sortConfig.key === "Location Name"
                                    ? sortConfig.direction
                                    : false
                                }
                              >
                                <TableSortLabel
                                  active={sortConfig.key === "Location Name"}
                                  direction={
                                    sortConfig.key === "Location Name"
                                      ? sortConfig.direction
                                      : "asc"
                                  }
                                  onClick={() => handleSort("Location Name")}
                                >
                                  Location Name
                                </TableSortLabel>
                              </TableCell>
                              <TableCell
                                sortDirection={
                                  sortConfig.key === "Job Title"
                                    ? sortConfig.direction
                                    : false
                                }
                              >
                                <TableSortLabel
                                  active={sortConfig.key === "Job Title"}
                                  direction={
                                    sortConfig.key === "Job Title"
                                      ? sortConfig.direction
                                      : "asc"
                                  }
                                  onClick={() => handleSort("Job Title")}
                                >
                                  Job Title
                                </TableSortLabel>
                              </TableCell>
                              <TableCell
                                sortDirection={
                                  sortConfig.key === "status"
                                    ? sortConfig.direction
                                    : false
                                }
                              >
                                <TableSortLabel
                                  active={sortConfig.key === "status"}
                                  direction={
                                    sortConfig.key === "status"
                                      ? sortConfig.direction
                                      : "asc"
                                  }
                                  onClick={() => handleSort("status")}
                                >
                                  Status
                                </TableSortLabel>
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {paginatedRows?.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={7} align="center">
                                  No data available
                                </TableCell>
                              </TableRow>
                            ) : (
                              paginatedRows.map((absence, index) => {
                                // const actualIndex =
                                //   currentPage * absencePerPage + index;

                                return (
                                  <TableRow key={index}>
                                    <TableCell>
                                      {moment(absence.date).format(
                                        "DD/MM/YYYY"
                                      )}
                                    </TableCell>
                                    <TableCell>{absence?.userName}</TableCell>
                                    <TableCell>{absence?.clientName}</TableCell>
                                    <TableCell>
                                      {absence?.locationName}
                                    </TableCell>
                                    <TableCell>{absence?.jobTitle}</TableCell>
                                    <TableCell>{absence?.status}</TableCell>
                                  </TableRow>
                                );
                              })
                            )}
                          </TableBody>
                          <TableFooter>
                            <TableRow>
                              <TableCell colSpan={6}>
                                <TablePagination
                                  component="div"
                                  count={Totalabsencereport}
                                  page={absencecurrentPage - 1}
                                  onPageChange={handleAbsencePageChange}
                                  rowsPerPage={absencePerPage}
                                  onRowsPerPageChange={
                                    handleabsencePerPageChange
                                  }
                                  rowsPerPageOptions={[5, 10, 15]}
                                />
                              </TableCell>
                            </TableRow>
                          </TableFooter>
                        </Table>
                      </TableContainer>
                    </div>
                  )}
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
                      <h1>Timesheet</h1>
                    </div>
                  </div>

                  {/* <div className="dashboard-absence-table">
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
                  </div> */}
                  <TableContainer>
                    <Table className="employeetimesheet-table">
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <TableSortLabel>Clock In</TableSortLabel>
                          </TableCell>
                          <TableCell>
                            <TableSortLabel>Clock Out</TableSortLabel>
                          </TableCell>
                          <TableCell>
                            <TableSortLabel>Working Time</TableSortLabel>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedRowstimesheet?.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} align="center">
                              No data available
                            </TableCell>
                          </TableRow>
                        ) : (
                          paginatedRowstimesheet.map((clock, index) => {
                            // const actualIndex =
                            //   currentPage * absencePerPage + index;

                            return (
                              <TableRow key={index}>
                                <TableCell>
                                  {moment(clock.date).format("DD/MM/YYYY")}
                                </TableCell>
                                <TableCell>
                                  {clock.clockIn
                                    ? moment(clock.clockIn).format(
                                        "DD/MM/YYYY h:mm:ss A"
                                      )
                                    : "-"}
                                </TableCell>
                                <TableCell>
                                  {" "}
                                  {clock.clockOut ? (
                                    moment(clock.clockOut).format(
                                      "DD/MM/YYYY h:mm:ss A"
                                    )
                                  ) : (
                                    <b className="active">Active</b>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {" "}
                                  {clock.totalTiming !== "0" ? (
                                    clock.totalTiming
                                  ) : (
                                    <BsHourglassSplit />
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
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
                    <h1>Holidays</h1>
                    {/* {userRole === "Superadmin" && (
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
                    )} */}

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
                          style: {
                            width: 100,
                            maxHeight: 100,
                            overflowX: "auto",
                            scrollbarWidth: "thin",
                          },
                        },
                      }}
                    >
                      {/* <MenuItem value="" disabled className="menu-item">
                        Select year
                      </MenuItem> */}
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
                            <TableCell
                              sortDirection={
                                sortConfigholiday.key === "Company Name"
                                  ? sortConfigholiday.direction
                                  : false
                              }
                            >
                              <TableSortLabel
                                active={
                                  sortConfigholiday.key === "Company Name"
                                }
                                direction={
                                  sortConfigholiday.key === "Company Name"
                                    ? sortConfigholiday.direction
                                    : "asc"
                                }
                                onClick={() =>
                                  handleSortholiday("Company Name")
                                }
                              >
                                Company Name
                              </TableSortLabel>
                            </TableCell>
                            <TableCell
                              sortDirection={
                                sortConfigholiday.key === "Date"
                                  ? sortConfigholiday.direction
                                  : false
                              }
                            >
                              <TableSortLabel
                                active={sortConfigholiday.key === "Date"}
                                direction={
                                  sortConfigholiday.key === "Date"
                                    ? sortConfigholiday.direction
                                    : "asc"
                                }
                                onClick={() => handleSortholiday("Date")}
                              >
                                Date
                              </TableSortLabel>
                            </TableCell>
                            <TableCell
                              sortDirection={
                                sortConfigholiday.key === "Occasion"
                                  ? sortConfigholiday.direction
                                  : false
                              }
                            >
                              <TableSortLabel
                                active={sortConfigholiday.key === "Occasion"}
                                direction={
                                  sortConfigholiday.key === "Occasion"
                                    ? sortConfigholiday.direction
                                    : "asc"
                                }
                                onClick={() => handleSortholiday("Occasion")}
                              >
                                Occasion
                              </TableSortLabel>
                            </TableCell>
                            <TableCell
                              sortDirection={
                                sortConfigholiday.key === "Day"
                                  ? sortConfigholiday.direction
                                  : false
                              }
                            >
                              <TableSortLabel
                                active={sortConfigholiday.key === "Day"}
                                direction={
                                  sortConfigholiday.key === "Day"
                                    ? sortConfigholiday.direction
                                    : "asc"
                                }
                                onClick={() => handleSortholiday("Day")}
                              >
                                Day
                              </TableSortLabel>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {paginatedRowsholiday.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={3} align="center">
                                No data available
                              </TableCell>
                            </TableRow>
                          ) : (
                            paginatedRowsholiday.map((holiday, index) => (
                              <TableRow key={index}>
                                <TableCell>{holiday.companyName}</TableCell>
                                <TableCell>
                                  {moment(holiday.date).format("DD/MM/YYYY")}
                                </TableCell>

                                <TableCell>{holiday.occasion}</TableCell>
                                <TableCell>
                                  {moment(holiday.date).format("dddd")}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                        <TableFooter>
                          <TableRow>
                            <TableCell colSpan={4}>
                              <TablePagination
                                component="div"
                                count={totalHoliday}
                                page={currentPage - 1}
                                onPageChange={(_, newPage) =>
                                  setCurrentPage(newPage + 1)
                                }
                                rowsPerPage={holidayPerPage}
                                onRowsPerPageChange={handlePerPageChange}
                                rowsPerPageOptions={[5, 10, 15]}
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
