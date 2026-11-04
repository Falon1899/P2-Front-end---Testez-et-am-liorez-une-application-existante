import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  // Récupère le JWT enregistré lors de la connexion
  const token = sessionStorage.getItem('token');

  // Vérifie que la requête concerne une API interne protégée
  const isProtectedApi =
    req.url.startsWith('/api/') &&
    req.url !== '/api/login' &&
    req.url !== '/api/register';

  // Ajoute le JWT uniquement s'il existe et si l'API est protégée
  if (token && isProtectedApi) {
    const authenticatedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(authenticatedRequest);
  }

  // Transmet la requête sans modification dans les autres cas
  return next(req);
};