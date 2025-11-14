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
    console.log('[Auth] Starting logout...');

    try {
      // Try to call logout endpoint with a timeout
      // Don't wait more than 5 seconds for the server
      console.log('[Auth] Calling logout mutation...');
      await Promise.race([
        logoutMutation.mutateAsync(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Logout timeout')), 5000)
        ),
      ]);
      console.log('[Auth] Logout mutation completed successfully');
    } catch (error: unknown) {
      // Log the error but continue anyway - we'll clear session locally
      console.warn('[Auth] Logout mutation failed (continuing anyway):', error instanceof Error ? error.message : error);
    }

    // Always clear local auth state regardless of mutation result
    console.log('[Auth] Clearing local auth state...');
    utils.auth.me.setData(undefined, null);
    await utils.auth.me.invalidate();

    // Clear tokens from storage
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
    localStorage.removeItem('manus-runtime-user-info');

    console.log('[Auth] Logout complete, redirecting to login...');
    // Redirect to login page
    window.location.href = '/login';
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
