import React, { useEffect, useState } from "react";
// import { SlOptionsVertical } from "react-icons/sl";
// import { IoMdPersonAdd } from "react-icons/io";
import { useNavigate } from "react-router";
import { GetCall, PostCall } from "../../ApiServices";
import "./Settings.css";
import Loader from "../Helper/Loader";
import { showToast } from "../../main/ToastManager";
import { MdAddBusiness } from "react-icons/md";
import DeleteConfirmation from "../../main/DeleteConfirmation";
import CommonTable from "../../SeparateCom/CommonTable";
import CommonAddButton from "../../SeparateCom/CommonAddButton";
import { TextField } from "@mui/material";
import { useSelector } from "react-redux";

const Settings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [companyList, setCompanyList] = useState([]);
  const [showDropdownAction, setShowDropdownAction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [companiesPerPage, setCompaniesPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const userRole = useSelector((state) => state.userInfo.userInfo.role);
  const [totalCompany, settotalCompany] = useState([]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleAction = (id) => {
    setShowDropdownAction(showDropdownAction === id ? null : id);
  };

  const HandleAddCompanyList = () => {
    navigate("/settings/addCompany");
  };

  const HandleEditCompany = async (id) => {
    navigate(`/settings/editcompany/${id}`);
    setShowDropdownAction(null);
  };

  const HandleAddEmployee = async (id) => {
    navigate(`/employees/addemployee?companyId=${id}`);
    setShowDropdownAction(null);
  };

  const HandleDeleteCompany = async (id, name) => {
    setCompanyName(name);
    setCompanyId(id);
    setShowConfirm(true);
  };

  const GetCompanies = async () => {
    try {
      setLoading(true);
      const response = await GetCall(
        `/getallcompany?page=${currentPage}&limit=${companiesPerPage}&search=${searchQuery}`
      );

      if (response?.data?.status === 200) {
        setCompanyList(response?.data?.companies);
        settotalCompany(response.data.totalCompanies);
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
      const response = await PostCall(`/deleteCompany/${id}`);
      if (response?.data?.status === 200) {
        showToast(response?.data?.message, "success");
        navigate("/settings");
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.log("error", error);
    }
    GetCompanies();
  };

  useEffect(() => {
    GetCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, companiesPerPage, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const tableHeaders = ["Business Name", "Company Code", "City", "Action"];

  const handleSettingPerPageChange = (e) => {
    setCompaniesPerPage(e);
    setCurrentPage(1);
  };

  // const HandleGenerateQrCode = (id) => {
  //   navigate(`/settings/generateqrcode?companyId=${id}`);
  // };

  const HandleClientList = (id) => {
    navigate(`/settings/client/?companyId=${id}`);
  };

  const settingactions = [
    // { label: "Edit", onClick: HandleEditCompany },
    // { label: "Delete", onClick: HandleDeleteCompany },
    { label: "Add Employee", onClick: HandleAddEmployee },
    { label: "Client list", onClick: HandleClientList },
    // { label: "QRCode", onClick: HandleGenerateQrCode },
  ];

  if (userRole === "Superadmin") {
    settingactions.push(
      {
        label: "Edit",
        onClick: HandleEditCompany,
      },
      {
        label: "Delete",
        onClick: HandleDeleteCompany,
      }
    );
  }

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <div className="company-list-container">
      <div className="companylist-flex">
        <div className="companylist-title">
          <h1>Company List</h1>
        </div>
        <div className="companylist-action">
          {userRole === "Superadmin" && (
            <CommonAddButton
              label="Add Company"
              icon={MdAddBusiness}
              onClick={HandleAddCompanyList}
            />
          )}
        </div>
      </div>
      <TextField
        label="Search Company"
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
            data={companyList.map((company) => ({
              _id: company._id,
              Name: company?.companyDetails?.businessName,
              CompanyCode: company?.companyDetails?.companyCode,
              City: company?.companyDetails?.city,
            }))}
            actions={{
              // showDropdownAction,
              actionsList: settingactions,
              // onAction: handleAction,
            }}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showPerPage={companiesPerPage}
            onPerPageChange={handleSettingPerPageChange}
            handleAction={handleAction}
            isPagination="true"
            isSearchQuery={true}
            searchQuery={searchQuery}
            totalData={totalCompany}
          />
          {showConfirm && (
            <DeleteConfirmation
              confirmation={`Are you sure you want to delete the company <b>${companyName}</b>?`}
              onConfirm={() => confirmDelete(companyId)}
              onCancel={cancelDelete}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Settings;
