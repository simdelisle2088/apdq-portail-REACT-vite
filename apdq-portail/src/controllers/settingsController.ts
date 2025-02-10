import axios, { AxiosError } from 'axios';
import { ApiResponse, ErrorResponse } from '../interface/interface';

class SettingsController {
  private readonly baseURL = 'http://127.0.0.1:8000';

  constructor() {
    this.baseURL = 'http://127.0.0.1:8000';
  }

  async updateGarage(
    authToken: string,
    garageName: string,
    updateData: { username?: string; password?: string }
  ): Promise<
    ApiResponse<{ message: string; garage_name: string; username: string }>
  > {
    try {
      const response = await axios.put<{
        message: string;
        garage_name: string;
        username: string;
      }>(
        `${this.baseURL}/garages/api/v1/update_garage`,
        {
          garage_name: garageName,
          ...updateData,
        },
        {
          headers: {
            'X-Deliver-Auth': authToken,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        data: response.data,
        message: 'Garage updated successfully',
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorResponse: ErrorResponse = {
          success: false,
          message: 'Failed to update garage',
          error: {
            status: error.response?.status || 500,
            message:
              error.response?.data?.detail || 'An unexpected error occurred',
          },
        };

        // Handle specific error cases
        switch (error.response?.status) {
          case 403:
            errorResponse.message =
              'You do not have permission to update this garage';
            break;
          case 404:
            errorResponse.message = `Garage with name "${garageName}" not found`;
            break;
          case 400:
            errorResponse.message =
              error.response.data?.detail || 'Invalid update data provided';
            break;
        }

        return errorResponse;
      }

      return {
        success: false,
        message: 'An unexpected error occurred while updating the garage',
        error: {
          status: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
  async updateAdmin(
    authToken: string,
    username: string,
    updateData: { new_username?: string; password?: string }
  ): Promise<ApiResponse<{ message: string; username: string; role: string }>> {
    try {
      // Make the API request to update admin information
      const response = await axios.put<{
        message: string;
        username: string;
        role: string;
      }>(
        `${this.baseURL}/admin/api/v1/update_admin`,
        {
          username: username,
          ...updateData,
        },
        {
          headers: {
            'X-Deliver-Auth': authToken,
            'Content-Type': 'application/json',
          },
        }
      );

      // Return successful response
      return {
        success: true,
        data: response.data,
        message: 'Admin updated successfully',
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        // Create the error response object
        const errorResponse: ErrorResponse = {
          success: false,
          message: 'Failed to update admin',
          error: {
            status: error.response?.status || 500,
            message:
              error.response?.data?.detail || 'An unexpected error occurred',
          },
        };

        // Handle different error scenarios
        switch (error.response?.status) {
          case 403:
            errorResponse.message =
              'You do not have permission to perform this update. Only superadmin and apdq users are authorized.';
            break;
          case 404:
            errorResponse.message = `User with username "${username}" not found`;
            break;
          case 400:
            errorResponse.message =
              error.response.data?.detail || 'Invalid update data provided';
            break;
          case 401:
            errorResponse.message =
              'Authentication failed. Please log in again.';
            break;
        }

        return errorResponse;
      }

      // Handle unexpected errors
      return {
        success: false,
        message: 'An unexpected error occurred while updating the admin',
        error: {
          status: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
}

export const settingsController = new SettingsController();
