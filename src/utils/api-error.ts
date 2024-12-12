export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleAPIError(error: any) {
  console.error('API Error:', error);
  
  if (error.response?.status === 401) {
    return new APIError(
      'Invalid API key. Please check your environment variables.',
      401,
      'invalid_api_key'
    );
  }

  return new APIError(
    error.message || 'An unexpected error occurred',
    error.response?.status || 500
  );
} 