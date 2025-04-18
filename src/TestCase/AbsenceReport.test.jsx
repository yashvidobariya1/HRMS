import React from "react";
import { render, waitFor } from "@testing-library/react";
import AbsenceReport from "../pages/AbsenceReport/AbsenceReport";
import { GetCall, PostCall } from "../ApiServices";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

jest.mock("../ApiServices", () => ({
  GetCall: jest.fn(),
  PostCall: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: () => ({
    search: "?EmployeeId=123",
    pathname: "/absence-report",
  }),
}));

const mockStore = configureStore([]);

describe("AbsenceReport API Tests", () => {
  let store;

  beforeEach(() => {
    jest.clearAllMocks();
    store = mockStore({
      jobRoleSelect: {
        jobRoleSelect: {
          jobId: "6788c9f251694d56d08dfcd4",
        },
      },
    });
  });

//   it("should make correct API calls for fetching job titles and absence report", async () => {
//     // Mock successful job titles response
//     GetCall.mockResolvedValueOnce({
//       data: {
//         status: 200,
//         message: "Job titles fetched successfully",
//         multipleJobTitle: true,
//         jobTitles: [
//           { jobId: "6788c9f251694d56d08dfcd4", title: "Developer" },
//         ],
//       },
//     });

//     // Mock successful absence report response
//     PostCall.mockResolvedValueOnce({
//       data: {
//         status: 200,
//         message: "Absence report fetched successfully",
//         report: [
//           {
//             date: "2024-04-01",
//             status: "Absent",
//             leave: false,
//             holiday: false,
//             absent: false,
//             data: {},
//           },
//         ],
//         totalReports: 1,
//         totalPages: 1,
//         currentPage: 1,
//       },
//     });

//     render(
//       <Provider store={store}>
//         <MemoryRouter>
//           <AbsenceReport />
//         </MemoryRouter>
//       </Provider>
//     );

//     // Verify job titles API call
//     await waitFor(() => {
//       expect(GetCall).toHaveBeenCalledWith("/getUserJobTitles?EmployeeId=123");
//     });

//     // Verify absence report API call
//     await waitFor(() => {
//       expect(PostCall).toHaveBeenCalledWith(
//         "/getAbsenceReport?page=1&limit=50&year=2024&month=4",
//         {
//           jobId: "6788c9f251694d56d08dfcd4",
//           userId: "123",
//         }
//       );
//     });
//   });

//   it("should handle error when fetching job titles", async () => {
//     // Mock error response for job titles
//     GetCall.mockRejectedValueOnce({
//       response: {
//         data: {
//           status: 500,
//           message: "Failed to fetch job titles",
//           error: "Internal server error",
//         },
//       },
//     });

//     render(
//       <Provider store={store}>
//         <MemoryRouter>
//           <AbsenceReport />
//         </MemoryRouter>
//       </Provider>
//     );

//     await waitFor(() => {
//       expect(GetCall).toHaveBeenCalledWith("/getUserJobTitles?EmployeeId=123");
//     });
//   });

//   it("should handle error when fetching absence report", async () => {
//     // Mock successful job titles response
//     GetCall.mockResolvedValueOnce({
//       data: {
//         status: 200,
//         message: "Job titles fetched successfully",
//         multipleJobTitle: true,
//         jobTitles: [
//           { jobId: "6788c9f251694d56d08dfcd4", title: "Developer" },
//         ],
//       },
//     });

//     // Mock error response for absence report
//     PostCall.mockRejectedValueOnce({
//       response: {
//         data: {
//           status: 500,
//           message: "Failed to fetch absence report",
//           error: "Internal server error",
//         },
//       },
//     });

//     render(
//       <Provider store={store}>
//         <MemoryRouter>
//           <AbsenceReport />
//         </MemoryRouter>
//       </Provider>
//     );

//     await waitFor(() => {
//       expect(PostCall).toHaveBeenCalledWith(
//         "/getAbsenceReport?page=1&limit=50&year=2024&month=4",
//         {
//           jobId: "6788c9f251694d56d08dfcd4",
//           userId: "123",
//         }
//       );
//     });
//   });
});
