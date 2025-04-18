import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import Login from "../pages/Login/Login";
import { PostCall } from "../ApiServices";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { useNavigate } from "react-router";

jest.mock("../ApiServices", () => ({
  PostCall: jest.fn(),
}));

jest.mock("react-router", () => ({
  useNavigate: jest.fn(),
}));

const mockStore = configureStore([]);
const store = mockStore({});

const renderWithRedux = () => {
  render(
    <Provider store={store}>
      <Login />
    </Provider>
  );
};

// Helper function
const setup = () => {
  return {
    emailInput: screen.getByPlaceholderText(/enter your email/i),
    passwordInput: screen.getByPlaceholderText(/enter your password/i),
    loginButton: screen.getByRole("button", { name: /login/i }),
  };
};

describe("handleLogin API Call", () => {
  beforeEach(() => {
    renderWithRedux();
  });

  // =====API-call========
  test("should call API and redirect on successful login", async () => {
    const mockNavigate = jest.fn();
    useNavigate.mockReturnValue(mockNavigate);

    PostCall.mockResolvedValue({
      data: {
        status: 200,
        message: "User login successfully",
        user: {
          token: "1234",
        },
      },
    });

    const { emailInput, passwordInput, loginButton } = setup();

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(loginButton);

    await waitFor(() => expect(PostCall).toHaveBeenCalledTimes(1));

    const token = localStorage.getItem("token");
    expect(token.replace(/"/g, "")).toBe("1234");
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  // =====Login-fail========
  test("should call API and show error toast on failed login", async () => {
    PostCall.mockResolvedValue({
      data: { status: 401, message: "Invalid credential" },
    });

    const { emailInput, passwordInput, loginButton } = setup();

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
    fireEvent.click(loginButton);
    await waitFor(() => expect(PostCall).toHaveBeenCalledTimes(1));
  });
});
