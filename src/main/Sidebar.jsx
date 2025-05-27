import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { SidebarData } from "./Sidebardata";
import { useDispatch, useSelector } from "react-redux";
import "./Sidebar.css";
import { RxDashboard } from "react-icons/rx";
// import { IoCloseCircleSharp } from "react-icons/io5";
import { FaChevronCircleLeft } from "react-icons/fa";
import { GetCall } from "../ApiServices";
import { setCompanySelect } from "../store/selectCompanySlice";
import { Select, MenuItem } from "@mui/material";
import { showToast } from "./ToastManager";
import { MdOutlineExpandMore, MdChevronRight } from "react-icons/md";

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const currentRole = useSelector((state) => state.userInfo.userInfo.role);
  const location = useLocation();
  const dispatch = useDispatch();
  const [companyList, setcompanyList] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(
    useSelector((state) => state.companySelect.companySelect)
  );
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpand = (title) => {
    setExpandedItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const filterSidebarData = (data, role) => {
    return data
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => item.allowedRoles.includes(role)),
      }))
      .filter((section) => section.items.length > 0);
  };

  const filteredSidebarData = filterSidebarData(SidebarData, currentRole);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleChange = (e) => {
    const companyId = e.target.value;
    setSelectedCompanyId(companyId);
    dispatch(setCompanySelect(companyId));
    // console.log("Selected company:", companyId);
  };

  const GetCompanies = async () => {
    try {
      const response = await GetCall(`/getallcompany`);

      if (response?.data?.status === 200) {
        const companies = response?.data?.companies;
        setcompanyList(companies);
        if (
          (!selectedCompanyId ||
            (typeof selectedCompanyId === "object" &&
              Object.keys(selectedCompanyId).length === 0)) &&
          companies.length > 0
        ) {
          const defaultCompanyId = companies[0]._id;
          dispatch(setCompanySelect(defaultCompanyId));
          setSelectedCompanyId(defaultCompanyId);
        }
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 992) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [setIsCollapsed]);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsCollapsed(true);
    }
  }, [location, setIsCollapsed]);

  // const handleOverlayClick = () => {
  //   if (window.innerWidth < 575) {
  //     setIsCollapsed(true);
  //   }
  // };

  useEffect(() => {
    GetCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* <div
        className={`sidebar-overlay ${!isCollapsed ? "active" : ""}`}
        onClick={handleOverlayClick}
      ></div> */}

      <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
        <div className="logo-details">
          <div className="logo_name">
            {/* <img src="/image/login-bg.png" alt="Logo" /> */}
            {selectedCompanyId && companyList.length > 0
              ? (() => {
                  const selectedCompany = companyList.find(
                    (company) => company._id === selectedCompanyId
                  );
                  const logo = selectedCompany?.companyDetails?.companyLogo;
                  const name = selectedCompany?.companyDetails?.businessName;

                  return logo ? (
                    <img
                      src={logo}
                      alt={name || "Company Logo"}
                      className="company-logo"
                    />
                  ) : (
                    <img src="/image/logo.jpg" alt="default logo" />
                  );
                })()
              : ""}

            {companyList.length > 0 && !isCollapsed && (
              <>
                {companyList.length === 1 ? (
                  <span className="logo-text">
                    {companyList[0].companyDetails.businessName}
                  </span>
                ) : (
                  // <select
                  //   value={selectedCompanyId}
                  //   onChange={handleChange}
                  //   className="company-dropdown"
                  //   // className="dropdown"
                  // >
                  //   {currentRole === "Superadmin" && (
                  //     <option value="allCompany">All</option>
                  //   )}
                  //   {companyList.map((company) => (
                  //     <option key={company._id} value={company._id}>
                  //       {company.companyDetails.businessName}
                  //     </option>
                  //   ))}
                  // </select>
                  <Select
                    value={selectedCompanyId}
                    onChange={handleChange}
                    className="company-dropdown"
                    // className="dropdown"
                    MenuProps={{
                      PaperProps: {
                        style: {
                          width: 200, // same as Select
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          scrollbarWidth: "thin",
                          overflowX: "auto",
                          maxHeight: 192,
                        },
                      },
                    }}
                  >
                    {currentRole === "Superadmin" && (
                      <MenuItem value="allCompany">All</MenuItem>
                    )}
                    {companyList.map((company) => (
                      // <Tooltip
                      //   title={company.companyDetails.businessName}
                      //   key={company._id}
                      // >
                      <MenuItem
                        key={company._id}
                        value={company._id}
                        style={{
                          // overflow: "hidden",
                          textOverflow: "ellipsis",
                          // whiteSpace: "nowrap",
                        }}
                      >
                        {company.companyDetails.businessName}
                      </MenuItem>
                      // {/* </Tooltip> */}
                    ))}
                  </Select>
                )}
              </>
            )}
          </div>
        </div>
        {/* <IoCloseCircleSharp */}
        <FaChevronCircleLeft
          className="sidebar-Toggle-menu"
          onClick={toggleSidebar}
        />
        <ul className="nav-links">
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <div className="sidebar-icon">
                <RxDashboard />
              </div>
              {!isCollapsed && <span className="link_name">Dashboard</span>}
            </NavLink>
          </li>
          {filteredSidebarData?.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <li className={`section-title ${isCollapsed ? "collapsed" : ""}`}>
                {section.section}
              </li>
              {section?.items?.map((item, itemIndex) => (
                <li key={itemIndex}>
                  {item.subItems ? (
                    <>
                      <div
                        className={`sidebar-collapsible-header ${
                          expandedItems[item.title] ? "expanded" : ""
                        } sidebar-collapsible-header-custom`}
                        onClick={() => toggleExpand(item.title)}
                      >
                        <div className="sidebar-icon">{item.icon}</div>
                        {!isCollapsed && (
                          <>
                            <span className="link_name">{item.title}</span>
                            <span style={{ marginLeft: "auto" }}>
                              {expandedItems[item.title] ? (
                                <MdOutlineExpandMore />
                              ) : (
                                <MdChevronRight />
                              )}
                            </span>
                          </>
                        )}
                      </div>
                      {expandedItems[item.title] && !isCollapsed && (
                        <ul className="sidebar-submenu">
                          {item.subItems.map((subItem, subIndex) => (
                            <li key={subIndex} className="sidebar-subitem">
                              <NavLink
                                to={subItem.link}
                                className={({ isActive }) =>
                                  isActive ? "active" : ""
                                }
                              >
                                <span className="link_name">
                                  {subItem.title}
                                </span>
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <NavLink
                      to={item.link}
                      className={({ isActive }) => (isActive ? "active" : "")}
                    >
                      <div className="sidebar-icon">{item.icon}</div>
                      {!isCollapsed && (
                        <span className="link_name">{item.title}</span>
                      )}
                    </NavLink>
                  )}
                </li>
              ))}
            </div>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
