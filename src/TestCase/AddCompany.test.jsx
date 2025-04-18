import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddCompany from "../pages/Settings/AddCompany";
import { MemoryRouter } from "react-router";
import { PostCall } from "../ApiServices";


jest.mock("../ApiServices", () => ({
  PostCall: jest.fn().mockResolvedValue({
      status: 200,
      message: "Company created successfully.",
      company: {
          isDeleted: false,
          companyDetails: {
              companyCode: "abc123",
              businessName: "TechCorp",
              companyLogo: "https://res.cloudinary.com/dwerzoswa/image/upload/v1741169793/companyLogos/pdx8gpjoi6hhayuoa8p3.png",
              companyRegistrationNumber: "Gardner and Alvarez Associates",
              payeReferenceNumber: "60",
              address: "address",
              addressLine2: "Sed facere eligendi",
              city: "Aliqua Nihil aute q",
              postCode: "Soluta quidem conseq",
              country: "USA",
              timeZone: "GMT+3",
              contactPersonFirstname: "Gage",
              contactPersonMiddlename: "Piper Mccall",
              contactPersonLastname: "Vargas",
              contactPersonEmail: "pukydaza@mailinator.com",
              contactPhone: "1234567890",
              adminToReceiveNotification: "Admin",
              additionalEmailsForCompliance: "vanyveguk@mailinator.com",
              pensionProvider: "Tempor autem volupta"
          },
          employeeSettings: {
              payrollFrequency: "Monthly",
              immigrationReminderDay1st: 25,
              immigrationReminderDay2nd: 14,
              immigrationReminderDay3rd: 20,
              holidayYear: "Mar-Jun",
              noticePeriodDays:"11",
              contactConfirmationDays: 14,
              rightToWorkCheckReminder: 33,
              holidaysExcludingBank: 6,
              sickLeaves: 91
          },
          contractDetails: {
              startDate: "1985-06-12",
              endDate: "2009-11-12",
              maxEmployeesAllowed: 36
          }
      }
    
  }), 
}));
describe("add leave api call", () => {
  test("submits successfully and call API", async () => {
    render(
      <MemoryRouter>
        <AddCompany />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Enter Company Code/i), {
      target: { value: "abc123" },
    });
    expect(screen.getByPlaceholderText(/Enter Company Code/i)).toHaveValue("abc123");

    fireEvent.change(screen.getByPlaceholderText(/Enter Business Name/i), {
      target: { value: "TechCorp" },
    });
    expect(screen.getByPlaceholderText(/Enter Business Name/i)).toHaveValue("TechCorp");

    const file = new File(["(image content)"], "logo.png", { type: "image/png" });

    fireEvent.change(screen.getByLabelText(/Choose File/i), {
      target: { files: [file] },
    });
    
    expect(screen.getByLabelText(/Choose File/i).files[0]).toBe(file);
    expect(screen.getByLabelText(/Choose File/i).files[0].name).toBe("logo.png");
    fireEvent.change(screen.getByPlaceholderText(/Enter Company Registration Number/i), {
      target: { value: "123456" },
    });
    expect(screen.getByPlaceholderText(/Enter Company Registration Number/i)).toHaveValue("123456");

    fireEvent.change(screen.getByPlaceholderText(/Enter PAYE Reference Number/i), {
      target: { value: "60" },
    });
    expect(screen.getByPlaceholderText(/Enter PAYE Reference Number/i)).toHaveValue("60");

    const addressInputs = screen.getAllByPlaceholderText(/Enter Address/i);
    fireEvent.change(addressInputs[0], { target: { value: "address" } });
    expect(addressInputs[0]).toHaveValue("address");
    
    fireEvent.change(screen.getByPlaceholderText(/Enter City/i), {
      target: { value: "New York" },
    });
    expect(screen.getByPlaceholderText(/Enter City/i)).toHaveValue("New York");

    fireEvent.change(screen.getByPlaceholderText(/Enter Post Code/i), {
      target: { value: "10001" },
    });
    expect(screen.getByPlaceholderText(/Enter Post Code/i)).toHaveValue("10001");

    fireEvent.change(screen.getByPlaceholderText(/Enter Contact Person Firstname/i), {
      target: { value: "John" },
    });
    expect(screen.getByPlaceholderText(/Enter Contact Person Firstname/i)).toHaveValue("John");

    fireEvent.change(screen.getByPlaceholderText(/Enter Contact Person Middlename/i), {
      target: { value: "A." },
    });
    expect(screen.getByPlaceholderText(/Enter Contact Person Middlename/i)).toHaveValue("A.");

    fireEvent.change(screen.getByPlaceholderText(/Enter Contact Person Lastname/i), {
      target: { value: "Doe" },
    });
    expect(screen.getByPlaceholderText(/Enter Contact Person Lastname/i)).toHaveValue("Doe");

    fireEvent.change(screen.getByPlaceholderText(/Enter Contact Person Email/i), {
      target: { value: "john@example.com" },
    });
    expect(screen.getByPlaceholderText(/Enter Contact Person Email/i)).toHaveValue("john@example.com");

    fireEvent.change(screen.getByPlaceholderText(/Enter Telephone/i), {
      target: { value: "1234567890" },
    });
    expect(screen.getByPlaceholderText(/Enter Telephone/i)).toHaveValue("1234567890");

    fireEvent.click(screen.getByRole("button", { name: /Next/i }));

    await waitFor(() => {
      expect(PostCall).toHaveBeenCalledTimes(1);
      expect(PostCall).toHaveBeenCalledWith("/addCompany",{
        companyDetails: {
          companyCode: "abc123",
          businessName: "TechCorp",
          companyLogo: "https://res.cloudinary.com/dwerzoswa/image/upload/v1741169793/companyLogos/pdx8gpjoi6hhayuoa8p3.png",
          companyRegistrationNumber: "123456",
          payeReferenceNumber: "60",
          address: "address",
          addressLine2: "Sed facere eligendi",
          city: "Aliqua Nihil aute q",
          postCode: "Soluta quidem conseq",
          country: "USA",
          timeZone: "GMT+3",
          contactPersonFirstname: "Gage",
          contactPersonMiddlename: "Piper Mccall",
          contactPersonLastname: "Vargas",
          contactPersonEmail: "pukydaza@mailinator.com",
          contactPhone: "1234567890",
          adminToReceiveNotification: "Admin",
          additionalEmailsForCompliance: "vanyveguk@mailinator.com",
          pensionProvider: "Tempor autem volupta"
      },
      employeeSettings: {
          payrollFrequency: "Monthly",
          immigrationReminderDay1st: 25,
          immigrationReminderDay2nd: 14,
          immigrationReminderDay3rd: 20,
          holidayYear: "Mar-Jun",
          noticePeriodDays:"11",
          contactConfirmationDays: 14,
          rightToWorkCheckReminder: 33,
          holidaysExcludingBank: 6,
          sickLeaves: 91
      },
      contractDetails: {
          startDate: "1985-06-12",
          endDate: "2009-11-12",
          maxEmployeesAllowed: 36
      }
      });
    });
  });
});

