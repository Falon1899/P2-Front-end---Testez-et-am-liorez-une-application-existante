import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  Router,
  convertToParamMap,
  provideRouter
} from '@angular/router';
import { of } from 'rxjs';

import { RegisterComponent } from './register.component';
import { UserService } from '../../core/service/user.service';

describe('RegisterComponent', () => {

  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let router: Router;

  // Création du service utilisateur simulé.
  const userServiceMock = {
    register: jest.fn()
  };

  // Simulation des paramètres présents dans l'URL.
  const routeMock = {
    snapshot: {
      queryParamMap: convertToParamMap({})
    }
  };

  // Données fictives utilisées pour les inscriptions.
  const registerUser = {
    firstName: 'Test',
    lastName: 'User',
    login: 'testUser',
    password: 'Password123!'
  };

  beforeEach(async () => {

    // Réinitialise les mocks avant chaque test.
    jest.resetAllMocks();

    // Par défaut, aucun paramètre dans l'URL.
    routeMock.snapshot.queryParamMap =
      convertToParamMap({});

    // Simule une inscription réussie.
    userServiceMock.register.mockReturnValue(
      of({})
    );

    // Empêche l'affichage réel de la fenêtre d'alerte.
    jest.spyOn(window, 'alert').mockImplementation(() => {});

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],

      providers: [
        provideRouter([]),

        {
          provide: UserService,
          useValue: userServiceMock
        },
        {
          provide: ActivatedRoute,
          useValue: routeMock
        }
      ]
    }).compileComponents();

    // Récupère le routeur et simule sa méthode navigate.
    router = TestBed.inject(Router);

    jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  afterEach(() => {

    // Restaure les méthodes originales après chaque test.
    jest.restoreAllMocks();
  });

  // FU-04 : vérifie l'instanciation du composant.
  it('should create', () => {

    expect(component).toBeTruthy();
  });

  // FU-18 : vérifie une inscription valide.
  it('should register a user and navigate to login', () => {

    // Arrange : renseigne le formulaire.
    component.registerForm.setValue(registerUser);

    // Act : soumet le formulaire.
    component.onSubmit();

    // Assert : vérifie les données transmises.
    expect(userServiceMock.register)
      .toHaveBeenCalledTimes(1);

    expect(userServiceMock.register)
      .toHaveBeenCalledWith(registerUser);

    // Vérifie la confirmation de l'inscription.
    expect(window.alert)
      .toHaveBeenCalledWith('Inscription réussie !');

    // Vérifie la redirection vers la connexion.
    expect(router.navigate)
      .toHaveBeenCalledWith(['/login']);
  });

  // FU-44 : interdit une inscription avec un formulaire invalide.
  it('should not submit an invalid form', () => {

    // Arrange : le formulaire est vide par défaut.
    expect(component.registerForm.invalid).toBe(true);

    // Act : tente de soumettre le formulaire.
    component.onSubmit();

    // Assert : vérifie qu'aucune inscription n'est effectuée.
    expect(userServiceMock.register)
      .not.toHaveBeenCalled();

    expect(router.navigate)
      .not.toHaveBeenCalled();

    expect(component.submitted).toBe(true);
  });

  // FU-45 : vérifie une inscription depuis la liste des étudiants.
  it('should navigate to students when registering from students list', () => {

    // Arrange : simule le paramètre ?from=students.
    routeMock.snapshot.queryParamMap =
      convertToParamMap({ from: 'students' });

    component.registerForm.setValue(registerUser);

    // Act : soumet le formulaire.
    component.onSubmit();

    // Assert : vérifie l'inscription.
    expect(userServiceMock.register)
      .toHaveBeenCalledWith(registerUser);

    // Vérifie la redirection vers la liste des étudiants.
    expect(router.navigate)
      .toHaveBeenCalledWith(['/students']);
  });

  // FU-46 : vérifie la réinitialisation du formulaire.
  it('should reset the form and submitted state', () => {

    // Arrange : simule un formulaire renseigné et soumis.
    component.registerForm.setValue(registerUser);
    component.submitted = true;

    // Act : réinitialise le formulaire.
    component.onReset();

    // Assert : vérifie la réinitialisation des champs.
    expect(component.registerForm.value).toEqual({
      firstName: null,
      lastName: null,
      login: null,
      password: null
    });

    expect(component.submitted).toBe(false);
    expect(component.registerForm.invalid).toBe(true);
  });
});