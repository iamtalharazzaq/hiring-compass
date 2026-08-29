export type User = { id: string; email: string; display_name: string; is_active: boolean; created_at: string };
export type AuthPayload = { user: User; access_token: string; token_type: string; expires_in: number };
