import React, { useEffect, useState } from "react";
import { GetCall } from "../../ApiServices";
import "./LoggedInUser.css";
import Loader from "../Helper/Loader";
import CommonTable from "../../SeparateCom/CommonTable";
import moment from "moment";
import { TextField } from "@mui/material";

const LoggedInUser = () => {
  const [loading, setLoading] = useState(false);
  const [userLoggedList, setuserLoggedList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loggeduserPerPage, setloggeduserPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState(24);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalLoggedUser, settotalLoggedUser] = useState([]);
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePerPageChange = (e) => {
    // setloggeduserPerPage(parseInt(e.target.value, 10));
    setloggeduserPerPage(e);
    setCurrentPage(1);
  };

  const handleTimePeriodChange = (e) => {
    setSelectedTimePeriod(e.target.value);
  };

  const GetUsersLogged = async () => {
    try {
      setLoading(true);
      // console.log("selectedTimePeriod", selectedTimePeriod);

      const response = await GetCall(
        `/getAllLoggedInOutUsers?page=${currentPage}&limit=${loggeduserPerPage}&timePeriod=${selectedTimePeriod}?search=${searchQuery}`
      );

      // console.log("response", response);
      if (response?.data?.status === 200) {
        setuserLoggedList(response?.data?.users);
        settotalLoggedUser(response.data.totalUsers);
        setTotalPages(response?.data?.totalPages);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const headers = [
    "Name",
    "Role",
    // "Client IP Address",
    "Login Time",
    "Last Access Time",
    "Active",
    "Browser",
  ];

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {
    GetUsersLogged();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, loggeduserPerPage, selectedTimePeriod, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="loggeduser-list-container">
      <div className="loggeduserlist-flex">
        <div className="loggeduserlist-title">
          <h1>Users</h1>
        </div>
        <div className="loggeduserlist-action">
          <p>Time Period</p>
          <select
            value={selectedTimePeriod}
            onChange={handleTimePeriodChange}
            className="loggeduserlist-timeperoid"
          >
            <option value="24">24 Hours</option>
            <option value="48">48 Hours</option>
          </select>
        </div>
      </div>
      <TextField
        label="Search Logged user"
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
          data={userLoggedList.map((loggeduser) => ({
            _id: loggeduser?._id,
            Name: loggeduser?.userName,
            Role: loggeduser?.role,
            // UserIPAddess: loggeduser?.userIPAddess,
            // lastTimeLoggedIn: loggeduser?.lastTimeLoggedIn?.toString().slice(0, 19).replace("T", " "),
            LastTimeLoggedIn: moment(loggeduser?.lastTimeLoggedIn).format(
              "YYYY/MM/DD hh:mm A"
            ),
            // lastTimeLoggedOut: loggeduser?.lastTimeLoggedOut?.toString().slice(0, 19).replace("T", " "),
            LastTimeLoggedOut: moment(loggeduser?.lastTimeLoggedOut).format(
              "YYYY/MM/DD hh:mm A"
            ),
            IsActive: loggeduser?.isActive ? "Logged In" : "Logged Out",
            UsedBrowser: loggeduser?.browser,
          }))}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          showPerPage={loggeduserPerPage}
          onPerPageChange={handlePerPageChange}
          isPagination="true"
          searchQuery={searchQuery}
          isSearchQuery={true}
          totalData={totalLoggedUser}
        />
      )}
    </div>
  );
};

export default LoggedInUser;
