import { useQueryClient } from "@tanstack/react-query";
import { 
  useListClasses, 
  useListMyBookings, 
  useCreateBooking, 
  useCancelBooking,
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
  getListMyBookingsQueryKey,
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

export function useMyBookings() {
  return useListMyBookings({
    query: {
      retry: false,
    }
  });
}

export function useBookClass() {
  const queryClient = useQueryClient();
  
  return useCreateBooking({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMyBookingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListClassesQueryKey() });
      }
    }
  });
}

export function useCancelClassBooking() {
  const queryClient = useQueryClient();
  
  return useCancelBooking({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListMyBookingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListClassesQueryKey() });
      }
    }
  });
}

export function useCoachStatus() {
  return useGetCoachStatus({
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
    query: {
      enabled,
      retry: false,
    }
  });
}

// Admin hooks
export function useAdminStatus() {
  return useGetAdminStatus({
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
    query: { retry: false }
  });
}

export function useAdminClasses() {
  return useAdminListClasses({
    query: { retry: false }
  });
}

export function useAdminOverview() {
  return useAdminGetOverview({
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
    query: { retry: false }
  });
}

// Attendance hooks
export function useMyCheckIns() {
  return useGetMyCheckIns({
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
