// import { render, screen, fireEvent, waitFor } from "@testing-library/react";
// import { MemoryRouter } from "react-router";
// import { Provider } from "react-redux";
// import configureStore from "redux-mock-store";
// import AddEmployee from "../pages/Employee/AddEmployee";
// import { GetCall, PostCall } from "../ApiServices";

// // Mock the API services
// jest.mock("../ApiServices", () => ({
//     GetCall: jest.fn(),
//     PostCall: jest.fn(),
// }));

// const mockStore = configureStore([]);

// describe("AddEmployee API Tests", () => {
//     let store;

//     beforeEach(() => {
//         store = mockStore({
//             userInfo: {
//                 userInfo: { id: 1, name: "Test User", role: "admin" },
//             },
//         });

//         // Reset all mocks before each test
//         jest.clearAllMocks();
//     });

//     test("should handle successful API response", async () => {
//         // Mock successful API response
//         const mockResponse = {
//             data: {
//                 status: 200,
//                 message: "Employee added successfully",
//                 user: {
//                     id: "123",
//                     firstName: "John",
//                     lastName: "Doe",
//                     email: "john.doe@example.com"
//                 }
//             }
//         };
//         PostCall.mockResolvedValueOnce(mockResponse);

//         render(
//             <Provider store={store}>
//                 <MemoryRouter>
//                     <AddEmployee />
//                 </MemoryRouter>
//             </Provider>
//         );

//         // Fill in required fields
//         const firstName = await screen.findByPlaceholderText(/Enter FirstName/i);
//         fireEvent.change(firstName, { target: { value: "John" } });

//         const lastName = await screen.findByPlaceholderText(/Enter lastName/i);
//         fireEvent.change(lastName, { target: { value: "Doe" } });

//         const dateofbirth = await screen.findByTestId("dateofbirth");
//         fireEvent.change(dateofbirth, { target: { value: "1990-01-01" } });

//         const gender = await screen.findByTestId("gender-select");
//         fireEvent.change(gender, { target: { value: "male" } });

//         const maritalStatus = await screen.findByTestId("marital Status");
//         fireEvent.change(maritalStatus, { target: { value: "Single" } });

//         const phone = await screen.findByPlaceholderText(/Enter phone/i);
//         fireEvent.change(phone, { target: { value: "1234567890" } });

//         const email = await screen.findByPlaceholderText(/Enter Email/i);
//         fireEvent.change(email, { target: { value: "john.doe@example.com" } });

//         const sendLink = await screen.findByTestId("send-link");
//         fireEvent.click(sendLink);

//         // Click Next to submit
//         const nextButton = screen.getByText(/Next/i);
//         fireEvent.click(nextButton);

//         // Verify API call and response handling
//         await waitFor(() => {
//             expect(PostCall).toHaveBeenCalledWith("/addUser", expect.objectContaining({
//                 personalDetails: expect.objectContaining({
//                     firstName: "John",
//                     lastName: "Doe",
//                     dateOfBirth: "1990-01-01",
//                     gender: "male",
//                     maritalStatus: "Single",
//                     phone: "1234567890",
//                     email: "john.doe@example.com",
//                     sendRegistrationLink: true
//                 })
//             }));
//         });

//         // Verify that the success message is displayed
//         await waitFor(() => {
//             expect(screen.getByText(/Employee added successfully/i)).toBeInTheDocument();
//         });
//     });

//     test("should handle API error response", async () => {
//         // Mock error API response
//         const mockError = {
//             response: {
//                 data: {
//                     status: 400,
//                     message: "Invalid input data"
//                 }
//             }
//         };
//         PostCall.mockRejectedValueOnce(mockError);

//         render(
//             <Provider store={store}>
//                 <MemoryRouter>
//                     <AddEmployee />
//                 </MemoryRouter>
//             </Provider>
//         );

//         // Fill in required fields
//         const firstName = await screen.findByPlaceholderText(/Enter FirstName/i);
//         fireEvent.change(firstName, { target: { value: "John" } });

//         const lastName = await screen.findByPlaceholderText(/Enter lastName/i);
//         fireEvent.change(lastName, { target: { value: "Doe" } });

//         const dateofbirth = await screen.findByTestId("dateofbirth");
//         fireEvent.change(dateofbirth, { target: { value: "1990-01-01" } });

//         const gender = await screen.findByTestId("gender-select");
//         fireEvent.change(gender, { target: { value: "male" } });

