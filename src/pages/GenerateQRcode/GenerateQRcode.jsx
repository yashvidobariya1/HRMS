import React, { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import { FaDownload } from "react-icons/fa6";
import "./GenerateQRcode.css";
import { GetCall, PostCall } from "../../ApiServices";
import { useLocation } from "react-router";
import { showToast } from "../../main/ToastManager";
import Loader from "../Helper/Loader";
import CommonTable from "../../SeparateCom/CommonTable";
import DeleteConfirmation from "../../main/DeleteConfirmation";
import moment from "moment";
import CommonAddButton from "../../SeparateCom/CommonAddButton";

const GenerateQRcode = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const companyId = queryParams.get("companyId");
  const locationId = queryParams.get("locationId");
  const [showDropdownAction, setShowDropdownAction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [qrPerPage, setQrPerPage] = useState(50);
  const [QRvalue, setQRvalue] = useState("");
  const [qrName, setQrName] = useState("");
  const [qrId, setQrId] = useState("");
  const [QRcodeList, setQRCodeList] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const qrCodeRef = useRef();
  const ID = locationId !== null ? locationId : companyId;
  const uniqueQRName = `${QRvalue}-${
    moment().format("YYYYMMDDHHmmssSSS") + Math.floor(Math.random() * 1000)
  }`;
  const [totalQRCodes, settotalQRCodes] = useState([]);

  const tableHeaders = [
    "QRCode Value",
    "Location Name",
    "Company Name",
    "Status",
    "Generated On",
    "QR Code",
    "Action",
  ];

  const handleGenerateQRCode = async () => {
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
            qrValue: uniqueQRName,
            qrCode: pngBase64,
            qrType: locationId !== null ? "Location" : "Company",
          };
          try {
            setLoading(true);
            const response = await PostCall(`/generateQR/${ID}`, formdata);
            // console.log("response", response);
            if (response?.data?.status === 200) {
              showToast(response?.data?.message, "success");
              GetAllQRs(ID);
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

  const cancelDelete = () => {
    setShowConfirm(false);
    setShowDropdownAction(null);
  };

  const confirmDelete = async (id) => {
    setShowConfirm(false); // inactive - active
    setShowDropdownAction(null);
    try {
      setLoading(true);
      const response = await PostCall(`/inactivateQRCode/${id}`);
      if (response?.data?.status === 200) {
        showToast(response?.data?.message, "success");
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.log("error", error);
    }
    GetAllQRs(ID);
  };

  const handleAction = (id) => {
    setShowDropdownAction(showDropdownAction === id ? null : id);
  };

  const HandleDeleteQR = async (id, name) => {
    setQrName(name);
    setQrId(id);
    setShowConfirm(true);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handlePerPageChange = (e) => {
    // setQrPerPage(parseInt(e.target.value, 10));
    setQrPerPage(e);
    setCurrentPage(1);
  };

  const handleDownloadBase64 = (e, qrURL, locationName, companyName) => {
    e.preventDefault();

    const timestamp = moment().format("YYYYMMDD-HHmmss");
    const fileName = `${locationName}-${companyName}-${timestamp}.png`.replace(
      /\s+/g,
      "_"
    );

    fetch(qrURL)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => console.error("Error downloading QR Code:", error));
  };

  const GetAllQRs = async (id) => {
    try {
      setLoading(true);
      const QRs = await GetCall(
        `/getAllQRCodes/${id}?page=${currentPage}&limit=${qrPerPage}`
      );
      // console.log(QRs)
      if (QRs?.data?.status === 200) {
        setQRCodeList(QRs?.data?.QRCodes);
        settotalQRCodes(QRs?.data.totalQRCodes);
        setQRvalue(QRs?.data?.qrValue);
        setTotalPages(QRs?.data?.totalPages);
      } else {
        showToast(QRs?.data?.message, "error");
      }
      setLoading(false);
      // console.log("QRs", QRs);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (ID) {
      GetAllQRs(ID);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ID, currentPage, qrPerPage]);

  return (
    <div className="qr-generator-container">
      <div className="qr-generator-section">
        <h1>QR Code Generator</h1>
        <div className="generate-qr-button">
          {/* <button onClick={handleGenerateQRCode}>Generate QR Code</button> */}
          <CommonAddButton
            label="Generate QR Code"
            // icon={MdAddBusiness}
            onClick={handleGenerateQRCode}
          />
        </div>
      </div>
      {loading ? (
        <div className="loader-wrapper">
          <Loader />
        </div>
      ) : (
        <>
          <div className="qr-code" ref={qrCodeRef}>
            <QRCode className="location-generated-code" value={uniqueQRName} />
          </div>
          <CommonTable
            headers={tableHeaders}
            data={QRcodeList?.map((qr) => ({
              _id: qr?._id,
              Name: qr?.qrValue,
              LocationName: qr?.locationName,
              companyName: qr?.companyName,
              isactive: qr?.isActive ? "Active" : "Inactive",
              date: moment(qr?.createdAt).format("DD-MM-YYYY"),
              qrcode: (
                <div
                  className="qr-container"
                  onClick={(event) =>
                    handleDownloadBase64(
                      event,
                      qr.qrURL,
                      qr?.locationName,
                      qr?.companyName
                    )
                  }
                >
                  <img src={qr.qrURL} alt="QR Code" className="qr-image" />
                  <FaDownload className="download-icon" />
                </div>
              ),
            }))}
            actions={{
              actionsList: [{ label: "Inactive", onClick: HandleDeleteQR }],
            }}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showPerPage={qrPerPage}
            onPerPageChange={handlePerPageChange}
            handleAction={handleAction}
            isPagination="true"
            isSearchQuery={true}
            totalData={totalQRCodes}
          />
          {showConfirm && (
            <DeleteConfirmation
              confirmation={`Are you sure you want to inactive QR generated on <b>${qrName}</b>?`}
              onConfirm={() => confirmDelete(qrId)}
              onCancel={cancelDelete}
            />
          )}
        </>
      )}
    </div>
  );
};

export default GenerateQRcode;
