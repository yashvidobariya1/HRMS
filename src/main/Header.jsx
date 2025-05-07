import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { IoIosMenu } from "react-icons/io";
import { MdOutlineNotificationsActive } from "react-icons/md";
import "./Header.css";
import { useDispatch, useSelector } from "react-redux";
import { clearUserInfo } from "../store/userInfoSlice";
import { persistor } from "../store";
import { clearThemeColor, setThemeColor } from "../store/themeColorSlice";
import { clearNotificationCount } from "../store/notificationCountSlice";
import { clearJobRoleSelect } from "../store/selectJobeRoleSlice";
import { PostCall } from "../ApiServices";
import { showToast } from "./ToastManager";
import Loader from "../pages/Helper/Loader";
import { TextField, MenuItem } from "@mui/material";

const Header = ({ isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.userInfo.userInfo);
  const themeColor = useSelector((state) => state.themeColor.themeColor);
  const Notificationscount = useSelector(
    (state) => state.notificationCount.notificationCount
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // const handleThemeChange = (e) => {
  //   const selectedTheme = e.target.value;
  //   console.log("selection item", selectedTheme);
  //   setTheme(selectedTheme);
  //   dispatch(setThemeColor(selectedTheme));
  //   document.documentElement.setAttribute("data-theme", selectedTheme);
  //   setIsDropdownOpen(false);
  // };

  const handleThemeChange = (e) => {
    alert("(change");
  };
  const handleLogout = async () => {
    try {
      setLoading(true);
      localStorage.clear();
      const response = await PostCall(`/logOut?userId=${user?._id}`);
      if (response?.data?.status === 200) {
        dispatch(clearUserInfo());
        dispatch(clearNotificationCount());
        dispatch(clearThemeColor());
        dispatch(clearJobRoleSelect());
        persistor.pause();
        await persistor.purge();
        persistor.persist();
        navigate("/login");
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleClickOutside = useCallback(
    (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    },
    [dropdownRef]
  );

  const HandleShowNotification = () => {
    navigate("/notification");
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  useEffect(() => {
    setTheme(themeColor);
    document.documentElement.setAttribute("data-theme", themeColor);
  }, [themeColor]);

  return (
    <section className="home-section">
      {loading ? (
        <div className="loader-wrapper">
          <Loader />
        </div>
      ) : (
        <div className="home-content">
          <IoIosMenu className="Header-Toggle-menu" onClick={toggleSidebar} />

          <span className="text">
            <div
              className="header-notification-flex"
              onClick={HandleShowNotification}
            >
              <MdOutlineNotificationsActive className="header-notification" />
              <div className="header-notification-count">
                <span>
                  {Notificationscount > 99 ? "99+" : Notificationscount}
                </span>
              </div>
            </div>
            <div className="profile-name">
              <p>{user?.personalDetails?.firstName}</p>
              <h6>{user?.role}</h6>
            </div>
            <img
              src={process.env.PUBLIC_URL + "/image/profile.png"}
              alt="Profile"
              onClick={toggleDropdown}
            />
          </span>

          {isDropdownOpen && (
            <div className="profile-dropdown-menu" ref={dropdownRef}>
              <ul>
                <Link to="/profile" onClick={() => setIsDropdownOpen(false)}>
                  <li>Profile</li>
                </Link>
                <Link
                  to="/changepassword"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <li>Change Password</li>
                </Link>
                {/* <li>
                  Theme{" "}
                  <select
                    className="header-theme"
                    value={theme}
                    onChange={handleThemeChange}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </li> */}
                <li>
                  Theme{" "}
                  <TextField
                    select
                    value={theme}
                    onChange={handleThemeChange}
                    variant="standard"
                    size="small"
                    sx={{ minWidth: 100 }}
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                  </TextField>
                </li>
                <Link to="/login" onClick={handleLogout}>
                  <li>Logout</li>
                </Link>
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default Header;