//         const maritalStatus = await screen.findByTestId("marital Status");
//         fireEvent.change(maritalStatus, { target: { value: "Single" } });

//         const phone = await screen.findByPlaceholderText(/Enter phone/i);
//         fireEvent.change(phone, { target: { value: "1234567890" } });

//         const email = await screen.findByPlaceholderText(/Enter Email/i);
//         fireEvent.change(email, { target: { value: "john.doe@example.com" } });

//         const sendLink = await screen.findByTestId("send-link");
//         fireEvent.click(sendLink);

//         // Click Next to submit
//         const nextButton = screen.getByText(/Next/i);
//         fireEvent.click(nextButton);

//         // Verify error handling
//         await waitFor(() => {
//             expect(screen.getByText(/Invalid input data/i)).toBeInTheDocument();
//         });
//     });

//     test("should handle network error", async () => {
//         // Mock network error
//         PostCall.mockRejectedValueOnce(new Error("Network Error"));

//         render(
//             <Provider store={store}>
//                 <MemoryRouter>
//                     <AddEmployee />
//                 </MemoryRouter>
//             </Provider>
//         );

//         // Fill in required fields
//         const firstName = await screen.findByPlaceholderText(/Enter FirstName/i);
//         fireEvent.change(firstName, { target: { value: "John" } });

//         const lastName = await screen.findByPlaceholderText(/Enter lastName/i);
//         fireEvent.change(lastName, { target: { value: "Doe" } });

//         const dateofbirth = await screen.findByTestId("dateofbirth");
//         fireEvent.change(dateofbirth, { target: { value: "1990-01-01" } });

//         const gender = await screen.findByTestId("gender-select");
//         fireEvent.change(gender, { target: { value: "male" } });

//         const maritalStatus = await screen.findByTestId("marital Status");
//         fireEvent.change(maritalStatus, { target: { value: "Single" } });

//         const phone = await screen.findByPlaceholderText(/Enter phone/i);
//         fireEvent.change(phone, { target: { value: "1234567890" } });

//         const email = await screen.findByPlaceholderText(/Enter Email/i);
//         fireEvent.change(email, { target: { value: "john.doe@example.com" } });

//         const sendLink = await screen.findByTestId("send-link");
//         fireEvent.click(sendLink);

//         // Click Next to submit
//         const nextButton = screen.getByText(/Next/i);
//         fireEvent.click(nextButton);

//         // Verify network error handling
//         await waitFor(() => {
//             expect(screen.getByText(/Network Error/i)).toBeInTheDocument();
//         });
//     });
// });

// =============================================

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import AddEmployee from "../pages/Employee/AddEmployee";
import { GetCall, PostCall } from "../ApiServices";

// Mock the API services
jest.mock("../ApiServices", () => ({
  GetCall: jest.fn(),
  PostCall: jest.fn(),
}));

const mockStore = configureStore([]);

