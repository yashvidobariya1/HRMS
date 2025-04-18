import { render, screen, waitFor } from "@testing-library/react";
import { GetCall } from "../ApiServices";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { MemoryRouter } from "react-router";
import Holidays from "../pages/Holidays/Holidays";

jest.mock("../ApiServices", () => ({
  GetCall: jest.fn(),
}));

const mockStore = configureStore([]);
const store = mockStore({
    userInfo: { userInfo: { role: "Tester" } },
  });

  jest.mock("../ApiServices", () => ({
    GetCall: jest.fn(),
    PostCall: jest.fn(),
  }));
  
jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"), 
  useParams: jest.fn(() => ({ id: "123" })),
  useNavigate: jest.fn(),
}));

  
describe("Holidays Component API Call", () => {

  test("fetches and displays holidays", async () => {
    GetCall.mockResolvedValue({
      data: {
        status: 200,
        holidays: [
          { occasion: "festival", date: "2025-01-01" },
          { occasion: "Independence Day", date: "2025-07-04" },
        ],
      },
    });

render(
    <Provider store={store}>updatePassword
    <Holidays />
  </Provider>
)   
screen.debug();
    await waitFor(() => screen.getByText("Independence Day"));
expect(screen.getByText("Independence Day")).toBeInTheDocument();
  });
});
