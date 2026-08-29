# API reference

FastAPI provides interactive OpenAPI documentation at `/docs` and the schema at `/openapi.json` when the API is running.

All API responses use this envelope:

```json
{
  "data": {},
  "request_id": "uuid"
}
```

Errors use `error.code`, `error.message`, and `request_id`. Send a bearer token in the `Authorization` header for authenticated endpoints. Every response includes `X-Request-ID`.

## Implemented endpoints

| Area | Method | Path | Purpose |
| --- | --- | --- | --- |
| Health | `GET` | `/health` | API status |
| Health | `GET` | `/health/ready` | Database readiness |
| Authentication | `POST` | `/api/v1/auth/signup` | Create an account |
| Authentication | `POST` | `/api/v1/auth/login` | Start an authenticated session |
| Authentication | `POST` | `/api/v1/auth/refresh` | Rotate the refresh session and access token |
| Authentication | `POST` | `/api/v1/auth/logout` | End the current refresh session |
| Authentication | `GET` | `/api/v1/auth/me` | Read the authenticated user |
| Organizations | `POST` | `/api/v1/organizations` | Create an organization; creator becomes admin |
| Organizations | `GET` | `/api/v1/organizations` | List organizations for the authenticated user |
| Organizations | `GET` | `/api/v1/organizations/{organization_id}` | Read an organization as an active member |
| Organizations | `PATCH` | `/api/v1/organizations/{organization_id}` | Rename an organization as an admin |
| Members | `GET` | `/api/v1/organizations/{organization_id}/members` | List members as an admin |
| Members | `POST` | `/api/v1/organizations/{organization_id}/members` | Add an existing active user as an admin |
| Members | `PATCH` | `/api/v1/organizations/{organization_id}/members/{member_id}` | Change another member's role or active status as an admin |

## Authorization

Roles are `admin`, `recruiter`, `hiring_manager`, and `interviewer`.

- Active members can view their organization.
- Admins manage organization details and members.
- An organization must retain at least one active admin.
- Admins cannot change their own role or active status.
- Adding a member requires an existing active account.

## Current product boundary

The application currently provides identity, organization membership, role-based access control, settings, and an organization-aware empty dashboard. Jobs, candidates, interviews, approvals, activity, notifications, and AI workflows are not implemented yet.