describe("AddEmployee API Tests", () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      userInfo: {
        userInfo: { id: 1, name: "Test User", role: "Superadmin" },
      },
    });

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  test("should fetch employee details when editing an existing employee", async () => {
    const mockEmployeeData = {
      data: {
        status: 200,
        user: {
          personalDetails: {
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
          },
        },
      },
    };

    GetCall.mockResolvedValueOnce(mockEmployeeData);

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/add-employee/123"]}>
          <AddEmployee />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(GetCall).toHaveBeenCalledWith("/getUser/123");
      expect(screen.getByDisplayValue("John")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Doe")).toBeInTheDocument();
      expect( screen.getByDisplayValue("john.doe@example.com")).toBeInTheDocument();
      expect(screen.getByDisplayValue("UK")).toBeInTheDocument();
      expect(screen.getByDisplayValue("abc12")).toBeInTheDocument();
      expect(screen.getByDisplayValue("uk") ).toBeInTheDocument();
      expect(screen.getByDisplayValue("1234") ).toBeInTheDocument();
    });
  });

  test("should handle successful employee creation", async () => {
    const mockResponse = {
      data: {
        status: 200,
        message: "Employee added successfully",
      },
    };

    PostCall.mockResolvedValueOnce(mockResponse);

    render(
      <Provider store={store}>
        <MemoryRouter>
          <AddEmployee />
        </MemoryRouter>
      </Provider>
    );

    // Fill in required fields
    const firstName = await screen.findByPlaceholderText(/Enter FirstName/i);
    fireEvent.change(firstName, { target: { value: "John" } });

    const lastName = await screen.findByPlaceholderText(/Enter lastName/i);
    fireEvent.change(lastName, { target: { value: "Doe" } });

    const dateofbirth = await screen.findByTestId("dateofbirth");
    fireEvent.change(dateofbirth, { target: { value: "1990-01-01" } });

    const gender = await screen.findByTestId("gender-select");
    fireEvent.change(gender, { target: { value: "male" } });

    const maritalStatus = await screen.findByTestId("marital Status");
    fireEvent.change(maritalStatus, { target: { value: "Single" } });

    const phone = await screen.findByPlaceholderText(/Enter phone/i);
    fireEvent.change(phone, { target: { value: "1234567890" } });

    const email = await screen.findByPlaceholderText(/Enter Email/i);
    fireEvent.change(email, { target: { value: "john.doe@example.com" } });

    const sendLink = await screen.findByTestId("send-link");
    fireEvent.click(sendLink);

    // Navigate through all steps and submit
    const nextButton = screen.getByText(/Next/i);
    for (let i = 0; i < 7; i++) {
      fireEvent.click(nextButton);
    }

    const address = await screen.findByPlaceholderText(/Enter Address/i);
    fireEvent.change(address, { target: { value: "UK" } });

    const address2 = await screen.findByPlaceholderText(
      /Enter Address Line 2/i
    );
    fireEvent.change(address2, { target: { value: "abc12" } });

    const city = await screen.findByPlaceholderText(/Enter City/i);
    fireEvent.change(city, { target: { value: "uk" } });

    const postcode = await screen.findByPlaceholderText(/Enter Post Code/i);
    fireEvent.change(postcode, { target: { value: "1234" } });

    await waitFor(() => {
      expect(PostCall).toHaveBeenCalledWith("/addUser", expect.any(Object));
    });
  });

  test("should handle API error when creating employee", async () => {
    const mockError = {
      response: {
        data: {
          status: 400,
          message: "Invalid input data",
        },
      },
    };

    PostCall.mockRejectedValueOnce(mockError);

    render(
      <Provider store={store}>
        <MemoryRouter>
          <AddEmployee />
        </MemoryRouter>
      </Provider>
    );

    // Fill in required fields
    const firstName = await screen.findByPlaceholderText(/Enter FirstName/i);
    fireEvent.change(firstName, { target: { value: "John" } });

    const lastName = await screen.findByPlaceholderText(/Enter lastName/i);
    fireEvent.change(lastName, { target: { value: "Doe" } });

    const dateofbirth = await screen.findByTestId("dateofbirth");
    fireEvent.change(dateofbirth, { target: { value: "1990-01-01" } });

    const gender = await screen.findByTestId("gender-select");
    fireEvent.change(gender, { target: { value: "male" } });

    const maritalStatus = await screen.findByTestId("marital Status");
    fireEvent.change(maritalStatus, { target: { value: "Single" } });

    const phone = await screen.findByPlaceholderText(/Enter phone/i);
    fireEvent.change(phone, { target: { value: "1234567890" } });

    const email = await screen.findByPlaceholderText(/Enter Email/i);
    fireEvent.change(email, { target: { value: "john.doe@example.com" } });

    const sendLink = await screen.findByTestId("send-link");
    fireEvent.click(sendLink);

    // Navigate through all steps and submit
    const nextButton = screen.getByText(/Next/i);
    for (let i = 0; i < 7; i++) {
      fireEvent.click(nextButton);
    }

    await waitFor(() => {
      expect(PostCall).toHaveBeenCalledWith("/addUser", expect.any(Object));
    });
  });

  test("should handle address details step correctly", async () => {
    // Mock initial data
    GetCall.mockResolvedValueOnce({
      data: {
        status: 200,
        companiesAllLocations: [],
        contracts: [],
        clients: [],
        templates: [],
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <AddEmployee />
        </MemoryRouter>
      </Provider>
    );

    // First fill in personal details to move to next step
    const firstName = await screen.findByPlaceholderText(/Enter FirstName/i);
    fireEvent.change(firstName, { target: { value: "John" } });

    const lastName = await screen.findByPlaceholderText(/Enter lastName/i);
    fireEvent.change(lastName, { target: { value: "Doe" } });

    const dateofbirth = await screen.findByTestId("dateofbirth");
    fireEvent.change(dateofbirth, { target: { value: "1990-01-01" } });

    const gender = await screen.findByTestId("gender-select");
    fireEvent.change(gender, { target: { value: "male" } });

    const maritalStatus = await screen.findByTestId("marital Status");
    fireEvent.change(maritalStatus, { target: { value: "Single" } });

    const phone = await screen.findByPlaceholderText(/Enter phone/i);
    fireEvent.change(phone, { target: { value: "1234567890" } });

    const email = await screen.findByPlaceholderText(/Enter Email/i);
    fireEvent.change(email, { target: { value: "john.doe@example.com" } });

    const sendLink = await screen.findByTestId("send-link");
    fireEvent.click(sendLink);

    // Click Next to move to address details step
    const nextButton = screen.getByText(/Next/i);
    fireEvent.click(nextButton);

    // Wait for address details form to be visible
    await waitFor(() => {
      expect(screen.getByText(/Address Details/i)).toBeInTheDocument();
    });

    // Fill in address details
    const address = await screen.findByPlaceholderText(/Enter Address/i);
    fireEvent.change(address, { target: { value: "123 Test Street" } });
    expect(address).toHaveValue("123 Test Street");

    const addressLine2 = await screen.findByPlaceholderText(
      /Enter Address Line 2/i
    );  
    fireEvent.change(addressLine2, { target: { value: "Apt 4B" } });
    expect(addressLine2).toHaveValue("Apt 4B");

    const city = await screen.findByPlaceholderText(/Enter City/i);
    fireEvent.change(city, { target: { value: "London" } });
    expect(city).toHaveValue("London");

    const postCode = await screen.findByPlaceholderText(/Enter Post Code/i);
    fireEvent.change(postCode, { target: { value: "SW1A 1AA" } });
    expect(postCode).toHaveValue("SW1A 1AA");

    // Click Next to move to next step
    fireEvent.click(nextButton);

    // Verify we moved to the next step (Kin Details)
    await waitFor(() => {
      expect(screen.getByText(/Kin Details/i)).toBeInTheDocument();
    });
  });

//   test("should show validation errors for required address fields", async () => {
//     // Mock initial data
//     GetCall.mockResolvedValueOnce({
//       data: {
//         status: 200,
//         companiesAllLocations: [],
//         contracts: [],
//         clients: [],
//         templates: [],
//       },
//     });

//     render(
//       <Provider store={store}>
//         <MemoryRouter>
//           <AddEmployee />
//         </MemoryRouter>
//       </Provider>
//     );

//     // First fill in personal details to move to next step
//     const firstName = await screen.findByPlaceholderText(/Enter FirstName/i);
//     fireEvent.change(firstName, { target: { value: "John" } });

//     const lastName = await screen.findByPlaceholderText(/Enter lastName/i);
//     fireEvent.change(lastName, { target: { value: "Doe" } });

//     const dateofbirth = await screen.findByTestId("dateofbirth");
//     fireEvent.change(dateofbirth, { target: { value: "1990-01-01" } });

//     const gender = await screen.findByTestId("gender-select");
//     fireEvent.change(gender, { target: { value: "male" } });

//     const maritalStatus = await screen.findByTestId("marital Status");
//     fireEvent.change(maritalStatus, { target: { value: "Single" } });

//     const phone = await screen.findByPlaceholderText(/Enter phone/i);
//     fireEvent.change(phone, { target: { value: "1234567890" } });

//     const email = await screen.findByPlaceholderText(/Enter Email/i);
//     fireEvent.change(email, { target: { value: "john.doe@example.com" } });

//     const sendLink = await screen.findByTestId("send-link");
//     fireEvent.click(sendLink);

//     // Click Next to move to address details step
//     const nextButton = screen.getByText(/Next/i);
//     fireEvent.click(nextButton);

//     // Wait for address details form to be visible
//     await waitFor(() => {
//       expect(screen.getByText(/Address Details/i)).toBeInTheDocument();
//     });

//     // Try to move to next step without filling required fields
//     fireEvent.click(nextButton);

//     // Verify validation errors are shown
//     await waitFor(() => {
//       expect(screen.getByText(/Address is required/i)).toBeInTheDocument();
//       expect(screen.getByText(/City is required/i)).toBeInTheDocument();
//       expect(screen.getByText(/Post Code is required/i)).toBeInTheDocument();
//     });
//   });
});
