import React, { useEffect, useState } from "react";
import { GetCall } from "../../ApiServices";
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
  const [totalEmployees, settotalEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [openRows, setOpenRows] = useState({});

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const allStatusPending = statusList?.every(
    (item) => item.status === "Pending"
  );
  const handleToggle = (index) => {
    setOpenRows((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const tableHeaders = allStatusPending
    ? ["Employee Name", "Job Title", "Role", "status"]
    : ["", "Employee Name", "Job Title", "Role", "status"];

  const handlereportPerPageChange = (e) => {
    setReportPerPage(e);
    setCurrentPage(1);
  };

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
        `/getReportForClient?page=${currentPage}&limit=${reportPerPage}&reportId=${reportId}&companyId=${companyId}`
      );
      if (response?.data?.status === 200) {
        setStatusList(response?.data?.report?.employees);
        settotalEmployees(response.data.totalEmployees);
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
  }, [currentPage, reportPerPage, companyId]);

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
          // onClick={GoTOAddLocation}
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
                    <TableCell>Employee Name</TableCell>
                    <TableCell>Job Title</TableCell>
                    <TableCell>Job Role</TableCell>
                    {/* <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell> */}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {statusList?.map((row, index) => (
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
                        {/* <TableCell>{row?.totalHours}</TableCell>
                        <TableCell>{row?.overTime}</TableCell> */}
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
                                  {/* {row?.employeeTimesheetData.timesheetData?.map(
                                    (day) =>
                                      day?.employeeTimesheetData.timesheetData?.clockinTime?.map(
                                        (entry) => (
                                          <TableRow key={entry?._id}>
                                            <TableCell>
                                              {moment(entry?.clockIn).format(
                                                "L LTS"
                                              )}
                                            </TableCell>
                                            <TableCell>
                                              {moment(entry?.clockOut).format(
                                                "L LTS"
                                              )}
                                            </TableCell>
                                            <TableCell>
                                              {entry?.totalTiming}
                                            </TableCell>
                                          </TableRow>
                                        )
                                      )
                                  )} */}
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
          </div>
        </>
      )}
    </div>
  );
};

export default ViewStatus;
