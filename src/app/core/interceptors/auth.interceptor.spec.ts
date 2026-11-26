import { TestBed } from '@angular/core/testing';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {

  // Création du routeur simulé.
  const routerMock = {
    navigate: jest.fn()
  };

  // Simule le traitement de la requête HTTP suivante.
  const nextMock = jest.fn();

  // Exécute le véritable intercepteur dans
  // un contexte d'injection Angular.
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() =>
      authInterceptor(req, next)
    );

  beforeEach(() => {

    // Réinitialise les mocks avant chaque test.
    jest.resetAllMocks();

    // Nettoie le stockage de session.
    sessionStorage.removeItem('token');

    // Simule une navigation réussie.
    routerMock.navigate.mockResolvedValue(true);

    // Simule une réponse HTTP réussie par défaut.
    nextMock.mockReturnValue(
      of(new HttpResponse({ status: 200 }))
    );

    TestBed.configureTestingModule({
      providers: [
        {
          provide: Router,
          useValue: routerMock
        }
      ]
    });
  });

  afterEach(() => {
    sessionStorage.removeItem('token');
  });

  // AI-01 : vérifie que l'intercepteur existe.
  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  // AI-02 : ajoute le JWT aux API protégées.
  it('should add the authorization header to protected requests', () => {

    sessionStorage.setItem('token', 'fake-jwt-token');

    const request = new HttpRequest(
      'GET',
      '/api/users'
    );

    interceptor(request, nextMock).subscribe();

    // Récupère la requête transmise par l'intercepteur.
    const interceptedRequest = nextMock.mock.calls[0][0];

    expect(nextMock).toHaveBeenCalledTimes(1);

    expect(
      interceptedRequest.headers.get('Authorization')
    ).toBe('Bearer fake-jwt-token');
  });

  // AI-03 : conserve la requête si aucun JWT n'existe.
  it('should not add an authorization header without a token', () => {

    const request = new HttpRequest(
      'GET',
      '/api/users'
    );

    interceptor(request, nextMock).subscribe();

    expect(nextMock).toHaveBeenCalledWith(request);

    expect(
      nextMock.mock.calls[0][0].headers.has('Authorization')
    ).toBe(false);
  });

  // AI-04 : exclut les requêtes de connexion.
  it('should not add a token to login requests', () => {

    sessionStorage.setItem('token', 'fake-jwt-token');

    const request = new HttpRequest(
      'POST',
      '/api/login',
      {}
    );

    interceptor(request, nextMock).subscribe();

    expect(nextMock).toHaveBeenCalledWith(request);

    expect(
      nextMock.mock.calls[0][0].headers.has('Authorization')
    ).toBe(false);
  });

  // AI-05 : exclut les requêtes d'inscription.
  it('should not add a token to register requests', () => {

    sessionStorage.setItem('token', 'fake-jwt-token');

    const request = new HttpRequest(
      'POST',
      '/api/register',
      {}
    );

    interceptor(request, nextMock).subscribe();

    expect(nextMock).toHaveBeenCalledWith(request);

    expect(
      nextMock.mock.calls[0][0].headers.has('Authorization')
    ).toBe(false);
  });

  // AI-06 : exclut les requêtes hors API.
  it('should not add a token to non API requests', () => {

    sessionStorage.setItem('token', 'fake-jwt-token');

    const request = new HttpRequest(
      'GET',
      '/assets/config.json'
    );

    interceptor(request, nextMock).subscribe();

    expect(nextMock).toHaveBeenCalledWith(request);

    expect(
      nextMock.mock.calls[0][0].headers.has('Authorization')
    ).toBe(false);
  });

  // AI-07 : déconnecte l'utilisateur en cas
  // d'erreur 401 sur une API protégée.
  it('should remove the token and redirect on protected 401 errors', () => {

    sessionStorage.setItem('token', 'fake-jwt-token');

    const request = new HttpRequest(
      'GET',
      '/api/users'
    );

    const error = new HttpErrorResponse({
      status: 401,
      statusText: 'Unauthorized'
    });

    // Simule une erreur retournée par le backend.
    nextMock.mockReturnValue(
      throwError(() => error)
    );

    const errorCallback = jest.fn();

    interceptor(request, nextMock).subscribe({
      error: errorCallback
    });

    // Vérifie la suppression du JWT.
    expect(sessionStorage.getItem('token')).toBeNull();

    // Vérifie la redirection.
    expect(routerMock.navigate)
      .toHaveBeenCalledWith(['/login']);

    // Vérifie la transmission de l'erreur.
    expect(errorCallback).toHaveBeenCalledWith(error);
  });

  // AI-08 : ne déconnecte pas l'utilisateur
  // lors d'une erreur 401 sur la page de connexion.
  it('should not redirect on login 401 errors', () => {

    sessionStorage.setItem('token', 'fake-jwt-token');

    const request = new HttpRequest(
      'POST',
      '/api/login',
      {}
    );

    const error = new HttpErrorResponse({
      status: 401,
      statusText: 'Unauthorized'
    });

    nextMock.mockReturnValue(
      throwError(() => error)
    );

    const errorCallback = jest.fn();

    interceptor(request, nextMock).subscribe({
      error: errorCallback
    });

    expect(sessionStorage.getItem('token'))
      .toBe('fake-jwt-token');

    expect(routerMock.navigate)
      .not.toHaveBeenCalled();

    expect(errorCallback).toHaveBeenCalledWith(error);
  });

  // AI-09 : ne déconnecte pas l'utilisateur
  // lors d'une erreur interne du serveur.
  it('should not redirect on server errors', () => {

    sessionStorage.setItem('token', 'fake-jwt-token');

    const request = new HttpRequest(
      'GET',
      '/api/users'
    );

    const error = new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error'
    });

    nextMock.mockReturnValue(
      throwError(() => error)
    );

    const errorCallback = jest.fn();

    interceptor(request, nextMock).subscribe({
      error: errorCallback
    });

    expect(sessionStorage.getItem('token'))
      .toBe('fake-jwt-token');

    expect(routerMock.navigate)
      .not.toHaveBeenCalled();

    expect(errorCallback).toHaveBeenCalledWith(error);
  });
});