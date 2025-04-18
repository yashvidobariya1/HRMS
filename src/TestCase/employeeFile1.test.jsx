import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CommonTable from "../SeparateCom/CommonTable";
import CommonAddButton from "../SeparateCom/CommonAddButton";
import Employee from "../pages/Employee/Employee";
import { GetCall, PostCall } from "../ApiServices";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";

const employeesList = [
  {
    _id: "1",
    personalDetails: {
      firstName: "John",
      email: "john@example.com",
    },
    role: "Developer",
  },
  {
    _id: "2",
    personalDetails: {
      firstName: "Jane",
      email: "jane@example.com",
    },
    role: "Designer",
  },
];

const headers = ["Name", "Position", "Email", "Action"];
const actions = [
  { label: "Edit", onClick: jest.fn() },
  { label: "Delete", onClick: jest.fn() },
];
const handlePageChange = jest.fn();
const handlePerPageChange = jest.fn();
const handleAction = jest.fn();
const HandleAddEmployeeList = jest.fn();

jest.mock("../ApiServices", () => ({
  GetCall: jest.fn(),
  PostCall: jest.fn(),
}));

jest.mock("react-router", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("react-redux", () => ({
  useSelector: jest.fn(),
}));

describe("CommonTable Component", () => {
  it("should render employee list with correct headers", async () => {
    GetCall.mockResolvedValue({
      data: {
        status: 200,
        message: "Users got successfully.",
        users: [
          {
            _id: "1",
            personalDetails: { firstName: "John", email: "john@example.com" },
          },
        ],
        totalPages: 2,
        totalUsers: 13,
      },
    });

    render(<Employee />);

    await waitFor(() => screen.getByText("John"));
    expect(screen.getByText("John")).toBeInTheDocument();
  });

  test("calls handlePageChange when clicking pagination button", async () => {
    render(
      <CommonTable
        headers={headers}
        data={employeesList.map((employee) => ({
          _id: employee._id,
          name: employee.personalDetails.firstName,
          position: employee.role,
          email: employee.personalDetails.email,
        }))}
        actions={{ actionsList: actions }}
        currentPage={1}
        totalPages={2}
        onPageChange={handlePageChange}
        showPerPage={10}
        onPerPageChange={handlePerPageChange}
        handleAction={handleAction}
        isPagination="true"
      />
    );

    const nextPageButton = screen.getByText("2");
    fireEvent.click(nextPageButton);

    await waitFor(() => {
      expect(handlePageChange).toHaveBeenCalledWith(2);
    });
  });

  test("opens action dropdown and calls action function", async () => {
    render(
      <CommonTable
        headers={headers}
        data={employeesList.map((employee) => ({
          _id: employee._id,
          name: employee.personalDetails.firstName,
          position: employee.role,
          email: employee.personalDetails.email,
        }))}
        actions={{ actionsList: actions }}
        currentPage={1}
        totalPages={2}
        onPageChange={handlePageChange}
        showPerPage={10}
        onPerPageChange={handlePerPageChange}
        handleAction={handleAction}
        isPagination="true"
      />
    );

    const actionButton = screen.getAllByTestId("action-button")[0];
    fireEvent.click(actionButton);

    await waitFor(() => {
      expect(screen.getByText(/Edit/i)).toBeInTheDocument();
      expect(screen.getByText(/Delete/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Edit/i));
    expect(actions[0].onClick).toHaveBeenCalledTimes(1);

    fireEvent.click(actionButton);
    await waitFor(() => {
      expect(screen.getByText(/Delete/i)).toBeInTheDocument();
    });
    screen.debug();
    fireEvent.click(screen.getByText(/Delete/i));
    expect(actions[1].onClick).toHaveBeenCalledTimes(1);
  });
});
