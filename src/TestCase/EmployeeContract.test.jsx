import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EmploymentContract from "../pages/EmploymentContract/EmploymentContract"
import { GetCall, PostCall } from '../ApiServices';
import { showToast } from "../main/ToastManager";

jest.mock('../ApiServices', () => ({
  GetCall: jest.fn(),
  PostCall: jest.fn(),
}));

jest.mock('../main/ToastManager', () => ({
  showToast: jest.fn(),
}));

describe('EmploymentContract Component', () => {
  const mockCompanyData = {
    data: {
      status: 200,
      companies: [
        { _id: '1', companyDetails: { businessName: 'Test Company' } }
      ]
    }
  };

  const mockContractData = {
    data: {
      status: 200,
      contracts: [
        {
          _id: '1',
          contractName: 'Test Contract',
          contractFileName: 'test.doc',
          companyName: 'Test Company',
          uploadBy: 'Admin',
          createdAt: '2024-01-01'
        }
      ],
      totalPages: 1,
      totalContracts: 1
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    GetCall.mockImplementation((url) => {
      if (url.includes('/getAllCompany')) {
        return Promise.resolve(mockCompanyData);
      }
      if (url.includes('/getAllContract')) {
        return Promise.resolve(mockContractData);
      }
      return Promise.resolve({ data: { status: 200 } });
    });

    PostCall.mockResolvedValue({ data: { status: 200, message: 'Success' } });
  });

//   test('renders the component', () => {
//     render(<EmploymentContract />);
//     expect(screen.getByText('Employee Contract')).toBeInTheDocument();
//   });

//   test('validates form submission with empty fields', async () => {
//     render(<EmploymentContract />);
    
//     // Click upload button without filling any fields
//     const uploadButton = screen.getByText('Upload');
//     fireEvent.click(uploadButton);

//     // Check for validation error messages
//     await waitFor(() => {
//       expect(screen.getByText('company Name is required')).toBeInTheDocument();
//       expect(screen.getByText('Contract name is required')).toBeInTheDocument();
//       expect(screen.getByText('Contract file is required')).toBeInTheDocument();
//     });
//   });

//   test('validates file type on upload', async () => {
//     render(<EmploymentContract />);
    
//     // Create a mock file with invalid type
//     const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    
//     // Get the file input and trigger change event
//     const fileInput = screen.getByLabelText('Choose File');
//     fireEvent.change(fileInput, { target: { files: [file] } });

//     // Check for file type validation error
//     await waitFor(() => {
//       expect(screen.getByText('Please upload a valid contract file (Word, or doc).')).toBeInTheDocument();
//     });
//   });

//   test('handles successful contract upload', async () => {
//     render(<EmploymentContract />);
    
//     // Fill in the form
//     const companySelect = screen.getByRole('combobox');
//     fireEvent.change(companySelect, { target: { value: '1' } });

//     const contractNameInput = screen.getByPlaceholderText('Enter contract Name');
//     fireEvent.change(contractNameInput, { target: { value: 'Test Contract' } });

//     // Create a mock file with valid type
//     const file = new File(['test'], 'test.doc', { type: 'application/msword' });
//     const fileInput = screen.getByLabelText('Choose File');
//     fireEvent.change(fileInput, { target: { files: [file] } });

//     // Submit the form
//     const uploadButton = screen.getByText('Upload');
//     fireEvent.click(uploadButton);

//     // Check if API was called and success message shown
//     await waitFor(() => {
//       expect(PostCall).toHaveBeenCalledWith('/addContract', expect.any(Object));
//       expect(showToast).toHaveBeenCalledWith('Success', 'success');
//     });
//   });

//   test('handles API error during contract upload', async () => {
//     // Mock API error
//     PostCall.mockRejectedValueOnce(new Error('API Error'));

//     render(<EmploymentContract />);
    
//     // Fill in the form
//     const companySelect = screen.getByRole('combobox');
//     fireEvent.change(companySelect, { target: { value: '1' } });

//     const contractNameInput = screen.getByPlaceholderText('Enter contract Name');
//     fireEvent.change(contractNameInput, { target: { value: 'Test Contract' } });

//     const file = new File(['test'], 'test.doc', { type: 'application/msword' });
//     const fileInput = screen.getByLabelText('Choose File');
//     fireEvent.change(fileInput, { target: { files: [file] } });

//     // Submit the form
//     const uploadButton = screen.getByText('Upload');
//     fireEvent.click(uploadButton);

//     // Check if error message is shown
//     await waitFor(() => {
//       expect(showToast).toHaveBeenCalledWith('An error occurred while processing your request.', 'error');
//     });
//   });

//   test('handles contract deletion', async () => {
//     render(<EmploymentContract />);
    
//     // Wait for contracts to load
//     await waitFor(() => {
//       expect(GetCall).toHaveBeenCalledWith(expect.stringContaining('/getAllContract'));
//     });

//     // Find and click the delete button
//     const deleteButton = screen.getByText('Delete');
//     fireEvent.click(deleteButton);

//     // Confirm deletion
//     const confirmButton = screen.getByText('Confirm');
//     fireEvent.click(confirmButton);

//     // Check if delete API was called
//     await waitFor(() => {
//       expect(PostCall).toHaveBeenCalledWith(expect.stringContaining('/deleteContract/'), expect.any(Object));
//       expect(showToast).toHaveBeenCalledWith('Success', 'success');
//     });
//   });

//   test('handles search functionality', async () => {
//     render(<EmploymentContract />);
    
//     const searchInput = screen.getByLabelText('Search Contract');
//     fireEvent.change(searchInput, { target: { value: 'test' } });

//     // Check if API was called with search query
//     await waitFor(() => {
//       expect(GetCall).toHaveBeenCalledWith(expect.stringContaining('search=test'));
//     });
//   });
}); 