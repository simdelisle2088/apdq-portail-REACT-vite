import axios, { AxiosError } from 'axios';
import {
  ApiResponse,
  CreateRemorqueurRequest,
  ErrorResponse,
  GarageResponse,
  GarageWithRemorqueurs,
  Permission,
  Remorqueur,
  Role,
  UpdateRemorqueurRequest,
  User,
} from '../interface/interface';
class DashboardUserController {
  private readonly baseURL = 'http://127.0.0.1:8000';

  constructor() {
    this.baseURL = 'http://127.0.0.1:8000';
  }

  async getGarageCount(
    authToken: string
  ): Promise<ApiResponse<{ total_garages: number }>> {
    try {
      const response = await axios.get<{ total_garages: number }>(
        `${this.baseURL}/garages/api/v1/count`,
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
        message: 'Garage count retrieved successfully',
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorResponse: ErrorResponse = {
          success: false,
          message: 'Failed to fetch garage count',
          error: {
            status: error.response?.status || 500,
            message:
              error.response?.data?.detail || 'An unexpected error occurred',
          },
        };

        // Handle specific error cases
        if (error.response?.status === 403) {
          errorResponse.message =
            'You do not have permission to view garage count';
        }

        return errorResponse;
      }

      return {
        success: false,
        message: 'An unexpected error occurred while fetching garage count',
        error: {
          status: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  async createGarage(
    authToken: string,
    createData: {
      name: string;
      email: string;
      username: string;
      password: string;
      role_name: string;
    }
  ): Promise<ApiResponse<GarageResponse>> {
    try {
      // Note that we're now expecting a GarageResponse from the API
      const response = await axios.post<GarageResponse>(
        `${this.baseURL}/garages/api/v1/create_garages`,
        createData,
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
        message: 'Garage created successfully',
      };
    } catch (error) {
      // Error handling remains the same
      if (error instanceof AxiosError) {
        const errorResponse: ErrorResponse = {
          success: false,
          message: 'Failed to create garage',
          error: {
            status: error.response?.status || 500,
            message:
              error.response?.data?.detail || 'An unexpected error occurred',
          },
        };

        switch (error.response?.status) {
          case 403:
            errorResponse.message =
              'You do not have permission to create garages';
            break;
          case 400:
            errorResponse.message =
              error.response.data?.detail || 'Invalid data provided';
            break;
        }

        return errorResponse;
      }

      return {
        success: false,
        message: 'An unexpected error occurred while creating garage',
        error: {
          status: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  async getGarageRemorqueurs(
    authToken: string
  ): Promise<ApiResponse<Remorqueur[]>> {
    try {
      const response = await axios.get<Remorqueur[]>(
        `${this.baseURL}/remorqueurs/api/v1/get_garage_remorqueurs/`,
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
        message: 'Remorqueurs retrieved successfully',
      };
    } catch (error) {
      // Handle different types of errors
      if (error instanceof AxiosError) {
        const errorResponse: ErrorResponse = {
          success: false,
          message: 'Failed to fetch remorqueurs',
          error: {
            status: error.response?.status || 500,
            message:
              error.response?.data?.detail || 'An unexpected error occurred',
          },
        };

        // Handle specific error cases
        if (error.response?.status === 403) {
          errorResponse.message =
            'You do not have permission to view remorqueurs';
        } else if (error.response?.status === 404) {
          errorResponse.message = 'Garage not found';
        }

        return errorResponse;
      }

      // Handle unexpected errors
      return {
        success: false,
        message: 'An unexpected error occurred while fetching remorqueurs',
        error: {
          status: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  async createRemorqueur(
    authToken: string,
    createData: CreateRemorqueurRequest
  ): Promise<ApiResponse<Remorqueur>> {
    try {
      const response = await axios.post<Remorqueur>(
        `${this.baseURL}/remorqueurs/api/v1/create_remorqueur`,
        createData,
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
        message: 'Remorqueur created successfully',
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorResponse: ErrorResponse = {
          success: false,
          message: 'Failed to create remorqueur',
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
              'You do not have permission to create remorqueurs';
            break;
          case 400:
            errorResponse.message =
              error.response.data?.detail || 'Invalid data provided';
            break;
          case 404:
            errorResponse.message = 'Garage not found';
            break;
        }

        return errorResponse;
      }

      return {
        success: false,
        message: 'An unexpected error occurred while creating remorqueur',
        error: {
          status: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  async updateRemorqueur(
    authToken: string,
    remorqueurId: number,
    updateData: UpdateRemorqueurRequest
  ): Promise<ApiResponse<Remorqueur>> {
    try {
      const response = await axios.put<Remorqueur>(
        `${this.baseURL}/remorqueurs/api/v1/update_remorqueur/${remorqueurId}`,
        updateData,
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
        message: 'Remorqueur updated successfully',
      };
    } catch (error) {
      // Handle different types of errors
      if (error instanceof AxiosError) {
        const errorResponse: ErrorResponse = {
          success: false,
          message: 'Failed to update remorqueur',
          error: {
            status: error.response?.status || 500,
            message:
              error.response?.data?.detail || 'An unexpected error occurred',
          },
        };

        // Handle specific error cases based on your backend responses
        switch (error.response?.status) {
          case 403:
            errorResponse.message =
              error.response.data?.detail ||
              'You do not have permission to update this remorqueur';
            break;
          case 404:
            errorResponse.message = 'Remorqueur not found';
            break;
          case 400:
            errorResponse.message =
              error.response.data?.detail || 'Invalid update data provided';
            break;
        }

        return errorResponse;
      }

      // Handle unexpected errors
      return {
        success: false,
        message: 'An unexpected error occurred while updating remorqueur',
        error: {
          status: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  async deleteRemorqueur(
    authToken: string,
    remorqueurId: number
  ): Promise<ApiResponse<{ message: string; remorqueur_id: number }>> {
    try {
      const response = await axios.delete<{
        message: string;
        remorqueur_id: number;
      }>(
        `${this.baseURL}/remorqueurs/api/v1/delete_remorqueur/${remorqueurId}`,
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
        message: 'Remorqueur deleted successfully',
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorResponse: ErrorResponse = {
          success: false,
          message: 'Failed to delete remorqueur',
          error: {
            status: error.response?.status || 500,
            message:
              error.response?.data?.detail || 'An unexpected error occurred',
          },
        };

        if (error.response?.status === 403) {
          errorResponse.message =
            'You do not have permission to delete this remorqueur';
        } else if (error.response?.status === 404) {
          errorResponse.message = 'Remorqueur not found';
        }

        return errorResponse;
      }

      return {
        success: false,
        message: 'An unexpected error occurred while deleting remorqueur',
        error: {
          status: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  async getAllGaragesWithRemorqueurs(
    authToken: string
  ): Promise<ApiResponse<GarageWithRemorqueurs[]>> {
    try {
      const response = await axios.get<GarageWithRemorqueurs[]>(
        `${this.baseURL}/api/v1/get_all_garages_with_remorqueurs/`,
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
        message: 'Garages retrieved successfully',
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorResponse: ErrorResponse = {
          success: false,
          message: 'Failed to fetch garages',
          error: {
            status: error.response?.status || 500,
            message:
              error.response?.data?.detail || 'An unexpected error occurred',
          },
        };

        // Handle specific error cases
        if (error.response?.status === 403) {
          errorResponse.message =
            'You do not have permission to view all garages';
        }

        return errorResponse;
      }

      return {
        success: false,
        message: 'An unexpected error occurred while fetching garages',
        error: {
          status: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
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
  async refreshUserData(): Promise<User | null> {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      console.log('token::::', token);
      if (!token) {
        console.warn('No token found in localStorage');
        return null;
      }
      if (!userData) {
        console.warn('No user data found in localStorage');
        return null;
      }

      // Parse the stored user data to extract the username
      const user = JSON.parse(userData);
      const username = user.garage_name; // Extracting the username

      if (!username) {
        console.warn('Username (garage_name) not found in user data');
        return null;
      }

      // Make sure we're sending the token in the correct format
      const response = await axios.post<User>(
        `${this.baseURL}/garages/api/v1/current_garage`,
        { username },
        {
          headers: {
            'X-Deliver-Auth': token,
            'Content-Type': 'application/json',
          },
        }
      );

      // Handle the response
      if (response.data) {
        // Update local storage with fresh data
        localStorage.setItem('user', JSON.stringify(response.data));
        localStorage.setItem('role', JSON.stringify(response.data.role));

        if (response.data.stripe_customer_id) {
          localStorage.setItem(
            'stripeCustomerId',
            response.data.stripe_customer_id
          );
        }

        return response.data;
      }

      return null;
    } catch (error) {
      console.error('Error refreshing garage data:', error);
      return null;
    }
  }
}

// Helper types for better type checking and consistency
export type { Remorqueur, Role, Permission, UpdateRemorqueurRequest };

// Export the controller as a singleton instance
export const dashboardUserController = new DashboardUserController();
