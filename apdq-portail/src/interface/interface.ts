export interface Permission {
  id: number;
  name: string;
}

export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
  expires_at?: string;
}

export interface User {
  id: number;
  username: string;
  is_active: boolean;
  garage_name: string; // This is the crucial field we need
  role_id: number;
  role: string;
  permission: string;
  stripe_customer_id: string;
}

// Login Related Interfaces
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponseData {
  access_token: string;
  token_type: string;
  user: User;
  role: Role;
  garage_name: string;
  expires_at: string;
}

export interface LoginResponse {
  success: boolean;
  data?: LoginResponseData;
  error?: string;
  message?: string;
  paymentRequired?: boolean;
}

// New interface for alert information
export interface AlertInfo {
  type: 'error' | 'info' | 'success' | 'warning';
  message: string;
}

// Auth Context Interfaces
export interface AuthContextType {
  token: string | null;
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  logout: () => void;
}

// Route Protection Interfaces
export interface PublicRouteProps {
  children: React.ReactNode;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

// Table and Filter Interfaces
export interface TableFilters {
  search: string;
  status: 'all' | 'active' | 'inactive';
  sortBy: string;
}

// API Related Interfaces
export interface APIErrorResponse {
  detail: string;
}

// Remorqueur Management Interfaces
export interface Remorqueur {
  id: number;
  name: string;
  tel: string;
  username: string;
  role: Role;
  garage_name: string;
  is_active: boolean;
}

export interface UpdateRemorqueurRequest {
  name?: string;
  tel?: string;
  username?: string;
  password?: string;
  is_active?: boolean;
}

export interface CreateRemorqueurRequest {
  name: string;
  tel: string;
  username: string;
  password: string;
  garage_name: string;
  role_name: 'remorqueur';
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
  message: string;
}

export interface ApiError {
  status: number;
  message: string;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error: ApiError;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export interface EditModalProps {
  open: boolean;
  onClose: () => void;
  onUpdate: () => Promise<void>;
  editingRemorqueur: UpdateRemorqueurRequest;
  setEditingRemorqueur: React.Dispatch<
    React.SetStateAction<UpdateRemorqueurRequest>
  >;
  updateSuccess: boolean;
  updateError: string | null;
}

export interface DeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  remorqueurName: string;
  deleteError: string | null;
}

export interface CreateModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (createData: CreateRemorqueurRequest) => Promise<void>;
  createError: string | null;
  createSuccess: boolean;
  setCreateError: (error: string | null) => void;
}

export interface EnhancedAuthContextType extends AuthContextType {
  hasPermission: (permissionName: string) => boolean;
  hasAnyPermission: (permissionNames: string[]) => boolean;
  hasAllPermissions: (permissionNames: string[]) => boolean;
  getPermissions: () => Permission[];
}

export interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path?: string;
  component?: string;
  roles?: string[];
}

export interface GarageWithRemorqueurs {
  id: number;
  name: string;
  username: string;
  role_id: number;
  created_by_id: number;
  is_active: boolean;
  remorqueurs: Remorqueur[];
  role?: {
    id: number;
    name: string;
    permissions: Array<{ id: number; name: string }>;
  };
}

export interface CreateGarageRequest {
  name: string;
  username: string;
  password: string;
  email: string;
  role_name: string;
}

export interface GarageResponse {
  id: number;
  name: string;
  username: string;
  role: {
    id: number;
    name: string;
    permissions: Array<{ id: number; name: string }>;
  };
  is_active: boolean;
}

export enum DashboardView {
  USERS = 'users',
  SETTINGS = 'settings',
  FAQADMIN = 'faqadmin',
  MESSAGEADMIN = 'messageadmin',
  MESSAGEGARAGE = 'messagegarage',
  DATA = 'data',
  SUPPORT = 'support',
}

export interface SidebarProps {
  onViewChange: (view: DashboardView) => void;
  currentView: DashboardView;
}

export interface GarageUpdateForm {
  newPassword: string;
  confirmPassword: string;
}

export interface AdminUpdateForm {
  username: string;
  new_username: string;
  newPassword: string;
  confirmPassword: string;
}

export interface VehicleCreate {
  brand: string;
  model: string;
  year_from: number;
  year_to?: number;
  neutral_proc?: string;
  deactivation_proc?: string;
  delay_time_neutral?: number;
  delay_time_deactivation?: number;
}

// Types for file upload responses
export interface FileUploadResponse {
  message: string;
  file_path: string;
}

// Types for delete responses
export interface DeleteResponse {
  message: string;
}

export interface ErrorDataResponse {
  detail?: string;
}

export interface DataProps {
  vehicleId?: number;
}

export interface FileBase {
  id: number;
  vehicle_id: number;
  file_name: string;
  file_path: string;
  file_size: number;
  upload_date: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NeutralPDF extends FileBase {
  // Inherits all FileBase properties
  // We can add specific properties for neutral PDFs if needed
}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DeactivationPDF extends FileBase {
  // Inherits all FileBase properties
  // We can add specific properties for deactivation PDFs if needed
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface VehicleImage extends FileBase {
  // Inherits all FileBase properties
  // We can add specific properties for images if needed
}

// Vehicle related interfaces
export interface VehicleCreate {
  brand: string;
  model: string;
  year_from: number;
  year_to?: number;
  neutral_proc?: string;
  deactivation_proc?: string;
  delay_time_neutral?: number;
  delay_time_deactivation?: number;
}

export interface VehicleResponse extends VehicleCreate {
  id: number;
  created_at: string;
  updated_at: string;
  neutral_pdfs: NeutralPDF[]; // Changed from pdfs to separate types
  deactivation_pdfs: DeactivationPDF[];
  images: VehicleImage[];
}

// Response interfaces for API operations
export interface FileUploadResponse {
  message: string;
  file_path: string;
}

export interface DeleteResponse {
  message: string;
}

export interface ErrorDataResponse {
  detail?: string;
}

export interface DataProps {
  vehicleId?: number;
}

// Adding some additional utility types that might be useful
export type FileType = 'neutralPdf' | 'deactivationPdf' | 'image';

export interface FileUploadState {
  neutralPdf?: File;
  deactivationPdf?: File;
  image?: File;
}

export interface CreateGarageFormData {
  name: string;
  email: string;
  username: string;
  password: string;
}

export interface CreateGarageModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: CreateGarageFormData) => Promise<void>;
  createError: string | null;
  createSuccess: boolean;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  language: string;
}

export interface FAQCreate {
  question: string;
  answer: string;
  language: string;
}

export interface FAQResponse extends FAQ {
  id: number;
  question: string;
  answer: string;
  language: string;
}

export interface FAQDeleteResponse {
  message: string;
  faq_id: number;
}

export interface FaqModalProps {
  open: boolean;
  onClose: () => void;
}

export interface StripePortalResponse {
  url: string;
}
