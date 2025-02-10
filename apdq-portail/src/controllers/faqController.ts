import axios, { AxiosError } from 'axios';
import {
  ApiResponse,
  ErrorResponse,
  FAQ,
  FAQCreate,
  FAQResponse,
  FAQDeleteResponse,
} from '../interface/interface';

class FaqController {
  private readonly baseURL: string;

  constructor() {
    this.baseURL = 'http://127.0.0.1:8000';
  }

  async createFaq(
    authToken: string,
    faqData: FAQCreate
  ): Promise<ApiResponse<FAQResponse>> {
    // Validate language before making the API call
    if (!['en', 'fr'].includes(faqData.language)) {
      return {
        success: false,
        message: 'Invalid language specified',
        error: {
          status: 400,
          message: "Language must be either 'en' or 'fr'",
        },
      };
    }

    try {
      const response = await axios.post<FAQResponse>(
        `${this.baseURL}/admin/api/v1/faq`,
        faqData,
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
        message: `FAQ created successfully in ${
          faqData.language === 'en' ? 'English' : 'French'
        }`,
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorResponse: ErrorResponse = {
          success: false,
          message: 'Failed to create FAQ',
          error: {
            status: error.response?.status || 500,
            message:
              error.response?.data?.detail || 'An unexpected error occurred',
          },
        };

        // Enhanced error handling to include language-specific errors
        switch (error.response?.status) {
          case 403:
            errorResponse.message = 'You do not have permission to create FAQs';
            break;
          case 401:
            errorResponse.message = 'Authentication required';
            break;
          case 400:
            // Handle validation errors, including language validation from backend
            errorResponse.message =
              error.response.data?.detail ||
              'Invalid data provided. Please check the language setting and other fields';
            break;
        }

        return errorResponse;
      }

      return {
        success: false,
        message: 'An unexpected error occurred while creating FAQ',
        error: {
          status: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  async getFaqs(
    authToken: string,
    language?: string
  ): Promise<ApiResponse<FAQ[]>> {
    try {
      // Build the URL with language query parameter if provided
      let url = `${this.baseURL}/admin/api/v1/faqs`;
      if (language) {
        url += `?language=${language}`;
      }

      const response = await axios.get<FAQ[]>(url, {
        headers: {
          'X-Deliver-Auth': authToken,
          'Content-Type': 'application/json',
        },
      });

      return {
        success: true,
        data: response.data,
        message: 'FAQs retrieved successfully',
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorResponse: ErrorResponse = {
          success: false,
          message: 'Failed to fetch FAQs',
          error: {
            status: error.response?.status || 500,
            message:
              error.response?.data?.detail || 'An unexpected error occurred',
          },
        };

        if (error.response?.status === 403) {
          errorResponse.message = 'You do not have permission to view FAQs';
        } else if (error.response?.status === 401) {
          errorResponse.message = 'Authentication required';
        }

        return errorResponse;
      }

      return {
        success: false,
        message: 'An unexpected error occurred while fetching FAQs',
        error: {
          status: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  async getAllFaqs(authToken: string): Promise<ApiResponse<FAQ[]>> {
    try {
      const response = await axios.get<FAQ[]>(
        `${this.baseURL}/admin/api/v1/all_faqs`,
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
        message: 'FAQs retrieved successfully',
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorResponse: ErrorResponse = {
          success: false,
          message: 'Failed to fetch FAQs',
          error: {
            status: error.response?.status || 500,
            message:
              error.response?.data?.detail || 'An unexpected error occurred',
          },
        };

        if (error.response?.status === 403) {
          errorResponse.message = 'You do not have permission to view FAQs';
        } else if (error.response?.status === 401) {
          errorResponse.message = 'Authentication required';
        }

        return errorResponse;
      }

      return {
        success: false,
        message: 'An unexpected error occurred while fetching FAQs',
        error: {
          status: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  async deleteFaq(
    authToken: string,
    faqId: number
  ): Promise<ApiResponse<FAQDeleteResponse>> {
    try {
      const response = await axios.delete<FAQDeleteResponse>(
        `${this.baseURL}/admin/api/v1/faq/${faqId}`,
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
        message: 'FAQ deleted successfully',
      };
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorResponse: ErrorResponse = {
          success: false,
          message: 'Failed to delete FAQ',
          error: {
            status: error.response?.status || 500,
            message:
              error.response?.data?.detail || 'An unexpected error occurred',
          },
        };

        switch (error.response?.status) {
          case 404:
            errorResponse.message = 'FAQ not found';
            break;
          case 403:
            errorResponse.message = 'You do not have permission to delete FAQs';
            break;
          case 401:
            errorResponse.message = 'Authentication required';
            break;
        }

        return errorResponse;
      }

      return {
        success: false,
        message: 'An unexpected error occurred while deleting FAQ',
        error: {
          status: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
}

const faqController = new FaqController();
export default faqController;
