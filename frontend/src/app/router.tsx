import { createBrowserRouter, Navigate } from "react-router-dom";

import { WorkspacePreviewPage } from "../pages/WorkspacePreviewPage";

export const router = createBrowserRouter([
  { path: "/", element: <WorkspacePreviewPage /> },
  { path: "*", element: <Navigate replace to="/" /> },
]);
