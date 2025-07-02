// Shared interfaces for our monorepo

export interface UserData {
  id?: string;
  name: string;
  email: string;
  age: number;
  timestamp?: string;
}

export interface ProcessedData {
  id: string;
  name: string;
  email: string;
  age: number;
  processedBy: string;
  enrichedInfo: string;
  timestamp: string;
  processingTimestamp: string;
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
