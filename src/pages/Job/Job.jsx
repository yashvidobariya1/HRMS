import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { GetCall, PostCall } from "../../ApiServices";
import "./Job.css";
import Loader from "../Helper/Loader";
import { showToast } from "../../main/ToastManager";
import { MdOutlineLocalPostOffice } from "react-icons/md";
import DeleteConfirmation from "../../main/DeleteConfirmation";
import CommonTable from "../../SeparateCom/CommonTable";
import CommonAddButton from "../../SeparateCom/CommonAddButton";
// import { useLocation } from "react-router-dom";
// import { useSelector } from "react-redux";
import { TextField } from "@mui/material";

const Job = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [jobList, setJobList] = useState([]);
  const [showDropdownAction, setShowDropdownAction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const [jobName, setJobName] = useState("");
  const [jobId, setJobId] = useState("");
  const [jobPerPage, setJobPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(0);
  // const userRole = useSelector((state) => state.userInfo.userInfo.role);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalJobPost, settotalJobPost] = useState([]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleAction = (id) => {
    setShowDropdownAction(showDropdownAction === id ? null : id);
  };

  const HandleEditJob = async (id) => {
    navigate(`/job/editjob/${id}`);
    setShowDropdownAction(null);
  };

  const HandleAddJob = async () => {
    navigate(`/job/addjob`);
    setShowDropdownAction(null);
  };

  const HandleDeleteJob = async (id, name) => {
    setJobName(name);
    setJobId(id);
    setShowConfirm(true);
  };

  const GetJobs = async () => {
    try {
      setLoading(true);
      const response = await GetCall(
        `/getAllJobPosts?page=${currentPage}&limit=${jobPerPage}&search=${searchQuery}`
      );

      if (response?.data?.status === 200) {
        setJobList(response?.data?.jobPost);
        settotalJobPost(response.data.totalJobPost);
        setTotalPages(response?.data?.totalPages);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
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
      const response = await PostCall(`/deleteJobPost/${id}`);
      if (response?.data?.status === 200) {
        showToast(response?.data?.message, "success");
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.log("error", error);
    }
    GetJobs();
  };

  const tableHeaders = [
    "Title",
    "Description",
    "Location",
    "Category",
    "Apply Date",
    "Status",
    "Apply Link",
    "Action",
  ];

  const handlejobPerPageChange = (e) => {
    setJobPerPage(e);
    setCurrentPage(1);
  };

  const actions = [
    { label: "Edit", onClick: HandleEditJob },
    { label: "Delete", onClick: HandleDeleteJob },
  ];

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {
    GetJobs();
  }, [currentPage, jobPerPage, searchQuery]);

  return (
    <div className="job-list-container">
      <div className="job-list-flex">
        <div className="jobList-title">
          <h1>Job List</h1>
        </div>

        <div className="jobList-action">
          {/* {userRole !== "Superadmin" && ( */}
          <CommonAddButton
            label="Add Job"
            icon={MdOutlineLocalPostOffice}
            onClick={HandleAddJob}
          />
          {/* )} */}
        </div>
      </div>

      <TextField
        label="Search Job"
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
            headers={tableHeaders}
            data={jobList?.map((job) => ({
              _id: job._id,
              Name: job?.jobTitle,
              jobDescription: job?.jobDescription,
              jobLocation: job?.jobLocation,
              jobCategory: job?.jobCategory,
              jobApplyTo: job?.jobApplyTo,
              Contact: job?.companyContactNumber,
              jobStatus: job?.jobStatus,
              jobPostedLink: job?.jobPostedLink,
            }))}
            actions={{
              actionsList: actions,
            }}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showPerPage={jobPerPage}
            onPerPageChange={handlejobPerPageChange}
            handleAction={handleAction}
            isPagination="true"
            isSearchQuery={true}
            searchQuery={searchQuery}
            totalData={totalJobPost}
          />
          {showConfirm && (
            <DeleteConfirmation
              confirmation={`Are you sure you want to delete <b>${jobName}</b>?`}
              onConfirm={() => confirmDelete(jobId)}
              onCancel={cancelDelete}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Job;
