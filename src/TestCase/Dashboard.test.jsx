import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import Dashboard from "../pages/Dashboard/Dashboard";
import { GetCall, PostCall } from "../ApiServices";
import { MemoryRouter } from "react-router";
import { showToast } from "../main/ToastManager";

// Mock the API service and toast manager
jest.mock("../ApiServices", () => ({
  GetCall: jest.fn(),
  PostCall: jest.fn(),
}));

jest.mock("../main/ToastManager", () => ({
  showToast: jest.fn(),
}));

// Mock console.error
console.error = jest.fn();

const mockStore = configureStore([]);

describe("Dashboard API Tests", () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      userInfo: {
        userInfo: { id: 1, name: "Test User", role: "Superadmin" },
      },
      jobRoleSelect: {
        jobRoleSelect: { jobId: "6788c9f251694d56d08dfcd4" },
      },
    });

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  test("should fetch dashboard data successfully", async () => {
    // Mock dashboard data response
    const mockDashboardData = {
      totalEmployees: 100,
      totalCompanies: 5,
      totalClients: 10,
      totalContracts: 15,
      totalLocations: 8,
      totalTemplates: 10,
      totalActiveUsers: 80,
      totalLeaveRequests: 25,
      activeUsersGrowth: "10%",
      clientGrowth: "5%",
      companyGrowth: "3%",
      contractGrowth: 2.5,
      employeeGrowth: "8%",
      templateGrowth: 1.5,
      locationGrowth: "4%",
      pendingLRGrowth: "2%",
      totalPendingLR: 5,
      leaveRequestGrowth: "3%",
      currentMonthTotalActiveUsers: 5,
      currentMonthTotalClients: 2,
      currentMonthTotalCompanies: 1,
      currentMonthTotalContracts: 3,
      currentMonthTotalEmployees: 10,
      currentMonthTotalTemplates: 2,
      currentMonthTotalLocations: 1,
      currentMonthTotalOwnLeaveRequests: 2,
      holidayGrowth: "1%",
      currentMonthTotalHolidays: 1,
      userGrowth: [],
      totalHoursAndOverTime: [],
      todaysClocking: [],
      totalAvailableLeave: [],
      isTemplateSigned: true,
      totalHolidays: 10,
      totalOwnLeaveRequests: 5,
      absentInCurrentMonth: 3,
      currentMonthTotalOwnPendingLR: 2,
    };

    PostCall.mockResolvedValueOnce({
      data: {
        status: 200,
        responseData: mockDashboardData,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(PostCall).toHaveBeenCalledWith("/dashboard", {
        jobId: "6788c9f251694d56d08dfcd4",
      });
    });
    screen.debug();
    await waitFor(() => {
      expect(screen.getByText("Total Employees")).toBeInTheDocument();
      expect(screen.getByText("Total Companies")).toBeInTheDocument();
      expect(screen.getByText(/total Clients/i)).toBeInTheDocument();
      expect(screen.getByText("Total Contracts")).toBeInTheDocument();
      expect(screen.getByText("Total Locations")).toBeInTheDocument();
      expect(screen.getByText("Total Templates")).toBeInTheDocument();
      // expect(screen.getByText("Total Active Users")).toBeInTheDocument();
      expect(screen.getByText("Total Leave Requests")).toBeInTheDocument();

      expect(screen.getByText("Active User Growth")).toBeInTheDocument();
      expect(screen.getByText("Client Growth")).toBeInTheDocument();
      expect(screen.getByText("Company Growth")).toBeInTheDocument();
      expect(screen.getByText("Contract Growth")).toBeInTheDocument();
      expect(screen.getByText("Employee Growth")).toBeInTheDocument();
      expect(screen.getByText("Template Growth")).toBeInTheDocument();
      expect(screen.getByText("Location Growth")).toBeInTheDocument();
      expect(screen.getByText("Leave Request Growth")).toBeInTheDocument();
    });
  });

  test("should handle API error gracefully", async () => {
    PostCall.mockRejectedValueOnce(new Error("API Error"));

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </Provider>
    );

    // Verify API call was made
    await waitFor(() => {
      expect(PostCall).toHaveBeenCalledWith("/dashboard", {
        jobId: "6788c9f251694d56d08dfcd4",
      });
    });

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching data:",
        expect.any(Error)
      );
    });
  });

  test("should handle invalid API response", async () => {
    PostCall.mockResolvedValueOnce({
      data: {
        status: 400,
        message: "Invalid response",
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(PostCall).toHaveBeenCalledWith("/dashboard", {
        jobId: "6788c9f251694d56d08dfcd4",
      });
    });

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith("Invalid response", "error");
    });
  });

  // test("should fetch holiday data for Superadmin", async () => {
  //     // Mock dashboard data response
  //     PostCall.mockResolvedValueOnce({
  //         data: {
  //             status: 200,
  //             responseData: {
  //                 isTemplateSigned: true
  //             }
  //         }
  //     });

  //     // Mock location data response
  //     GetCall.mockResolvedValueOnce({
  //         data: {
  //             status: 200,
  //             locations: [
  //                 {
  //                     _id: "loc1",
  //                     locationName: "Main Office"
  //                 }
  //             ]
  //         }
  //     });

  //     // Mock holiday data response
  //     GetCall.mockResolvedValueOnce({
  //         data: {
  //             status: 200,
  //             holidays: [
  //                 {
  //                     _id: "1",
  //                     occasion: "New Year",
  //                     date: "2024-01-01",
  //                     locationId: "loc1"
  //                 }
  //             ]
  //         }
  //     });

  //     render(
  //         <Provider store={store}>
  //             <MemoryRouter>
  //                 <Dashboard />
  //             </MemoryRouter>
  //         </Provider>
  //     );

  //     // Verify API calls were made
  //     await waitFor(() => {
  //         expect(PostCall).toHaveBeenCalledWith("/dashboard", { jobId: "6788c9f251694d56d08dfcd4" });
  //         expect(GetCall).toHaveBeenCalledWith("/getAllLocation");
  //     });

  //     // Verify holiday data is displayed
  //     await waitFor(() => {
  //         expect(screen.getByText("Total Holidays")).toBeInTheDocument();
  //     });
  // });
});

// Check for dashboard items
