import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addStage,
  allInterviews,
  applicationInterviews,
  deactivateStage,
  reorderStages,
  scheduleInterview,
  stages,
} from "./api";
import { assignments, feedback, myFeedback, scorecard } from "./api";
export const useStages = (org: string, job: string) =>
  useQuery({
    queryKey: ["stages", org, job],
    queryFn: () => stages(org, job),
    enabled: !!org && !!job,
  });
export const useApplicationInterviews = (org: string, app: string) =>
  useQuery({
    queryKey: ["interviews", org, app],
    queryFn: () => applicationInterviews(org, app),
    enabled: !!org && !!app,
  });
export const useUpcomingInterviews = (org: string) =>
  useQuery({
    queryKey: ["interviews", org, "upcoming"],
    queryFn: () => allInterviews(org),
    enabled: !!org,
  });
export const useAssignments = (org: string, interview: string) => useQuery({ queryKey: ["assignments", org, interview], queryFn: () => assignments(org, interview), enabled: !!org && !!interview });
export const useFeedback = (org: string, interview: string) => useQuery({ queryKey: ["feedback", org, interview], queryFn: () => feedback(org, interview), enabled: !!org && !!interview });
export const useMyFeedback = (org: string, interview: string) => useQuery({ queryKey: ["my-feedback", org, interview], queryFn: () => myFeedback(org, interview), enabled: !!org && !!interview });
export const useScorecard = (org: string, stage: string, interview?: string) => useQuery({ queryKey: ["scorecard", org, stage, interview], queryFn: () => scorecard(org, stage, interview), enabled: !!org && !!stage });
export function useInterviewActions(org: string, job: string) {
  const client = useQueryClient();
  const refresh = () => {
    client.invalidateQueries({ queryKey: ["stages", org, job] });
    client.invalidateQueries({ queryKey: ["interviews", org] });
    client.invalidateQueries({ queryKey: ["applications", org] });
  };
  return {
    addStage: useMutation({
      mutationFn: (body: Parameters<typeof addStage>[2]) =>
        addStage(org, job, body),
      onSuccess: refresh,
    }),
    reorder: useMutation({
      mutationFn: (ids: string[]) => reorderStages(org, job, ids),
      onSuccess: refresh,
    }),
    deactivate: useMutation({
      mutationFn: (id: string) => deactivateStage(org, id),
      onSuccess: refresh,
    }),
    schedule: useMutation({
      mutationFn: ({
        app,
        ...body
      }: {
        app: string;
        interview_stage_id: string;
        scheduled_at: string;
        duration_minutes?: number;
        location_or_meeting_details?: string;
      }) => scheduleInterview(org, app, body),
      onSuccess: refresh,
    }),
  };
}
