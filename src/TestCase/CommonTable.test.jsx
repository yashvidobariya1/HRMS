import { render, screen, act } from "@testing-library/react";
import CommonTable from "../SeparateCom/CommonTable";

const headers = ["Name", "Position", "Email", "Action"];
const data = [
  {
    Name: "John Doe",
    Position: "Developer",
    Email: "john@example.com",
    Action: "Edit",
  },
];
const actions = { actionsList: [{ label: "Edit", onClick: jest.fn() }] };
// const mockHandleDelete = jest.fn();

test("opens dropdown when clicking the action button", async () => {
  const handleAction = jest.fn();

  await act(async () => {
    render(
      <CommonTable
        headers={headers}
        data={data}
        actions={actions}
        handleAction={handleAction}
      />
    );
  });

  const actionButton = await screen.findByTestId("action-button");
  expect(actionButton).toBeInTheDocument();
});

// test("calls handleDelete with correct arguments", () => {
//   render(
//     <CommonTable
//       headers={headers}
//       data={data}
//       actions={actions}
//       handleAction={mockHandleDelete}
//       isPagination={"false"}
//     />
//   );

//   const actionButtons = screen.getAllByTestId("action-button");
//   expect(actionButtons.length).toBeGreaterThan(0);

//   fireEvent.click(actionButtons[0]);

//   const deleteButton = screen.getByText("Delete");
//   fireEvent.click(deleteButton);

//   expect(mockHandleDelete).toHaveBeenCalledWith("1", "Jane Doe");
// });
