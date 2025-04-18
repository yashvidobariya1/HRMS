import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import Settings from "../pages/Settings/Settings";
import { GetCall } from "../ApiServices";
import { MemoryRouter } from "react-router";

jest.mock("../ApiServices", () => ({
    GetCall: jest.fn(),
}));

jest.mock("../main/ToastManager", () => ({
    showToast: jest.fn(),
}));

const mockStore = configureStore([]);

describe("Settings Component API Tests", () => {
    let store;
    const mockCompanyData = {
        companyDetails: {
            companyCode: "COM00123",
            businessName: "HRMS",
            city: "London",
        },
        _id: "677f604ca2ae13675b5c9655",
    };

    beforeEach(() => {
        store = mockStore({
            userInfo: {
                userInfo: { id: 1, name: "Test User", role: "Superadmin" },
            },
        });
        jest.clearAllMocks();
    });

    test("should display company data from API response", async () => {
        const mockResponse = {
            data: {
                status: 200,
                companies: [mockCompanyData],
                totalPages: 1,
                totalCompanies: 1,
            },
        };

        GetCall.mockImplementation(() => Promise.resolve(mockResponse));

        render(
            <Provider store={store}>
                <MemoryRouter>
                    <Settings />
                </MemoryRouter>
            </Provider>
        );

        await waitFor(() => {
            expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
        });

        expect(GetCall).toHaveBeenCalledWith(
            expect.stringContaining("/getallcompany?page=1&limit=50&search=")
        );

        await waitFor(() => {
            expect(screen.getByText("HRMS")).toBeInTheDocument();
            expect(screen.getByText("COM00123")).toBeInTheDocument();
            expect(screen.getByText("London")).toBeInTheDocument();
        });
    });

    test("should handle invalid API response", async () => {
        GetCall.mockResolvedValueOnce({
            data: {
                status: 500,
                message: "Something went wrong while fetching companies!",
            },
        });

        render(
            <Provider store={store}>
                <MemoryRouter>
                    <Settings />
                </MemoryRouter>
            </Provider>
        );

        await waitFor(() => {
            expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
        });

        expect(GetCall).toHaveBeenCalledWith(
            expect.stringContaining("/getallcompany?page=1&limit=50&search=")
        );
    });
});
