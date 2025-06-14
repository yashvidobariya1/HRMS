import React from "react";
import { FaRegFileLines, FaUsers } from "react-icons/fa6";
// import { RxDashboard } from "react-icons/rx";
// import { IoSettingsOutline } from "react-icons/io5";
import { FaUserTie } from "react-icons/fa6";
import { PiBuildingOfficeFill } from "react-icons/pi";
import { TbContract } from "react-icons/tb";
import { TiLocationOutline } from "react-icons/ti";
import { RiBookletLine } from "react-icons/ri";
import { FaUserGroup } from "react-icons/fa6";
import { HiMiniArrowLeftStartOnRectangle } from "react-icons/hi2";
import { FaBriefcase, FaTasks, FaUmbrellaBeach } from "react-icons/fa";
import { TbReportSearch } from "react-icons/tb";
import { TbClockHour7 } from "react-icons/tb";
import { LiaHourglassStartSolid } from "react-icons/lia";
import { BiSolidSpreadsheet } from "react-icons/bi";
import { GrWorkshop } from "react-icons/gr";
import { FaRegUser } from "react-icons/fa";

export const SidebarData = [
  {
    section: "Company",
    items: [
      // {
      //   title: "Dashboard",
      //   icon: <RxDashboard />,
      //   link: "/dashboard",
      //   allowedRoles: ["Superadmin", "Administrator", "Manager", "Employee"],
      // },
      {
        title: "Company",
        icon: <PiBuildingOfficeFill />,
        link: "/company",
        allowedRoles: ["Superadmin", "Administrator"],
      },
      {
        title: "Clients",
        icon: <FaUserTie />,
        link: "/clients",
        allowedRoles: ["Superadmin", "Administrator"],
      },
      {
        title: "Client Reports",
        icon: <FaRegFileLines />,
        link: "/reportlist",
        allowedRoles: ["Superadmin", "Administrator"],
      },
      {
        title: "Employment Contract",
        icon: <TbContract />,
        link: "/employmentcontract",
        allowedRoles: ["Superadmin"],
      },
      {
        title: "Location",
        icon: <TiLocationOutline />,
        link: "/location",
        allowedRoles: ["Superadmin"],
      },
      {
        title: "Templates",
        icon: <RiBookletLine />,
        link: "/templates",
        allowedRoles: ["Superadmin"],
      },
    ],
  },
  {
    section: "Employee",
    items: [
      {
        title: "View Employees",
        icon: <FaUserGroup />,
        link: "/employees",
        allowedRoles: ["Superadmin", "Administrator", "Manager"],
      },
      {
        title: "Logged In User",
        icon: <FaUsers />,
        link: "/loggedinuser",
        allowedRoles: ["Superadmin", "Administrator", "Manager"],
      },
    ],
  },
  {
    section: "Absence Management",
    items: [
      {
        title: "Leaves",
        icon: <HiMiniArrowLeftStartOnRectangle />,
        link: "/leaves",
        allowedRoles: ["Administrator", "Manager", "Employee"],
      },
      {
        title: "Leave Requests",
        icon: <HiMiniArrowLeftStartOnRectangle />,
        link: "/leavesrequest",
        allowedRoles: ["Superadmin"],
      },
      {
        title: "Holidays",
        icon: <FaUmbrellaBeach />,
        link: "/holidays",
        allowedRoles: ["Superadmin", "Administrator", "Manager", "Employee"],
      },
      {
        title: "Absence Report",
        icon: <TbReportSearch />,
        link: "/staffabsencereport",
        allowedRoles: ["Superadmin"],
      },
      {
        title: "Absence Report",
        icon: <TbReportSearch />,
        allowedRoles: ["Administrator", "Manager"],
        subItems: [
          {
            title: "Staff Absence Report",
            link: "/staffabsencereport",
            allowedRoles: ["Administrator", "Manager"],
          },
          {
            title: "My Absence Report",
            link: "/myabsencereport",
            allowedRoles: ["Administrator", "Manager"],
          },
        ],
      },
      {
        title: "Absence Report",
        icon: <TbReportSearch />,
        link: "/myabsencereport",
        allowedRoles: ["Employee"],
      },
    ],
  },
  {
    section: "Timesheet Management",
    items: [
      {
        title: "Clock In",
        icon: <TbClockHour7 />,
        link: "/clockin",
        allowedRoles: ["Administrator", "Manager", "Employee"],
      },
      {
        title: "View Hours",
        icon: <LiaHourglassStartSolid />,
        link: "/staffviewhours",
        allowedRoles: ["Superadmin"],
      },
      {
        title: "View Hours",
        icon: <LiaHourglassStartSolid />,
        link: "/myviewhours",
        allowedRoles: ["Employee"],
      },
      {
        title: "View Hours",
        icon: <LiaHourglassStartSolid />,
        allowedRoles: ["Administrator", "Manager"],
        subItems: [
          {
            title: "Staff View Hours",
            link: "/staffviewhours",
            allowedRoles: ["Administrator", "Manager"],
          },
          {
            title: "My View Hours",
            link: "/myviewhours",
            allowedRoles: ["Administrator", "Manager"],
          },
        ],
      },
      {
        title: "View Rota Schedule",
        icon: <FaTasks />,
        link: "/stafftask",
        allowedRoles: ["Superadmin"],
      },
      {
        title: "View Rota Schedule",
        icon: <FaTasks />,
        allowedRoles: ["Administrator", "Manager"],
        subItems: [
          {
            title: "Staff Rota Schedule",
            link: "/stafftask",
            allowedRoles: ["Administrator", "Manager"],
          },
          {
            title: "My Rota Schedule",
            link: "/mytask",
            allowedRoles: ["Administrator", "Manager"],
          },
        ],
      },
      {
        title: "View Rota Schedule",
        icon: <FaTasks />,
        link: "/mytask",
        allowedRoles: ["Employee"],
      },
      {
        title: "Timesheet Report",
        icon: <BiSolidSpreadsheet />,
        allowedRoles: ["Superadmin", "Administrator", "Manager"],
        subItems: [
          {
            title: "Daily Report",
            link: "/timesheetreport/daily",
            allowedRoles: ["Superadmin", "Administrator", "Manager"],
          },
          {
            title: "Weekly Report",
            link: "/timesheetreport/weekly",
            allowedRoles: ["Superadmin", "Administrator", "Manager"],
          },
          {
            title: "Monthly Report",
            link: "/timesheetreport/monthly",
            allowedRoles: ["Superadmin", "Administrator", "Manager"],
          },
          {
            title: "My Report",
            link: "/myreport",
            allowedRoles: ["Administrator", "Manager"],
          },
        ],
      },
      {
        title: "Timesheet Report",
        icon: <BiSolidSpreadsheet />,
        link: "/myreport",
        allowedRoles: ["Employee"],
      },
    ],
  },
  {
    section: "Recruitment Management",
    items: [
      {
        title: "Job",
        icon: <GrWorkshop />,
        link: "/job",
        allowedRoles: ["Superadmin", "Administrator", "Manager"],
      },
      {
        title: "Candidate",
        icon: <FaRegUser />,
        link: "/candidate",
        allowedRoles: ["Superadmin", "Administrator", "Manager"],
      },
    ],
  },
  {
    section: "Job Titles",
    items: [
      {
        title: "Jobs",
        icon: <FaBriefcase />,
        link: "/jobtitles",
        allowedRoles: ["Superadmin"],
      },
    ],
  },
];
