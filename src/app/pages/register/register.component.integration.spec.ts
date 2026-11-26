import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import {
  ActivatedRoute,
  Router,
  convertToParamMap
} from '@angular/router';

import { RegisterComponent } from './register.component';

describe('RegisterComponent - Integration', () => {

  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let httpTestingController: HttpTestingController;

  // Simulation du routeur.
  const routerMock = {
    navigate: jest.fn()
  };

  // Simule une inscription depuis la page d'accueil,
  // sans paramètre "from" dans l'URL.
  const routeMock = {
    snapshot: {
      queryParamMap: convertToParamMap({})
    }
  };

  // Informations fictives utilisées pour l'inscription.
  const registerUser = {
    firstName: 'Test',
    lastName: 'User',
    login: 'testUser',
    password: 'Password123!'
  };

  beforeEach(async () => {

    // Réinitialise les mocks avant chaque test.
    jest.resetAllMocks();

    routerMock.navigate.mockResolvedValue(true);

    // Empêche l'affichage réel de la fenêtre d'alerte.
    jest.spyOn(window, 'alert').mockImplementation(() => {});

    await TestBed.configureTestingModule({

      imports: [RegisterComponent],

      providers: [

        // Configure le véritable client HTTP Angular.
        provideHttpClient(),

        // Remplace uniquement le backend HTTP.
        provideHttpClientTesting(),

        // Simule la navigation.
        {
          provide: Router,
          useValue: routerMock
        },

        // Simule les paramètres de l'URL.
        {
          provide: ActivatedRoute,
          useValue: routeMock
        }
      ]
    }).compileComponents();

    // Récupère le contrôleur HTTP de test.
    httpTestingController = TestBed.inject(
      HttpTestingController
    );

    // Crée le véritable composant.
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;

    // Initialise le formulaire et le template HTML.
    fixture.detectChanges();
  });

  afterEach(() => {

    // Vérifie l'absence de requêtes HTTP inattendues.
    httpTestingController.verify();

    // Restaure les méthodes originales espionnées.
    jest.restoreAllMocks();
  });

  // FI-02 : vérifie l'intégration du formulaire HTML,
  // du composant et du véritable UserService.
  it('should register a user through the real UserService', () => {

    // ARRANGE

    // Récupère le véritable template HTML.
    const element: HTMLElement = fixture.nativeElement;

    // Récupère les champs du formulaire.
    const firstNameInput = element.querySelector(
      'input[formControlName="firstName"]'
    ) as HTMLInputElement;

    const lastNameInput = element.querySelector(
      'input[formControlName="lastName"]'
    ) as HTMLInputElement;

    const loginInput = element.querySelector(
      'input[formControlName="login"]'
    ) as HTMLInputElement;

    const passwordInput = element.querySelector(
      'input[formControlName="password"]'
    ) as HTMLInputElement;

    // Récupère le bouton d'inscription.
    const registerButton = element.querySelector(
      'button.btn-primary'
    ) as HTMLButtonElement;

    // Simule la saisie du prénom.
    firstNameInput.value = registerUser.firstName;
    firstNameInput.dispatchEvent(new Event('input'));

    // Simule la saisie du nom.
    lastNameInput.value = registerUser.lastName;
    lastNameInput.dispatchEvent(new Event('input'));

    // Simule la saisie de l'identifiant.
    loginInput.value = registerUser.login;
    loginInput.dispatchEvent(new Event('input'));

    // Simule la saisie du mot de passe.
    passwordInput.value = registerUser.password;
    passwordInput.dispatchEvent(new Event('input'));

    // Actualise le template.
    fixture.detectChanges();

    // Vérifie la synchronisation entre les champs HTML
    // et le formulaire réactif Angular.
    expect(component.registerForm.getRawValue())
      .toEqual(registerUser);

    expect(component.registerForm.valid).toBe(true);

    // ACT

    // Simule un clic sur le bouton d'inscription.
    registerButton.click();

    // ASSERT

    // Intercepte la requête HTTP générée
    // par le véritable UserService.
    const request = httpTestingController.expectOne(
      '/api/register'
    );

    // Vérifie la méthode HTTP utilisée.
    expect(request.request.method).toBe('POST');

    // Vérifie les données transmises au backend.
    expect(request.request.body).toEqual(registerUser);

    // Vérifie que le service attend une réponse JSON.
    expect(request.request.responseType).toBe('json');

    // Vérifie que le formulaire a été soumis.
    expect(component.submitted).toBe(true);

    // Vérifie qu'aucune confirmation ni navigation
    // n'intervient avant la réponse du backend.
    expect(window.alert).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();

    // Simule une réponse HTTP d'inscription réussie.
    request.flush(
      { message: 'Inscription réussie' },
      {
        status: 201,
        statusText: 'Created'
      }
    );

    // Vérifie la confirmation de l'inscription.
    expect(window.alert).toHaveBeenCalledTimes(1);

    expect(window.alert).toHaveBeenCalledWith(
      'Inscription réussie !'
    );

    // Vérifie la demande de navigation
    // vers la page de connexion.
    expect(routerMock.navigate).toHaveBeenCalledTimes(1);

    expect(routerMock.navigate).toHaveBeenCalledWith(
      ['/login']
    );
  });
});