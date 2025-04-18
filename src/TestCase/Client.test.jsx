import React from "react";
import { render, waitFor } from "@testing-library/react";
import Client from "../pages/Client/Client";
import { GetCall } from "../ApiServices";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router-dom";

jest.mock("../ApiServices", () => ({
  GetCall: jest.fn(),
  PostCall: jest.fn(),
}));


jest.mock("react-router", () => ({
  useNavigate: () => jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  useLocation: () => ({
    search: "?companyId=123",
    pathname: "/settings/client",
  }),
}));

const mockStore = configureStore([]);

describe("Client API Tests", () => {
  let store;

  beforeEach(() => {
    jest.clearAllMocks();
    store = mockStore({
      userInfo: {
        userInfo: {
          role: "Superadmin",
        },
      },
    });
  });

  it("should fetch clients data successfully", async () => {
    GetCall.mockResolvedValueOnce({
      data: {
        status: 200,
        message: "Clients fetched successfully",
        clients: [
          {
            _id: "1",
            clientName: "Test Client",
            email: "test@example.com",
            city: "Test City",
            contactNumber: "1234567890",
          },
        ],
        totalClients: 1,
        totalPages: 1,
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Client />
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(GetCall).toHaveBeenCalledWith(
        "/getAllClients?page=1&limit=50&search="
      );
    });
  });
});
