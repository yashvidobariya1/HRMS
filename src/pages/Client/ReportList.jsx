import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { GetCall, PostCall } from "../../ApiServices";
import "./ReportList.css";
import Loader from "../Helper/Loader";
import { showToast } from "../../main/ToastManager";
import CommonTable from "../../SeparateCom/CommonTable";
import CommonAddButton from "../../SeparateCom/CommonAddButton";
import { useLocation } from "react-router-dom";
import moment from "moment";

const ReportList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [reportList, setReportList] = useState([]);
  const [showDropdownAction, setShowDropdownAction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportPerPage, setReportPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(0);
  const [minDate, setMinDate] = useState(
    moment(process.env.REACT_APP_START_DATE).format("YYYY-MM-DD")
  );
  const [maxDate, setMaxDate] = useState(moment().format("YYYY-MM-DD"));
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
  });
  const [errors, setErrors] = useState({});
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const clientId = searchParams.get("clientId");
  const [totalReports, setTotalReports] = useState([]);
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleAction = (id) => {
    setShowDropdownAction(showDropdownAction === id ? null : id);
  };

  const HandleViewStatus = async (id) => {
    navigate(`/settings/client/reportlist/viewstatus?reportId=${id}`);
  };

  const tableHeaders = [
    "Start Date",
    "End Date",
    "Report Generated Date",
    "Status",
    "Action",
  ];

  const actions = [{ label: "View Status", onClick: HandleViewStatus }];

  const handlereportPerPageChange = (e) => {
    setReportPerPage(e);
    setCurrentPage(1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validate = () => {
    let newErrors = {};
    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }
    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const HandleGenerateReport = async () => {
    if (validate()) {
      const data = {
        ...formData,
        clientId,
      };
      try {
        setLoading(true);
        const response = await PostCall(`/generateLink`, data);
        if (response?.data?.status === 200) {
          showToast(response?.data?.message, "success");
          GetReports();
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  };

  const GetReports = async () => {
    try {
      setLoading(true);
      const response = await GetCall(
        `/getAllReports?clientId=${clientId}&page=${currentPage}&limit=${reportPerPage}`
      );

      if (response?.data?.status === 200) {
        setReportList(response?.data?.reports);
        setTotalReports(response.data.totalReports);
        setTotalPages(response?.data?.totalPages);
        setMinDate(response?.data?.startDate);
        setMaxDate(response?.data?.endDate);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    GetReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, reportPerPage]);

  return (
    <div className="report-list-container">
      <div className="report-list-flex">
        <div className="report-list-title">
          <h1>Report List</h1>
        </div>
        <div className="report-list-download-container">
          <div className="report-list-input-container">
            <label className="label">Start Date*</label>
            <input
              type="date"
              name="startDate"
              className="report-list-input"
              // value={formData?.startDate}
              value={formData.startDate ? formData.startDate : ""}
              onChange={handleChange}
              min={minDate}
              max={maxDate}
            />
            {errors?.startDate && (
              <p className="error-text">{errors?.startDate}</p>
            )}
          </div>
          <div className="report-list-input-container">
            <label className="label">End Date*</label>
            <input
              type="date"
              name="endDate"
              className="report-list-input"
              // value={formData?.endDate}
              value={formData.endDate ? formData.endDate : ""}
              onChange={handleChange}
              min={minDate}
              max={maxDate}
            />
            {errors?.endDate && <p className="error-text">{errors?.endDate}</p>}
          </div>
          <div className="report-list-action">
            <CommonAddButton
              label="Generate Report"
              // icon={MdAddBusiness}
              onClick={HandleGenerateReport}
            />
          </div>
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
            data={reportList?.map((report) => ({
              _id: report._id,
              startDate: report?.startDate,
              endDate: report?.endDate,
              generatedDate: moment(report?.createdAt).format(
                "YYYY/MM/DD hh:mm A"
              ),
              status: report?.status,
            }))}
            actions={{
              actionsList: actions,
            }}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showPerPage={reportPerPage}
            onPerPageChange={handlereportPerPageChange}
            handleAction={handleAction}
            isPagination="true"
            isSearchQuery={false}
            totalData={totalReports}
          />
        </>
      )}
    </div>
  );
};

export default ReportList;
