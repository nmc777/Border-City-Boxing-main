import { useQueryClient } from "@tanstack/react-query";
import {
  useListClasses,
  useGetCoachStatus,
  useRegisterAsCoach,
  useCoachSignInToClass,
  useCoachSignOutFromClass,
  useGetClassRoster,
  useGetAdminStatus,
  useRegisterAsAdmin,
  useAdminListUsers,
  useAdminListClasses,
  useAdminToggleMembership,
  useAdminToggleCoach,
  useAdminDeleteClass,
  useAdminCreateClass,
  useAdminGetOverview,
  useGetMemberStatus,
  useCheckInToClass,
  useGetMyCheckIns,
  getListClassesQueryKey,
  getGetCoachStatusQueryKey,
  getGetClassRosterQueryKey,
  getGetAdminStatusQueryKey,
  getAdminListUsersQueryKey,
  getAdminListClassesQueryKey,
  getAdminGetOverviewQueryKey,
  getGetMemberStatusQueryKey,
  getGetMyCheckInsQueryKey,
} from "@workspace/api-client-react";

export function useClasses() {
  return useListClasses();
}

export function useCoachStatus() {
  return useGetCoachStatus({
    // @ts-expect-error - queryKey is provided automatically by the hook
    query: {
      retry: false,
    }
  });
}

export function useCoachRegister() {
  const queryClient = useQueryClient();

  return useRegisterAsCoach({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCoachStatusQueryKey() });
      }
    }
  });
}

export function useCoachSignIn(classId: number) {
  const queryClient = useQueryClient();

  return useCoachSignInToClass({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetClassRosterQueryKey(classId) });
      }
    }
  });
}

export function useCoachSignOut(classId: number) {
  const queryClient = useQueryClient();

  return useCoachSignOutFromClass({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetClassRosterQueryKey(classId) });
      }
    }
  });
}

export function useClassRoster(classId: number, enabled: boolean) {
  return useGetClassRoster(classId, {
    // @ts-expect-error - queryKey is provided automatically by the hook
    query: {
      enabled,
      retry: false,
    }
  });
}

// Admin hooks
export function useAdminStatus() {
  return useGetAdminStatus({
    // @ts-expect-error - queryKey is provided automatically by the hook
    query: { retry: false }
  });
}

export function useAdminRegister() {
  const queryClient = useQueryClient();
  return useRegisterAsAdmin({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAdminStatusQueryKey() });
      }
    }
  });
}

export function useAdminUsers() {
  return useAdminListUsers({
    // @ts-expect-error - queryKey is provided automatically by the hook
    query: { retry: false }
  });
}

export function useAdminClasses() {
  return useAdminListClasses({
    // @ts-expect-error - queryKey is provided automatically by the hook
    query: { retry: false }
  });
}

export function useAdminOverview() {
  return useAdminGetOverview({
    // @ts-expect-error - queryKey is provided automatically by the hook
    query: { retry: false }
  });
}

export function useToggleMembership() {
  const queryClient = useQueryClient();
  return useAdminToggleMembership({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });
        queryClient.invalidateQueries({ queryKey: getAdminGetOverviewQueryKey() });
      }
    }
  });
}

export function useToggleCoach() {
  const queryClient = useQueryClient();
  return useAdminToggleCoach({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });
        queryClient.invalidateQueries({ queryKey: getAdminGetOverviewQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetCoachStatusQueryKey() });
      }
    }
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();
  return useAdminDeleteClass({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListClassesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getAdminGetOverviewQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListClassesQueryKey() });
      }
    }
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();
  return useAdminCreateClass({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getAdminListClassesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getAdminGetOverviewQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListClassesQueryKey() });
      }
    }
  });
}

// Member hook
export function useMemberStatus() {
  return useGetMemberStatus({
    // @ts-expect-error - queryKey is provided automatically by the hook
    query: { retry: false }
  });
}

// Attendance hooks
export function useMyCheckIns() {
  return useGetMyCheckIns({
    // @ts-expect-error - queryKey is provided automatically by the hook
    query: { retry: false }
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();
  return useCheckInToClass({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMyCheckInsQueryKey() });
      }
    }
  });
}
