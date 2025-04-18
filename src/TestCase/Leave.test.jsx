import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { GetCall, PostCall } from "../ApiServices";
import Leaves from "../pages/Leaves/Leaves";
import { useNavigate } from "react-router";

jest.mock("../ApiServices", () => ({
  GetCall: jest.fn(),
  PostCall: jest.fn(),
}));

jest.mock("react-router", () => ({
  useNavigate: jest.fn(),
}));

const mockNavigate = jest.fn();

const mockStore = configureStore([]);
const store = mockStore({
  userInfo: { userInfo: { role: "Tester" } },
  jobRoleSelect: { jobRoleSelect: { jobId: "12345" } },
});

describe("Leaves Page API Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockImplementation(() => mockNavigate);
  });

  test("should fetch leave data successfully", async () => {
    const mockSuccessResponse = {
      data: {
        status: 200,
        message: "All leave requests fetched successfully.",
        allLeaves: [
          {
            _id: "1",
            userName: "John Doe",
            startDate: "2024-03-17",
            selectionDuration: "1 day",
            status: "Approved",
            leaveType: "Casual",
            reasonOfLeave: "Personal"
          }
        ],
        totalPages: 2,
        totalLeaves: 13,
      }
    };

    PostCall.mockResolvedValue(mockSuccessResponse);

    render(
      <Provider store={store}>
        <Leaves />
      </Provider>
    );

    await waitFor(() => {
      expect(PostCall).toHaveBeenCalledWith(
        `/getAllOwnLeaves?page=1&limit=50&search=`,
        { jobId: "12345" }
      );
    });

    const userNameElement = await screen.findByText("John Doe");
    expect(userNameElement).toBeInTheDocument();
  });

  // test("should handle API error when fetching leaves", async () => {
  //   const mockErrorResponse = {
  //     response: {
  //       data: {
  //         status: 500,
  //         message: "Failed to fetch leave requests",
  //         error: "Internal server error"
  //       }
  //     }
  //   };

  //   PostCall.mockRejectedValue(mockErrorResponse);

  //   render(
  //     <Provider store={store}>
  //       <Leaves />
  //     </Provider>
  //   );

  //   await waitFor(() => {
  //     expect(PostCall).toHaveBeenCalledWith(
  //       `/getAllOwnLeaves?page=1&limit=50&search=`,
  //       { jobId: "12345" }
  //     );
  //   });

  //   // Check if error message is displayed
  //   const errorMessage = await screen.findByText(/Failed to fetch leave requests/i);
  //   expect(errorMessage).toBeInTheDocument();
  // });

  // test("should navigate to edit leave page with correct parameters", async () => {
  //   const mockSuccessResponse = {
  //     data: {
  //       status: 200,
  //       message: "All leave requests fetched successfully.",
  //       allLeaves: [
  //         {
  //           _id: "1",
  //           userName: "John Doe",
  //           startDate: "2024-03-17",
  //           selectionDuration: "1 day",
  //           status: "Approved",
  //           leaveType: "Casual",
  //           reasonOfLeave: "Personal"
  //         }
  //       ],
  //       totalPages: 1,
  //       totalLeaves: 1,
  //     }
  //   };

  //   PostCall.mockResolvedValue(mockSuccessResponse);

  //   render(
  //     <Provider store={store}>
  //       <Leaves />
  //     </Provider>
  //   );

  //   // Wait for data to load
  //   await waitFor(() => {
  //     expect(screen.getByText("John Doe")).toBeInTheDocument();
  //   });

  //   // Find and click edit button
  //   const editButton = screen.getByTestId("edit-leave-button");
  //   fireEvent.click(editButton);

  //   // Verify navigation
  //   expect(mockNavigate).toHaveBeenCalledWith(`/leaves/editleave/1?jobId=12345`);
  // });

  // test("should handle delete leave request", async () => {
  //   const mockSuccessResponse = {
  //     data: {
  //       status: 200,
  //       message: "Leave request deleted successfully",
  //       allLeaves: [],
  //       totalPages: 0,
  //       totalLeaves: 0,
  //     }
  //   };

  //   PostCall.mockResolvedValue(mockSuccessResponse);

  //   render(
  //     <Provider store={store}>
  //       <Leaves />
  //     </Provider>
  //   );

  //   // Find and click delete button
  //   const deleteButton = screen.getByTestId("delete-leave-button");
  //   fireEvent.click(deleteButton);

  //   // Find and click confirm button
  //   const confirmButton = screen.getByText("Confirm");
  //   fireEvent.click(confirmButton);

  //   // Verify delete API call
  //   await waitFor(() => {
  //     expect(PostCall).toHaveBeenCalledWith(`/deleteLeaveRequest/1`);
  //   });

  //   // Verify success message
  //   const successMessage = await screen.findByText("Leave request deleted successfully");
  //   expect(successMessage).toBeInTheDocument();
  // });

  // test("should handle search functionality", async () => {
  //   const mockSuccessResponse = {
  //     data: {
  //       status: 200,
  //       message: "All leave requests fetched successfully.",
  //       allLeaves: [
  //         {
  //           _id: "1",
  //           userName: "John Doe",
  //           startDate: "2024-03-17",
  //           selectionDuration: "1 day",
  //           status: "Approved",
  //           leaveType: "Casual",
  //           reasonOfLeave: "Personal"
  //         }
  //       ],
  //       totalPages: 1,
  //       totalLeaves: 1,
  //     }
  //   };

  //   PostCall.mockResolvedValue(mockSuccessResponse);

  //   render(
  //     <Provider store={store}>
  //       <Leaves />
  //     </Provider>
  //   );

  //   // Find search input and enter search term
  //   const searchInput = screen.getByLabelText("Search Leave");
  //   fireEvent.change(searchInput, { target: { value: "John" } });

  //   // Verify search API call
  //   await waitFor(() => {
  //     expect(PostCall).toHaveBeenCalledWith(
  //       `/getAllOwnLeaves?page=1&limit=50&search=John`,
  //       { jobId: "12345" }
  //     );
  //   });
  // });
});
