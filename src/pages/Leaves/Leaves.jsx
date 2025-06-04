import React, { useState, useEffect } from "react";
import CommonTable from "../../SeparateCom/CommonTable";
import { MdAddBusiness } from "react-icons/md";
import { useNavigate } from "react-router";
import useApiServices from "../../useApiServices";
import { showToast } from "../../main/ToastManager";
import "./Leaves.css";
import CommonAddButton from "../../SeparateCom/CommonAddButton";
import { useSelector } from "react-redux";
// import JobTitleForm from "../../SeparateCom/RoleSelect";
import DeleteConfirmation from "../../main/DeleteConfirmation";
import { TextField } from "@mui/material";
import Loader from "../Helper/Loader";
import moment from "moment";

const Leaves = () => {
  const { GetCall, PostCall } = useApiServices();
  const [leaveList, setLeaveList] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [leavePerPage, setleavePerPage] = useState(50);
  const [loading, setLoading] = useState(false);
  const [showDropdownAction, setShowDropdownAction] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  // const [openJobTitleModal, setOpenJobTitleModal] = useState(false);
  // const [JobTitledata, setJobTitledata] = useState([]);
  // const [selectedJobId, setSelectedJobId] = useState("");
  const [LeaveName, setLeaveName] = useState("");
  const [leaveId, setleaveId] = useState("");
  const userRole = useSelector((state) => state.userInfo.userInfo.role);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const jobRoleId = useSelector(
    (state) => state.jobRoleSelect.jobRoleSelect.jobId
  );
  const [totalLeaves, settotalLeaves] = useState([]);

  const headers = [
    "",
    "Employee",
    "Leave Date",
    "Duration",
    "Leave status",
    "Leave Type",
    // "Paid",
    "Action",
  ];

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const GetLeave = async () => {
    try {
      // console.log("select jobtitle", jobRoleId);
      setLoading(true);
      const response = await PostCall(
        `/getAllOwnLeaves?page=${currentPage}&limit=${leavePerPage}&search=${debouncedSearch}`,
        { jobId: jobRoleId }
      );

      if (response?.data?.status === 200) {
        setLeaveList(response?.data?.allLeaves);
        settotalLeaves(response.data?.totalLeaves);
        setTotalPages(response?.data?.totalPages);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // const handlePopupClose = () => {
  //   setOpenJobTitleModal(true);
  // };

  // const handleJobTitleSelect = (selectedTitle) => {
  //   console.log("selecttitle", selectedTitle);
  //   setSelectedJobId(selectedTitle);
  //   setOpenJobTitleModal(true);
  // };

  const HandleAddLeaveList = () => {
    navigate(`/leaves/addleaves?jobId=${jobRoleId}`);
  };

  const HandleAddLeaveReq = () => {
    navigate(`/leaves/leavesrequest/?jobId=${jobRoleId}`);
  };

  const handleAction = (id) => {
    setShowDropdownAction(showDropdownAction === id ? null : id);
  };

  const HandleEditLeave = async (id) => {
    navigate(`/leaves/editleave/${id}?jobId=${jobRoleId}`);
    setShowDropdownAction(null);
  };

  const HandleDelete = async (id, name) => {
    setLeaveName(name);
    setleaveId(id);
    setShowConfirm(true);
  };

  const leaveActions = [
    { label: "Edit", onClick: HandleEditLeave },
    {
      label: "Delete",
      onClick: HandleDelete,
    },
  ];

  const handleLeavePerPageChange = (e) => {
    // setleavePerPage(parseInt(e.target.value));
    setleavePerPage(e);
    setCurrentPage(1);
  };

  // const Getjobtitledata = async () => {
  //   try {
  //     const response = await GetCall("/getUserJobTitles");
  //     if (response?.data?.status === 200) {
  //       const { multipleJobTitle, jobTitles } = response?.data;
  //       setJobTitledata(jobTitles);
  //       if (multipleJobTitle) {
  //         setOpenJobTitleModal(false);
  //       } else {
  //         setSelectedJobId(jobTitles[0]?.jobId);
  //         setOpenJobTitleModal(true);
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   }
  // };

  const cancelDelete = () => {
    setShowConfirm(false);
    setShowDropdownAction(null);
  };

  const confirmDelete = async (id) => {
    setShowConfirm(false);
    setShowDropdownAction(null);
    try {
      setLoading(true);
      const response = await PostCall(`/deleteLeaveRequest/${id}`);
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
    GetLeave();
  };

  // useEffect(() => {
  //   Getjobtitledata();
  // }, []);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {
    // if (openJobTitleModal && selectedJobId) {
    GetLeave();
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, leavePerPage, jobRoleId, debouncedSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  return (
    <>
      {/* {!openJobTitleModal && JobTitledata.length > 1 && (
        <JobTitleForm
          onClose={handlePopupClose}
          jobTitledata={JobTitledata}
          onJobTitleSelect={handleJobTitleSelect}
        />
      )} */}

      <div className="leave-list-container">
        <div className="leavelist-flex">
          <div className="leavelist-title">
            <h1>Leave</h1>
          </div>
          <div className="leavelist-action">
            <CommonAddButton
              label="Add Leave"
              icon={MdAddBusiness}
              onClick={HandleAddLeaveList}
            />
            {(userRole === "Superadmin" ||
              userRole === "Administrator" ||
              userRole === "Manager") && (
              <CommonAddButton
                label="Leave requests"
                icon={MdAddBusiness}
                onClick={HandleAddLeaveReq}
              />
            )}
          </div>
        </div>

        <TextField
          label="Search Leave"
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
          <>
            <CommonTable
              headers={headers}
              data={leaveList?.map((leave) => ({
                _id: leave._id,
                Name: leave.userName,
                startDate: moment(leave.startDate).format("DD/MM/YYYY"),
                selectionDuration: leave.selectionDuration,
                status: leave.status,
                leaveType: leave.leaveType,
                rejectionReason: leave.rejectionReason,
                approvalReason: leave.approvalReason,
                reasonOfLeave: leave.reasonOfLeave,
                // isPaidLeave: leave.isPaidLeave === true ? "Paid" : "Unpaid",
              }))}
              actions={{
                // showDropdownAction,
                actionsList: leaveActions,
                // onAction: handleAction,
              }}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              showPerPage={leavePerPage}
              onPerPageChange={handleLeavePerPageChange}
              handleAction={handleAction}
              searchQuery={searchQuery}
              isPagination="true"
              isSearchQuery={true}
              totalData={totalLeaves}
            />
            {showConfirm && (
              <DeleteConfirmation
                confirmation={`Are you sure you want to delete leave of <b>${LeaveName}</b>?`}
                onConfirm={() => confirmDelete(leaveId)}
                onCancel={cancelDelete}
              />
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Leaves;
