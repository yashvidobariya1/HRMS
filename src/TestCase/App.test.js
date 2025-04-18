// import { render, screen, fireEvent } from "@testing-library/react";
// import App from "../App";

// jest.mock("../main/ProtectedRoute", () => ({ children }) => (
//   <div>{children}</div>
// ));

// jest.mock("../main/PublicRoute", () => ({ children }) => <div>{children}</div>);

// describe("App Component", () => {
//   it('renders login page for "/" route', () => {
//     render(<App />);
//     // expect(screen.getByText(/login/i)).toBeInTheDocument();
//   });

//   it('renders Unauthorized page for "/unauthorized" route', () => {
//     render(<App />);
//     fireEvent.click(screen.getByText(/unauthorized/i));
//     expect(screen.getByText(/unauthorized/i)).toBeInTheDocument();
//   });

//   it('renders the Dashboard page for "/dashboard" route when logged in', () => {
//     render(<App />);

//     fireEvent.click(screen.getByText(/dashboard/i));
//     expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
//   });
// });


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
                userInfo: { id: 1, name: "Test User", role: "admin" },
            },
        });

        // Reset all mocks before each test
        jest.clearAllMocks();
    });

    test("should handle successful API response", async () => {
        // Mock successful API response
        const mockResponse = {
            data: {
                status: 200,
                message: "Employee added successfully",
                user: {
                    id: "123",
                    firstName: "John",
                    lastName: "Doe",
                    email: "john.doe@example.com"
                }
            }
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

        // Click Next to submit
        const nextButton = screen.getByText(/Next/i);
        fireEvent.click(nextButton);

        // Verify API call and response handling
        await waitFor(() => {
            expect(PostCall).toHaveBeenCalledWith("/addUser", expect.objectContaining({
                personalDetails: expect.objectContaining({
                    firstName: "John",
                    lastName: "Doe",
                    dateOfBirth: "1990-01-01",
                    gender: "male",
                    maritalStatus: "Single",
                    phone: "1234567890",
                    email: "john.doe@example.com",
                    sendRegistrationLink: true
                })
            }));
        });

        // Verify that the success message is displayed
        await waitFor(() => {
            expect(screen.getByText(/Employee added successfully/i)).toBeInTheDocument();
        });
    });

    test("should handle API error response", async () => {
        // Mock error API response
        const mockError = {
            response: {
                data: {
                    status: 400,
                    message: "Invalid input data"
                }
            }
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

        // Click Next to submit
        const nextButton = screen.getByText(/Next/i);
        fireEvent.click(nextButton);

        // Verify error handling
        await waitFor(() => {
            expect(screen.getByText(/Invalid input data/i)).toBeInTheDocument();
        });
    });

    test("should handle network error", async () => {
        // Mock network error
        PostCall.mockRejectedValueOnce(new Error("Network Error"));

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

        // Click Next to submit
        const nextButton = screen.getByText(/Next/i);
        fireEvent.click(nextButton);

        // Verify network error handling
        await waitFor(() => {
            expect(screen.getByText(/Network Error/i)).toBeInTheDocument();
        });
    });
});
