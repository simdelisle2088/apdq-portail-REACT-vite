import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  DeleteResponse,
  ErrorDataResponse,
  FileUploadResponse,
  VehicleCreate,
  VehicleResponse,
} from '../interface/interface';

class DataController {
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

  private handleError(error: AxiosError) {
    if (error.response) {
      const errorData = error.response.data as ErrorDataResponse;
      throw new Error(errorData.detail || 'An error occurred');
    } else if (error.request) {
      throw new Error('No response received from server');
    } else {
      throw new Error('Error setting up request');
    }
  }

  // Vehicle CRUD operations
  async createVehicle(vehicleData: VehicleCreate): Promise<VehicleResponse> {
    try {
      const response = await this.axios.post<VehicleResponse>(
        '/vehicles/',
        vehicleData
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  async getVehicles(skip = 0, limit = 100): Promise<VehicleResponse[]> {
    try {
      const response = await this.axios.get<VehicleResponse[]>('/vehicles/', {
        params: { skip, limit },
      });
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  async getVehicle(vehicleId: number): Promise<VehicleResponse> {
    try {
      const response = await this.axios.get<VehicleResponse>(
        `/vehicles/${vehicleId}`
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  async uploadImage(
    vehicleId: number,
    file: File
  ): Promise<FileUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.axios.post<FileUploadResponse>(
        `/vehicles/${vehicleId}/upload-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }
  async deleteImage(
    vehicleId: number,
    imageId: number
  ): Promise<DeleteResponse> {
    try {
      const response = await this.axios.delete<DeleteResponse>(
        `/vehicles/${vehicleId}/images/${imageId}`
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  async uploadNeutralPDF(
    vehicleId: number,
    file: File
  ): Promise<FileUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.axios.post<FileUploadResponse>(
        `/vehicles/${vehicleId}/upload-neutral-pdf`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  async uploadDeactivationPDF(
    vehicleId: number,
    file: File
  ): Promise<FileUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.axios.post<FileUploadResponse>(
        `/vehicles/${vehicleId}/upload-deactivation-pdf`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  async updateVehicle(
    vehicleId: number,
    vehicleData: VehicleCreate
  ): Promise<VehicleResponse> {
    try {
      const response = await this.axios.put<VehicleResponse>(
        `/vehicles/${vehicleId}`,
        vehicleData
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  async updateNeutralPDF(
    vehicleId: number,
    file: File
  ): Promise<FileUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.axios.post<FileUploadResponse>(
        `/vehicles/${vehicleId}/update-neutral-pdf`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  async updateDeactivationPDF(
    vehicleId: number,
    file: File
  ): Promise<FileUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.axios.post<FileUploadResponse>(
        `/vehicles/${vehicleId}/update-deactivation-pdf`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  async updateImage(
    vehicleId: number,
    file: File
  ): Promise<FileUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await this.axios.post<FileUploadResponse>(
        `/vehicles/${vehicleId}/update-image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  async deleteNeutralPDF(
    vehicleId: number,
    pdfId: number
  ): Promise<DeleteResponse> {
    try {
      const response = await this.axios.delete<DeleteResponse>(
        `/vehicles/${vehicleId}/neutral-pdfs/${pdfId}`
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }

  async deleteDeactivationPDF(
    vehicleId: number,
    pdfId: number
  ): Promise<DeleteResponse> {
    try {
      const response = await this.axios.delete<DeleteResponse>(
        `/vehicles/${vehicleId}/deactivation-pdfs/${pdfId}`
      );
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }
}

const dataController = new DataController();
export default dataController;
