export class ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };

  static success<T>(data: T): ApiResponse<T> {
    const response = new ApiResponse<T>();
    response.success = true;
    response.data = data;
    return response;
  }

  static error(code: string, message: string): ApiResponse<null> {
    const response = new ApiResponse<null>();
    response.success = false;
    response.error = { code, message };
    return response;
  }
}
