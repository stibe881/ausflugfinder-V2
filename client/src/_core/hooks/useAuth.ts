import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath } =
    options ?? {};
  const finalRedirectPath = redirectPath ?? (() => {
    try {
      return getLoginUrl();
    } catch (error) {
      console.error("Failed to get login URL:", error);
      return "/";
    }
  })();
  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  const logout = useCallback(async () => {
    try {
      console.log('[Auth] Starting logout...');
      const result = await Promise.race([
        logoutMutation.mutateAsync(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Logout timeout after 10s')), 10000)
        ),
      ]);
      console.log('[Auth] Logout completed:', result);
    } catch (error: unknown) {
      console.error('[Auth] Logout error:', error);
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        console.log('[Auth] Logout unauthorized error, continuing anyway');
        // Continue with logout even if unauthorized
      } else {
        console.error('[Auth] Logout failed:', error);
      }
    } finally {
      console.log('[Auth] Clearing auth state...');
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
      console.log('[Auth] Auth state cleared');
    }
  }, [logoutMutation, utils]);

  const state = useMemo(() => {
    localStorage.setItem(
      "manus-runtime-user-info",
      JSON.stringify(meQuery.data)
    );
    return {
      user: meQuery.data ?? null,
      loading: meQuery.isLoading || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(meQuery.data),
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading || logoutMutation.isPending) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === finalRedirectPath) return;

    window.location.href = finalRedirectPath
  }, [
    redirectOnUnauthenticated,
    finalRedirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    state.user,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
