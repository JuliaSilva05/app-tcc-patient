import { createContext, PropsWithChildren, use, useState } from "react";
import { useStorageState } from "./useStorageState";

interface userContext {
  _id: string,
  name: string,
  email: string,
}

const AuthContext = createContext<{
  signIn: (data: any) => void;
  signOut: () => void;
  session?: string | null;
  user?: userContext | null;
  isLoading: boolean;
  isLoadingUser: boolean;
} | null>(null);

export function useSession() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error('useSession must be wrapped in a <SessionProvider />');
  };

  return value;
};

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState('session');
  const [[isLoadingUser, user], setUser] = useStorageState('user');

  return (
    <AuthContext.Provider
      value={{
        signIn: (data) => {
          // Perform sign-in logic here
          // const parsedData = JSON.parse(data);
          if (data.user && data.token) {
            setSession(data.token);
            setUser(data.user);
          }
        },
        signOut: () => {
          setSession(null);
          setUser(null);
        },
        user,
        session,
        isLoading,
        isLoadingUser,
      }}>
      {children}
    </AuthContext.Provider>
  );
}