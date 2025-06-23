// import React, { useCallback, useState, useEffect, useRef } from "react";
// import { SlOptionsVertical } from "react-icons/sl";
// import "../SeparateCom/CommonTable.css";
// import Pagination from "../main/Pagination";

// const CommonTable = ({
//   headers,
//   data,
//   actions,
//   handleAction,
//   currentPage,
//   totalPages,
//   onPageChange,
//   showPerPage,
//   onPerPageChange,
//   isPagination,
// }) => {
//   const showActionColumn = headers.includes("Action");
//   const [isDropdownOpen, setIsDropdownOpen] = useState(null);
//   const dropdownRefs = useRef({});

//   const getStatusColor = (status) => {
//     if (status === "Pending") return "Pending";
//     if (status === "Rejected") return "Rejected";
//     if (status === "Approved") return "Approved";
//     return "gray";
//   };

//   const getPaidLeaveColor = (isPaidLeave) => {
//     return isPaidLeave === "Paid" ? "green" : "red";
//   };

//   const handleClickOutside = useCallback(
//     (event) => {
//       if (
//         isDropdownOpen !== null &&
//         dropdownRefs.current[isDropdownOpen] &&
//         !dropdownRefs.current[isDropdownOpen].contains(event.target)
//       ) {
//         setIsDropdownOpen(null);
//       }
//     },
//     [isDropdownOpen]
//   );

//   useEffect(() => {
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [handleClickOutside]);

//   const handleDropdownToggle = (id) => {
//     setIsDropdownOpen(isDropdownOpen === id ? null : id);
//   };

//   // const handleDropdownToggle = (id, event) => {
//   //   setIsDropdownOpen(isDropdownOpen === id ? null : id);

//   //   setTimeout(() => {
//   //     const dropdownEl = dropdownRefs.current[id]?.querySelector(".dropdown-menu");

//   //     if (!dropdownEl) return;

//   //     // Get button position
//   //     const buttonRect = event.target.getBoundingClientRect();

//   //     // Set dropdown styles dynamically
//   //     dropdownEl.style.position = "fixed"; // Takes dropdown out of table flow
//   //     dropdownEl.style.left = `${buttonRect.left}px`;
//   //     dropdownEl.style.width = `${buttonRect.width}px`;

//   //     // Check space below the button
//   //     const dropdownHeight = dropdownEl.offsetHeight;
//   //     const viewportHeight = window.innerHeight;

//   //     if (buttonRect.bottom + dropdownHeight > viewportHeight) {
//   //       // Show dropdown above if not enough space below
//   //       dropdownEl.style.top = `${buttonRect.top - dropdownHeight}px`;
//   //     } else {
//   //       // Show dropdown below
//   //       dropdownEl.style.top = `${buttonRect.bottom}px`;
//   //     }

//   //     // Ensure dropdown doesn't overflow right side
//   //     const dropdownRight = buttonRect.left + dropdownEl.offsetWidth;
//   //     if (dropdownRight > window.innerWidth) {
//   //       dropdownEl.style.left = `${window.innerWidth - dropdownEl.offsetWidth - 10}px`;
//   //     }

//   //     // Set max height with scroll if needed
//   //     dropdownEl.style.maxHeight = "200px";
//   //     dropdownEl.style.overflowY = "auto";
//   //   }, 0);
//   // };

//   return (
//     <>
//       <div className="table-container">
//         <table className="common-table">
//           <thead>
//             <tr>
//               {headers.map((header, index) => (
//                 <th key={index}>{header}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {data?.map((item, i) => (
//               <tr key={i}>
//                 {Object.keys(item).map((key, index) => {
//                   if (key === "email") {
//                     return (
//                       <td key={index}>
//                         {Array.isArray(item[key])
//                           ? item[key].map((email, emailIndex) => (
//                               <div key={emailIndex}>{email}</div>
//                             ))
//                           : item[key]}
//                       </td>
//                     );
//                   } else if (
//                     key !== "_id" &&
//                     key !== "status" &&
//                     key !== "isPaidLeave" &&
//                     key !== "leaves"
//                   ) {
//                     return <td key={index}>{item[key]}</td>;
//                   }
//                   if (key === "status") {
//                     return (
//                       <td key={index}>
//                         <span
//                           className={`status-circle ${getStatusColor(
//                             item[key]
//                           )}`}
//                         ></span>
//                         {item[key]}
//                       </td>
//                     );
//                   }
//                   if (key === "isPaidLeave") {
//                     return (
//                       <td key={index}>
//                         <div
//                           className={`paid-leave-status ${getPaidLeaveColor(
//                             item[key]
//                           )}`}
//                         >
//                           {item[key]}
//                         </div>
//                       </td>
//                     );
//                   }
//                   return null;
//                 })}
//                 {showActionColumn && (
//                   <td>
//                     <div
//                       className="dropdown-container"
//                       ref={(el) => (dropdownRefs.current[item?._id] = el)}
//                     >
//                       <SlOptionsVertical
//                         data-testid="action-button"
//                         onClick={() => {
//                           handleAction(item?._id, item?.employeeName);
//                           handleDropdownToggle(item?._id);
//                         }}
//                       />

