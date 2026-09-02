// Production mapping: hiringcompass.com -> public pages,
// app.hiringcompass.com -> recruiter portal, api.hiringcompass.com -> backend API.
const isProduction = window.location.hostname.endsWith(".hiringcompass.com") || window.location.hostname === "hiringcompass.com";
const publicHost = isProduction ? "hiringcompass.com" : "hiringcompass.localhost";
const portalHost = isProduction ? "app.hiringcompass.com" : "app.hiringcompass.localhost";

const urlFor = (host: string, path: string) => `${window.location.protocol}//${host}${window.location.port ? `:${window.location.port}` : ""}${path}`;

export const isPortalHost = () => window.location.hostname === portalHost;
export const publicUrl = (path = "/") => urlFor(publicHost, path);
export const portalUrl = (path = "/app") => urlFor(portalHost, path);
