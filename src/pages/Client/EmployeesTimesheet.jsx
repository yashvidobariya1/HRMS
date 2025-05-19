import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { GetCall } from "../../ApiServices";
import "./EmployeesTimesheet.css";
import Loader from "../Helper/Loader";
import { showToast } from "../../main/ToastManager";
import CommonTable from "../../SeparateCom/CommonTable";
import { useLocation } from "react-router-dom";
import { setUserInfo } from "../../store/userInfoSlice";
import { useDispatch } from "react-redux";
import {
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

const EmployeesTimesheet = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [reportDetails, setReportDetails] = useState({});
  const [showDropdownAction, setShowDropdownAction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportPerPage, setReportPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(0);
  const [totalEmployee, setTotalEmployee] = useState([]);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token");
  localStorage.setItem("token", JSON.stringify(token));
  dispatch(setUserInfo({ role: "Client" }));

  // const handlePageChange = (pageNumber) => {
  //   setCurrentPage(pageNumber);
  // };

  // const handleAction = (id) => {
  //   setShowDropdownAction(showDropdownAction === id ? null : id);
  // };

  const [openRows, setOpenRows] = useState({});
  const handleToggle = (index) => {
    setOpenRows((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const HandleAction = async (id) => {
    navigate(
      `/viewtimesheetreport?jobId=${id}&reportId=${reportDetails?._id}&startDate=${reportDetails?.startDate}&endDate=${reportDetails?.endDate}`
    );
  };

  const allStatusPending = reportDetails?.employees?.every(
    (item) => item.status === "Pending"
  );

  const tableHeaders = allStatusPending
    ? ["Employee Name", "Job Title", "Role", "status", "Action"]
    : ["", "Employee Name", "Job Title", "Role", "status", "Action"];

  const actions = [{ label: "Action", onClick: HandleAction }];

  const handlereportPerPageChange = (e) => {
    // setReportPerPage(parseInt(e.target.value, 10));
    setReportPerPage(e);
    setCurrentPage(1);
  };

  const GetEmployeesStatus = async () => {
    try {
      setLoading(true);
      const response = await GetCall(
        `/getReportForClient?page=${currentPage}&limit=${reportPerPage}`
      );
      if (response?.data?.status === 200) {
        setReportDetails(response?.data?.report);
        // setStatusList(response?.data?.report);
        // setStartDate(response?.data?.report?.startDate);
        // setEndDate(response?.data?.report?.endDate);
        setTotalEmployee(response?.data?.totalEmployees);
        setTotalPages(response?.data?.totalPages);
      } else {
        showToast(response?.data?.message);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

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
            {reportDetails?.startDate}
          </div>
          To
          <div className="employee-report-list-input-container">
            {reportDetails?.endDate}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loader-wrapper">
          <Loader />
        </div>
      ) : (
        <>
          <TableContainer>
            <Table aria-label="collapsible table">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>User Name</TableCell>
                  <TableCell>Job Title</TableCell>
                  <TableCell>Job Role</TableCell>
                  <TableCell>Total Hours</TableCell>
                  <TableCell>Overtime</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportDetails.map((row, index) => (
                  <React.Fragment key={index}>
                    <TableRow>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleToggle(index)}
                        >
                          {openRows[index] ? (
                            <KeyboardArrowUp />
                          ) : (
                            <KeyboardArrowDown />
                          )}
                        </IconButton>
                      </TableCell>
                      <TableCell>{row.userName}</TableCell>
                      <TableCell>{row.jobTitle}</TableCell>
                      <TableCell>{row.jobRole}</TableCell>
                      <TableCell>{row.timesheetData.totalHours}</TableCell>
                      <TableCell>{row.timesheetData.overTime}</TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                        colSpan={6}
                      >
                        <Collapse
                          in={openRows[index]}
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
                                  <TableCell>Clock In</TableCell>
                                  <TableCell>Clock Out</TableCell>
                                  <TableCell>Total Time</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {console.log(row?.timesheetData?.clockinTime)}
                                {row?.timesheetData?.clockinTime?.map(
                                  (entry) => (
                                    <TableRow key={entry?._id}>
                                      <TableCell>{entry?.clockIn}</TableCell>
                                      <TableCell>{entry?.clockOut}</TableCell>
                                      <TableCell>
                                        {entry?.totalTiming}
                                      </TableCell>
                                    </TableRow>
                                  )
                                )}
                              </TableBody>
                            </Table>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </div>
  );
};

export default EmployeesTimesheet;
