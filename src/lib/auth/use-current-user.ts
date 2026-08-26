import { useQuery } from "@tanstack/react-query";
import { authClient } from "./client";
import { authEnabled } from "./email-password";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
};

export type CurrentUserState = {
  user: CurrentUser | null;
  isPending: boolean;
};

const DEV_USER: CurrentUser = {
  id: "dev-user",
  email: "dev@example.com",
  name: "Dev User",
};

export function useCurrentUserState(): CurrentUserState {
  if (!authEnabled) return { user: DEV_USER, isPending: false };
  const { data, isPending } = authClient.useSession();
  const user = data?.user;
  return {
    user: user
      ? {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      : null,
    isPending,
  };
}
