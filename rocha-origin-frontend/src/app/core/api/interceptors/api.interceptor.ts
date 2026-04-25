import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const apiInterceptor: HttpInterceptorFn = (request, next) => {
  const requestWithDefaults = request.clone({
    setHeaders: {
      Accept: 'application/json',
    },
  });

  // Keep the interceptor in place for future auth token injection.
  return next(requestWithDefaults).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error(`[API] ${request.method} ${request.urlWithParams}`, error);
      return throwError(() => error);
    }),
  );
};
