import React from "react";
import { FaUsers } from "react-icons/fa6";
// import { RxDashboard } from "react-icons/rx";
// import { IoSettingsOutline } from "react-icons/io5";
import { FaUserTie } from "react-icons/fa6";
import { PiBuildingOfficeFill } from "react-icons/pi";
import { TbContract } from "react-icons/tb";
import { TiLocationOutline } from "react-icons/ti";
import { RiBookletLine } from "react-icons/ri";
import { FaUserGroup } from "react-icons/fa6";
import { HiMiniArrowLeftStartOnRectangle } from "react-icons/hi2";
import { FaTasks, FaUmbrellaBeach } from "react-icons/fa";
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
        allowedRoles: ["Superadmin", "Administrator", "Manager"],
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
        link: "/absencereport",
        allowedRoles: ["Administrator", "Manager", "Employee"],
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
        link: "/viewhours",
        allowedRoles: ["Administrator", "Manager", "Employee"],
      },
      {
        title: "View Tasks",
        icon: <FaTasks />,
        link: "/viewtasks",
        allowedRoles: ["Employee"],
      },
      {
        title: "Timesheet Report",
        icon: <BiSolidSpreadsheet />,
        link: "/timesheetreport",
        allowedRoles: ["Superadmin", "Administrator", "Manager", "Employee"],
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
  // {
  //   section: "Job Titles",
  //   items: [
  //     {
  //       title: "Jobs",
  //       icon: <FaBriefcase />,
  //       link: "/jobtitles",
  //       allowedRoles: ["Superadmin"],
  //     },
  //   ],
  // },
];
