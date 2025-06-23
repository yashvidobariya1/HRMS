import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import useApiServices from "../../useApiServices";
import "./ReportList.css";
import Loader from "../Helper/Loader";
import { showToast } from "../../main/ToastManager";
import CommonTable from "../../SeparateCom/CommonTable";
// import CommonAddButton from "../../SeparateCom/CommonAddButton";
// import { useLocation } from "react-router-dom";
import moment from "moment";
import { useSelector } from "react-redux";
import { ListSubheader, MenuItem, Select, TextField } from "@mui/material";

const ReportList = () => {
  const { GetCall } = useApiServices();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [reportList, setReportList] = useState([]);
  const [showDropdownAction, setShowDropdownAction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportPerPage, setReportPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(0);
  const [clientList, setClientList] = useState([]);
  const [selectedClient, setSelectedClient] = useState("allClients");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [minDate, setMinDate] = useState(
    moment(process.env.REACT_APP_START_DATE).format("YYYY-MM-DD")
  );
  const [searchTerm, setSearchTerm] = useState("");
  const startDate = process.env.REACT_APP_START_DATE || "2025-01-01";
  const startYear = moment(startDate).year();
  const currentYear = moment().year();
  const currentMonth = moment().month() + 1;
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [maxDate, setMaxDate] = useState(moment().format("YYYY-MM-DD"));
  // const [formData, setFormData] = useState({
  //   startDate: "",
  //   endDate: "",
  // });
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [appliedFilters, setAppliedFilters] = useState({
    year: currentYear,
    month: currentMonth,
  });
  // const [errors, setErrors] = useState({});
  // const location = useLocation();
  // const searchParams = new URLSearchParams(location.search);
  // const clientId = searchParams.get("clientId");
  const [totalReports, setTotalReports] = useState([]);
  const companyId = useSelector((state) => state.companySelect.companySelect);
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleAction = (id) => {
    setShowDropdownAction(showDropdownAction === id ? null : id);
  };

  const filteredClientList = useMemo(() => {
    return clientList.filter((user) =>
      user.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, clientList]);

  const HandleViewStatus = async (id) => {
    // navigate(`/clients/reportlist/viewstatus?reportId=${id}`);
    navigate(`/reportlist/viewstatus?reportId=${id}`);
  };

  const tableHeaders = [
    "Client name",
    "Start Date",
    "End Date",
    "Generated on",
    "Action By",
    "Status",
    "View",
  ];

  const actions = [{ label: "View Status", onClick: HandleViewStatus }];

  const handlereportPerPageChange = (e) => {
    setReportPerPage(e);
    setCurrentPage(1);
  };

  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setFormData((prevData) => ({
  //     ...prevData,
  //     [name]: value,
  //   }));
  // };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // const validate = () => {
  //   let newErrors = {};
  //   if (!formData.startDate) {
  //     newErrors.startDate = "Start date is required";
  //   }
  //   if (!formData.endDate) {
  //     newErrors.endDate = "End date is required";
  //   }
  //   setErrors(newErrors);
  //   return Object.keys(newErrors).length === 0;
  // };

  const months = moment
    .months()
    .map((month, index) => ({
      name: moment().month(index).format("MMM"),
      value: index + 1,
    }))
    .filter(
      (month) => selectedYear < currentYear || month.value <= currentMonth
    );

  // const HandleGenerateReport = async () => {
  //   if (
  //     selectedClient === "" ||
  //     selectedClient === undefined ||
  //     selectedClient === null ||
  //     selectedClient === "allClients"
  //   ) {
  //     showToast("Please select a specific client", "error");
  //     return;
  //   }
  //   if (validate()) {
  //     const data = {
  //       ...formData,
  //       selectedClient,
  //     };
  //     try {
  //       setLoading(true);
  //       const response = await PostCall(`/generateLink`, data);
  //       if (response?.data?.status === 200) {
  //         showToast(response?.data?.message, "success");
  //         GetReports();
  //       } else {
  //         showToast(response?.data?.message, "error");
  //       }
  //       setLoading(false);
  //     } catch (error) {
  //       console.error("Error fetching data:", error);
  //     }
  //   }
  // };

  const GetAllClients = async () => {
    try {
      setLoading(true);
      const response = await GetCall(
        `/getAllClients?companyId=${companyId}&page=${currentPage}&limit=${reportPerPage}`
      );
      if (response?.data?.status === 200) {
        setClientList(response?.data?.clients);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const GetReports = async () => {
    try {
      setLoading(true);
      const response = await GetCall(
        `/getAllReports?clientId=${selectedClient}&page=${currentPage}&limit=${reportPerPage}&companyId=${companyId}&search=${debouncedSearch}`
      );

      if (response?.data?.status === 200) {
        setReportList(response?.data?.reports);
        setTotalReports(response.data.totalReports);
        setTotalPages(response?.data?.totalPages);
        setMinDate(response?.data?.startDate);
        setMaxDate(response?.data?.endDate);
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleFilter = async () => {
    setAppliedFilters({
      year: selectedYear,
      month: selectedMonth,
    });
    console.log("set filter", selectedYear, selectedMonth);
  };

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

  useEffect(() => {
    GetReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, reportPerPage, companyId, selectedClient, debouncedSearch]);

  useEffect(() => {
    GetAllClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, reportPerPage, companyId]);

  useEffect(() => {
    setSelectedClient("allClients");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  return (
    <div className="report-list-container">
      <div className="report-list-flex">
        <div className="report-list-title">
          <h1>Report List</h1>
        </div>
        <div className="report-download-container">
          <div className="report-input-container">
            <label className="label">Client</label>
            <Select
              className="reportlist-dropdown clients-list"
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              displayEmpty
              MenuProps={{
                disableAutoFocusItem: true,
                PaperProps: {
                  style: {
                    width: 100,
                    overflowX: "auto",
                    scrollbarWidth: "thin",
                    maxHeight: 200,
                  },
                },
                MenuListProps: {
                  onMouseDown: (e) => {
                    if (e.target.closest(".search-textfield")) {
                      e.stopPropagation();
                    }
                  },
                },
              }}
              renderValue={(selected) => {
                if (!selected) return "Select Client";
                if (selected === "allClients") return "All Clients";
                const found = clientList.find((emp) => emp._id === selected);
                return found?.clientName || "No found";
              }}
            >
              <ListSubheader>
                <TextField
                  size="small"
                  placeholder="Search Client"
                  fullWidth
                  className="search-textfield"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </ListSubheader>
              <MenuItem value="allClients" className="menu-item">
                All Clients
              </MenuItem>
              {filteredClientList.map((client) => (
                <MenuItem
                  key={client._id}
                  value={client._id}
                  className="menu-item"
                >
                  {client.clientName}
                </MenuItem>
              ))}
            </Select>
          </div>
          <div className="report-input-container">
            <label className="label">Month</label>
            <Select
              className="reportlist-dropdown"
              value={selectedMonth}
              displayEmpty
              onChange={(e) => setSelectedMonth(e.target.value)}
              MenuProps={{
                PaperProps: {
                  style: {
                    width: 80,
                    overflowX: "auto",
                    scrollbarWidth: "thin",
                    maxHeight: 200,
                  },
                },
              }}
            >
              {/* <MenuItem value="All">All</MenuItem> */}
              {months?.map((month) => (
                <MenuItem key={month.value} value={month.value}>
                  {month.name}
                </MenuItem>
              ))}
            </Select>
            {/* {errors?.startDate && (
              <p className="error-text">{errors?.startDate}</p>
            )} */}
          </div>
          <div className="report-input-container">
            <label className="label">Year</label>
            <Select
              value={selectedYear}
              className="reportlist-dropdown"
              onChange={(e) => setSelectedYear(e.target.value)}
              MenuProps={{
                PaperProps: {
                  style: {
                    width: 80,
                    overflowX: "auto",
                    scrollbarWidth: "thin",
                    maxHeight: 200,
                  },
                },
              }}
            >
              {[...Array(currentYear - startYear + 1)].map((_, index) => {
                const year = startYear + index;
                return (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                );
              })}
            </Select>
          </div>
          <button onClick={handleFilter}>Filter</button>
        </div>
        {/* <div className="report-list-download-container">
          <div className="report-list-input-container">
            <label className="label">Start Date*</label>
            <input
              type="date"
              name="startDate"
              className="report-list-input"
              value={formData?.startDate}
              // value={formData.startDate ? formData.startDate : ""}
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
              value={formData?.endDate}
              // value={formData.endDate ? formData.endDate : ""}
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
        </div> */}
      </div>

      <div className="report-list-flex">
        <TextField
          placeholder="Search"
          variant="outlined"
          size="small"
          value={searchQuery}
          className="common-searchbar"
          onChange={handleSearchChange}
        />
      </div>

      {loading ? (
        <div className="loader-wrapper">
          <Loader />
        </div>
      ) : (
        <>
          <CommonTable
            headers={tableHeaders}
            tableName="ReportList"
            data={reportList?.map((report) => ({
              _id: report._id,
              clientName: report?.clientName,
              startDate: moment(report?.startDate).format("DD/MM/YYYY"),
              endDate: moment(report?.endDate).format("DD/MM/YYYY"),
              generatedDate: moment(report?.createdAt).format(
                "DD/MM/YYYY hh:mm A"
              ),
              actionBy: report?.actionBy,
              reportstatus: report?.status,
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
            totalData={totalReports}
          />
        </>
      )}
    </div>
  );
};

export default ReportList;
