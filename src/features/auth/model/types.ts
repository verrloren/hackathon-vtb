export type AuthResponse =
  | {
      success: boolean;
      response: string;
			message?: string;
    }
  | {
      error: string;
    };

