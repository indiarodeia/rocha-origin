export const auth0Config = {
  domain: '',
  clientId: '',
  authorizationParams: {
    redirect_uri:
      typeof window !== 'undefined'
        ? `${window.location.origin}/dashboard`
        : 'http://localhost:4200/dashboard',
  },
};

export function isAuth0Configured(): boolean {
  return Boolean(auth0Config.domain.trim() && auth0Config.clientId.trim());
}
