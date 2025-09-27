/* eslint-disable react-refresh/only-export-components */
import axios from "axios";
import React, { createContext, useContext } from 'react'
import { useAsyncRetry, useAsyncFn } from 'react-use'
import { DimmerDimmable, Loader } from 'semantic-ui-react'
import { ApiResponse } from '../constants/types'
import { useSubscription } from '../hooks/use-subscription'
import { useProduce } from '../hooks/use-produce'
import { Error } from '../constants/types'
import { LoginPage } from '../pages/login-page'
import { UserDto } from '../constants/types'
import { StatusCodes } from '../constants/status-codes'
import { produceWithPatches } from "immer";
const currentUser = "currentUser";
const baseUrl = process.env.REACT_APP_API_BASE_URL;
const setUserItem = (user: UserDto) => {
  sessionStorage.setItem(currentUser, JSON.stringify(mapUser(user)));
};
const removeUserItem = () => {
  sessionStorage.removeItem(currentUser);
};
type AuthState = {
  user: UserDto | null;
  errors: Error[];
  redirectUrl?: string | null;
};
const INITIAL_STATE: AuthState = {
  user: null,
  errors: [],
  redirectUrl: null,
};
export const AuthContext = createContext<AuthState>(INITIAL_STATE);
export const AuthProvider = () => {
  const [state, setState] = useProduce<AuthState>(INITIAL_STATE);
  // for getting the user. called on every "notify("user-login") in order to fetch the user data."
  const fetchCurrentUser = useAsyncRetry(async () => {
    setState((draft) => {
      draft.errors = [];
    });
    const response = await axios.get<GetUserResponse>(
      `${baseUrl}/api/get-current-user`
    );
    if (response.data.hasErrors) {
      response.data.errors.forEach((err) => {
        console.error(err.message);
      });
      return response.data;
    }
    // user data as well as any errors.
    setState((draft) => {
      draft.user = response.data.data;
      draft.errors = response.data.errors;
    });
    setUserItem(response.data.data);
  }, [setState]);
  // logout endpoint
  const [, logoutUser] = useAsyncFn(async () => {
    setState((draft) => {
      draft.errors = [];
    });
    // axios call
    const response = await axios.post(`${baseUrl}/api/logout`);
    if (response.status !== StatusCodes.OK) {
      console.log(`Error on logout: ${response.statusText}`);
      return response;
    }
    console.log("Successfully Logged Out!");
    if (response.status === StatusCodes.OK) {
      removeUserItem();
      setState((draft) => {
        draft.user = null;
      });
    }
    return response;
  }, []);
  useSubscription("user-login", () => {
    fetchCurrentUser.retry();
  });
  useSubscription("user-logout", () => {
    logoutUser();
  });
  // Loading screen if the API call takes a long time to get user info
  if (fetchCurrentUser.loading) {
    return (
      <DimmerDimmable active inverted>
        <Loader indeterminate />
      </DimmerDimmable>
    );
  }
  // Brings unauthenticated users to the login page.
  if (!state.user && !fetchCurrentUser.loading) {
    return <LoginPage />;
  }
  // logged in
  return <AuthContext.Provider value={state} {...produceWithPatches} />;
};
type GetUserResponse = ApiResponse<UserDto>;
// anywhere wrapped inside of the <AuthProvider>
export function useUser(): UserDto {
  const { user } = useContext(AuthContext);
  if (!user) {
    throw new Error(`useUser must be used within an authenticated app`);
  }
  return user;
}
// map User entity.
export const mapUser = (user: UserDto): UserDto => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  userName: user.userName,
});
