export type Education = { degree: string; institution: string; field_of_study?: string; start_year?: number; end_year?: number; currently_studying?: boolean };
export type Candidate = { id: string; organization_id: string; created_by_user_id: string; full_name: string; email: string | null; phone: string | null; location: string | null; current_title: string | null; years_of_experience: number | null; summary: string | null; education: Education[]; created_at: string; updated_at: string };
export type CandidateInput = Omit<Candidate, "id" | "organization_id" | "created_by_user_id" | "created_at" | "updated_at">;
export type CandidatesResult = { items: Candidate[]; pagination: { page: number; page_size: number; total: number; total_pages: number } };
