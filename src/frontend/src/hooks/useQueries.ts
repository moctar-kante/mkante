import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Education,
  Experience,
  Language,
  OngoingProject,
  OngoingProjectInput,
  Profile,
  Publication,
  RelevantLink,
  RelevantLinkInput,
  SocialLink,
} from "../types";
import { useActor } from "./useActor";

export function useProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<Profile | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useExperiences() {
  const { actor, isFetching } = useActor();
  return useQuery<Experience[]>({
    queryKey: ["experiences"],
    queryFn: async () => {
      if (!actor) return [];
      const data = await actor.getAllExperiences();
      return [...data].sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
      );
    },
    enabled: !!actor && !isFetching,
  });
}

export function useEducation() {
  const { actor, isFetching } = useActor();
  return useQuery<Education[]>({
    queryKey: ["education"],
    queryFn: async () => {
      if (!actor) return [];
      const data = await actor.getAllEducation();
      return [...data].sort((a, b) => Number(b.endYear) - Number(a.endYear));
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePublications() {
  const { actor, isFetching } = useActor();
  return useQuery<Publication[]>({
    queryKey: ["publications"],
    queryFn: async () => {
      if (!actor) return [];
      const data = await actor.getAllPublications();
      return [...data].sort((a, b) => Number(b.year) - Number(a.year));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useLanguages() {
  const { actor, isFetching } = useActor();
  return useQuery<Language[]>({
    queryKey: ["languages"],
    queryFn: async () => {
      if (!actor) return [];
      const data = await actor.getAllLanguages();
      return [...data].sort(
        (a, b) => Number(a.displayOrder) - Number(b.displayOrder),
      );
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSocialLinks() {
  const { actor, isFetching } = useActor();
  return useQuery<SocialLink[]>({
    queryKey: ["socialLinks"],
    queryFn: async () => {
      if (!actor) return [];
      const data = await actor.getAllSocialLinks();
      return [...data].sort(
        (a, b) => Number(a.displayOrder) - Number(b.displayOrder),
      );
    },
    enabled: !!actor && !isFetching,
  });
}

export function useOngoingProjects() {
  const { actor, isFetching } = useActor();
  return useQuery<OngoingProject[]>({
    queryKey: ["ongoingProjects"],
    queryFn: async () => {
      if (!actor) return [];
      const data = await actor.getAllOngoingProjects();
      return [...data].sort(
        (a, b) => Number(a.displayOrder) - Number(b.displayOrder),
      );
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (profile: Profile) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateProfile(profile);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export function useCreateOngoingProject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: OngoingProjectInput) => {
      if (!actor) throw new Error("Not connected");
      return actor.createOngoingProject(input);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ongoingProjects"] }),
  });
}

export function useUpdateOngoingProject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: bigint; input: OngoingProjectInput }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateOngoingProject(id, input);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ongoingProjects"] }),
  });
}

export function useDeleteOngoingProject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteOngoingProject(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ongoingProjects"] }),
  });
}

export function useRelevantLinks() {
  const { actor, isFetching } = useActor();
  return useQuery<RelevantLink[]>({
    queryKey: ["relevantLinks"],
    queryFn: async () => {
      if (!actor) return [];
      const data = await actor.getAllRelevantLinks();
      return [...data].sort(
        (a, b) => Number(a.displayOrder) - Number(b.displayOrder),
      );
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateRelevantLink() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RelevantLinkInput) => {
      if (!actor) throw new Error("Not connected");
      return actor.createRelevantLink(input);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["relevantLinks"] }),
  });
}

export function useUpdateRelevantLink() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: bigint; input: RelevantLinkInput }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateRelevantLink(id, input);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["relevantLinks"] }),
  });
}

export function useDeleteRelevantLink() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteRelevantLink(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["relevantLinks"] }),
  });
}

export function useUpdateRelevantLinksOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: bigint[]) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateRelevantLinksOrder(ids);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["relevantLinks"] }),
  });
}
