import React, { useEffect, useState } from "react";
import "./ViewReport.css";
import { useLocation } from "react-router";
import { PostCall } from "../../ApiServices";
import { showToast } from "../../main/ToastManager";
import Loader from "../Helper/Loader";
import TimesheetTable from "../../SeparateCom/TimesheetTable";
import { GrDocumentDownload } from "react-icons/gr";
import CommonAddButton from "../../SeparateCom/CommonAddButton";
import ApproveRejectConfirmation from "../../main/ApproveRejectConfirmation";

const TimeSheetReport = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const jobId = queryParams.get("jobId");
  const reportId = queryParams.get("reportId");
  const startDate = queryParams.get("startDate");
  const endDate = queryParams.get("endDate");
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(50);
  const [loading, setLoading] = useState(false);
  const [timesheetReportList, setTimesheetReportList] = useState([]);
  const [status, setStatus] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [rejectionReason, setRejectionReason] = useState("");

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePerPageChange = (e) => {
    setPerPage(e);
    setCurrentPage(1);
  };

  const handleApprove = async (e) => {
    const data = {
      reportId,
      jobId,
    };
    try {
      setLoading(true);
      const response = await PostCall(`/approveReport`, data);

      if (response?.data?.status === 200) {
        showToast(response?.data?.message, "success");
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.log("Error while downloading timesheet report.", error);
      showToast("An error occurred while processing your request.", "error");
    }
  };

  const handleRejectSubmit = async () => {
    // if (!rejectionReason) {
    //   setErrors({ rejectionReason: "Rejection reason is required!" });
    //   return;
    // }

    const data = {
      reportId,
      jobId,
      reason: rejectionReason,
    };

    try {
      setLoading(true);
      const response = await PostCall(`/rejectReport`, data);

      if (response?.data?.status === 200) {
        showToast(response?.data?.message, "success");
        setRejectionReason("");
        setErrors({});
        setShowConfirm(false);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.log("Error while downloading timesheet report.", error);
      showToast("An error occurred while processing your request.", "error");
    }
  };

  const handleReject = () => {
    setShowConfirm(true);
  };

  const handleCancel = () => {
    setRejectionReason("");
    setShowConfirm(false);
    setErrors({});
  };

  const downloadTimesheetReport = async () => {
    const data = {
      jobId,
      startDate,
      endDate,
      format: "pdf",
    };
    try {
      setLoading(true);
      const response = await PostCall(`/downloadTimesheetReport`, data);
      const base64 = response?.data?.pdfBase64;

      if (response?.data?.status === 200) {
        let fixedBase64 = base64?.replace(/-/g, "+")?.replace(/_/g, "/");

        while (fixedBase64?.length % 4 !== 0) {
          fixedBase64 += "=";
        }

        const binary = Uint8Array.from(atob(fixedBase64), (c) =>
          c.charCodeAt(0)
        );

        const blob = new Blob([binary], { type: response?.data?.mimeType });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = response?.data?.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.log("Error while downloading timesheet report.", error);
      showToast("An error occurred while processing your request.", "error");
    }
  };

  const GetTimesheetReport = async () => {
    try {
      setLoading(true);
      const data = {
        jobId,
        reportId,
        startDate,
        endDate,
      };

      // console.log("data", data);

      const response = await PostCall(
        `/getTimesheetReport?page=${currentPage}&limit=${perPage}`,
        data
      );

      if (response?.data?.status === 200) {
        setTimesheetReportList(response?.data?.report);
        setStatus(response?.data?.reportStatus);
        setTotalPages(response?.data?.totalPages);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    GetTimesheetReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="view-report-list-container">
      <div className="view-report-flex">
        <div className="timesheet-title">
          <h1>Employee's TimeSheet Report</h1>
        </div>
        <div className="view-report-download-container">
          {/* <button onClick={downloadTimesheetReport}>
            <GrDocumentDownload /> Download
          </button> */}
          {status === "Pending" && (
            <CommonAddButton
              label="Approve"
              // icon={GrDocumentDownload}
              onClick={handleApprove}
            />
          )}
          {status === "Pending" && (
            <CommonAddButton
              label="Reject"
              // icon={GrDocumentDownload}
              onClick={handleReject}
            />
          )}
          <CommonAddButton
            label="Download"
            icon={GrDocumentDownload}
            onClick={downloadTimesheetReport}
          />
        </div>
      </div>

      {loading ? (
        <div className="loader-wrapper">
          <Loader />
        </div>
      ) : (
        <>
          <TimesheetTable
            headers={["Date", "Status", "Timing", "Total Hours", "OverTime"]}
            timesheetReportList={timesheetReportList}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showPerPage={perPage}
            onPerPageChange={handlePerPageChange}
          />
        </>
      )}

      {showConfirm && status === "Pending" && (
        <ApproveRejectConfirmation
          title={`Reject Timesheet Report`}
          message={`Are you sure you want to reject the Timesheet Report?`}
          placeholder="Enter Reason for rejection"
          reason={rejectionReason}
          setReason={setRejectionReason}
          onSubmit={() => handleRejectSubmit()}
          onCancel={handleCancel}
          error={errors}
          actionType={status}
          leaves={[]}
        />
      )}
    </div>
  );
};

export default TimeSheetReport;