//                       {/* <SlOptionsVertical
//                       onClick={(event) => {
//                         handleAction(item?._id, item?.employeeName);
//                         handleDropdownToggle(item?._id, event);
//                       }}
//                     /> */}

//                       {isDropdownOpen === item?._id && (
//                         <div className="dropdown-menu">
//                           {actions?.actionsList.map((action, id1) => (
//                             <button
//                               key={id1}
//                               // disabled={
//                               //   item.status !== "Pending" ||
//                               //   (item.status && action.label
//                               //     ? item.status.startsWith(action.label)
//                               //     : false)
//                               // }
//                               disabled={
//                                 // item.isOldDocument ||
//                                 (["Approved", "Rejected"].includes(
//                                   item.status
//                                 ) &&
//                                   (action.label === "Edit" ||
//                                     action.label === "Delete")) ||
//                                 (item.status && action.label
//                                   ? item.status.startsWith(action.label)
//                                   : false)
//                               }
//                               onClick={() => {
//                                 action.onClick(
//                                   item?._id,
//                                   item?.name,
//                                   item?.leaves ? item?.leaves : "",
//                                   item?.selectionDuration
//                                     ? item?.selectionDuration
//                                     : ""
//                                 );
//                                 setIsDropdownOpen(null);
//                               }}
//                             >
//                               {action.label}
//                             </button>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   </td>
//                 )}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//       {isPagination === "true" && (
//         <Pagination
//           currentPage={currentPage}
//           totalPages={totalPages}
//           onPageChange={onPageChange}
//           showPerPage={showPerPage}
//           onPerPageChange={onPerPageChange}
//         />
//       )}
//     </>
//   );
// };

// export default CommonTable;
import React, { useState } from "react";
import "../SeparateCom/CommonTable.css";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Box,
  IconButton,
  Menu,
  MenuItem,
  TableFooter,
  TablePagination,
  TableSortLabel,
  Collapse,
  Typography,
  FormControl,
  Select,
  ListSubheader,
  TextField,
} from "@mui/material";
import { SlOptionsVertical } from "react-icons/sl";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
// import { useLocation } from "react-router";
// import { useSelector } from "react-redux";
import moment from "moment";
import { BsHourglassSplit } from "react-icons/bs";
import "../SeparateCom/CommonTable.css";
import { useNavigate } from "react-router";

