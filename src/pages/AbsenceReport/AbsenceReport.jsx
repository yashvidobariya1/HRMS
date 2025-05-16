import React, { useEffect, useState } from "react";
import "./AbsenceReport.css";
import JobTitleForm from "../../SeparateCom/RoleSelect";
import { useLocation } from "react-router";
import { GetCall, PostCall } from "../../ApiServices";
import { showToast } from "../../main/ToastManager";
import Loader from "../Helper/Loader";
import moment from "moment";
import CommonAddButton from "../../SeparateCom/CommonAddButton";
import { useSelector } from "react-redux";
import CommonTable from "../../SeparateCom/CommonTable";
import { MenuItem, Select } from "@mui/material";
import AssignClient from "../../SeparateCom/AssignClient";

const AbsenceReport = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const EmployeeId = queryParams.get("EmployeeId");
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(50);
  const [loading, setLoading] = useState(false);
  // const [errors, setErrors] = useState({});
  const [openJobTitleModal, setOpenJobTitleModal] = useState(false);
  const [absenceReportList, setAbsenceReportList] = useState([]);
  const [JobTitledata, setJobTitledata] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [openClietnSelectModal, setopenClietnSelectModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [Clientdata, setClientdata] = useState([]);
  const [isWorkFromOffice, setIsWorkFromOffice] = useState("");
  const startDate = process.env.REACT_APP_START_DATE || "2025-01-01";
  const startYear = moment(startDate).year();
  const currentYear = moment().year();
  const currentMonth = moment().month() + 1;
  const [selectedYear, setSelectedYear] = useState(currentYear);
  // const today = moment().format("YYYY-MM-DD");
  const [totalAbsencesheet, settotalAbsencesheet] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const jobRoleId = useSelector(
    (state) => state.jobRoleSelect.jobRoleSelect.jobId
  );
  const jobRoleisworkFromOffice = useSelector(
    (state) => state.jobRoleSelect.jobRoleSelect.isWorkFromOffice
  );
  const [appliedFilters, setAppliedFilters] = useState({
    year: currentYear,
    month: currentMonth,
  });

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePerPageChange = (e) => {
    setPerPage(e);
    setCurrentPage(1);
  };

  const handlePopupClose = () => {
    setOpenJobTitleModal(true);
  };

  const handleJobTitleSelect = (selectedTitle) => {
    setSelectedJobId(selectedTitle);
    const selectedJob = JobTitledata.find((job) => job.jobId === selectedTitle);
    if (selectedJob) {
      setIsWorkFromOffice(selectedJob.isWorkFromOffice);
      console.log("setIsWorkFromOffice", selectedJob.isWorkFromOffice);
    }
    setOpenJobTitleModal(true);
  };

  const GetAbsenceReport = async () => {
    try {
      setLoading(true);
      const filters = {
        jobId: EmployeeId ? selectedJobId : jobRoleId,
        userId: EmployeeId,
        clientId: selectedClientId,
      };
      const { year, month } = appliedFilters;

      const response = await PostCall(
        `/getAbsenceReport?page=${currentPage}&limit=${perPage}&year=${year}&month=${month}`,
        filters
      );

      if (response?.data?.status === 200) {
        setAbsenceReportList(response?.data?.report);
        settotalAbsencesheet(response.data.totalReports);
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
      if (EmployeeId) {
        response = await GetCall(`/getUserJobTitles?EmployeeId=${EmployeeId}`);
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

  const GetClientdata = async () => {
    const payload = {
      jobId: selectedJobId || jobRoleId,
      userId: EmployeeId,
    };

    try {
      const response = await PostCall(`/getUsersAssignClients`, payload);

      if (response?.data?.status === 200) {
        const jobTitles = response.data.assignClients;
        console.log("job title", jobTitles);
        setClientdata(jobTitles);

        if (jobTitles.length > 1) {
          setopenClietnSelectModal(false);
        } else {
          setSelectedClientId(jobTitles[0]?.clientId);
          setopenClietnSelectModal(true);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleClientPopupClose = () => {
    setopenClietnSelectModal(true);
  };

  const handleClientSelect = (selectedTitle) => {
    console.log("setSelectedClientId", selectedClientId);
    setSelectedClientId(selectedTitle);
    setopenClietnSelectModal(true);
  };

  useEffect(() => {
    const GetTimesheet =
      (EmployeeId && selectedJobId && selectedClientId) ||
      (!EmployeeId &&
        ((jobRoleId && jobRoleisworkFromOffice) ||
          (jobRoleId && !jobRoleisworkFromOffice && selectedClientId) ||
          (selectedJobId && !jobRoleisworkFromOffice && selectedClientId))) ||
      (selectedJobId && isWorkFromOffice);

    if (GetTimesheet) {
      GetAbsenceReport();
    }
  }, [
    EmployeeId,
    selectedJobId,
    selectedClientId,
    jobRoleId,
    isWorkFromOffice,
    jobRoleisworkFromOffice,
  ]);

  useEffect(() => {
    const GetClientData =
      (EmployeeId && selectedJobId && !isWorkFromOffice) ||
      (!EmployeeId && jobRoleId && !jobRoleisworkFromOffice);

    if (GetClientData) {
      GetClientdata();
    }
  }, [
    EmployeeId,
    selectedJobId,
    jobRoleId,
    isWorkFromOffice,
    jobRoleisworkFromOffice,
  ]);

  useEffect(() => {
    if (EmployeeId) {
      Getjobtitledata();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect(() => {
  //   if (EmployeeId) {
  //     if (selectedJobId) {
  //       GetAbsenceReport();
  //     }
  //   } else {
  //     GetAbsenceReport();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [
  //   selectedJobId,
  //   EmployeeId,
  //   currentPage,
  //   perPage,
  //   jobRoleId,
  //   appliedFilters,
  // ]);

  return (
    <div className="absencesheet-list-container">
      {!openJobTitleModal && JobTitledata.length > 1 && (
        <JobTitleForm
          onClose={handlePopupClose}
          jobTitledata={JobTitledata}
          onJobTitleSelect={handleJobTitleSelect}
        />
      )}
      {!openClietnSelectModal && Clientdata.length > 1 && (
        <AssignClient
          onClose={handleClientPopupClose}
          Clientdata={Clientdata}
          onClientSelect={handleClientSelect}
        />
      )}
      <div className="absencesheet-flex">
        <div className="absencesheet-title">
          <h1>Absence Report</h1>
        </div>
        <div className="absencesheet-report-filter-container">
          <div className="selection-wrapper">
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
              value={selectedYear}
              className="absence-dropdown"
              onChange={(e) => setSelectedYear(e.target.value)}
              MenuProps={{
                PaperProps: {
                  style: {
                    width: 80,
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxHeight: 192,
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
              className="absence-dropdown"
              value={selectedMonth}
              displayEmpty
              onChange={(e) => setSelectedMonth(e.target.value)}
              MenuProps={{
                PaperProps: {
                  style: {
                    width: 80,
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxHeight: 192,
                  },
                },
              }}
            >
              <MenuItem value="All">All</MenuItem>
              {months?.map((month) => (
                <MenuItem key={month.value} value={month.value}>
                  {month.name}
                </MenuItem>
              ))}
            </Select>
          </div>

          <CommonAddButton
            label={"Filter"}
            // icon={MdRateReview}
            onClick={applyFilters}
          />
        </div>
      </div>

      {loading ? (
        <div className="loader-wrapper">
          <Loader />
        </div>
      ) : (
        <>
          <CommonTable
            headers={["Absence Date", "Status"]}
            data={absenceReportList.map((absencesheet) => ({
              absencesheetdate: absencesheet.date,
              absencesheetstatus: absencesheet.status,
            }))}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showPerPage={perPage}
            onPerPageChange={handlePerPageChange}
            isPagination="true"
            isSearchQuery={false}
            totalData={totalAbsencesheet}
          />

          {/* <AbsencesheetTable
            headers={["Date", "Status", "Timing", "Total Hours", "OverTime"]}
            absenceReportList={absenceReportList}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showPerPage={perPage}
            onPerPageChange={handlePerPageChange}
        /> */}
        </>
      )}
    </div>
  );
};

export default AbsenceReport;
