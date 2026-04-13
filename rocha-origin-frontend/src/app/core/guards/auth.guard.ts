import { CanActivateFn } from '@angular/router';

// Temporary preview guard while Auth0 is not connected.
export const appAuthGuard: CanActivateFn = () => true;
