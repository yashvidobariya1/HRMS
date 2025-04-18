import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { PostCall } from "../ApiServices";
import { showToast } from "../main/ToastManager";
import ChangePassword from "../pages/EmployeeProfile/ChangePassword";
import { act } from "@testing-library/react";

jest.mock("../ApiServices", () => ({
  PostCall: jest.fn(),
}));

jest.mock("../main/ToastManager", () => ({
  showToast: jest.fn(),
}));

jest.mock("react-router", () => ({
  useNavigate: jest.fn(),
}));

const mockStore = configureStore([]);
const store = mockStore({
  userInfo: { userInfo: { _id: "user123" } },
});

describe("ChangePassword Component", () => {
  beforeEach(() => {
    render(
      <Provider store={store}>
        <ChangePassword />
      </Provider>
    );
  });

  test("renders the ChangePassword form correctly", () => {
    expect(screen.getByLabelText(/Old Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
  });

  test("renders the submit button", () => {
    const submitButton = screen.getByRole("button", { name: /change password/i });
    expect(submitButton).toBeInTheDocument();
  });

  test("validation errors when fields are blank", async () => {
    fireEvent.click(screen.getByText(/Change Password/i));

    await waitFor(() => {
      expect(screen.getByText("Old Password is required.")).toBeInTheDocument();
      expect(screen.getByText("New Password is required.")).toBeInTheDocument();
      expect(screen.getByText("Confirm Password is required.")).toBeInTheDocument();
    });
  });

  test("shows error for password mismatch", async () => {
    fireEvent.change(screen.getByLabelText(/Old Password/i), {
      target: { value: "old123" },
    });
    fireEvent.change(screen.getByLabelText(/New Password/i), {
      target: { value: "new123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "new1234" },
    });

    fireEvent.click(screen.getByText(/Change Password/i));

    await waitFor(() => {
      expect(
        screen.getByText("Confirm Password does not match New Password.")
      ).toBeInTheDocument();
    });
  });

  test("calls API only after clicking the button", async () => {
    PostCall.mockResolvedValue({
      data: { status: 200, message: "Password changed successfully" },
    });
  
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Old Password/i), { target: { value: "123" } });
      fireEvent.change(screen.getByLabelText(/New Password/i), { target: { value: "Ab@1234" } });
      fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: "Ab@1234" } });
    });
  
    expect(PostCall).not.toHaveBeenCalled();
  
    await act(async () => {
      fireEvent.click(screen.getByText(/Change Password/i));
    });
  
    await waitFor(() => {

      expect(PostCall).toHaveBeenCalledWith("/updatePassword", {
        oldPassword: "123",
        newPassword: "Ab@1234",
        confirmPassword: "Ab@1234",
        userId: "user123",
      });
    });
  });
});
