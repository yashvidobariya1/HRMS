import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router";
import { GetCall, PostCall } from "../../ApiServices";
import "./EmployeesTimesheet.css";
import Loader from "../Helper/Loader";
import { showToast } from "../../main/ToastManager";
// import CommonTable from "../../SeparateCom/CommonTable";
import { useLocation } from "react-router-dom";
import { setUserInfo } from "../../store/userInfoSlice";
import { useDispatch } from "react-redux";
import moment from "moment";
import {
  Box,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
// import CommonAddButton from "../../SeparateCom/CommonAddButton";
import ApproveRejectConfirmation from "../../main/ApproveRejectConfirmation";

const EmployeesTimesheet = () => {
  // const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [reportDetails, setReportDetails] = useState([]);
  // const [showDropdownAction, setShowDropdownAction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportPerPage, setReportPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(0);
  const [dateEmployee, setDateEmployee] = useState([]);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token");
  const [openRows, setOpenRows] = useState({});
  const [errors, setErrors] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [status, setStatus] = useState("");
  const [totalemployeereport, setTotalemployeereport] = useState("");
  const [rejectReason, setrejectReason] = useState("");
  const [actionBy, setActionby] = useState("");
  const [sortConfig, setSortConfig] = React.useState({
    key: "",
    direction: "asc",
  });

  const keyMap = {
    userName: "userName",
    jobTitle: "jobTitle",
    totalWorkingHours: "totalWorkingHours",
    overTime: "overTime",
    totalHours: "totalHours",
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
    if (!Array.isArray(reportDetails)) return [];
    if (!sortConfig.key) return [...reportDetails];
    return [...reportDetails].sort((a, b) => {
      const valueA = a[sortConfig.key] ?? "";
      const valueB = b[sortConfig.key] ?? "";
      // console.log("reportDetails", reportDetails);
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
  }, [reportDetails, sortConfig]);

  const filteredData = React.useMemo(() => {
    return sortedData.filter((item) =>
      Object.values(item).some(
        (value) => value?.toString().toLowerCase().includes
      )
    );
  }, [sortedData]);

  const paginatedRows = React.useMemo(() => {
    const start = (currentPage - 1) * reportPerPage;
    const end = start + reportPerPage;
    return filteredData.slice(start, end);
  }, [filteredData, currentPage, reportPerPage]);

  const handleToggle = (index) => {
    setOpenRows((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // const handleAction = (id) => {
  //   setShowDropdownAction(showDropdownAction === id ? null : id);
  // };

  // const HandleAction = async (id) => {
  //   navigate(
  //     `/viewtimesheetreport?jobId=${id}&reportId=${reportDetails?._id}&startDate=${reportDetails?.startDate}&endDate=${reportDetails?.endDate}`
  //   );
  // };

  // const allStatusPending = reportDetails?.employees?.every(
  //   (item) => item.status === "Pending"
  // );

  // const tableHeaders = allStatusPending
  //   ? ["Employee Name", "Job Title", "Role", "status", "Action"]
  //   : ["", "Employee Name", "Job Title", "Role", "status", "Action"];

  // const actions = [{ label: "Action", onClick: HandleAction }];

  // const handlereportPerPageChange = (e) => {
  //   // setReportPerPage(parseInt(e.target.value, 10));
  //   setReportPerPage(e);
  //   setCurrentPage(1);
  // };

  const GetEmployeesStatus = async () => {
    try {
      setLoading(true);
      const response = await GetCall(
        `/getReportForClient?page=${currentPage}&limit=${reportPerPage}`
      );
      if (response?.data?.status === 200) {
        setReportDetails(response?.data?.reports.employeeTimesheetData);
        setStatus(response.data?.reports?.status);
        setTotalemployeereport(response?.data?.reports?.totalHoursOfEmployees);
        setActionby(response.data.reports.actionBy);
        setrejectReason(response?.data?.reports?.rejectionReason);
        // setStartDate(response?.data?.report?.startDate);
        // setEndDate(response?.data?.report?.endDate);
        setDateEmployee(response?.data?.reports);
        setTotalPages(response?.data?.totalReports);
      } else {
        showToast(response?.data?.message);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleApprove = async (e) => {
    // const data = {
    //   reportId,
    //   jobId,
    // };
    try {
      setLoading(true);
      const response = await PostCall(`/approveReport`);
      if (response?.data?.status === 200) {
        setStatus(response?.data?.updatedReport?.status);
        showToast(response?.data?.message, "success");
        // console.log("response", response);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
      GetEmployeesStatus();
    } catch (error) {
      console.log("Error while downloading timesheet report.", error);
      showToast("An error occurred while processing your request.", "error");
    }
  };

  const handleRejectSubmit = async () => {
    setShowConfirm(false);
    const data = {
      reason: rejectionReason,
    };
    try {
      setLoading(true);
      const response = await PostCall(`/rejectReport`, data);
      if (response?.data?.status === 200) {
        showToast(response?.data?.message, "success");
        setRejectionReason("");
        setShowConfirm(false);
        GetEmployeesStatus();
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.log("Error while downloading timesheet report.", error);
      showToast("An error occurred while processing your request.", "error");
    }
  };

  const handleReject = () => {
    setShowConfirm(true);
  };

  const handleCancel = () => {
    setRejectionReason("");
    setShowConfirm(false);
    setErrors({});
  };

  const handleReportPerPageChange = (event) => {
    const value = parseInt(event.target.value, 10);
    setReportPerPage(value);
    setCurrentPage(1);
  };

  // const paginatedRows = reportDetails?.slice(
  //   page * reportPerPage,
  //   page * reportPerPage + reportPerPage
  // );

  useEffect(() => {
    GetEmployeesStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, reportPerPage]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", JSON.stringify(token));
      dispatch(setUserInfo({ role: "Client" }));
    }
  }, [token, dispatch]);

  return (
    <div className="employee-report-list-container">
      <div className="employee-report-list-flex">
        <div className="employee-report-list-title">
          <h1>Employee List</h1>
        </div>
        <div className="employee-report-list-download-container">
          <div className="employee-report-list-input-container">
            <label className="label">Time Duration : </label>
          </div>
          <div className="employee-report-list-input-container">
            {dateEmployee?.startDate}
          </div>
          To
          <div className="employee-report-list-input-container">
            {dateEmployee?.endDate}
          </div>
        </div>
      </div>
      {status !== "Pending" && (
        <div className="employee-report-list-action-button">
          <div className="employee-report-list-input-container-status">
            <div className="Employeetimesheet-reason">
              <p>
                {status} by <b>{actionBy}</b>
              </p>

              {status === "Rejected" && rejectReason && (
                <p>
                  Reason: <b>{rejectReason}</b>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      {status === "Pending" && (
        <div className="employee-report-list-action-button">
          <div className="employee-report-list-input-container">
            <button
              label="Approve"
              // icon={GrDocumentDownload}
              onClick={handleApprove}
            >
              Approve
            </button>
          </div>
          <div className="employee-report-list-input-container reject">
            <button
              label="Reject"
              // icon={GrDocumentDownload}
              onClick={handleReject}
            >
              Reject
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loader-wrapper">
          <Loader />
        </div>
      ) : (
        <>
          {/* <CommonTable
            headers={tableHeaders}
            data={reportDetails?.employees?.map((report) => ({
              _id: report?._id,
              username: report?.userName,
              jobtitle: report?.jobTitle,
              role: report?.jobRole,
              status: report?.status,
              reason: report?.reason,
            }))}
            actions={{
              actionsList: actions,
            }}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showPerPage={reportPerPage}
            onPerPageChange={handlereportPerPageChange}
            handleAction={handleAction}
            isPagination="true"
            isSearchQuery={false}
            totalData={totalEmployee}
          /> */}
          <div className="scrollable-table-wrapper">
            <TableContainer>
              <Table
                aria-label="collapsible table"
                className="employeetimesheet-table"
              >
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell
                      sortDirection={
                        sortConfig.key === "userName"
                          ? sortConfig.direction
                          : false
                      }
                    >
                      <TableSortLabel
                        active={sortConfig.key === "userName"}
                        direction={
                          sortConfig.key === "userName"
                            ? sortConfig.direction
                            : "asc"
                        }
                        onClick={() => handleSort("userName")}
                      >
                        User Name
                      </TableSortLabel>
                    </TableCell>
                    <TableCell
                      sortDirection={
                        sortConfig.key === "jobTitle"
                          ? sortConfig.direction
                          : false
                      }
                    >
                      <TableSortLabel
                        active={sortConfig.key === "jobTitle"}
                        direction={
                          sortConfig.key === "jobTitle"
                            ? sortConfig.direction
                            : "asc"
                        }
                        onClick={() => handleSort("jobTitle")}
                      >
                        Job Title
                      </TableSortLabel>
                    </TableCell>
                    <TableCell
                      sortDirection={
                        sortConfig.key === "totalWorkingHours"
                          ? sortConfig.direction
                          : false
                      }
                    >
                      <TableSortLabel
                        active={sortConfig.key === "totalWorkingHours"}
                        direction={
                          sortConfig.key === "totalWorkingHours"
                            ? sortConfig.direction
                            : "asc"
                        }
                        onClick={() => handleSort("totalWorkingHours")}
                      >
                        Working Hours
                      </TableSortLabel>
                    </TableCell>
                    <TableCell
                      sortDirection={
                        sortConfig.key === "overTime"
                          ? sortConfig.direction
                          : false
                      }
                    >
                      <TableSortLabel
                        active={sortConfig.key === "overTime"}
                        direction={
                          sortConfig.key === "overTime"
                            ? sortConfig.direction
                            : "asc"
                        }
                        onClick={() => handleSort("overTime")}
                      >
                        Over Time
                      </TableSortLabel>
                    </TableCell>
                    <TableCell
                      sortDirection={
                        sortConfig.key === "totalHours"
                          ? sortConfig.direction
                          : false
                      }
                    >
                      <TableSortLabel
                        active={sortConfig.key === "totalHours"}
                        direction={
                          sortConfig.key === "totalHours"
                            ? sortConfig.direction
                            : "asc"
                        }
                        onClick={() => handleSort("totalHours")}
                      >
                        Total Hours
                      </TableSortLabel>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedRows && paginatedRows.length > 0 ? (
                    paginatedRows.map((row, index) => {
                      const actualIndex = totalPages * reportPerPage + index;
                      return (
                        <React.Fragment key={actualIndex}>
                          <TableRow>
                            <TableCell>
                              <IconButton
                                onClick={() => handleToggle(actualIndex)}
                              >
                                {openRows[actualIndex] ? (
                                  <KeyboardArrowUp />
                                ) : (
                                  <KeyboardArrowDown />
                                )}
                              </IconButton>
                            </TableCell>
                            <TableCell>{row?.userName}</TableCell>
                            <TableCell>{row?.jobTitle}</TableCell>
                            {/* <TableCell>{row?.jobRole}</TableCell> */}
                            <TableCell>{row?.totalWorkingHours}</TableCell>
                            <TableCell>{row?.overTime}</TableCell>
                            <TableCell>{row?.totalHours}</TableCell>
                          </TableRow>

                          <TableRow>
                            <TableCell
                              style={{ paddingBottom: 0, paddingTop: 0 }}
                              colSpan={6}
                            >
                              <Collapse
                                in={openRows[actualIndex]}
                                timeout="auto"
                                unmountOnExit
                              >
                                <Box margin={1}>
                                  <Typography variant="subtitle1" gutterBottom>
                                    Clock In/Out Entries
                                  </Typography>
                                  <Table size="small" aria-label="times">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Timing</TableCell>
                                        <TableCell>Working Hours</TableCell>
                                        <TableCell>Over Time</TableCell>
                                        <TableCell>Total Hours</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {row?.timesheetData?.map((entry) => (
                                        <TableRow key={entry?.date}>
                                          <TableCell>
                                            {moment(entry?.date).format(
                                              "YYYY-MM-DD (ddd)"
                                            )}
                                          </TableCell>
                                          <TableCell>
                                            {entry?.timesheetData?.clockinTime?.map(
                                              (clockEntry) => (
                                                <div
                                                  key={clockEntry?._id}
                                                  className="employeetimeesheet-timing"
                                                >
                                                  <span className="employee-timesheetclockin">
                                                    {moment(
                                                      clockEntry?.clockIn
                                                    ).format("LT")}{" "}
                                                    |{" "}
                                                  </span>
                                                  <span className="employee-timesheetclockout">
                                                    {moment(
                                                      clockEntry?.clockOut
                                                    ).format("LT")}
                                                  </span>
                                                  <span className="employee-timesheet-timming">
                                                    {" "}
                                                    | {clockEntry?.totalTiming}
                                                  </span>
                                                </div>
                                              )
                                            )}
                                          </TableCell>
                                          <TableCell>
                                            {entry?.timesheetData?.workingHours}
                                          </TableCell>
                                          <TableCell>
                                            {entry?.timesheetData?.overTime}
                                          </TableCell>
                                          <TableCell>
                                            {entry?.timesheetData?.totalHours}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Data not found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={10}>
                      <div className="employeetimesheet-count">
                        <p>
                          Total Hours: <b>{totalemployeereport}</b>
                        </p>
                        <TablePagination
                          component="div"
                          count={totalPages}
                          page={currentPage - 1}
                          onPageChange={handlePageChange}
                          rowsPerPage={reportPerPage}
                          onRowsPerPageChange={handleReportPerPageChange}
                          rowsPerPageOptions={[50, 100, 200]}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </div>
        </>
      )}
      {showConfirm && status === "Pending" && (
        <ApproveRejectConfirmation
          title={`Reject Timesheet Report`}
          message={`Are you sure you want to reject the Timesheet Report?`}
          placeholder="Enter Reason for rejection"
          reason={rejectionReason}
          setReason={setRejectionReason}
          onSubmit={() => handleRejectSubmit()}
          onCancel={handleCancel}
          error={errors}
          actionType={status}
          leaves={[]}
        />
      )}
    </div>
  );
};

export default EmployeesTimesheet;
