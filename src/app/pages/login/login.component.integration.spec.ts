import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { LoginComponent } from './login.component';

describe('LoginComponent - Integration', () => {

  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let httpTestingController: HttpTestingController;

  // Seul le comportement du routeur est simulé.
  const routerMock = {
    navigate: jest.fn()
  };

  // Identifiants fictifs utilisés pour le test.
  const credentials = {
    login: 'testUser',
    password: 'Password123!'
  };

  beforeEach(async () => {

    // Garantit l'indépendance des tests.
    jest.resetAllMocks();
    sessionStorage.removeItem('token');

    routerMock.navigate.mockResolvedValue(true);

    await TestBed.configureTestingModule({

      imports: [LoginComponent],

      providers: [

        // Configure le véritable client HTTP Angular.
        provideHttpClient(),

        // Remplace le backend HTTP par un backend de test.
        provideHttpClientTesting(),

        // Simule la navigation.
        {
          provide: Router,
          useValue: routerMock
        }
      ]
    }).compileComponents();

    // Récupère le contrôleur des requêtes HTTP de test.
    httpTestingController = TestBed.inject(
      HttpTestingController
    );

    // Crée le véritable composant Angular.
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    // Initialise le composant et son template HTML.
    fixture.detectChanges();
  });

  afterEach(() => {

    // Vérifie qu'aucune requête HTTP inattendue
    // ou non traitée ne subsiste.
    httpTestingController.verify();

    // Nettoie le stockage de session.
    sessionStorage.removeItem('token');
  });

  // FI-01 : vérifie l'intégration du formulaire HTML,
  // du composant, du service et du client HTTP.
  it('should authenticate through the real UserService', () => {

    // ARRANGE

    // Récupère le véritable template HTML.
    const element: HTMLElement = fixture.nativeElement;

    // Récupère les champs du formulaire.
    const loginInput = element.querySelector(
      '#login'
    ) as HTMLInputElement;

    const passwordInput = element.querySelector(
      '#password'
    ) as HTMLInputElement;

    const submitButton = element.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;

    // Simule la saisie de l'identifiant.
    loginInput.value = credentials.login;
    loginInput.dispatchEvent(new Event('input'));

    // Simule la saisie du mot de passe.
    passwordInput.value = credentials.password;
    passwordInput.dispatchEvent(new Event('input'));

    // Actualise le template après la saisie.
    fixture.detectChanges();

    // Vérifie la communication entre le HTML
    // et le formulaire réactif Angular.
    expect(component.loginForm.getRawValue())
      .toEqual(credentials);

    expect(submitButton.disabled).toBe(false);

    // ACT

    // Simule un clic sur le bouton de connexion.
    submitButton.click();

    // ASSERT

    // Intercepte la requête produite par
    // le véritable UserService.
    const request = httpTestingController.expectOne(
      '/api/login'
    );

    // Vérifie la méthode HTTP.
    expect(request.request.method).toBe('POST');

    // Vérifie les identifiants transmis au backend.
    expect(request.request.body).toEqual(credentials);

    // Vérifie que le service attend une réponse texte.
    expect(request.request.responseType).toBe('text');

    // Vérifie l'état avant la réponse du backend.
    expect(component.isLoading).toBe(true);
    expect(sessionStorage.getItem('token')).toBeNull();
    expect(routerMock.navigate).not.toHaveBeenCalled();

    // Simule la réponse HTTP du backend.
    request.flush('fake-jwt-token');

    // Vérifie que le composant a correctement
    // traité la réponse du véritable service.
    expect(sessionStorage.getItem('token'))
      .toBe('fake-jwt-token');

    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toBe('');

    // Vérifie la demande de navigation.
    expect(routerMock.navigate)
      .toHaveBeenCalledTimes(1);

    expect(routerMock.navigate)
      .toHaveBeenCalledWith(['/students']);
  });
});