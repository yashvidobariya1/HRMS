import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Profile from "../pages/EmployeeProfile/Profile"
import * as ApiServices from '../ApiServices';
import { showToast } from '../main/ToastManager';

jest.mock('../ApiServices');
jest.mock('../main/ToastManager', () => ({
  showToast: jest.fn(),
}));

describe('Profile Component', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
  
    test('renders profile and shows loader initially', async () => {
      ApiServices.GetCall.mockResolvedValueOnce({
        data: {
          status: 200,
          user: {
            personalDetails: {
              firstName: 'John',
              middleName: 'M',
              lastName: 'Doe',
              dateOfBirth: '1990-01-01',
              gender: 'Male',
              maritalStatus: 'Single',
              phone: '1234567890',
              homeTelephone: '',
              email: 'john@example.com',
            },
            documentDetails: [],
          },
        },
      });
  
      render(<Profile />);
  
      // Check loader is shown
      expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  
      // Wait for profile data to load
      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
        expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  
    test('displays all profile fields correctly', async () => {
      ApiServices.GetCall.mockResolvedValueOnce({
        data: {
          status: 200,
          user: {
            personalDetails: {
              firstName: 'John',
              middleName: 'M',
              lastName: 'Doe',
              dateOfBirth: '1990-01-01',
              gender: 'Male',
              maritalStatus: 'Single',
              phone: '1234567890',
              homeTelephone: '',
              email: 'john@example.com',
            },
            documentDetails: [],
          },
        },
      });
  
      render(<Profile />);
  
      // Wait for all fields to be displayed
      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
        expect(screen.getByDisplayValue('M')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
        expect(screen.getByDisplayValue('1990-01-01')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Male')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Single')).toBeInTheDocument();
        expect(screen.getByDisplayValue('1234567890')).toBeInTheDocument();
        expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
      }, { timeout: 5000 });
    });
  
    test('handles API error when fetching profile', async () => {
      // Mock error response
      ApiServices.GetCall.mockRejectedValueOnce({
        response: {
          data: {
            status: 500,
            message: "Error fetching profile details",
          },
        },
      });
  
      render(<Profile />);
  
      // Check loader is shown initially
      expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  
      // Wait for error handling
      await waitFor(() => {
        // Verify error toast is shown
        expect(showToast).toHaveBeenCalledWith("Error fetching profile details", "error");
        
        // Verify loader is gone
        expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();
        
        // Verify no profile data is displayed
        expect(screen.queryByDisplayValue('John')).not.toBeInTheDocument();
        expect(screen.queryByDisplayValue('Doe')).not.toBeInTheDocument();
      }, { timeout: 5000 });
    });
      
  });
  
