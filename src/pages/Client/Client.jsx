import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import useApiServices from "../../useApiServices";
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
import QRCode from "react-qr-code";
import moment from "moment";
import { FaDownload } from "react-icons/fa6";

const Client = () => {
  const { GetCall, PostCall } = useApiServices();
  const navigate = useNavigate();
  const qrCodeRef = useRef();
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
  const [QRvalue, setQRvalue] = useState("");

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
        settotalClient(response?.data?.totalClients);
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
    "Active QR",
    "Action",
  ];

  const handleClientPerPageChange = (e) => {
    setClientPerPage(e);
    setCurrentPage(1);
  };

  const actions = [];

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const HandleGenerateQrCode = (id) => {
    navigate(`/clients/generateqrcode?clientId=${id}`);
  };

  const HandleGenerateNewQrCode = async (
    id,
    param1,
    param2,
    param3,
    param4,
    qrValue
  ) => {
    const newQRName = `${qrValue}-${moment().format(
      "YYYYMMDDHHmmssSSS"
    )}${Math.floor(Math.random() * 1000)}`;
    setQRvalue(newQRName);
    setTimeout(() => {
      const qrCodeSVG = qrCodeRef.current.querySelector("svg");

      if (qrCodeSVG) {
        const svgData = new XMLSerializer().serializeToString(qrCodeSVG);
        const img = new Image();
        const svgBlob = new Blob([svgData], { type: "image/svg+xml" });
        const svgUrl = URL.createObjectURL(svgBlob);

        img.onload = async () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const pngBase64 = canvas.toDataURL("image/png");
          const formdata = {
            qrValue: newQRName,
            qrCode: pngBase64,
          };
          try {
            setLoading(true);
            const response = await PostCall(
              `/generateQRCodeForClient/${id}`,
              formdata
            );
            // console.log("response", response);
            if (response?.data?.status === 200) {
              showToast(response?.data?.message, "success");
              GetClients();
            } else {
              showToast(response?.data?.message, "error");
            }
            setLoading(false);
          } catch (error) {
            console.error("Error:", error);
          }
        };

        img.src = svgUrl;
      }
    }, 0);
  };

  const handleDownloadBase64 = async (e, qrURL, qrName) => {
    e.stopPropagation();

    const timestamp = moment().format("YYYYMMDD-HHmmss");
    const fileName = `${qrName || "qr-code"}-${timestamp}.png`.replace(
      /\s+/g,
      "_"
    );

    try {
      const response = await fetch(qrURL, { mode: "cors" });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;

      // Append for Safari
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      window.URL.revokeObjectURL(url);
      showToast("QR Code downloaded successfully!", "success");
    } catch (err) {
      console.error("Download failed:", err);
      showToast("Failed to download QR Code.", "error");
    }
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

  // if (userRole === "Superadmin" || userRole === "Administrator") {
  //   actions.push({ label: "QRCode", onClick: HandleGenerateQrCode });
  // }

  if (userRole === "Superadmin" || userRole === "Administrator") {
    actions.push({ label: "New QRCode", onClick: HandleGenerateNewQrCode });
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
          <div className="qr-code" ref={qrCodeRef}>
            <QRCode className="client-generated-code" value={QRvalue} />
          </div>
          <CommonTable
            headers={tableHeaders}
            data={clientList?.map((clients) => ({
              _id: clients._id,
              Name: clients?.clientName,
              email: clients?.email,
              City: clients?.city,
              contactNumber: clients?.contactNumber,
              latestQRCode: clients?.latestQRCode,
              latestQRCode: clients?.latestQRCode ? (
                <div
                  className="qr-container"
                  onClick={(event) =>
                    handleDownloadBase64(
                      event,
                      clients?.latestQRCode,
                      clients?.qrValue
                    )
                  }
                >
                  <img
                    src={clients?.latestQRCode}
                    alt="QR Code"
                    className="qr-image"
                  />
                  <FaDownload className="download-icon" />
                </div>
              ) : (
                "No Active QR"
              ),
              qrValue: clients?.qrValue,
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
