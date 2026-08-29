import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOrganization } from "../../features/organizations/OrganizationProvider";
export function CreateOrganizationForm() {
  const [name,setName]=useState(""); const [error,setError]=useState(""); const [saving,setSaving]=useState(false); const { create }=useOrganization(); const navigate=useNavigate();
  const submit=async (event: React.FormEvent) => { event.preventDefault(); setError(""); setSaving(true); try { await create(name); navigate("/"); } catch (e) { setError(e instanceof Error ? e.message : "Could not create workspace."); } finally { setSaving(false); } };
  return <form onSubmit={submit} className="mt-8 space-y-4"><label className="block text-sm font-medium">Organization name<input required maxLength={120} value={name} onChange={(e)=>setName(e.target.value)} className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3" placeholder="Northstar Labs" /></label>{error && <p className="text-sm text-red-700">{error}</p>}<button disabled={saving} className="rounded-xl bg-[var(--color-navy)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Creating…" : "Create workspace"}</button></form>;
}
