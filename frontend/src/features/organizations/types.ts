export type Organization = { id: string; name: string; slug: string };
export type OrganizationSummary = { organization: Organization; role: string };
export type Member = { user: { id: string; email: string; display_name: string; is_active: boolean }; membership: { id: string; role: string; is_active: boolean } };
