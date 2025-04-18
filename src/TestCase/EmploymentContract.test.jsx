import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EmploymentContract from '../pages/EmploymentContract/EmploymentContract';
import { GetCall, PostCall } from '../ApiServices';
import { showToast } from '../main/ToastManager';

jest.mock('../../ApiServices', () => ({
  GetCall: jest.fn(),
  PostCall: jest.fn(),
}));

jest.mock('../../main/ToastManager', () => ({
  showToast: jest.fn(),
}));

describe('EmploymentContract Component', () => {
  const mockContractData = {
    _id: '1',
    contractName: 'Test Contract',
    contractFileName: 'test.doc',
    companyId: 'company1',
    uploadedBy: 'Test User',
    updatedDate: '2024-03-20',
  };

  const mockCompanyData = [
    { _id: 'company1', name: 'Test Company' },
    { _id: 'company2', name: 'Another Company' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    GetCall.mockImplementation((url) => {
      if (url.includes('/getAllCompany')) {
        return Promise.resolve({ data: { status: 200, companies: mockCompanyData } });
      }
      if (url.includes('/getAllContract')) {
        return Promise.resolve({
          data: {
            status: 200,
            contracts: [mockContractData],
            totalPages: 1,
            totalContracts: 1,
          },
        });
      }
      return Promise.resolve({ data: { status: 200, contract: mockContractData } });
    });

    PostCall.mockImplementation(() => 
      Promise.resolve({ data: { status: 200, message: 'Success' } })
    );
  });

  test('renders the component', () => {
    render(<EmploymentContract />);
    expect(screen.getByText('Contract Name')).toBeInTheDocument();
    expect(screen.getByText('Company')).toBeInTheDocument();
  });

  test('validates form submission with empty fields', async () => {
    render(<EmploymentContract />);
    
    const uploadButton = screen.getByText('Upload');
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText('company Name is required')).toBeInTheDocument();
      expect(screen.getByText('Contract name is required')).toBeInTheDocument();
      expect(screen.getByText('Contract file is required')).toBeInTheDocument();
    });
  });

  test('validates file upload with invalid file type', async () => {
    render(<EmploymentContract />);
    
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/Choose File/i);
    
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Please upload a valid contract file (Word, or doc).')).toBeInTheDocument();
    });
  });

  test('successfully submits form with valid data', async () => {
    render(<EmploymentContract />);
    
    const contractNameInput = screen.getByLabelText(/Contract Name/i);
    fireEvent.change(contractNameInput, { target: { value: 'Test Contract' } });

    const companySelect = screen.getByLabelText(/Company/i);
    fireEvent.change(companySelect, { target: { value: 'company1' } });

    const validFile = new File(['test'], 'test.doc', { type: 'application/msword' });
    const fileInput = screen.getByLabelText(/Choose File/i);
    fireEvent.change(fileInput, { target: { files: [validFile] } });

    const uploadButton = screen.getByText('Upload');
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(PostCall).toHaveBeenCalled();
      expect(showToast).toHaveBeenCalledWith('Success', 'success');
    });
  });

  test('handles API error during contract fetch', async () => {
    GetCall.mockImplementationOnce(() => 
      Promise.reject(new Error('API Error'))
    );

    render(<EmploymentContract />);

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith('An error occurred while fetching contracts.', 'error');
    });
  });

  test('handles contract deletion', async () => {
    render(<EmploymentContract />);

    await waitFor(() => {
      expect(screen.getByText('Test Contract')).toBeInTheDocument();
    });

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    const confirmButton = screen.getByText('Yes');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(PostCall).toHaveBeenCalledWith('/deleteContract/1');
      expect(showToast).toHaveBeenCalledWith('Success', 'success');
    });
  });

  test('handles search functionality', async () => {
    render(<EmploymentContract />);

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'Test' } });

    await waitFor(() => {
      expect(GetCall).toHaveBeenCalledWith(
        expect.stringContaining('search=Test')
      );
    });
  });
});
