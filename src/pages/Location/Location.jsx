import React, { useEffect, useState } from "react";
import { FaLocationDot } from "react-icons/fa6";
import { useNavigate } from "react-router";
import "./Location.css";
import Loader from "../Helper/Loader";
import { GetCall, PostCall } from "../../ApiServices";
import { showToast } from "../../main/ToastManager";
import DeleteConfirmation from "../../main/DeleteConfirmation";
import CommonTable from "../../SeparateCom/CommonTable";
import CommonAddButton from "../../SeparateCom/CommonAddButton";
import { TextField } from "@mui/material";
import { useSelector } from "react-redux";

const Location = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [locationList, setLocationList] = useState([]);
  const [locationName, setLocationName] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [locationId, setLocationId] = useState("");
  const [showDropdownAction, setShowDropdownAction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [locationPerPage, setLocationPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [totalLocations, settotalLocations] = useState([]);
  const companyId = useSelector((state) => state.companySelect.companySelect);

  const handleAction = (id) => {
    setShowDropdownAction(showDropdownAction === id ? null : id);
  };

  const GoTOAddLocation = () => {
    if (
      companyId === "" ||
      companyId === undefined ||
      companyId === null ||
      companyId === "allCompany"
    ) {
      showToast("Please select a specific company", "error");
      return;
    }
    navigate("/location/addlocation");
  };

  const handlePageChange = (pageNumber) => {
    // console.log("pagnumber", pageNumber);
    setCurrentPage(pageNumber);
  };

  const HandleEditLocation = async (id) => {
    navigate(`/location/editlocation/${id}`);
    setShowDropdownAction(null);
  };

  const HandleDeleteLocation = async (id, name) => {
    setLocationName(name);
    setLocationId(id);
    setShowConfirm(true);
  };

  const GetLocations = async () => {
    try {
      setLoading(true);
      const response = await GetCall(
        `/getAllLocation?page=${currentPage}&limit=${locationPerPage}&search=${debouncedSearch}&companyId=${companyId}`
      );

      if (response?.data?.status === 200) {
        setLocationList(response?.data?.locations);
        settotalLocations(response.data?.totalLocations);
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
      const response = await PostCall(`/deleteLocation/${id}`);
      if (response?.data?.status === 200) {
        showToast(response?.data?.message, "success");
        navigate("/location");
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.log("error", error);
    }
    GetLocations();
  };

  const headers = ["Location Name", "Address", "City", "Post Code", "Action"];

  const handlePerPageChange = (e) => {
    // setLocationPerPage(parseInt(e.target.value, 10));
    setLocationPerPage(e);
    // console.log("LocationPerPage", locationPerPage);
    setCurrentPage(1);
  };

  const HandleGenerateQrCode = (id) => {
    // console.log("id", id);
    navigate(`/location/generateqrcode?locationId=${id}`);
  };

  // const HandleViewHoliday = (id) => {
  //   // console.log("id", id);
  //   navigate(`/location/holidays/${id}`);
  // };

  const actionsList = [
    {
      label: "Edit",
      onClick: HandleEditLocation,
    },
    {
      label: "Delete",
      onClick: HandleDeleteLocation,
    },
    { label: "QRCode", onClick: HandleGenerateQrCode },
    // {
    //   label: "Holiday",
    //   onClick: HandleViewHoliday,
    // },
  ];

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {
    GetLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, locationPerPage, debouncedSearch, companyId]);

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
    <div className="location-list-container">
      <div className="locationlist-flex">
        <div className="locationlist-title">
          <h1>Location List</h1>
        </div>
        <div className="locationlist-action">
          <CommonAddButton
            label="Add Location"
            icon={FaLocationDot}
            onClick={GoTOAddLocation}
          />
        </div>
      </div>
      <TextField
        label="Search Location"
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
            data={locationList?.map((location) => ({
              _id: location._id,
              Name: location.locationName,
              Address: location.address,
              City: location.city,
              Postcode: location.postcode,
            }))}
            actions={{
              showDropdownAction,
              actionsList,
              // onEdit: HandleEditLocation,
              // onDelete: HandleDeleteLocation,
            }}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showPerPage={locationPerPage}
            onPerPageChange={handlePerPageChange}
            handleAction={handleAction}
            isPagination="true"
            searchQuery={searchQuery}
            isSearchQuery={true}
            totalData={totalLocations}
          />

          {showConfirm && (
            <DeleteConfirmation
              confirmation={`Are you sure you want to delete location <b>${locationName}</b>?`}
              onConfirm={() => confirmDelete(locationId)}
              onCancel={cancelDelete}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Location;
