import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';

import { LoginComponent } from './login.component';
import { UserService } from '../../core/service/user.service';

describe('LoginComponent', () => {

  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  // Création du service utilisateur simulé.
  const userServiceMock = {
    login: jest.fn()
  };

  // Création du routeur simulé.
  const routerMock = {
    navigate: jest.fn()
  };

  // Identifiants fictifs réutilisables.
  const credentials = {
    login: 'testUser',
    password: 'Password123!'
  };

  beforeEach(async () => {

    // Réinitialise les mocks avant chaque test.
    jest.resetAllMocks();

    // Supprime le token pour garantir
    // l'indépendance des tests.
    sessionStorage.removeItem('token');

    // Simule une navigation réussie.
    routerMock.navigate.mockResolvedValue(true);

    // Simule une connexion réussie par défaut.
    userServiceMock.login.mockReturnValue(
      of('fake-jwt-token')
    );

    await TestBed.configureTestingModule({
      imports: [LoginComponent],

      providers: [
        {
          provide: UserService,
          useValue: userServiceMock
        },
        {
          provide: Router,
          useValue: routerMock
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  afterEach(() => {

    // Nettoie le stockage après chaque test.
    sessionStorage.removeItem('token');
  });

  // LC-01 : vérifie l'instanciation du composant.
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // LC-02 : vérifie qu'un formulaire vide est invalide.
  it('should have an invalid form when empty', () => {

    expect(component.loginForm.valid).toBe(false);
  });

  // LC-03 : vérifie que l'identifiant est obligatoire.
  it('should require a login', () => {

    component.loginForm.setValue({
      login: '',
      password: credentials.password
    });

    expect(component.loginForm.valid).toBe(false);

    expect(
      component.loginForm.controls.login.hasError('required')
    ).toBe(true);
  });

  // LC-04 : vérifie que le mot de passe est obligatoire.
  it('should require a password', () => {

    component.loginForm.setValue({
      login: credentials.login,
      password: ''
    });

    expect(component.loginForm.valid).toBe(false);

    expect(
      component.loginForm.controls.password.hasError('required')
    ).toBe(true);
  });

  // LC-05 : vérifie la validité du formulaire renseigné.
  it('should have a valid form with valid credentials', () => {

    component.loginForm.setValue(credentials);

    expect(component.loginForm.valid).toBe(true);
  });

  // LC-06 : interdit la soumission d'un formulaire invalide.
  it('should not submit an invalid form', () => {

    component.onSubmit();

    expect(userServiceMock.login)
      .not.toHaveBeenCalled();

    expect(component.isLoading).toBe(false);
  });

  // LC-07 : empêche les connexions simultanées.
  it('should not submit while already loading', () => {

    component.loginForm.setValue(credentials);

    component.isLoading = true;

    component.onSubmit();

    expect(userServiceMock.login)
      .not.toHaveBeenCalled();
  });

  // LC-08 : vérifie une connexion réussie.
  it('should store the token and navigate on successful login', () => {

    // Arrange : préparation du formulaire.
    component.loginForm.setValue(credentials);

    // Act : soumission du formulaire.
    component.onSubmit();

    // Assert : vérification des identifiants transmis.
    expect(userServiceMock.login)
      .toHaveBeenCalledTimes(1);

    expect(userServiceMock.login)
      .toHaveBeenCalledWith(credentials);

    // Vérifie le stockage du JWT.
    expect(sessionStorage.getItem('token'))
      .toBe('fake-jwt-token');

    // Vérifie la redirection.
    expect(routerMock.navigate)
      .toHaveBeenCalledWith(['/students']);

    // Vérifie la fin du chargement.
    expect(component.isLoading).toBe(false);

    expect(component.errorMessage).toBe('');
  });

  // LC-09 : vérifie l'état du composant
  // pendant une requête en cours.
  it('should enable loading and reset messages during login', () => {

    // Crée un Observable dont nous contrôlons
    // manuellement le moment de la réponse.
    const response = new Subject<string>();

    userServiceMock.login.mockReturnValue(
      response.asObservable()
    );

    component.loginForm.setValue(credentials);

    // Simule les messages d'une précédente tentative.
    component.errorMessage = 'Ancienne erreur';
    component.successMessage = 'Ancien succès';

    component.onSubmit();

    // La réponse du service n'est pas encore arrivée.
    expect(component.isLoading).toBe(true);

    expect(component.errorMessage).toBe('');
    expect(component.successMessage).toBe('');

    expect(routerMock.navigate)
      .not.toHaveBeenCalled();

    expect(sessionStorage.getItem('token'))
      .toBeNull();

    // Déclenche manuellement la réponse du service.
    response.next('fake-jwt-token');
    response.complete();

    // Vérifie la fin du chargement.
    expect(component.isLoading).toBe(false);
  });

  // LC-10 : vérifie une erreur d'authentification.
  it('should display an error message on unauthorized login', () => {

    component.loginForm.setValue(credentials);

    userServiceMock.login.mockReturnValue(
      throwError(() => ({ status: 401 }))
    );

    component.onSubmit();

    expect(component.errorMessage).toBe(
      'Identifiant ou mot de passe incorrect.'
    );

    expect(component.isLoading).toBe(false);

    expect(sessionStorage.getItem('token'))
      .toBeNull();

    expect(routerMock.navigate)
      .not.toHaveBeenCalled();
  });

  // LC-11 : vérifie une erreur serveur.
  it('should display a generic message on server error', () => {

    component.loginForm.setValue(credentials);

    userServiceMock.login.mockReturnValue(
      throwError(() => ({ status: 500 }))
    );

    component.onSubmit();

    expect(component.errorMessage).toBe(
      'Une erreur est survenue lors de la connexion.'
    );

    expect(component.isLoading).toBe(false);

    expect(sessionStorage.getItem('token'))
      .toBeNull();

    expect(routerMock.navigate)
      .not.toHaveBeenCalled();
  });
});