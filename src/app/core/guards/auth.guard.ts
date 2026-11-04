import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  // Récupère le JWT enregistré lors de la connexion
  const token = sessionStorage.getItem('token');

  // Autorise l'accès si un token est présent
  if (token) {
    return true;
  }

  // Redirige vers la connexion si aucun token n'est présent
  const router = inject(Router);
  return router.createUrlTree(['/login']);
};