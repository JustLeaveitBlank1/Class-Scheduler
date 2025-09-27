import { notify } from '../hooks/use-subscription'
// event for logout and login
export function logoutUser() {
  notify("user-logout", undefined);
}
export function loginUser() {
  notify("user-login", undefined);
}
