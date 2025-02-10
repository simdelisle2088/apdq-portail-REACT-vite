import axios from 'axios';
import { ApiResponse } from '../interface/interface';
import { dashboardUserController } from './dashboardUserController';

class StripeController {
  private readonly baseURL = 'http://127.0.0.1:8000';

  async createPortalSession(): Promise<ApiResponse<{ url: string }>> {
    try {
      // Refresh user data before proceeding
      const freshUserData = await dashboardUserController.refreshUserData();
      if (!freshUserData) {
        throw new Error('Failed to fetch user data');
      }

      const username = freshUserData.username || freshUserData.garage_name;
      const stripeCustomerId = freshUserData.stripe_customer_id;

      // Ensure both fields are available before sending the request
      if (!username || !stripeCustomerId) {
        throw new Error('Missing username or Stripe customer ID');
      }

      const response = await axios.post<{ url: string }>(
        `${this.baseURL}/billing/create-portal-session`,
        {
          username,
          stripe_customer_id: stripeCustomerId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        data: response.data,
        message: 'Portal session created successfully',
      };
    } catch (error) {
      console.error('Portal session error:', error); // Debug log

      if (axios.isAxiosError(error)) {
        const errorDetail = error.response?.data?.detail;
        let errorMessage = 'Failed to create portal session';

        switch (error.response?.status) {
          case 401:
            errorMessage = 'Authentication required. Please log in again.';
            break;
          case 403:
            errorMessage = 'Only garage accounts can access billing settings.';
            break;
          case 404:
            errorMessage =
              'Garage account not found. Please ensure you are logged in with a garage account.';
            break;
          case 400:
            errorMessage =
              errorDetail ||
              'No billing information found. Please complete the subscription process.';
            break;
          case 500:
            errorMessage = 'Server error occurred. Please try again later.';
            break;
          default:
            errorMessage = errorDetail || 'An unexpected error occurred';
        }

        return {
          success: false,
          message: errorMessage,
          error: {
            status: error.response?.status || 500,
            message: errorDetail || 'An unexpected error occurred',
          },
        };
      }

      return {
        success: false,
        message: 'Failed to access billing portal',
        error: {
          status: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
}

export const stripeController = new StripeController();
