import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  APIErrorResponse,
  LoginCredentials,
  LoginResponse,
  Role,
  User,
} from '../interface/interface';

class LoginController {
  private baseURL: string;
  private axios: AxiosInstance;

  constructor() {
    this.baseURL = 'http://127.0.0.1:8000';
    this.axios = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Process login request
  async login(
    credentials: LoginCredentials
  ): Promise<LoginResponse | undefined> {
    try {
      const response = await this.axios.post('/auth/api/v1/login', credentials);

      if (response.data.access_token) {
        // Check if user is a garage and is inactive
        if (
          response.data.role.name === 'garage' &&
          !response.data.user.is_active
        ) {
          const userEmail = response.data.user.email;

          // Store the credentials for later use
          sessionStorage.setItem('pendingPaymentEmail', userEmail);
          sessionStorage.setItem(
            'pendingLoginCredentials',
            JSON.stringify(credentials)
          );

          // Open Stripe in a new window
          const stripeUrl = new URL(
            'https://buy.stripe.com/test_6oE9EDcEN05X6JydQQ'
          );
          window.open(
            stripeUrl.toString(),
            'stripePayment',
            'width=1000,height=800'
          );

          return {
            success: false,
            paymentRequired: true,
            message:
              "Une souscription est nécessaire pour continuer. Une fenêtre de paiement s'est ouverte.",
          };
        }

        // Regular login flow remains the same
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('role', JSON.stringify(response.data.role));
        localStorage.setItem('garageName', response.data.user.garage_name);

        window.dispatchEvent(new Event('tokenChange'));

        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        error: 'Invalid response from server',
      };
    } catch (error) {
      return this.handleError(error as AxiosError<APIErrorResponse>);
    }
  }

  // Check if user is currently logged in
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // Get current user data
  getCurrentUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Get current user role and permissions
  getUserRole(): Role | null {
    const role = localStorage.getItem('role');
    return role ? JSON.parse(role) : null;
  }

  // Get garage name (for remorqueur)
  getGarageName(): string | null {
    return localStorage.getItem('garageName');
  }

  // Logout user
  logout = async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      localStorage.removeItem('garageName');

      return true;
    } catch (error) {
      console.error('Error in loginController logout:', error);
      throw error;
    }
  };

  // Handle API errors
  private handleError(error: AxiosError<APIErrorResponse>): LoginResponse {
    let errorMessage = 'An error occurred during login';

    if (error.response?.data?.detail) {
      // Server responded with error
      errorMessage = error.response.data.detail;
    } else if (error.request) {
      // Request made but no response received
      errorMessage = 'No response received from server';
    }

    return {
      success: false,
      error: errorMessage,
    };
  }

  // Check if token is expired
  isTokenExpired(): boolean {
    const role = this.getUserRole();
    if (!role) return true;

    const expiresAt = new Date(role.expires_at || '');
    return expiresAt < new Date();
  }

  // Refresh token if needed
  async checkAndRefreshToken(): Promise<boolean> {
    if (this.isLoggedIn() && this.isTokenExpired()) {
      this.logout();
      return false;
    }
    return true;
  }
}

// Create and export a singleton instance
const loginController = new LoginController();
export default loginController;
