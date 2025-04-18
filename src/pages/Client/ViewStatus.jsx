import React, { useEffect, useState } from "react";
import { GetCall } from "../../ApiServices";
import "./ViewStatus.css";
import Loader from "../Helper/Loader";
import { showToast } from "../../main/ToastManager";
import CommonTable from "../../SeparateCom/CommonTable";
import { useLocation } from "react-router-dom";

const ViewStatus = () => {
  const [loading, setLoading] = useState(false);
  const [statusList, setStatusList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportPerPage, setReportPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(0);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const reportId = searchParams.get("reportId");
  const [totalEmployees, settotalEmployees] = useState([]);
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const allStatusPending = statusList.every(
    (item) => item.status === "Pending"
  );

  const tableHeaders = allStatusPending
    ? ["Employee Name", "Job Title", "Role", "status"]
    : ["", "Employee Name", "Job Title", "Role", "status"];

  const handlereportPerPageChange = (e) => {
    setReportPerPage(e);
    setCurrentPage(1);
  };

  const GetEmployeesStatus = async () => {
    try {
      setLoading(true);
      const response = await GetCall(
        `/getReport/${reportId}?page=${currentPage}&limit=${reportPerPage}`
      );
      if (response?.data?.status === 200) {
        setStatusList(response?.data?.report?.employees);
        settotalEmployees(response.data.totalEmployees);
        setTotalPages(response?.data?.totalPages);
      } else {
        showToast(response?.data?.message);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    GetEmployeesStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, reportPerPage]);

  return (
    <div className="status-list-container">
      <div className="status-list-flex">
        <div className="status-list-title">
          <h1>View Status</h1>
        </div>
      </div>

      {loading ? (
        <div className="loader-wrapper">
          <Loader />
        </div>
      ) : (
        <>
          <CommonTable
            headers={tableHeaders}
            data={statusList?.map((status) => ({
              _id: status._id,
              name: status?.userName,
              jobTitle: status?.jobTitle,
              jobRole: status?.jobTitle,
              status: status?.status,
              reason: status?.reason,
              // GeneratedBy:status?.creatorBy
            }))}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showPerPage={reportPerPage}
            onPerPageChange={handlereportPerPageChange}
            isPagination="true"
            isSearchQuery={false}
            totalData={totalEmployees}
          />
        </>
      )}
    </div>
  );
};

export default ViewStatus;
