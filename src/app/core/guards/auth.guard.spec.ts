import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivateFn,
  Router,
  provideRouter
} from '@angular/router';

import { authGuard } from './auth.guard';

describe('authGuard', () => {

  let router: Router;

  // Création des paramètres nécessaires à l'appel du guard.
  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;

  // Exécute le guard dans un contexte d'injection Angular.
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() =>
      authGuard(...guardParameters)
    );

  beforeEach(() => {

    // Supprime le token avant chaque test
    // afin de garantir leur indépendance.
    sessionStorage.removeItem('token');

    // Configuration de l'environnement de test.
    TestBed.configureTestingModule({
      providers: [
        provideRouter([])
      ]
    });

    // Récupération du routeur Angular.
    router = TestBed.inject(Router);
  });

  afterEach(() => {

    // Nettoyage du token après chaque test.
    sessionStorage.removeItem('token');
  });

  // AG-01 : vérifie que le guard existe.
  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  // AG-02 : autorise l'accès si un token est présent.
  it('should allow access when a token exists', () => {

    // Arrange : simulation d'un utilisateur connecté.
    sessionStorage.setItem('token', 'fake-jwt-token');

    // Act : exécution du véritable guard.
    const result = executeGuard(route, state);

    // Assert : vérification de l'autorisation.
    expect(result).toBe(true);
  });

  // AG-03 : redirige vers login si aucun token n'existe.
  it('should redirect to login when no token exists', () => {

    // Arrange : aucun token dans le sessionStorage.
    sessionStorage.removeItem('token');

    // Act : exécution du véritable guard.
    const result = executeGuard(route, state);

    // Assert : vérification de la destination.
    expect(result).toEqual(
      router.createUrlTree(['/login'])
    );
  });

  // AG-04 : redirige vers login si le token est vide.
  it('should redirect to login when the token is empty', () => {

    // Arrange : stockage d'un token vide.
    sessionStorage.setItem('token', '');

    // Act : exécution du véritable guard.
    const result = executeGuard(route, state);

    // Assert : vérification de la destination.
    expect(result).toEqual(
      router.createUrlTree(['/login'])
    );
  });
});