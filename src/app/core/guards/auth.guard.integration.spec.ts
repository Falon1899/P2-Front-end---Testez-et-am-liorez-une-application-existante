import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';

import { routes } from '../../app.routes';
import { LoginComponent } from '../../pages/login/login.component';
import { StudentsComponent } from '../../pages/students/students.component';

describe('AuthGuard - Integration', () => {

  let router: Router;
  let httpTestingController: HttpTestingController;

  beforeEach(async () => {

    // Garantit l'absence de session avant chaque test.
    sessionStorage.removeItem('token');

    // Masque les logs pendant le test.
    jest.spyOn(console, 'log').mockImplementation(() => {});

    await TestBed.configureTestingModule({

      providers: [

        // Utilise les véritables routes de l'application.
        provideRouter(routes),

        // Configure le véritable client HTTP Angular.
        provideHttpClient(),

        // Remplace le backend HTTP par un backend de test.
        provideHttpClientTesting()
      ]
    }).compileComponents();

    // Récupère le véritable routeur Angular.
    router = TestBed.inject(Router);

    // Récupère le contrôleur HTTP de test.
    httpTestingController = TestBed.inject(
      HttpTestingController
    );
  });

  afterEach(() => {

    // Nettoie le stockage de session.
    sessionStorage.removeItem('token');

    // Restaure les méthodes originales espionnées.
    jest.restoreAllMocks();

    // Vérifie l'absence de requêtes HTTP inattendues.
    httpTestingController.verify();
  });

  // FI-06 : vérifie l'intégration du routeur Angular
  // avec le véritable guard d'authentification.
  it('should protect student routes according to authentication state', async () => {

    // ARRANGE

    // Crée un environnement permettant de tester
    // la navigation réelle entre les composants.
    const harness = await RouterTestingHarness.create();

    // Vérifie l'absence de token.
    expect(sessionStorage.getItem('token')).toBeNull();

    // ACT : tentative d'accès sans authentification.

    const loginComponent = await harness.navigateByUrl(
      '/students',
      LoginComponent
    );

    // ASSERT

    // Vérifie la redirection effective vers la connexion.
    expect(router.url).toBe('/login');

    // Vérifie que le véritable composant de connexion
    // a été chargé par le routeur.
    expect(loginComponent).toBeInstanceOf(LoginComponent);

    // Vérifie que la liste protégée n'a pas été demandée.
    httpTestingController.expectNone('/api/users');

    // ARRANGE : simulation d'une session authentifiée.

    sessionStorage.setItem('token', 'fake-jwt-token');

    // ACT : nouvelle tentative d'accès.

    const studentsComponent = await harness.navigateByUrl(
      '/students',
      StudentsComponent
    );

    // ASSERT

    // Vérifie que le routeur a autorisé la navigation.
    expect(router.url).toBe('/students');

    // Vérifie que le véritable composant des étudiants
    // a été chargé.
    expect(studentsComponent).toBeInstanceOf(
      StudentsComponent
    );

    // Intercepte la requête déclenchée par ngOnInit().
    const request = httpTestingController.expectOne(
      '/api/users'
    );

    // Vérifie la méthode HTTP utilisée.
    expect(request.request.method).toBe('GET');

    // Simule une liste vide renvoyée par le backend.
    request.flush([]);

    // Actualise le template du composant.
    harness.detectChanges();

    // Vérifie que la réponse HTTP a été traitée.
    expect(studentsComponent.students).toEqual([]);
  });
});