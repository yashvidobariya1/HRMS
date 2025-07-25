import React, { useEffect, useState } from "react";
import Loader from "../Helper/Loader";
import useApiServices from "../../useApiServices";
import { showToast } from "../../main/ToastManager";
import DeleteConfirmation from "../../main/DeleteConfirmation";
import CommonTable from "../../SeparateCom/CommonTable";
import moment from "moment";
import CommonAddButton from "../../SeparateCom/CommonAddButton";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "./HolidayList.css";
import { MdAssignmentAdd } from "react-icons/md";
import { MenuItem, Select } from "@mui/material";

const HolidayList = () => {
  const { GetCall, PostCall } = useApiServices();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [AllholidayList, setAllholidayList] = useState([]);
  const [HolidayName, setHolidayName] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [holidayid, setHolidayId] = useState("");
  const [showDropdownAction, setShowDropdownAction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [holidayPerPage, setholidayPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(0);
  // const { locationId } = useParams();
  const userRole = useSelector((state) => state.userInfo.userInfo.role);
  const companyId = useSelector((state) => state.companySelect.companySelect);
  // console.log("id", locationId);
  const [totalHoliday, setTotalHoliday] = useState([]);
  const handleAction = (id) => {
    setShowDropdownAction(showDropdownAction === id ? null : id);
  };

  const currentYear = moment().year();
  const startDate = process.env.REACT_APP_START_DATE || "2025-01-01";
  const startYear = moment(startDate).year();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const handleYearChange = (e) => {
    setSelectedYear(e);
    // setSelectedYear(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const HandleEditHoliday = async (id) => {
    navigate(`/holidays/editholiday/${id}`);
    setShowDropdownAction(null);
  };

  const HandleDeleteLocation = async (id, name) => {
    setHolidayName(name);
    setHolidayId(id);
    setShowConfirm(true);
  };

  const getAllHoliday = async () => {
    try {
      setLoading(true);

      const response = await GetCall(
        `/getAllHolidays?page=${currentPage}&limit=${holidayPerPage}&year=${selectedYear}&companyId=${companyId}`
      );
      if (response?.data?.status === 200) {
        setAllholidayList(response?.data.holidays);
        setTotalHoliday(response.data.totalHolidays);
        setTotalPages(response?.data?.totalPages);
        // console.log("response", response?.data.holidays);
      } else {
        showToast(response?.data?.message, "error");
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching holidays:", error);
      setLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setShowDropdownAction(null);
  };

  const confirmDelete = async (id) => {
    setShowConfirm(false);
    setShowDropdownAction(null);
    try {
      setLoading(true);
      const response = await PostCall(`/deleteHoliday/${id}`);
      if (response?.data?.status === 200) {
        showToast(response?.data?.message, "success");
        // navigate(`/location/holidays/holidaylist/${locationId}`);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      // console.log("error", error);
    }
    getAllHoliday();
  };

  const headers = ["Company Name", "Date", "Occasion", "Day"];
  if (userRole === "Superadmin" || userRole === "Administrator") {
    headers.push("Action");
  }

  const GoToAddHoliday = () => {
    // if (userRole === "Superadmin") {
    //   navigate(`/location/holidays/addholiday/${locationId}`);
    // } else {
    navigate(`/holidays/addholiday`);
    // }
  };

  const handlePerPageChange = (e) => {
    // setholidayPerPage(parseInt(e.target.value, 10));
    setholidayPerPage(e);
    setCurrentPage(1);
  };

  const actionsList = [
    {
      label: "Edit",
      onClick: HandleEditHoliday,
    },
    {
      label: "Delete",
      onClick: HandleDeleteLocation,
    },
  ];

  // const HandleBack = () => {
  //   // if (userRole === "Superadmin") {
  //   //   navigate(`/location/holidays/${locationId}`);
  //   // } else {
  //   navigate("/holidays");
  //   // }
  // };

  useEffect(() => {
    getAllHoliday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, holidayPerPage, selectedYear, companyId]);

  return (
    <div className="Holidaylist-list-container">
      <div className="holidaylist-flex">
        <div className="holidaylist-title">
          <h1>Holiday List</h1>
          {(userRole === "Superadmin" || userRole === "Administrator") && (
            <>
              {/* <select
                id="year-select"
                value={selectedYear}
                onChange={handleYearChange}
                className="holiday-Year-select"
              >
                {[...Array(currentYear - startYear + 1)].map((_, index) => {
                  const year = startYear + index;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select> */}
              <Select
                id="year-select"
                value={selectedYear}
                onChange={handleYearChange}
                className="holiday-year-select"
                displayEmpty
                MenuProps={{
                  disableAutoFocusItem: true,
                  PaperProps: {
                    style: {
                      width: 80,
                      maxHeight: 200,
                      overflowX: "auto",
                      scrollbarWidth: "thin",
                    },
                  },
                }}
              >
                {[...Array(currentYear - startYear + 1)].map((_, index) => {
                  const year = startYear + index;
                  return (
                    <MenuItem key={year} value={year} className="menu-item">
                      {year}
                    </MenuItem>
                  );
                })}
              </Select>
            </>
          )}
        </div>
        <div className="holidaylist-action">
          {/* <CommonAddButton label="View calendar" onClick={HandleBack} /> */}
          {(userRole === "Superadmin" || userRole === "Administrator") && (
            <CommonAddButton
              label="Add Holiday"
              icon={MdAssignmentAdd}
              onClick={GoToAddHoliday}
            />
          )}
        </div>
      </div>

      {loading ? (
        <div className="loader-wrapper">
          <Loader />
        </div>
      ) : (
        <>
          <CommonTable
            tableName="HolidayList"
            headers={headers}
            data={AllholidayList?.map((holidaylist) => ({
              _id: holidaylist._id,
              comapnyName: holidaylist.companyName,
              name: holidaylist.date,
              Name: holidaylist.occasion,
              day: moment(holidaylist.date).format("dddd"),
            }))}
            actions={{
              // showDropdownAction,
              actionsList,
              // onEdit: HandleEditHoliday,
              // onDelete: HandleDeleteLocation,
            }}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showPerPage={holidayPerPage}
            onPerPageChange={handlePerPageChange}
            handleAction={handleAction}
            isPagination="true"
            totalData={totalHoliday}
          />

          {showConfirm && (
            <DeleteConfirmation
              confirmation={`Are you sure you want to delete holiday on <b>${HolidayName}</b>?`}
              onConfirm={() => confirmDelete(holidayid)}
              onCancel={cancelDelete}
            />
          )}
        </>
      )}
    </div>
  );
};

export default HolidayList;
