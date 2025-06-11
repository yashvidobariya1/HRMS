import React, { useEffect, useState } from "react";
// import { useLocation } from "react-router-dom";
import { BsDot } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import useApiServices from "../useApiServices";
import { setJobRoleSelect } from "../store/selectJobeRoleSlice";
import "./Subheader.css";
import { MenuItem, Select } from "@mui/material";
// import JobTitles from "../pages/JobTitles/JobTitles";
import { showToast } from "./ToastManager";

const pageNames = {
  dashboard: "Dashboard",
  settings: "Settings",
  company: "Company",
  addCompany: "Add Company",
  editcompany: "Update Company",
  contact: "Contact",
  employees: "Employees",
  addemployee: "Add Employee",
  addlocation: "Add Location",
  editemployee: "Update Employee",
  profile: "Profile",
  changepassword: "Change Password",
  employmentcontract: "Employment Contract",
  location: "Location",
  editlocation: "Update Location",
  templates: "Templates",
  loggedinuser: "Logged In User",
  leaves: "Leaves",
  holidays: "Holidays",
  absencereport: "Absence Report",
  clockin: "Clock In",
  // viewhours: "View Hours",
  staffviewhours: "Staff View Hours",
  myviewhours: "My View Hours",
  timesheetreport: "Timesheet Report",
  job: "Job",
  candidate: "Candidate",
  generateqrcode: "Generate QRcode",
  addleaves: "Add Leaves",
  leavesrequest: "Leave Request",
  holidaylist: "Holiday List",
  addholiday: "Add Holiday",
  editholiday: "Update Holiday",
  client: "Client List",
  addclient: "Add Client",
  editclient: "Update Client",
  editleave: "Update Leave",
  notification: "Notification",
  reportlist: "Report List",
  viewstatus: "View Status",
  viewtasks: "View Tasks",
  employeeclockin: "Employee Clock In-Out",
  addjob: "Add Job",
  editjob: "Update Job",
  applyjob: "Apply Job",
  clients: "Clients",
  jobtitles: "Job Titles",
  addjobtitles: "Add Job Title",
  daily: "Daily Report",
  weekly: "Weekly Report",
  monthly: "Monthly Report",
  myreport: "My Report",
  attendanceform: "Attendance",
  viewattendanceform: "View Attendance",
  editattendanceform: "Update Attendance",
};

const Subheader = () => {
  const { GetCall } = useApiServices();
  const [jobTitleData, setJobTitleData] = useState([]);
  const dispatch = useDispatch();
  // const location = useLocation();

  const selectedJob = useSelector((state) => state.jobRoleSelect.jobRoleSelect);
  // const jobRoleId = useSelector(
  //   (state) => state.jobRoleSelect.jobRoleSelect.jobId
  // );

  const formatPageName = (pathname) => {
    const idPattern = /^[a-fA-F0-9]{24}$/;
    return pathname
      .split("?")[0]
      .split("/")
      .filter(Boolean)
      .filter((path) => !idPattern.test(path))
      .map((path, index, arr) => (
        <React.Fragment key={index}>
          <span className="breadcrumb-item">
            {pageNames[path] || decodeURIComponent(path)}
          </span>
          {index < arr.length - 1 && <BsDot className="breadcrumb-icon" />}
        </React.Fragment>
      ));
  };

  const Getjobtitledata = async () => {
    try {
      const response = await GetCall("/getUserJobTitles");
      if (response?.data?.status === 200) {
        const { jobTitles } = response?.data;
        setJobTitleData(jobTitles);

        // const defaultJob = jobTitles[0];
        // console.log("defaultJob", defaultJob);
        // dispatch(setJobRoleSelect(defaultJob));
        if (!selectedJob?.jobName) {
          const defaultJob = jobTitles[0];
          dispatch(setJobRoleSelect(defaultJob));
        }
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (error) {
      console.error("Error fetching job titles:", error);
    }
  };

  useEffect(() => {
    // if (!jobRoleId) {
    Getjobtitledata();
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleJobTitleChange = (e) => {
    const selected = jobTitleData.find((job) => job.jobName === e.target.value);

    if (selected) {
      dispatch(setJobRoleSelect(selected));
    }
  };

  return (
    <section className="subheader-section">
      <div className="home-subheader-content">
        {/* <p className="page-title">{formatPageName(location.pathname)}</p> */}
        {jobTitleData.length > 1 && (
          // <select
          //   className="JobTitle-input"
          //   value={selectedJob?.jobName || ""}
          //   onChange={handleJobTitleChange}
          // >
          //   <option value="" disabled>
          //     Select a Job Title
          //   </option>
          //   {jobTitleData?.map((title) => (
          //     <option key={title.jobId} value={title.jobName}>
          //       {title.jobName}
          //     </option>
          //   ))}
          // </select>
          <Select
            className="JobTitle-input-dropdown"
            value={selectedJob?.jobName || ""}
            onChange={handleJobTitleChange}
            MenuProps={{
              PaperProps: {
                style: {
                  width: 80,
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxHeight: 80,
                },
              },
            }}
          >
            {jobTitleData.map((title) => (
              <MenuItem key={title.jobId} value={title.jobName}>
                {title.jobName}
              </MenuItem>
            ))}
          </Select>
        )}
      </div>
    </section>
  );
};

export default Subheader;
