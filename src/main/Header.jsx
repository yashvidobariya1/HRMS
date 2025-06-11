import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { IoIosMenu } from "react-icons/io";
import { MdOutlineNotificationsActive } from "react-icons/md";
import "./Header.css";
import { useDispatch, useSelector } from "react-redux";
import { clearUserInfo } from "../store/userInfoSlice";
import { persistor } from "../store";
import { clearThemeColor, setThemeColor } from "../store/themeColorSlice";
import { clearNotificationCount } from "../store/notificationCountSlice";
import { clearJobRoleSelect } from "../store/selectJobeRoleSlice";
import useApiServices from "../useApiServices";
import { showToast } from "./ToastManager";
import { Select, MenuItem, Menu, ListItemText } from "@mui/material";
import { clearCompanySelect } from "../store/selectCompanySlice";
import { clearEmployeeformFilled } from "../store/EmployeeFormSlice";

const Header = ({ isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { PostCall } = useApiServices();
  const [theme, setTheme] = useState("light");
  const user = useSelector((state) => state.userInfo.userInfo);
  const themeColor = useSelector((state) => state.themeColor.themeColor);
  const Notificationscount = useSelector(
    (state) => state.notificationCount.notificationCount
  );
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleOpenDropdown = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseDropdown = () => {
    setAnchorEl(null);
  };

  const handleThemeChange = (e) => {
    const selectedTheme = e.target.value;
    setTheme(selectedTheme);
    dispatch(setThemeColor(selectedTheme));
    document.documentElement.setAttribute("data-theme", selectedTheme);
    handleCloseDropdown();
  };

  const handleLogout = async () => {
    try {
      localStorage.clear();
      const response = await PostCall(`/logOut?userId=${user?._id}`);
      if (response?.data?.status === 200) {
        dispatch(clearUserInfo());
        dispatch(clearNotificationCount());
        dispatch(clearThemeColor());
        dispatch(clearJobRoleSelect());
        dispatch(clearCompanySelect());
        dispatch(clearEmployeeformFilled());
        persistor.pause();
        await persistor.purge();
        persistor.persist();
        navigate("/login");
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast("Error while logging out", "error");
    }
  };

  const HandleShowNotification = () => {
    navigate("/notification");
  };

  useEffect(() => {
    setTheme(themeColor);
    document.documentElement.setAttribute("data-theme", themeColor);
  }, [themeColor]);

  return (
    <section className="home-section">
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
            onClick={handleOpenDropdown}
          />
        </span>

        <Menu
          anchorEl={anchorEl}
          open={open}
          className="header-dropdown"
          onClose={handleCloseDropdown}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem
            onClick={() => {
              navigate("/profile");
              handleCloseDropdown();
            }}
          >
            Profile
          </MenuItem>
          <MenuItem
            onClick={() => {
              navigate("/changepassword");
              handleCloseDropdown();
            }}
          >
            Change Password
          </MenuItem>
          <MenuItem disableRipple>
            <ListItemText>Theme</ListItemText>
            <Select
              value={theme}
              onChange={(e) => {
                handleThemeChange(e);
              }}
              variant="standard"
              disableUnderline
            >
              <MenuItem value="light">Light</MenuItem>
              <MenuItem value="dark">Dark</MenuItem>
            </Select>
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleLogout();
              handleCloseDropdown();
            }}
          >
            Logout
          </MenuItem>
        </Menu>
      </div>
    </section>
  );
};

export default Header;
