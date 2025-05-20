import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router";
import { GetCall } from "../../ApiServices";
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
  TableHead,
  TablePagination,
  TableRow,
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
  localStorage.setItem("token", JSON.stringify(token));
  dispatch(setUserInfo({ role: "Client" }));
  const [openRows, setOpenRows] = useState({});
  const [errors, setErrors] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [status, setStatus] = useState("Pending");

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
        console.log(
          "report list",
          response.data?.reports.employeeTimesheetData
        );
        // setStatusList(response?.data?.report);
        // setStartDate(response?.data?.report?.startDate);
        // setEndDate(response?.data?.report?.endDate);
        setDateEmployee(response?.data?.reports);
        setTotalPages(response?.data?.totalPages);
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
    // try {
    //   setLoading(true);
    //   const response = await PostCall(`/approveReport`, data);
    //   if (response?.data?.status === 200) {
    //     showToast(response?.data?.message, "success");
    //   } else {
    //     showToast(response?.data?.message, "error");
    //   }
    //   setLoading(false);
    // } catch (error) {
    //   console.log("Error while downloading timesheet report.", error);
    //   showToast("An error occurred while processing your request.", "error");
    // }
    alert("submited suceesfully");
  };

  const handleRejectSubmit = async () => {
    const data = {
      reason: rejectionReason,
    };
    console.log("data", data);
    setShowConfirm(false);
    // if (!rejectionReason) {
    //   setErrors({ rejectionReason: "Rejection reason is required!" });
    //   return;
    // }
    // const data = {
    //   reportId,
    //   jobId,
    //   reason: rejectionReason,
    // };
    // try {
    //   setLoading(true);
    //   const response = await PostCall(`/rejectReport`, data);
    //   if (response?.data?.status === 200) {
    //     showToast(response?.data?.message, "success");
    //     setRejectionReason("");
    //     setErrors({});
    //     setShowConfirm(false);
    //   } else {
    //     showToast(response?.data?.message, "error");
    //   }
    //   setLoading(false);
    // } catch (error) {
    //   console.log("Error while downloading timesheet report.", error);
    //   showToast("An error occurred while processing your request.", "error");
    // }
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

  const [page, setPage] = useState(0);

  const ROWS_PER_PAGE = 5;
  const paginatedRows = reportDetails?.slice(
    page * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE + ROWS_PER_PAGE
  );

  useEffect(() => {
    GetEmployeesStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, reportPerPage]);

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
      <div className="employee-report-list-action-button">
        <div className="employee-report-list-input-container">
          {status === "Pending" && (
            <button
              label="Approve"
              // icon={GrDocumentDownload}
              onClick={handleApprove}
            >
              Approve
            </button>
          )}
        </div>
        <div className="employee-report-list-input-container reject">
          {status === "Pending" && (
            <button
              label="Reject"
              // icon={GrDocumentDownload}
              onClick={handleReject}
            >
              Reject
            </button>
          )}
        </div>
      </div>

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
                    <TableCell>User Name</TableCell>
                    <TableCell>Job Title</TableCell>
                    <TableCell>Job Role</TableCell>
                    <TableCell>Total Working</TableCell>
                    <TableCell>Total Hours</TableCell>
                    <TableCell>Overtime</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedRows?.map((row, index) => {
                    const actualIndex = page * ROWS_PER_PAGE + index;
                    return (
                      <React.Fragment key={actualIndex}>
                        <TableRow>
                          <TableCell>
                            <IconButton
                              // size="small"
                              onClick={() => handleToggle(actualIndex)}
                            >
                              {openRows[actualIndex] ? (
                                <KeyboardArrowUp />
                              ) : (
                                <KeyboardArrowDown />
                              )}
                            </IconButton>
                          </TableCell>
                          <TableCell>{row.userName}</TableCell>
                          <TableCell>{row.jobTitle}</TableCell>
                          <TableCell>{row.jobRole}</TableCell>
                          <TableCell>{row.totalWorkingHours}</TableCell>
                          <TableCell>{row?.totalHours}</TableCell>
                          <TableCell>{row?.overTime}</TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell
                            style={{ paddingBottom: 0, paddingTop: 0 }}
                            colSpan={7}
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
                                      <TableCell>Timming</TableCell>
                                      <TableCell>working Hours</TableCell>
                                      <TableCell>overTime</TableCell>
                                      <TableCell>totalHours</TableCell>
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
                                                className="employeetimeesheet-timming"
                                              >
                                                <span className="employee-timesheetclockin">
                                                  {" "}
                                                  {moment(
                                                    clockEntry?.clockIn
                                                  ).format("LT")}{" "}
                                                  |{" "}
                                                </span>
                                                <span className="employee-timesheetclockout">
                                                  {moment(
                                                    clockEntry?.clockOut
                                                  ).format("LT")}{" "}
                                                </span>
                                                <span className="employee-timesheet-timming">
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
                  })}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={totalPages}
                page={currentPage - 1}
                onPageChange={handlePageChange}
                rowsPerPage={reportPerPage}
                onRowsPerPageChange={handleReportPerPageChange}
                rowsPerPageOptions={[50, 100, 200]}
              />
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
