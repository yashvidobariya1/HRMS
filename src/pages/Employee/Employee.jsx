import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { GetCall, PostCall } from "../../ApiServices";
import Loader from "../Helper/Loader";
import { showToast } from "../../main/ToastManager";
import DeleteConfirmation from "../../main/DeleteConfirmation";
import "./Employee.css";
import CommonTable from "../../SeparateCom/CommonTable";
import CommonAddButton from "../../SeparateCom/CommonAddButton";
import { useSelector } from "react-redux";
import { TextField } from "@mui/material";

const Employee = () => {
  const navigate = useNavigate();
  // const user = useSelector((state) => state.userInfo.userInfo);
  const [loading, setLoading] = useState(false);
  const [employeesList, setEmployeeList] = useState([]);
  const [showDropdownAction, setShowDropdownAction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [employeesPerPage, setEmployeesPerPage] = useState(50);
  const [showConfirm, setShowConfirm] = useState(false);
  const [employeeName, setEmployeeName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const userRole = useSelector((state) => state.userInfo.userInfo.role);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalUsers, settotalUsers] = useState([]);
  const companyId = useSelector((state) => state.companySelect.companySelect);
  const handleAction = (id) => {
    setShowDropdownAction(showDropdownAction === id ? null : id);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const HandleAddEmployeeList = () => {
    if (
      companyId === "" ||
      companyId === undefined ||
      companyId === null ||
      companyId === "allCompany"
    ) {
      showToast("Please select a specific company", "error");
      return;
    }
    navigate("/employees/addemployee");
  };

  const HandleEditEmployee = async (id) => {
    navigate(`/employees/editemployee/${id}`);
    setShowDropdownAction(null);
  };

  const HandleDeleteEmployee = async (id, name) => {
    setEmployeeName(name);
    // console.log("employename", employeeName);
    setEmployeeId(id);
    // console.log("employeeid", employeeId);
    setShowConfirm(true);
  };

  const HandleEmployeeTimesheet = async (id, name) => {
    // setEmployeeName(name);
    // setEmployeeId(id);
    navigate(`/employees/timesheetreport/${name}?EmployeeId=${id}`);
    setShowDropdownAction(null);
  };

  const HandleViewHours = async (id, name) => {
    navigate(`/employees/viewhours/${name}?EmployeeId=${id}`);
  };

  const HandleViewTasks = async (id, name) => {
    navigate(`/employees/viewtasks/${name}?EmployeeId=${id}`);
  };

  const HandleViewAbsenceReport = async (id, name) => {
    navigate(`/employees/absencereport/${name}?EmployeeId=${id}`);
  };

  const GetEmployees = async () => {
    try {
      setLoading(true);
      const response = await GetCall(
        `/getAllUsers?page=${currentPage}&limit=${employeesPerPage}&search=${searchQuery}&companyId=${companyId}`
      );
      // console.log("Response:", response);
      if (response?.data?.status === 200) {
        settotalUsers(response.data.totalUsers);
        setEmployeeList(response?.data?.users);
        setTotalPages(response?.data?.totalPages);
      }
      setLoading(false);
      // console.log("response", response);
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
      const response = await PostCall(`/deleteUser/${id}`);
      if (response?.data?.status === 200) {
        showToast(response?.data?.message, "success");
        navigate("/employees");
      } else {
        showToast(response?.data?.message, "error");
      }
      setLoading(false);
    } catch (error) {
      console.log("error", error);
    }
    GetEmployees();
  };

  const headers = [
    "",
    "Id",
    "Employee Name",
    "Position",
    "Email Id",
    "Status",
    "Template",
    "Action",
  ];

  const handlePerPageChange = (e) => {
    setEmployeesPerPage(e);
    // setEmployeesPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  const HandleIsactiveUser = async (Id, isActive) => {
    try {
      setLoading(true);
      const response = await PostCall(`/activateDeactivateUser?userId=${Id}`);

      if (response?.data?.status === 200) {
        showToast(response?.data?.message, "success");
        GetEmployees();
      } else {
        showToast(response?.data?.message, "error");
      }
    } catch (error) {
      console.error("Error activating/deactivating user:", error);
      showToast("An error occurred. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const actions = [
    {
      label: "Edit",
      onClick: (id) => HandleEditEmployee(id),
    },
    {
      label: "Delete",
      onClick: HandleDeleteEmployee,
    },
    {
      label: "TimeSheet",
      onClick: HandleEmployeeTimesheet,
    },
    {
      label: "View Hours",
      onClick: HandleViewHours,
    },
    {
      label: "View Tasks",
      onClick: HandleViewTasks,
    },
    {
      label: "View Absence",
      onClick: HandleViewAbsenceReport,
    },
  ];

  if (userRole === "Superadmin") {
    actions.push(
      {
        label: "Active",
        onClick: (id) => HandleIsactiveUser(id, true),
      },
      {
        label: "Inactive",
        onClick: (id) => HandleIsactiveUser(id, false),
      }
    );
  }

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // const handlePopupClose = () => {
  //   setOpenJobTitleModal(false);
  // };

  useEffect(() => {
    GetEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, employeesPerPage, searchQuery, companyId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="employee-list-container">
      {/* {openJobTitleModal && SelectedEmployee?.jobs?.length > 1 && (
        <JobTitleForm
          onClose={handlePopupClose}
          jobTitledata={SelectedEmployee.jobs}
          onJobTitleSelect={handleJobTitleSelect}
        />
      )} */}

      <div className="employeelist-flex">
        <div className="employeelist-title">
          <h1>Employee List</h1>
        </div>
        <div className="employeelist-action">
          {/* {user?.role !== "Superadmin" && ( */}
          <CommonAddButton
            label="Add Employee"
            onClick={HandleAddEmployeeList}
          />
          {/* )} */}
        </div>
      </div>
      <TextField
        label="Search Employee"
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
            data={employeesList.map((employee) => ({
              _id: employee._id,
              unique_ID: employee.Id,
              Name: employee.userName,
              Position: employee.position,
              Email: employee.email,
              Activeuser: employee.status,
              Template: employee.templates,
              isActive: employee.status,
              ...(employee.roleWisePoints && {
                roleWisePoints: employee.roleWisePoints,
              }),
            }))}
            actions={{
              actionsList: actions,
            }}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showPerPage={employeesPerPage}
            onPerPageChange={handlePerPageChange}
            handleAction={handleAction}
            isPagination="true"
            searchQuery={searchQuery}
            isSearchQuery={true}
            totalData={totalUsers}
            // setSearchQuery={setSearchQuery}
          />

          {showConfirm && (
            <DeleteConfirmation
              confirmation={`Are you sure you want to delete Employee named <b>${employeeName}</b>?`}
              onConfirm={() => confirmDelete(employeeId)}
              onCancel={cancelDelete}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Employee;
