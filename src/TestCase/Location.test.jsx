import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import Location from '../pages/Location/Location';
import { GetCall, PostCall } from '../ApiServices';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    __esModule: true,
    ...originalModule,
    useNavigate: () => mockNavigate,
  };
});

// Mock the API services
jest.mock('../ApiServices', () => ({
  GetCall: jest.fn(),
  PostCall: jest.fn(),
}));

// Mock the toast manager
jest.mock('../main/ToastManager', () => ({
  showToast: jest.fn(),
}));

// Mock the Loader component
jest.mock('../pages/Helper/Loader', () => {
  return function MockLoader() {
    return <div data-testid="loader">Loading...</div>;
  };
});

// Mock the CommonTable component
jest.mock('../SeparateCom/CommonTable', () => {
  return function MockCommonTable({ data, actions, currentPage, totalPages, onPageChange }) {
    return (
      <div>
        {data?.map((item) => (
          <div key={item._id}>
            <span>{item.Name}</span>
            <button onClick={() => actions.actionsList[1].onClick(item._id, item.Name)}>Delete</button>
          </div>
        ))}
        <button onClick={() => onPageChange(currentPage + 1)}>Next</button>
      </div>
    );
  };
});

// Mock the DeleteConfirmation component
jest.mock('../main/DeleteConfirmation', () => {
  return function MockDeleteConfirmation({ onConfirm, onCancel }) {
    return (
      <div>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    );
  };
});

describe('Location Component', () => {
  const mockLocations = {
    data: {
      status: 200,
      locations: [
        {
          _id: '1',
          locationName: 'Test Location',
          address: '123 Test St',
          city: 'Test City',
          postcode: '12345',
        },
      ],
      totalLocations: 1,
      totalPages: 2,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    GetCall.mockResolvedValue(mockLocations);
  });

  it('renders location list correctly', async () => {
    render(
      <BrowserRouter>
        <Location />
      </BrowserRouter>
    );

    // Check if the title is rendered
    expect(screen.getByText('Location List')).toBeInTheDocument();

    // Wait for the data to load
    await waitFor(() => {
      expect(screen.getByText('Test Location')).toBeInTheDocument();
    });
  });

});
