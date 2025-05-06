import React, { useEffect, useState } from "react";
import { GetCall } from "../../ApiServices";
import { useDispatch } from "react-redux";
import moment from "moment";
import "./ShowNotification.css";
import { setNotificationCount } from "../../store/notificationCountSlice";
import { showToast } from "../../main/ToastManager";
import CommonTable from "../../SeparateCom/CommonTable";
import { TextField } from "@mui/material";
import Loader from "../Helper/Loader";

const ShowNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [notificationPerPage, setNotificationPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(0);
  const dispatch = useDispatch();
  const [showDropdownAction, setShowDropdownAction] = useState(null);
  const headers = ["User", "Type", "Message", "Time", "Read"];
  const [selectedNotification, setSelectedNotification] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalNotifications, settotalNotifications] = useState([]);

  const GetNotification = async () => {
    try {
      setLoading(true);
      const response = await GetCall(
        `/getNotifications?page=${currentPage}&limit=${notificationPerPage}&search=${searchQuery}`
      );
      if (response?.data?.status === 200) {
        setNotifications(response.data.notifications);
        setTotalPages(response.data.totalPages);
        settotalNotifications(response.data.totalNotifications);
        const unreadCount = response.data.unreadNotificationsCount;
        // console.log("unreadCount", response.data.unreadNotificationsCount);
        dispatch(setNotificationCount(unreadCount));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const ReadNotification = async (id) => {
    try {
      const response = await GetCall(`/readNotification/${id}`);
      if (response?.data?.status === 200) {
        // console.log("Notification read", response?.data);
      } else {
        showToast(response?.data?.message);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    } finally {
    }
  };

  const handleViewClick = (id, index, isRead) => {
    setSelectedNotification(notifications[index]);
    // console.log("unread", isRead);
    toggleDropdown(index);
    if (!isRead) {
      ReadNotification(id, index);
    }
  };

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleNotificationPageChange = (e) => {
    setNotificationPerPage(e);
    setCurrentPage(1);
  };

  const handleAction = (id) => {
    setShowDropdownAction(showDropdownAction === id ? null : id);
  };

  const cancelDelete = (isRead) => {
    if (!isRead) {
      // console.log("isread", isRead);
      GetNotification();
    }
    setOpenDropdown(null);
  };

  const actions = [
    {
      label: "View",
      action: (notification, index) =>
        handleViewClick(notification._id, index, notification.isRead),
    },
  ];

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {
    GetNotification();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, notificationPerPage, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="Notification-container">
      <div className="employeelist-flex">
        <div className="employeelist-title">
          <h1>Notification List</h1>
        </div>
      </div>
      <TextField
        label="Search Notification"
        variant="outlined"
        size="small"
        value={searchQuery}
        className="common-searchbar"
        onChange={handleSearchChange}
      />
      {loading ? (
        <div className="loader-wrapper">
          <Loader />
        </div>
      ) : (
        <CommonTable
          headers={headers}
          // data={filteredNotifications}
          data={notifications.map((notification) => ({
            _id: notification._id,
            userName: notification?.userName,
            type: notification?.type,
            message: notification?.message,
            createdAt: moment(notification?.createdAt).format(
              "DD-MM-YYYY hh:mm A"
            ),
            isRead: notification.isRead,
            read: (
              <button
                className="View-notification-button"
                onClick={() =>
                  handleViewClick(
                    notification._id,
                    notifications.indexOf(notification),
                    notification.isRead
                  )
                }
              >
                {notification.isRead ? "Read" : "Unread"}
              </button>
            ),
          }))}
          actions={{
            actionsList: actions,
          }}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          showPerPage={notificationPerPage}
          onPerPageChange={handleNotificationPageChange}
          handleAction={handleAction}
          isPagination="true"
          searchQuery={searchQuery}
          isSearchQuery={true}
          totalData={totalNotifications}
        />
      )}
      {openDropdown !== null && (
        <div className="dropdown-box">
          <div className="dropdown-content">
            <div className="notification-flex">
              <p>Notification</p>
            </div>
            <div className="notification-message">
              <div className="notification-message-flex">
                <div className="notification-div">
                  <h3>{selectedNotification?.userName}</h3>
                </div>
                <div className="notification-div">
                  <h3>{selectedNotification?.type}</h3>
                  <p>
                    {moment(selectedNotification?.createdAt).format("hh:mm A")}
                  </p>
                </div>
              </div>
              <div className="notification-message-show">
                <p>{selectedNotification?.message}</p>
              </div>
              <div className="notification-cancel-button">
                <button
                  onClick={() => cancelDelete(selectedNotification?.isRead)}
                  className="notifiction-cancel"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowNotification;
