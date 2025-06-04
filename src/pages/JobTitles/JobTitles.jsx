import React, { useEffect, useState } from "react";
import { FaLocationDot } from "react-icons/fa6";
import { useNavigate } from "react-router";
import "./JobTitle.css";
import Loader from "../Helper/Loader";
import useApiServices from "../../useApiServices";
import { showToast } from "../../main/ToastManager";
import DeleteConfirmation from "../../main/DeleteConfirmation";
import CommonTable from "../../SeparateCom/CommonTable";
import CommonAddButton from "../../SeparateCom/CommonAddButton";
import { TextField } from "@mui/material";

const JobTitles = () => {
  const { GetCall, PostCall } = useApiServices();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [jobTitlesList, setjobTitlesList] = useState([]);
  const [jobTitlesName, setjobTitlesName] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [jobTitlesId, setjobTitlesId] = useState("");
  const [showDropdownAction, setShowDropdownAction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobTitlesPerPage, setjobTitlesPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [totaljobTitless, settotaljobTitless] = useState([]);

  const handleAction = (id) => {
    setShowDropdownAction(showDropdownAction === id ? null : id);
  };

  const GoTOAddjobTitles = () => {
    navigate("/jobtitles/addjobtitles");
  };

  const handlePageChange = (pageNumber) => {
    // console.log("pagnumber", pageNumber);
    setCurrentPage(pageNumber);
  };

  const HandleEditjobTitles = async (id) => {
    navigate(`/jobtitles/editjobtitles/${id}`);
    setShowDropdownAction(null);
  };

  const HandleDeletejobTitles = async (id, name) => {
    setjobTitlesName(name);
    setjobTitlesId(id);
    setShowConfirm(true);
  };

  const GetjobTitles = async () => {
    try {
      setLoading(true);
      const response = await GetCall(
        `/getAllJobTitles?page=${currentPage}&limit=${jobTitlesPerPage}&search=${debouncedSearch}`
      );

      if (response?.data?.status === 200) {
        setjobTitlesList(response?.data?.jobTitles);
        settotaljobTitless(response.data?.totalJobTitles);
        setTotalPages(response?.data?.totalPages);
      } else {
        showToast(response?.data?.message, "error");
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
      const response = await PostCall(`/deleteJobTitle/${id}`);
      if (response?.data?.status === 200) {
        showToast(response?.data?.message, "success");
        navigate("/jobTitles");
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.log("error", error);
    }
    GetjobTitles();
  };

  const HandleIsactiveUser = async (Id) => {
    try {
      setLoading(true);
      // console.log("active id", Id);
      const response = await PostCall(
        `/activeInactiveJobTitle?jobTitleId=${Id}`
      );

      if (response?.data?.status === 200) {
        showToast(response?.data?.message, "success");
        GetjobTitles();
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (error) {
      console.error("Error activating/deactivating job title:", error);
      showToast("An error occurred. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const headers = ["Job Title Name", "Status", "Action"];

  const handlePerPageChange = (e) => {
    // setjobTitlesPerPage(parseInt(e.target.value, 10));
    setjobTitlesPerPage(e);
    // console.log("jobTitlesPerPage", jobTitlesPerPage);
    setCurrentPage(1);
  };

  const actionsList = [
    {
      label: "Edit",
      onClick: HandleEditjobTitles,
    },
    {
      label: "Delete",
      onClick: HandleDeletejobTitles,
    },
    {
      label: "Active",
      onClick: (id) => HandleIsactiveUser(id, true),
    },
    {
      label: "Inactive",
      onClick: (id) => HandleIsactiveUser(id, false),
    },
  ];

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {
    GetjobTitles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, jobTitlesPerPage, debouncedSearch]);

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
    <div className="jobTitles-list-container">
      <div className="jobTitleslist-flex">
        <div className="jobTitleslist-title">
          <h1>Job Title List</h1>
        </div>
        <div className="jobTitleslist-action">
          <CommonAddButton
            label="Add Job Titles"
            icon={FaLocationDot}
            onClick={GoTOAddjobTitles}
          />
        </div>
      </div>
      <TextField
        label="Search Job Titles"
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
            data={jobTitlesList?.map((jobTitles) => ({
              _id: jobTitles._id,
              Name: jobTitles.name,
              Status: jobTitles.isActive ? "Active" : "Inactive",
              isActive: jobTitles.isActive,
            }))}
            actions={{
              showDropdownAction,
              actionsList,
              // onEdit: HandleEditjobTitles,
              // onDelete: HandleDeletejobTitles,
            }}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showPerPage={jobTitlesPerPage}
            onPerPageChange={handlePerPageChange}
            handleAction={handleAction}
            isPagination="true"
            searchQuery={searchQuery}
            isSearchQuery={true}
            totalData={totaljobTitless}
          />

          {showConfirm && (
            <DeleteConfirmation
              confirmation={`Are you sure you want to delete jobTitles <b>${jobTitlesName}</b>?`}
              onConfirm={() => confirmDelete(jobTitlesId)}
              onCancel={cancelDelete}
            />
          )}
        </>
      )}
    </div>
  );
};

export default JobTitles;
