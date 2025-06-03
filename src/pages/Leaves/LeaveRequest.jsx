import React, { useState, useEffect } from "react";
import CommonTable from "../../SeparateCom/CommonTable";
import { GetCall, PostCall } from "../../ApiServices";
import { showToast } from "../../main/ToastManager";
import Loader from "../Helper/Loader";
import "./LeaveRequest.css";
import ApproveRejectConfirmation from "../../main/ApproveRejectConfirmation";
// import { useLocation, useNavigate } from "react-router";
// import { useSelector } from "react-redux";
import { TextField } from "@mui/material";
import { useSelector } from "react-redux";
import moment from "moment";

const LeavesRequest = () => {
  const [leaveList, setLeaveList] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [duration, setDuration] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [leavePerPage, setleavePerPage] = useState(50);
  const [loading, setLoading] = useState(false);
  const [showDropdownAction, setShowDropdownAction] = useState(null);
  const [employeeName, setEmployeeName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [approvalReason, setApprovalReason] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionType, setActionType] = useState("");
  const [errors, setErrors] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [totalLeaves, setTotalLeaves] = useState([]);
  const [approvedLeaveHours, setApprovedLeaveHours] = useState(0);
  const [totalLeavesHours, setTotalLeavesHours] = useState(0);
  const companyId = useSelector((state) => state.companySelect.companySelect);
  // const location = useLocation();
  // const queryParams = new URLSearchParams(location.search);
  // const jobId = queryParams.get("jobId");
  // const userRole = useSelector((state) => state.userInfo.userInfo.role);
  const headers = [
    "",
    "Employee",
    "Leave Date",
    "Duration",
    "Requested Leave",
    "Approved Leave",
    "Leave status",
    "Leave Type",
    // "Paid",
    "Action",
  ];

  const allowedDurations = [
    "Full-Day",
    "Multiple",
    "First-Half",
    "Second-Half",
  ];

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const GetLeave = async () => {
    try {
      setLoading(true);
      const response = await GetCall(
        `/getAllLeaveRequest?page=${currentPage}&limit=${leavePerPage}&search=${debouncedSearch}&companyId=${companyId}`
      );
      if (response?.data?.status === 200) {
        setLeaveList(response?.data?.allLeaveRequests);
        setTotalLeaves(response.data?.totalLeaveRequests);
        setTotalPages(response?.data?.totalPages);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleLeavePerPageChange = (e) => {
    setleavePerPage(parseInt(e));
    setCurrentPage(1);
  };

  const handleAction = (id) => {
    setShowDropdownAction(showDropdownAction === id ? null : id);
  };

  const handleApproveSubmit = async (id) => {
    const isAnyLeaveApproved = leaves.some((leave) => leave.isApproved);

    if (!isAnyLeaveApproved && duration === "Multiple") {
      setErrors({ leaveApproval: "At least one leave must be approved!" });
      return;
    }

    // if (!approvalReason && duration === "Multiple") {
    //   setErrors({ approvalReason: "Approval reason is required!" });
    //   return;
    // }

    if (!allowedDurations.includes(duration)) {
      if (approvedLeaveHours > totalLeavesHours) {
        // console.log("approvedLeaveHours", approvedLeaveHours);
        setErrors({
          approvedLeaveHours:
            "Approval hour is not greater to requested hours!",
        });
        return;
      }

      if (approvedLeaveHours < 0) {
        setErrors({
          approvedLeaveHours: "Approval hour must greater or equal zero!",
        });
        return;
      }

      if (!/^\d+$/.test(approvedLeaveHours)) {
        setErrors({
          approvedLeaveHours: "Approval hour must be a positive number!",
        });
        return;
      }

      // if (!approvalReason) {
      //   setErrors({
      //     approvedLeaveHours: "Approval reason is required  !",
      //   });
      //   return;
      // }
    }

    const data = { approvalReason: approvalReason, leaves, approvedLeaveHours };
    try {
      setLoading(true);
      const response = await PostCall(`/leaveRequestApprove/${id}`, data);
      if (response?.data?.status === 200) {
        showToast(response?.data?.message, "success");
        setApprovalReason("");
        setErrors({});
        GetLeave();
        setShowConfirm(false);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      showToast("Failed to approve leave", "error");
    }
  };

  const handleRejectSubmit = async (id) => {
    // if (!rejectionReason) {
    //   setErrors({ rejectionReason: "Rejection reason is required!" });
    //   return;
    // }
    const data = { rejectionReason: rejectionReason };
    try {
      setLoading(true);
      const response = await PostCall(`/leaveRequestReject/${id}`, data);
      if (response?.data?.status === 200) {
        showToast(response?.data?.message, "success");
        setRejectionReason("");
        setErrors({});
        GetLeave();
        setShowConfirm(false);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      showToast("Failed to reject leave", "error");
    }
  };

  const handleCancel = () => {
    setEmployeeName("");
    setEmployeeId("");
    setApprovalReason("");
    setRejectionReason("");
    setApprovedLeaveHours(0);
    setShowConfirm(false);
    setActionType("");
    setErrors({});
  };

  const HandleApprove = (id, userName, leaves, duration, totalLeavesHours) => {
    setEmployeeName(userName);
    setEmployeeId(id);
    setLeaves(leaves);
    // console.log("leave", leaves);
    setActionType("approve");
    setDuration(duration);
    setTotalLeavesHours(totalLeavesHours);
    setShowConfirm(true);
  };

  const HandleReject = (id, userName, leaves, duration) => {
    setEmployeeName(userName);
    setEmployeeId(id);
    setLeaves(leaves);
    setActionType("reject");
    setDuration(duration);
    // console.log("duration", duration);
    setShowConfirm(true);
  };

  // const HandleEdit = (id) => {
  //   if (userRole === "Superadmin") {
  //     navigate(`/leavesrequest/editleaves/${id}?jobId=${jobId}`);
  //   } else {
  //     navigate(`/leaves/leavesrequest/editleaves/${id}?jobId=${jobId}`);
  //   }
  // };

  const leaveActions = [
    {
      label: "Approve",
      onClick: HandleApprove,
    },
    {
      label: "Reject",
      onClick: HandleReject,
    },
    // {
    //   label: "Edit",
    //   onClick: HandleEdit,
    // },
  ];

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {
    GetLeave();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, leavePerPage, searchQuery, companyId]);

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
    <div className="leave-list-container">
      <div className="leavelist-flex">
        <div className="leavelist-title">
          <h1>Leave Request</h1>
        </div>
      </div>

      <TextField
        label="Search Leave Request"
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
              StartDate: moment(leave.startDate).format("DD/MM/YYYY"),
              SelectionDuration: leave.selectionDuration,
              TotalLeaveDays: leave.totalRequestedLeaves,
              NumberOfApproveLeaves: leave.totalApprovedLeaves,
              status: leave.status,
              leaveType: leave.leaveType,
              leaves: leave.leaves,
              rejectionReason: leave.rejectionReason,
              approvalReason: leave.approvalReason,
              reasonOfLeave: leave.reasonOfLeave,
              // totalLeaveHours: leave?.totalLeaveHours,
              isPaidLeave: leave.isPaidLeave === true ? "Paid" : "Unpaid",
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
            isPagination="true"
            searchQuery={searchQuery}
            totalData={totalLeaves}
          />
        </>
      )}
      {showConfirm && actionType === "approve" && (
        <ApproveRejectConfirmation
          title={`Approve Leave Request`}
          message={`Are you sure you want to approve the leave request for ${employeeName}?`}
          placeholder="Enter Reason for approval"
          reason={approvalReason}
          setReason={setApprovalReason}
          onSubmit={() => handleApproveSubmit(employeeId)}
          onCancel={handleCancel}
          error={errors}
          actionType={actionType}
          leaves={leaves}
          setLeaves={setLeaves}
          duration={duration}
          approvedLeaveHours={approvedLeaveHours}
          setApprovedLeaveHours={setApprovedLeaveHours}
        />
      )}

      {showConfirm && actionType === "reject" && (
        <ApproveRejectConfirmation
          title={`Reject Leave Request`}
          message={`Are you sure you want to reject the leave request for ${employeeName}?`}
          placeholder="Enter Reason for rejection"
          reason={rejectionReason}
          setReason={setRejectionReason}
          onSubmit={() => handleRejectSubmit(employeeId)}
          onCancel={handleCancel}
          error={errors}
          actionType={actionType}
          leaves={leaves}
          setLeaves={setLeaves}
          duration={duration}
          approvedLeaveHours={approvedLeaveHours}
          setApprovedLeaveHours={setApprovedLeaveHours}
        />
      )}
    </div>
  );
};

export default LeavesRequest;
