import React, { useEffect, useState } from "react";
import { GetCall, PostCall } from "../../ApiServices";
import "./ViewStatus.css";
import Loader from "../Helper/Loader";
import { showToast } from "../../main/ToastManager";
import CommonTable from "../../SeparateCom/CommonTable";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
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
  TextField,
  Typography,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import moment from "moment";
import CommonAddButton from "../../SeparateCom/CommonAddButton";

const ViewStatus = () => {
  const [loading, setLoading] = useState(false);
  const [statusList, setStatusList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportPerPage, setReportPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(0);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const companyId = useSelector((state) => state.companySelect.companySelect);
  const reportId = searchParams.get("reportId");
  // const [totalEmployees, settotalEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [openRows, setOpenRows] = useState({});
  const [page, setPage] = useState(0);
  const [totalemployeereport, setTotalemployeereport] = useState("1");

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // const allStatusPending = statusList?.every(
  //   (item) => item.status === "Pending"
  // );

  const handleToggle = (index) => {
    setOpenRows((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  // const tableHeaders = allStatusPending
  //   ? ["Employee Name", "Job Title", "Role", "status"]
  //   : ["", "Employee Name", "Job Title", "Role", "status"];

  // const handlereportPerPageChange = (e) => {
  //   setReportPerPage(e);
  //   setCurrentPage(1);
  // };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const GetEmployeesStatus = async () => {
    try {
      setLoading(true);
      // const response = await GetCall(
      //   `/getReport/${reportId}?page=${currentPage}&limit=${reportPerPage}&companyId=${companyId}&search=${debouncedSearch}`
      // );
      console.log(reportId);
      const response = await GetCall(
        `/getReportForClient?page=${currentPage}&limit=${reportPerPage}&reportId=${reportId}&companyId=${companyId}&search=${debouncedSearch}`
      );
      if (response?.data?.status === 200) {
        setStatusList(response?.data?.reports?.employeeTimesheetData);
        // setTotalemployeereport(response?.data?.)
        // settotalEmployees(response.data.totalEmployees);
        setTotalPages(response?.data?.totalPages);
      } else {
        showToast(response?.data?.message);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleGenerateReportLink = async () => {
    try {
      setLoading(true);
      const data = {
        reportId: reportId,
      };
      const response = await PostCall(`/re-generateReportLink`, data);
      if (response?.data?.status === 200) {
        showToast(response?.data?.message, "success");
      } else {
        showToast(response?.data?.message);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleReportPerPageChange = (event) => {
    const value = parseInt(event.target.value, 10);
    setReportPerPage(value);
    setCurrentPage(1);
  };

  const paginatedRows = statusList?.slice(
    page * reportPerPage,
    page * reportPerPage + reportPerPage
  );

  useEffect(() => {
    GetEmployeesStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, reportPerPage, companyId, debouncedSearch]);

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

  return (
    <div className="status-list-container">
      <div className="status-list-flex">
        <div className="status-list-title">
          <h1>View Status</h1>
        </div>
        <TextField
          label="Search View status"
          variant="outlined"
          size="small"
          value={searchQuery}
          className="common-searchbar"
          onChange={handleSearchChange}
        />
      </div>
      <div className="viewstatus-action">
        <CommonAddButton
          label="Re send Link"
          // icon={FaLocationDot}
          onClick={handleGenerateReportLink}
        />
      </div>

      {loading ? (
        <div className="loader-wrapper">
          <Loader />
        </div>
      ) : (
        <>
          {/* <CommonTable
            headers={tableHeaders}
            data={statusList?.map((status) => ({
              _id: status._id,
              name: status?.userName,
              jobTitle: status?.jobTitle,
              jobRole: status?.jobTitle,
              status: status?.status,
              reason: status?.reason,
              // GeneratedBy:status?.creatorBy
            }))}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showPerPage={reportPerPage}
            onPerPageChange={handlereportPerPageChange}
            isPagination="true"
            isSearchQuery={false}
            totalData={totalEmployees}
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
                  {paginatedRows && paginatedRows.length > 0 ? (
                    paginatedRows.map((row, index) => {
                      const actualIndex = page * reportPerPage + index;
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
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Data not found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="employeetimesheet-count">
                <p>Total Emplyoees {totalemployeereport}</p>
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
            </TableContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default ViewStatus;
