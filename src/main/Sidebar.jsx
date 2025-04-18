import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { SidebarData } from "./Sidebardata";
import { useSelector } from "react-redux";
import "./Sidebar.css";
import { RxDashboard } from "react-icons/rx";
// import { IoCloseCircleSharp } from "react-icons/io5";
import { FaChevronCircleLeft } from "react-icons/fa";

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const currentRole = useSelector((state) => state.userInfo.userInfo.role);
  const location = useLocation();

  const filterSidebarData = (data, role) => {
    return data
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => item.allowedRoles.includes(role)),
      }))
      .filter((section) => section.items.length > 0);
  };

  const filteredSidebarData = filterSidebarData(SidebarData, currentRole);

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

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

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
            <img src="/favicon.png" alt="Logo" />
            {!isCollapsed && <span className="logo-text">City Clean London</span>}
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
                  <NavLink
                    to={item.link}
                    className={({ isActive }) => (isActive ? "active" : "")}
                  >
                    <div className="sidebar-icon">{item.icon}</div>
                    {!isCollapsed && (
                      <span className="link_name">{item.title}</span>
                    )}
                  </NavLink>
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
