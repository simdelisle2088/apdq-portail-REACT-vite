import axios, { AxiosInstance, AxiosError } from 'axios';

interface AdminMessage {
  id: number;
  title: string;
  content: string;
  created_at: string;
  to_all: boolean;
  garage_ids: number[];
}

interface GarageMessage {
  id: number;
  title: string;
  content: string;
  created_at: string;
  to_all: boolean;
  remorqueur_ids: number[];
}

interface AdminMessageCreate {
  admin_id: number;
  title: string;
  content: string;
  to_all: boolean;
  garage_ids?: number[];
}

interface GarageMessageCreate {
  garage_id: number;
  title: string;
  content: string;
  to_all: boolean;
  remorqueur_ids?: number[];
}

interface DeleteMessageResponse {
  message: string;
}

interface APIErrorResponse {
  detail: string;
}

class MessageController {
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

    this.axios.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['X-Deliver-Auth'] = token;
      }
      return config;
    });
  }

  // Add these new methods to your MessageController class
  async getAllAdminMessages(): Promise<AdminMessage[]> {
    try {
      const response = await this.axios.get(
        '/admin/api/v1/get_all_admin_messages'
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError<APIErrorResponse>);
      return [];
    }
  }

  async getAllGarageMessages(garageId: number): Promise<GarageMessage[]> {
    try {
      const response = await this.axios.get(
        `/garages/api/v1/get_all_garage_messages?garage_id=${garageId}`
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError<APIErrorResponse>);
      return [];
    }
  }

  // Get messages for a garage from admin - Updated to use POST with body
  async getAdminMessages(garageId: number): Promise<AdminMessage[]> {
    try {
      const response = await this.axios.post(
        '/admin/api/v1/get_garages_fromAdmin_messages',
        { garage_id: garageId }
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError<APIErrorResponse>);
      return [];
    }
  }

  // Get messages for remorqueurs from their garage
  async getGarageMessages(remorqueurId: number): Promise<GarageMessage[]> {
    try {
      const response = await this.axios.post(
        '/garages/api/v1/get_remoqueurs_fromGarage_messages',
        { remorqueur_id: remorqueurId }
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError<APIErrorResponse>);
      return [];
    }
  }

  // Create a new admin message
  async createAdminMessage(
    messageData: AdminMessageCreate
  ): Promise<AdminMessage | null> {
    try {
      const response = await this.axios.post(
        '/admin/api/v1/create_admin_messages',
        messageData
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError<APIErrorResponse>);
      return null;
    }
  }

  // Create a new garage message
  async createGarageMessage(
    messageData: GarageMessageCreate
  ): Promise<GarageMessage | null> {
    try {
      const response = await this.axios.post(
        '/garages/api/v1/create_garage_messages',
        messageData
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError<APIErrorResponse>);
      return null;
    }
  }

  // Delete an admin message
  async deleteAdminMessage(
    messageId: number
  ): Promise<DeleteMessageResponse | null> {
    try {
      const response = await this.axios.delete(
        '/admin/api/v1/delete_admin_message',
        {
          data: { message_id: messageId },
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError<APIErrorResponse>);
      return null;
    }
  }

  // Delete a garage message
  async deleteGarageMessage(
    messageId: number
  ): Promise<DeleteMessageResponse | null> {
    try {
      const response = await this.axios.delete(
        '/garages/api/v1/delete_garage_message',
        {
          data: { message_id: messageId },
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError<APIErrorResponse>);
      return null;
    }
  }

  private handleError(error: AxiosError<APIErrorResponse>): void {
    let errorMessage = 'An error occurred';

    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail;
    } else if (error.request) {
      errorMessage = 'No response received from server';
    }

    console.error('MessageController Error:', errorMessage);
    throw new Error(errorMessage);
  }

  async deleteMultipleAdminMessages(
    messageIds: number[]
  ): Promise<DeleteMessageResponse | null> {
    try {
      const response = await this.axios.delete(
        '/admin/api/v1/delete_admin_messages',
        {
          data: { message_ids: messageIds },
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError<APIErrorResponse>);
      return null;
    }
  }
}

// Create and export a singleton instance
const messageController = new MessageController();
export default messageController;
