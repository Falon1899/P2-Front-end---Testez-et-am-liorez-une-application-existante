
import {
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';

import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const router = inject(Router);

  // Récupère le JWT enregistré lors de la connexion
  const token = sessionStorage.getItem('token');

  // Vérifie que la requête concerne une API interne protégée
  const isProtectedApi =
    req.url.startsWith('/api/') &&
    req.url !== '/api/login' &&
    req.url !== '/api/register';

  // Ajoute le JWT uniquement pour les API protégées
  const request = token && isProtectedApi
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

  // Transmet la requête et surveille les erreurs HTTP
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {

      // Si le backend refuse l'authentification
      if (isProtectedApi && error.status === 401) {

        // Supprime le JWT invalide ou expiré
        sessionStorage.removeItem('token');

        // Redirige vers la page de connexion
        router.navigate(['/login']);
      }

      // Transmet l'erreur au composant appelant
      return throwError(() => error);
    })
  );
};
