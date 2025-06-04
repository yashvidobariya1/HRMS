import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router";
import { GetCall } from "../../ApiServices";
import "./Candidate.css";
import Loader from "../Helper/Loader";
import { showToast } from "../../main/ToastManager";
// import { MdOutlineLocalPostOffice } from "react-icons/md";
// import DeleteConfirmation from "../../main/DeleteConfirmation";
import CommonTable from "../../SeparateCom/CommonTable";
// import CommonAddButton from "../../SeparateCom/CommonAddButton";
import { TextField } from "@mui/material";
import { FaDownload } from "react-icons/fa6";
import { useSelector } from "react-redux";

const Candidate = () => {
  // const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [candidateList, setCandidateList] = useState([]);
  const [showDropdownAction, setShowDropdownAction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  // const [showConfirm, setShowConfirm] = useState(false);
  // const [candidateName, setCandidateName] = useState("");
  // const [candidateId, setCandidateId] = useState("");
  const [candidatePerPage, setCandidatePerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [totalcandidatePost, settotalcandidatePost] = useState([]);
  const companyId = useSelector((state) => state.companySelect.companySelect);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleAction = (id) => {
    setShowDropdownAction(showDropdownAction === id ? null : id);
  };

  // const HandleDeleteCandidate = async (id, name) => {
  //   setCandidateName(name);
  //   setCandidateId(id);
  //   setShowConfirm(true);
  // };

  const GetCandidate = async () => {
    try {
      setLoading(true);
      const response = await GetCall(
        `/getAllCandidates?page=${currentPage}&limit=${candidatePerPage}&search=${debouncedSearch}&companyId=${companyId}`
      );

      if (response?.data?.status === 200) {
        setCandidateList(response?.data?.candidates);
        settotalcandidatePost(response.data.totalCandidates);
        setTotalPages(response?.data?.totalPages);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // const cancelDelete = () => {
  //   setShowConfirm(false);
  //   setShowDropdownAction(null);
  // };

  // const confirmDelete = async (id) => {
  //   setShowConfirm(false);
  //   setShowDropdownAction(null);
  //   try {
  //     setLoading(true);
  //     const response = await PostCall(`/deleteCandidatePost/${id}`);
  //     if (response?.data?.status === 200) {
  //       showToast(response?.data?.message, "success");
  //     } else {
  //       showToast(response?.data?.message, "error");
  //     }
  //     setLoading(false);
  //   } catch (error) {
  //     console.log("error", error);
  //   }
  //   GetCandidate();
  // };

  const tableHeaders = [
    "First name",
    "Last name",
    "Candidate Email",
    "Contact",
    "Dowload",
    // "Action",
  ];

  const handlecandidatePerPageChange = (e) => {
    setCandidatePerPage(e);
    setCurrentPage(1);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleDownloadResume = async (e, resumeUrl, firstName, lastName) => {
    e.preventDefault();
    const fileName = `${firstName} ${lastName} Resume.pdf`.replace(/\s+/g, "_");

    try {
      const response = await fetch(resumeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading resume:", error);
    }
  };

  useEffect(() => {
    GetCandidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, candidatePerPage, debouncedSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  return (
    <div className="candidate-list-container">
      <div className="candidate-list-flex">
        <div className="candidateList-title">
          <h1>Candidate List</h1>
        </div>
      </div>

      <TextField
        placeholder="Search Candidate"
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
            data={candidateList?.map((candidate) => ({
              _id: candidate._id,
              Name: candidate?.firstName,
              lastname: candidate?.lastName,
              email: candidate?.email,
              phonenumber: candidate?.phoneNumber,
              qrcode: (
                <div
                  className="qr-container"
                  onClick={(event) =>
                    handleDownloadResume(
                      event,
                      candidate.candidateResume,
                      candidate.firstName,
                      candidate.lastName
                    )
                  }
                  style={{
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <button className="Download-resume">
                    <FaDownload />
                    Resume
                  </button>
                </div>
              ),
            }))}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showPerPage={candidatePerPage}
            onPerPageChange={handlecandidatePerPageChange}
            handleAction={handleAction}
            isPagination="true"
            isSearchQuery={true}
            searchQuery={searchQuery}
            totalData={totalcandidatePost}
          />
          {/* {showConfirm && (
            <DeleteConfirmation
              confirmation={`Are you sure you want to delete <b>${candidateName}</b>?`}
              onConfirm={() => confirmDelete(candidateId)}
              onCancel={cancelDelete}
            />
          )} */}
        </>
      )}
    </div>
  );
};

export default Candidate;
