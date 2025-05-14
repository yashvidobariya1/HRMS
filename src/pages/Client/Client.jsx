import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { GetCall, PostCall } from "../../ApiServices";
import "./Client.css";
import { showToast } from "../../main/ToastManager";
import { MdAddBusiness } from "react-icons/md";
import DeleteConfirmation from "../../main/DeleteConfirmation";
import CommonTable from "../../SeparateCom/CommonTable";
import CommonAddButton from "../../SeparateCom/CommonAddButton";
// import { useLocation } from "react-router-dom";
import { TextField } from "@mui/material";
import { useSelector } from "react-redux";
import Loader from "../Helper/Loader";

const Client = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clientList, setClientList] = useState([]);
  const [showDropdownAction, setShowDropdownAction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientPerPage, setClientPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(0);
  // const location = useLocation();
  // const searchParams = new URLSearchParams(location.search);
  // const companyId = searchParams.get("companyId");
  const companyId = useSelector((state) => state.companySelect.companySelect);
  const userRole = useSelector((state) => state.userInfo.userInfo.role);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [totalClient, settotalClient] = useState([]);
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleAction = (id) => {
    setShowDropdownAction(showDropdownAction === id ? null : id);
  };

  const HandleEditClient = async (id) => {
    navigate(`/clients/editclient/${id}`);
    setShowDropdownAction(null);
  };

  const HandleAddClient = async () => {
    if (
      companyId === "" ||
      companyId === undefined ||
      companyId === null ||
      companyId === "allCompany"
    ) {
      showToast("Please select a specific company", "error");
      return;
    }
    navigate(`/clients/addclient?companyId=${companyId}`);
    setShowDropdownAction(null);
  };

  const HandleDeleteClient = async (id, name) => {
    setClientName(name);
    setClientId(id);
    setShowConfirm(true);
  };

  const GetClients = async () => {
    try {
      setLoading(true);
      const response = await GetCall(
        `/getAllClients?companyId=${companyId}&page=${currentPage}&limit=${clientPerPage}&search=${debouncedSearch}`
      );

      if (response?.data?.status === 200) {
        setClientList(response?.data?.clients);
        settotalClient(response.data.totalClients);
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
      const response = await PostCall(`/deleteClient/${id}`);
      if (response?.data?.status === 200) {
        showToast(response?.data?.message, "success");
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.log("error", error);
    }
    GetClients();
  };

  const tableHeaders = [
    "Client Name",
    "Email",
    "City",
    "Mobile Number",
    "Action",
  ];

  const handleClientPerPageChange = (e) => {
    setClientPerPage(e);
    setCurrentPage(1);
  };

  const actions = [
    // { label: "Edit", onClick: HandleEditClient },
    // { label: "Delete", onClick: HandleDeleteClient },
    // { label: "Reports List", onClick: HandleReportList },
  ];

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const HandleGenerateQrCode = (id) => {
    // console.log("id", id);
    navigate(`/clients/generateqrcode?clientId=${id}`);
  };

  useEffect(() => {
    GetClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, clientPerPage, debouncedSearch, companyId]);

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

  if (userRole === "Superadmin") {
    actions.push(
      {
        label: "Edit",
        onClick: HandleEditClient,
      },
      {
        label: "Delete",
        onClick: HandleDeleteClient,
      }
    );
  }

  if (userRole === "Superadmin" || userRole === "Administrator") {
    actions.push({ label: "QRCode", onClick: HandleGenerateQrCode });
  }

  return (
    <div className="client-list-container">
      <div className="clientlist-flex">
        <div className="clientlist-title">
          <h1>Client List</h1>
        </div>
        <div className="clientlist-action">
          {userRole === "Superadmin" && (
            <CommonAddButton
              label="Add Client"
              icon={MdAddBusiness}
              onClick={HandleAddClient}
            />
          )}
        </div>
      </div>

      <TextField
        label="Search Client"
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
            data={clientList?.map((clients) => ({
              _id: clients._id,
              Name: clients?.clientName,
              email: clients?.email,
              City: clients?.city,
              contactNumber: clients?.contactNumber,
            }))}
            actions={{
              actionsList: actions,
            }}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showPerPage={clientPerPage}
            onPerPageChange={handleClientPerPageChange}
            handleAction={handleAction}
            isPagination="true"
            isSearchQuery={true}
            searchQuery={searchQuery}
            totalData={totalClient}
          />
          {showConfirm && (
            <DeleteConfirmation
              confirmation={`Are you sure you want to delete <b>${clientName}</b>?`}
              onConfirm={() => confirmDelete(clientId)}
              onCancel={cancelDelete}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Client;