const CommonTable = ({
  headers,
  data,
  actions,
  // totalPages,
  showPerPage,
  onPageChange,
  onPerPageChange,
  currentPage,
  isPagination,
  searchQuery,
  isSearchQuery,
  totalData,
  tableName,
  // setSearchQuery,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [templateSearchTerms, setTemplateSearchTerms] = useState({});
  // const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(showPerPage);
  const [sortConfig, setSortConfig] = React.useState({
    key: "",
    direction: "asc",
  });
  const [openRow, setOpenRow] = useState(null);
  // const [templateSearchTerm, setTemplateSearchTerm] = useState("");
  const navigate = useNavigate();
  // const location = useLocation();
  const page = 0;
  // const params = new URLSearchParams(location.search);

  // const isLeavePage =
  //   location.pathname === "/leaves" ||
  //   location.pathname === "/leavesrequest" ||
  //   (location.pathname === "/leaves/leavesrequest" &&
  //     jobIdFromURL === jobRoleId);

  const handleMenuOpen = (event, rowId) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(rowId);
  };

  const handleSearchChange = (id, value) => {
    setTemplateSearchTerms((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleViewClick = (id) => {
    navigate(`/reportlist/viewstatus?reportId=${id}`);
  };

  // const handleChangePage = (event, newPage) => {
  //   setPage(newPage);
  // };

  // const handleChangeRowsPerPage = (event) => {
  //   setRowsPerPage(parseInt(event.target.value, 10));
  //   setPage(0);
  // };

  // const checkforReson = (item) => {
  //   const reasonItemList = [
  //     "reason",
  //     "rejectionReason",
  //     "approvalReason",
  //     "roleWisePoints",
  //     "reasonOfLeave",
  //   ];
  //   // console.log("item===>", item, Object.keys(item));
  //   return Object.keys(item).some((key) => reasonItemList.includes(key));
  // };

  const checkforReson = (item) => {
    const reasonItemList = [
      "reason",
      "rejectionReason",
      "approvalReason",
      "roleWisePoints",
      "reasonOfLeave",
    ];
    // return reasonItemList.some(
    //   (key) => item[key] !== undefined && item[key] !== null && item[key] !== ""
    // );
    return reasonItemList.some((key) => key in item);
  };

  // const checkforReson = (item) => {
  //   const reasonItemList = [
  //     "reason",
  //     "rejectionReason",
  //     "approvalReason",
  //     "roleWisePoints",
  //     "reasonOfLeave",
  //   ];

  //   const hasReason = reasonItemList.some(
  //     (key) => item[key] !== undefined && item[key] !== null && item[key] !== ""
  //   );

  //   const hasSpecialStatus =
  //     item.status === "Approved" || item.status === "Reject";

  //   return hasReason || hasSpecialStatus;
  // };

  // const keyMap = {
  //   EmployeeName: "username",
  //   EmployeeName: "uname",
  //   EmployeePhone: "userphone",
  // };

  const keyMap = {
    employee: {
      Id: "_id",
      "Employee Name": "Name",
      "Job Title": "JobTitle",
      Phone: "Phone",
      "Email Id": "Email",
      Position: "Position",
    },
    loggedinuser: {
      "Employee Name": "Name",
      Role: "Role",
      "Login Time": "LastTimeLoggedIn",
      "Last Access Time": "LastTimeLoggedOut",
      Active: "IsActive",
      Browser: "UsedBrowser",
    },
    company: {
      "Business Name": "Name",
      "Company Code": "CompanyCode",
      City: "City",
    },
    Client: {
      "Client Name": "Name",
      // Email: "email",
      City: "City",
      "Mobile Number": "contactNumber",
    },
    ReportList: {
      "Client name": "clientName",
      "Start Date": "startDate",
      "End Date": "endDate",
      "Generated on": "generatedDate",
      "Action By": "actionBy",
      Status: "reportstatus",
    },
    EmployeeContract: {
      "Contract Name": "Name",
      "File name": "ContractFileName",
      Company: "CompanyName",
      "Uploaded By": "UploadBy",
    },
    Location: {
      "Location Name": "Name",
      Address: "Address",
      City: "City",
      "Post Code": "Postcode",
    },
    Templates: {
      "Template Name": "Name",
      "File Name": "TemplateFileName",
      "Uploaded By": "UploadBy",
      "Updated Date": "CreatedAt",
    },
    AbsenceReport: {
      "Absent Date": "absencesheetdate",
      "Employee Name": "Name",
      "Location Name": "absencelocationandorclientName",
      "Client Name": "absencelocationandorclientName",
      "Job Title": "jobRole",
    },
    MyAbsencereport: {
      "Absent Date": "",
      "Employee Name": "Name",
      "Location Name": "absencelcaotionandorclientName",
      "Client Name": "absencelcaotionandorclientName",
      "Job Title": "jobRole",
    },
    Candidate: {
      "First name": "Name",
      "Last name": "lastname",
      "Candidate Email": "email",
      Contact: "phonenumber",
    },
    Clockinout: {
      "ClockIn Time": "clockin",
      "ClockOut Time": "clockout",
      "Working Time": "workingTime",
    },
    EmployeeJob: {
      "Job Title": "Name",
      "Annual Salary": "annualSalary",
      "Joining Date": "joiningDate",
    },
    EmployeeDocument: {
      "Document Type": "Name",
    },
    Profile: {
      "Document Type": "name",
      "Document Name": "document",
    },
    ProfileUploadFile: {
      "Document Type": "name",
      "Document Name": "document",
    },
    GenerateQR: {
      "QRCode Value": "Name",
      "Location Name": "LocationName",
      "Client Name": "ClientName",
      "Company Name": "companyName",
      Status: "isactive",
      "Generated On": "",
      "QR Code": "",
    },
    Generateqrforclient: {
      "QRCode Value": "",
      "Client Name": "ClientName",
      "Company Name": "companyName",
    },
    HolidayList: {
      "Company Name": "comapnyName",
      Date: "name",
      Occasion: "Name",
      Day: "day",
    },
    Job: {
      "Job Title": "Name",
      Description: "jobDescription",
      "Client Name": "clientName",
      Category: "jobCategory",
      "Apply Date": "jobApplyTo",
      Email: "useremail",
      "Apply Link": "jobPostedLink",
    },
    JobTitle: {
      "Job Title Name": "Name",
      Status: "Status",
    },
    LeaveRequest: {
      Employee: "Name",
      "Leave Date": "StartDate",
      Duration: "SelectionDuration",
      "Requested Leave": "TotalLeaveDays",
      "Approved Leave": "NumberOfApproveLeaves",
      "Leave status": "status",
      "Leave Type": "leaveType",
    },
    Leaves: {
      Employee: "Name",
      "Leave Date": "startDate",
      Duration: "selectionDuration",
      "Leave status": "status",
      "Leave Type": "leaveType",
    },
    ShowNofitciation: {
      User: "userName",
      Type: "type",
      Message: "message",
      Time: "createdAt",
    },
    TimesheetReport: {
      Date: "timesheetdate",
      "Timesheet Status": "timesheetstatus",
      "Total Hours": "totalHours",
      OverTime: "overTime",
    },
    Myviewhour: {
      "Employee Name": "Name",
      "Job Title": "jobTitle",
      "Client Name": "clientName",
      "Location Name": "locationName",
      "Clock In": "in",
      "Clock Out": "out",
      "Total Hours": "totalHours",
    },
    Viewhours: {
      "Employee Name": "Name",
      "Job Title": "jobTitle",
      "Location Name": "locationName",
      "Client Name": "clientName",
      "Clock In": "in",
      "Clock Out": "out",
      "Total Hours": "totalHours",
    },
    MyViewTask: {
      "Task Date": "taskdate",
      "Employee Name": "userName",
      "Job Title": "jobRole",
      "Location Name": "taskloctionandorclientName",
      "Client Name": "taskloctionandorclientName",
      "Start Time": "starttime",
      "End Time": "endtime",
    },
    ViewTask: {
      "Task Date": "taskdate",
      "Employee Name": "userName",
      "Job Title": "jobRole",
      "Location Name": "taskloctionandorclientName",
      "Client Name": "taskloctionandorclientName",
      "Start Time": "starttime",
      "End Time": "endtime",
    },
  };

  // const handleSort = (key) => {
  //   const mappedKey = keyMap[key] || key;
  //   // console.log("Sorting by:", mappedKey);

  //   setSortConfig((prevSort) => {
  //     let direction = "asc";
  //     if (prevSort.key === mappedKey && prevSort.direction === "asc") {
  //       direction = "desc";
  //     }
  //     return { key: mappedKey, direction };
  //   });
  // };

  const handleSort = (columnName, tableName) => {
    const mappedKey = keyMap[tableName]?.[columnName] || columnName;

    setSortConfig((prevSort) => {
      let direction = "asc";
      if (prevSort.key === mappedKey && prevSort.direction === "asc") {
        direction = "desc";
      }
      return { key: mappedKey, direction };
    });
  };

  // const sortedData = React.useMemo(() => {
  //   if (!data) return [];
  //   if (!sortConfig.key) return [...data];
  //   return [...data].sort((a, b) => {
  //     const valueA = a[sortConfig.key];
  //     const valueB = b[sortConfig.key];
  //     // console.log(data);
  //     if (typeof valueA === "string") {
  //       return sortConfig.direction === "asc"
  //         ? valueA.localeCompare(valueB)
  //         : valueB.localeCompare(valueA);
  //     } else {
  //       return sortConfig.direction === "asc"
  //         ? valueA - valueB
  //         : valueB - valueA;
  //     }
  //   });
  // }, [data, sortConfig]);

  const sortedData = React.useMemo(() => {
    if (!data) return [];

    const { key, direction } = sortConfig;
    if (!key) return [...data];

    return [...data].sort((a, b) => {
      const valueA = a[key];
      const valueB = b[key];

      if (typeof valueA === "string") {
        return direction === "asc"
          ? valueA?.localeCompare(valueB)
          : valueB?.localeCompare(valueA);
      } else {
        return direction === "asc" ? valueA - valueB : valueB - valueA;
      }
    });
  }, [data, sortConfig]);

  // const keyMap = {
  //   "Template Name": "TemplateFileName",
  //   "Business Name": "Name",
  //   "Company Code": "CompanyCode",
  //   "File name": "ContractFileName",
  //   "File Name ": "TemplateFileName",
  //   Company: "CompanyName",
  //   Type: "type",
  //   Message: "message",
  //   Time: "createdAt",
  //   "Leave Date": "StartDate",
  //   "Leave Type": "leaveType",
  //   "Leave status": "status",
  //   "Updated Date": "CreatedAt",
  //   "Uploaded By": "UploadBy",
  //   "Post Code": "Postcode",
  //   "Contract Name": "Name",
  //   "Location Name": "Name",
  //   "Requested Leave": "TotalLeaveDays",
  //   "Approved Leave": "NumberOfApproveLeaves",
  //   CreatedAt: "CreatedAt",
  //   Employee: "Name",
  //   leaveDate: "leaveDate",
  //   Duration: "SelectionDuration",
  //   // "Leave status": "Status",
  //   Name: "ClientName",
  //   User: "userName",
  //   "Mobile Number": "contactNumber",
  //   //  "Name":"locationName",
  //   "Company Name": "companyName",
  //   "Generated On": "date",
  //   Title: "Name",
  //   Description: "jobDescription",
  //   Location: "jobLocation",
  //   Category: "jobCategory",
  //   "Apply Date": "jobApplyTo",
  //   "Client Email": "email",
  //   Email: "useremail",
  //   "Client Name": "Name",
  //   "Start Date": "startDate",
  //   "End Date": "endDate",
  //   "Generated on": "generatedDate",
  //   "Login Time": "LastTimeLoggedIn",
  //   "Last Access Time": "LastTimeLoggedOut",
  //   Active: "IsActive",
  //   Browser: "UsedBrowser",
  //   "Absent Date": "absencesheetdate",
  //   "Job Title": "Name",
  //   "Annual Salary": "annualSalary",
  //   "Joining Date": "joiningDate",
  //   "Document Type": "Name",
  //   "Document Name": "document",
  //   "User Name": "Name",
  //   "Employee Name": "Name",
  //   Position: "Position",
  //   "Email Id": "Name",
  //   Occasion: "Name",
  //   Day: "day",
  //   Id: "_id",
  //   Client: "clientName",
  //   "First name": "Name",
  //   "Last name": "lastname",
  //   Contact: "phonenumber",
  //   "Candidate Email": "email",
  //   "QRCode Value": "Name",
  //   Date: "timesheetdate",
  //   status: "timesheetstatus",
  //   Timing: "totalTiming",
  //   "Total Hours": "totalHours",
  //   OverTime: "overTime",
  //   "Timesheet Status": "timesheetstatus",
  //   "ClockIn Time": "clockin",
  //   "ClockOut Time": "clockout",
  //   "Working Time": "workingTime",
  //   "Job Title Name": "Name",
  //   "Client name": "clientName",
  //   "Location Name": "absencelocationandorclientName",
  //   "Client Name": "absencelocationandorclientName",
  //   "Job Title": "jobRole",
  //   "Task Date": "taskdate",
  //   "Start Time": "starttime",
  //   "End Time": "endtime",
  //   "Client Name ": "taskloctionandorclientName",
  //   "Location Name ": "taskloctionandorclientName",
  //   "Job Title ": "jobRole",
  //   "Employee Name ": "userName",
  //   "Employee Name ": "Name",
  //   "Job Title": "jobTitle",
  //   "Client Name  ": "ClientName",
  //   "Location Name  ": "locationName",
  //   "Clock In": "in",
  //   "Clock Out": "out",
  // };

  // const keymap = {
  //   company: {
  //     "Business Name": "company.Name",
  //     "Company Code": "company.CompanyCode",
  //     City: "company.city",
  //   },
  // };

  // const handleSort = (columnName, tableName) => {
  //   const mappedKey = keymap[tableName]?.[columnName] || columnName;
  //   console.log("column ==>", columnName);
  //   console.log("table name==>", keymap[tableName], tableName);

  //   setSortConfig((prevSort) => {
  //     let direction = "asc";
  //     if (prevSort.key === mappedKey && prevSort.direction === "asc") {
  //       direction = "desc";
  //     }
  //     return { key: mappedKey, direction };
  //   });
  // };

  // const getNestedValue = (obj, path) => {
  //   if (!path || !obj) return "";
  //   console.log("obj, path ==>", obj, path);

  //   return path.split(".").reduce((acc, part) => {
  //     if (acc === null || acc === undefined) return "";
  //     return acc[part] ?? "";
  //   }, obj);
  // };

  // const sortedData = React.useMemo(() => {
  //   if (!data || !sortConfig.key) return [...data];

  //   return [...data].sort((a, b) => {
  //     const valueA = getNestedValue(a, sortConfig.key);
  //     const valueB = getNestedValue(b, sortConfig.key);

  //     const valA = valueA?.toString().toLowerCase() ?? "";
  //     const valB = valueB?.toString().toLowerCase() ?? "";

  //     if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
  //     if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
  //     console.log("valueA", valA);
  //     console.log("valueB", valB);
  //     return 0;
  //   });
  // }, [data, sortConfig]);

  console.log("filter", searchQuery);

  const filteredData = React.useMemo(() => {
    if (!isSearchQuery || !searchQuery?.trim()) return sortedData;

    return sortedData?.filter((item) =>
      Object.values(item)?.some((value) =>
        value?.toString().toLowerCase().includes(data?.toLowerCase())
      )
    );
  }, [isSearchQuery, data, sortedData]);

  // const paginatedData = filteredData.slice(
  //   page * showPerPage || 1,
  //   page * showPerPage + showPerPage
  // );

  const paginatedData = filteredData.slice(
    rowsPerPage === undefined ? undefined : page * rowsPerPage,
    rowsPerPage === undefined ? undefined : page * rowsPerPage + rowsPerPage
  );

  const getStatusColor = (status) => {
    if (status === "Pending") return "Pending";
    if (status === "Rejected") return "Rejected";
    if (status === "Approved" || status === "Reviewed") return "Approved";
    return "gray";
  };

  const reportgetStatusColor = (status) => {
    if (status === "Pending") return "Pending";
    if (status === "Rejected") return "Rejected";
    if (status === "Approved" || status === "Reviewed") return "Approved";
    return "gray";
  };

  // const handleSearchChange = (event) => {
  //   setSearchQuery(event.target.value);
  // };
  const mappedKey = keyMap[tableName]?.[headers] || headers;
  console.log("map key", mappedKey);

  return (
    <Box>
      {/* <Box>
        <TextField
          label="Search"
          variant="outlined"
          className="commontable-searchbar"
          value={searchQuery}
          onChange={handleSearchChange}
          className="common-searchbar"
        />
      </Box> */}

      <Paper
        className="custom-table"
        style={{
          overflowX: "auto",
          scrollbarWidth: "thin",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              {headers.map((header, index) => (
                <TableCell key={index} sx={{ fontWeight: "bold" }}>
                  {header === "Action" ||
                  header === "Read" ||
                  header === "Status" ||
                  header === "Email" ||
                  header === "Document Name" ||
                  header === "Template" ||
                  header === "QR Code" ||
                  header === "View" ||
                  header === "Timing" ||
                  header === "Active QR" ||
                  header === "" ? (
                    header
                  ) : (
                    <TableSortLabel
                      active={
                        sortConfig.key ===
                        (keyMap[tableName]?.[header] || header)
                      }
                      direction={
                        sortConfig.key ===
                        (keyMap[tableName]?.[header] || header)
                          ? sortConfig.direction
                          : "asc"
                      }
                      onClick={() => handleSort(header, tableName)}
                    >
                      {header}
                    </TableSortLabel>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item, i) => (
                <React.Fragment key={i}>
                  {item.timesheetdate &&
                  (item.holiday || item.absent || item.leave) ? (
                    <TableRow>
                      <TableCell>
                        {/* {console.log("timesheetdate", item)} */}
                        {moment(item.timesheetdate).format("DD-MM-YYYY")} (
                        {moment(item.timesheetdate).format("ddd")})
                      </TableCell>
                      <TableCell colSpan={headers.length - 1}>
                        {/* {console.log(item)} */}
                        {(() => {
                          let statusText = "";
                          if (item.holiday) {
                            statusText += `Holiday: ${
                              item.Holidayoccsion || ""
                            }`;
                          }

                          // {
                          //   console.log(" item.Holidayoccsion", item.holiday);
                          // }
                          if (item.leave) {
                            statusText += `Leave: ${item.leaveReason || ""}`;
                          }
                          if (item.absent) {
                            statusText += " Absent";
                          }
                          return statusText || "Present";
                        })()}
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow
                      className={
                        item.hasOwnProperty("isRead")
                          ? item.isRead
                            ? "read-notification"
                            : "unread-notification"
                          : ""
                      }
                    >
                      {/* {checkforReson(item) && (
                        <TableCell>
                          {console.log("1", item)}
                          {item.rejectionReason ||
                          item.approvalReason ||
                          (item.reason && item.reason !== "") ||
                          item.reason ||
                          item.status ||
                          (item.status === "Approved" || item.status === "Reject") ||
                          item.roleWisePoints ? (
                            <IconButton
                              onClick={() =>
                                setOpenRow(openRow === i ? null : i)
                              }
                            >
                              {openRow === i ? (
                                <KeyboardArrowUp />
                              ) : (
                                <KeyboardArrowDown />
                              )}
                            </IconButton>
                          ) : (
                            ""
                          )}
                        </TableCell>
                      )} */}
                      {checkforReson(item) &&
                      (item.rejectionReason ||
                        item.approvalReason ||
                        (item.reason && item.reason !== "") ||
                        // item.reason ||
                        item.status ||
                        item.status === "Approved" ||
                        item.status === "Reject" ||
                        item.roleWisePoints) ? (
                        <TableCell>
                          {item.reasonOfLeave !== "" ? (
                            <IconButton
                              onClick={() =>
                                setOpenRow(openRow === i ? null : i)
                              }
                            >
                              {openRow === i ? (
                                <KeyboardArrowUp />
                              ) : (
                                <KeyboardArrowDown />
                              )}
                            </IconButton>
                          ) : (
                            <></>
                          )}
                        </TableCell>
                      ) : item.status === "Approved" ||
                        item.status === "rejected" ? (
                        <TableCell></TableCell>
                      ) : (
                        ""
                      )}

                      {Object.keys(item)
                        .filter(
                          (key) =>
                            ![
                              "_id",
                              "isPaidLeave",
                              "leaves",
                              "rejectionReason",
                              "approvalReason",
                              "isActive",
                              "holiday",
                              "clockIn",
                              "clockOut",
                              "Holidayoccsion",
                              "leave",
                              "absent",
                              "leaveReason",
                              "isRead",
                              "roleWisePoints",
                              "reason",
                              "reasonOfLeave",
                              "qrValue",
                            ].includes(key)
                        )
                        .map((key, index) => (
                          <TableCell
                            key={index}
                            className={
                              key === "totalTiming" ? "timing-cell" : ""
                            }
                          >
                            {key === "jobPostedLink" ? (
                              <>
                                {/* {console.log("item[key]", item[key])} */}
                                <p
                                  style={{
                                    color: "blue",
                                    textDecoration: "underline",
                                    cursor: "pointer",
                                    margin: "0px",
                                  }}
                                  onClick={() => window.open(item[key])}
                                >
                                  Apply Link
                                </p>
                              </>
                            ) : (
                              (() => {
                                if (key === "timesheetdate") {
                                  return moment(item[key]).format(
                                    "DD/MM/YYYY (ddd)"
                                  );
                                }

                                if (key === "email") {
                                  return Array.isArray(item[key])
                                    ? item[key].map((email, emailIndex) => (
                                        <div key={emailIndex}>{email}</div>
                                      ))
                                    : item[key];
                                }

                                if (key === "document") {
                                  return Array.isArray(item[key])
                                    ? item[key].map((documentName, index) => (
                                        <div
                                          key={index}
                                          className="uploadfile-flex"
                                        >
                                          {documentName}
                                        </div>
                                      ))
                                    : item[key];
                                }

                                if (key === "jobDescription" && item[key]) {
                                  const words = item[key].split(" ");
                                  const limited = words.slice(0, 20).join(" ");
                                  const shortened =
                                    words.length > 20
                                      ? `${limited}...`
                                      : item[key];

                                  return (
                                    <div title={item[key]}>{shortened}</div>
                                  );
                                }

                                if (key === "Activeuser") {
                                  return item[key] ? "Active" : "Inactive";
                                }

                                if (key === "status") {
                                  return (
                                    <Box
                                      display="flex"
                                      alignItems="center"
                                      gap={1}
                                    >
                                      <span
                                        className={`status-circle ${getStatusColor(
                                          item[key]
                                        )}`}
                                      />
                                      <span>{item[key]}</span>
                                    </Box>
                                  );
                                }

                                if (key === "reportstatus") {
                                  return (
                                    <Box
                                      display="flex"
                                      alignItems="center"
                                      gap={1}
                                    >
                                      <span
                                        className={`status-circle ${reportgetStatusColor(
                                          item[key]
                                        )}`}
                                      />
                                      <span>{item[key]}</span>
                                    </Box>
                                  );
                                }

                                if (
                                  key === "totalTiming" &&
                                  item.clockIn.length > 0
                                ) {
                                  if (
                                    Array.isArray(item.clockIn) &&
                                    item.clockIn.length > 0
                                  ) {
                                    return (
                                      <div className="timing-container">
                                        {item.clockIn.map(
                                          (clockInTime, index) => (
                                            <div
                                              key={index}
                                              className="timing-entry"
                                            >
                                              <span className="clockin">
                                                {moment(clockInTime).format(
                                                  "LT"
                                                )}{" "}
                                                |{" "}
                                              </span>
                                              <span className="clockout">
                                                {item.clockOut[index] ? (
                                                  <>
                                                    {moment(
                                                      item.clockOut[index]
                                                    ).format("LT")}{" "}
                                                    |{" "}
                                                  </>
                                                ) : (
                                                  <BsHourglassSplit />
                                                )}
                                              </span>
                                              <span className="timing">
                                                {item.totalTiming[index] ||
                                                  "--"}
                                              </span>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    );
                                  }
                                }

                                if (key === "Template") {
                                  const templates = item.Template;
                                  const searchTerm =
                                    templateSearchTerms[item._id] || "";

                                  if (
                                    !Array.isArray(templates) ||
                                    templates.length === 0
                                  )
                                    return null;

                                  const filteredTemplates = templates.filter(
                                    (template) =>
                                      template.templateName
                                        .toLowerCase()
                                        .includes(searchTerm.toLowerCase())
                                  );

                                  return (
                                    <FormControl
                                      fullWidth
                                      className="employee-template"
                                    >
                                      <Select
                                        displayEmpty
                                        fullWidth
                                        defaultValue=""
                                        MenuProps={{
                                          disableAutoFocusItem: true,
                                          PaperProps: {
                                            style: {
                                              width: 150,
                                              overflowX: "auto",
                                              scrollbarWidth: "thin",
                                              maxHeight: 200,
                                            },
                                          },
                                          MenuListProps: {
                                            onMouseDown: (e) => {
                                              if (
                                                e.target.closest(
                                                  ".search-textfield"
                                                )
                                              ) {
                                                e.stopPropagation();
                                              }
                                            },
                                          },
                                        }}
                                        renderValue={(selected) => {
                                          if (!selected)
                                            return "Select a template";
                                          const found = templates.find(
                                            (t) => t._id === selected
                                          );
                                          return (
                                            found?.templateName || "Not found"
                                          );
                                        }}
                                      >
                                        <ListSubheader>
                                          <TextField
                                            size="small"
                                            placeholder="Search Template"
                                            fullWidth
                                            className="search-textfield"
                                            value={searchTerm}
                                            onChange={(e) =>
                                              handleSearchChange(
                                                item._id,
                                                e.target.value
                                              )
                                            }
                                            onKeyDown={(e) =>
                                              e.stopPropagation()
                                            }
                                          />
                                        </ListSubheader>

                                        <MenuItem
                                          value=""
                                          disabled
                                          className="menu-item"
                                        >
                                          Select a template
                                        </MenuItem>

                                        {filteredTemplates.length > 0 ? (
                                          filteredTemplates.map((template) => (
                                            <MenuItem
                                              key={template._id}
                                              value={template._id}
                                              className="menu-item"
                                              onClick={() => {
                                                fetch(template.templateUrl)
                                                  .then((res) => res.blob())
                                                  .then((blob) => {
                                                    const url =
                                                      window.URL.createObjectURL(
                                                        blob
                                                      );
                                                    const a =
                                                      document.createElement(
                                                        "a"
                                                      );
                                                    a.href = url;
                                                    a.download =
                                                      template.templateName;
                                                    document.body.appendChild(
                                                      a
                                                    );
                                                    a.click();
                                                    a.remove();
                                                    window.URL.revokeObjectURL(
                                                      url
                                                    );
                                                  });
                                              }}
                                            >
                                              {template.templateName}
                                            </MenuItem>
                                          ))
                                        ) : (
                                          <MenuItem
                                            disabled
                                            className="menu-item"
                                          >
                                            No templates found
                                          </MenuItem>
                                        )}
                                      </Select>
                                    </FormControl>
                                  );
                                }

                                return item[key];
                              })()
                            )}
                          </TableCell>
                        ))}

                      {headers.includes("Action") && (
                        <TableCell>
                          <IconButton
                            onClick={(e) => handleMenuOpen(e, item?._id)}
                          >
                            <SlOptionsVertical />
                          </IconButton>
                          <Menu
                            anchorEl={anchorEl}
                            open={
                              Boolean(anchorEl) && selectedRow === item?._id
                            }
                            onClose={handleMenuClose}
                            PaperProps={{
                              style: {
                                borderRadius: "var(--border-radius)",
                              },
                            }}
                          >
                            {actions?.actionsList
                              .filter(
                                (action) =>
                                  !(
                                    (item.isActive === true &&
                                      action.label === "Active") ||
                                    (item.isActive === false &&
                                      action.label === "Inactive")
                                  )
                              )
                              .map((action, id) => (
                                <MenuItem
                                  className="action-button"
                                  key={id}
                                  disabled={
                                    (["Approved", "Rejected"].includes(
                                      item.status
                                    ) &&
                                      (action.label === "Edit" ||
                                        action.label === "Delete")) ||
                                    (item.status && action.label
                                      ? item.status.startsWith(action.label)
                                      : false)
                                  }
                                  onClick={() => {
                                    action.onClick(
                                      item?._id,
                                      item?.Name,
                                      item?.leaves || "",
                                      item?.SelectionDuration || "",
                                      item?.TotalLeaveDays || 0,
                                      item?.qrValue
                                    );
                                    handleMenuClose();
                                  }}
                                >
                                  {action.label}
                                </MenuItem>
                              ))}
                          </Menu>
                        </TableCell>
                      )}
                      {headers.includes("View") && (
                        <TableCell className="reportlist-view-button">
                          <IconButton onClick={() => handleViewClick(item._id)}>
                            View
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  )}

                  {checkforReson(item) && item.status && (
                    <TableRow>
                      <TableCell
                        colSpan={headers.length + 1}
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                      >
                        <Collapse in={openRow === i} timeout="auto">
                          <Box sx={{ margin: 1 }}>
                            <Typography
                              variant="subtitle1"
                              gutterBottom
                              component="div"
                            >
                              {item.reasonOfLeave && (
                                <div className="leaverequest-reason">
                                  <strong> Reason For Leave :</strong>{" "}
                                  {item.reasonOfLeave}
                                </div>
                              )}

                              {item.status === "Rejected" &&
                                item.rejectionReason && (
                                  <div className="leaverequest-rejection-reason">
                                    <strong>Rejection Reason : </strong>{" "}
                                    {item.rejectionReason}
                                  </div>
                                )}
                              {/* 
                              {item.status === "Pending" &&
                                (item.rejectionReason ||
                                  item.approvalReason) && (
                                  <div>
                                    {item.rejectionReason && (
                                      <>
                                        <strong>Rejection Reason: </strong>{" "}
                                        {item.rejectionReason} <br />
                                      </>
                                    )}
                                    {item.approvalReason && (
                                      <>
                                        <strong>Approval Reason: </strong>{" "}
                                        {item.approvalReason}
                                      </>
                                    )}
                                  </div>
                                )} */}

                              {item.status === "Approved" &&
                                item.approvalReason && (
                                  <div className="leaverequest-approve-reason">
                                    <strong>Approval Reason : </strong>{" "}
                                    {item.approvalReason}
                                  </div>
                                )}

                              {item.reason && (
                                <div>
                                  <strong> Reason : </strong> {item.reason}
                                  {/* {console.log("{item.reason}", item.reason)} */}
                                </div>
                              )}

                              {/* {item.reasonOfLeave && (
                                <div>
                                  <strong>Reason For Leave : </strong>
                                  {item.reasonOfLeave}{" "}
                                </div>
                              )} */}
                            </Typography>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  )}

                  {item.roleWisePoints &&
                    Array.isArray(item.roleWisePoints) && (
                      <TableRow>
                        <TableCell
                          colSpan={headers.length + 1}
                          style={{ paddingBottom: 0, paddingTop: 0 }}
                        >
                          <Collapse
                            in={openRow === i}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Box sx={{ margin: 1 }}>
                              <Typography
                                variant="subtitle1"
                                gutterBottom
                                component="div"
                              >
                                {item.roleWisePoints.length > 0 ? (
                                  <div className="rolewisepoint">
                                    {item.roleWisePoints.map((role, index) => (
                                      <div key={index}>
                                        <strong>Job Title : </strong>{" "}
                                        {role.jobTitle} ||
                                        <strong> Grace Points : </strong>{" "}
                                        {role.gracePoints}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  ""
                                )}
                              </Typography>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={headers.length + 1} align="center">
                  No matching records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>

          <TableFooter>
            <TableRow>
              {isPagination === "true" && (
                <TablePagination
                  rowsPerPageOptions={[50, 100, 200]}
                  // count={totalPages * showPerPage}
                  count={
                    Array.isArray(totalData) ? totalData.length : totalData
                  }
                  rowsPerPage={showPerPage}
                  page={currentPage - 1}
                  onPageChange={(_, newPage) => onPageChange(newPage + 1)}
                  onRowsPerPageChange={(event) =>
                    onPerPageChange(parseInt(event.target.value, 10))
                  }
                />
              )}
            </TableRow>
          </TableFooter>
        </Table>
      </Paper>
    </Box>
  );
};

export default CommonTable;
