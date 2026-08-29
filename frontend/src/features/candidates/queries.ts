import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCandidate, getCandidate, listCandidates, updateCandidate } from "./api";
import type { CandidateInput } from "./types";
export const candidateKeys = { list: (org: string, page: number, search?: string) => ["candidates", org, page, search] as const, detail: (org: string, id: string) => ["candidates", org, id] as const };
export const useCandidates = (org: string, page: number, search?: string) => useQuery({ queryKey: candidateKeys.list(org, page, search), queryFn: () => listCandidates(org, page, search), enabled: Boolean(org) });
export const useCandidate = (org: string, id: string) => useQuery({ queryKey: candidateKeys.detail(org, id), queryFn: () => getCandidate(org, id), enabled: Boolean(org && id) });
export function useCandidateMutation(org: string) { const client = useQueryClient(); const refresh = () => client.invalidateQueries({ queryKey: ["candidates", org] }); return { create: useMutation({ mutationFn: (input: CandidateInput) => createCandidate(org, input), onSuccess: refresh }), update: useMutation({ mutationFn: ({ id, input }: { id: string; input: Partial<CandidateInput> }) => updateCandidate(org, id, input), onSuccess: refresh }) }; }
