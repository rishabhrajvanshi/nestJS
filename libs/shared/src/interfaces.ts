// Shared interfaces for our monorepo

export interface UserData {
  id?: string;
  name: string;
  email: string;
  age: number;
  timestamp?: Date;
}

export interface ProcessedData extends UserData {
  processedBy: string;
  enrichedInfo: string;
  processingTimestamp: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  timestamp: Date;
}

// gRPC Service Interfaces
export interface DataProcessingRequest {
  userData: UserData;
  sourceApp: string;
  requestId: string;
}

export interface DataProcessingResponse {
  success: boolean;
  processedData?: ProcessedData;
  message?: string;
} 