import { useApiMutation } from "@/hooks/use-api-mutation";
import { useApiQuery } from "@/hooks/use-api-query";
import { NeynarUser } from "@/lib/neynar";
import sdk from "@farcaster/miniapp-sdk";
import { QueryObserverResult } from "@tanstack/react-query";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useMiniApp } from "./miniapp-context";

const UserProviderContext = createContext<
  | {
      user: {
        data: NeynarUser | undefined;
        refetch: () => Promise<QueryObserverResult<NeynarUser>>;
        isLoading: boolean;
        error: Error | null;
      };
      signIn: () => Promise<void>;
      signOut: () => Promise<void>;
      isLoading: boolean;
      error: Error | null;
    }
  | undefined
>(undefined);

interface UserProviderProps {
  children: ReactNode;
  autoSignIn?: boolean;
}

export const useUser = () => {
  const context = useContext(UserProviderContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({
  children,
  autoSignIn = false,
}: UserProviderProps) => {
  const { context } = useMiniApp();
  const [error, setError] = useState<Error | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    data: user,
    refetch: refetchUser,
    isLoading: isFetchingUser,
    error: userError,
  } = useApiQuery<NeynarUser>({
    queryKey: ["user-query"],
    url: "/api/users/me",
    refetchOnWindowFocus: false,
    isProtected: true,
    retry: false,
    enabled: true,
    ...{
      onSuccess: (data: NeynarUser) => {
        console.log("✅ User data loaded successfully:", data);
        setIsSignedIn(true);
      },
      onError: (error: unknown) => {
        console.error("❌ Error loading user data:", error);
      },
    },
  });

  const { mutate: signIn } = useApiMutation<{
    user: NeynarUser;
  }>({
    url: "/api/auth/sign-in",
    method: "POST",
    body: (variables) => variables,
    onSuccess: (data) => {
      setIsSignedIn(true);
      setIsLoading(false);
      refetchUser();
    },
  });

  const handleSignIn = useCallback(async () => {
    try {
      console.log("handleSignIn");
      setIsLoading(true);
      setError(null);

      if (!context) {
        console.error("Not in mini app");
        throw new Error("Not in mini app");
      }

      const referrerFid =
        context.location?.type === "cast_embed"
          ? context.location.cast.author.fid
          : undefined;

      const result = await sdk.quickAuth.getToken();

      if (!result) {
        throw new Error("No token from SIWF Quick Auth");
      }

      await signIn({
        fid: context.user.fid,
        referrerFid,
        token: result.token,
      });
    } catch {
      setError(new Error("Failed to sign in"));
    } finally {
      setIsLoading(false);
    }
  }, [context, signIn]);

  const handleSignOut = useCallback(async () => {
    try {
      console.log("handleSignOut");
      setIsLoading(true);
      setError(null);

      // Clear the signed in state
      setIsSignedIn(false);
      
      // Clear any stored tokens or session data
      // This will force the user to re-authenticate
      localStorage.removeItem('farcaster-auth-token');
      sessionStorage.clear();
      
      // Reload the page to clear all state
      window.location.reload();
    } catch (error) {
      console.error("Error signing out:", error);
      setError(new Error("Failed to sign out"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (context && !isSignedIn && !isLoading && autoSignIn && userError) {
      handleSignIn();
    }
  }, [context, handleSignIn, isSignedIn, isLoading, autoSignIn, userError]);

  const value = useMemo(() => {
    return {
      user: {
        data: user,
        refetch: refetchUser,
        isLoading: isFetchingUser,
        error: userError,
      },
      signIn: handleSignIn,
      signOut: handleSignOut,
      isLoading,
      error,
    };
  }, [
    user,
    isFetchingUser,
    userError,
    handleSignIn,
    handleSignOut,
    isLoading,
    error,
    refetchUser,
  ]);

  return (
    <UserProviderContext.Provider value={value}>
      {children}
    </UserProviderContext.Provider>
  );
};