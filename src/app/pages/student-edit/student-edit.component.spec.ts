import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  Router,
  provideRouter,
  convertToParamMap
} from '@angular/router';
import { of, throwError } from 'rxjs';

import { StudentEditComponent } from './student-edit.component';
import { UserService } from '../../core/service/user.service';

describe('StudentEditComponent', () => {

  let component: StudentEditComponent;
  let fixture: ComponentFixture<StudentEditComponent>;
  let router: Router;

  // Informations initiales de l'étudiant.
  const studentMock = {
    id: 1,
    firstName: 'Test',
    lastName: 'User',
    login: 'testUser'
  };

  // Nouvelles informations de l'étudiant.
  const updatedStudent = {
    firstName: 'Updated',
    lastName: 'User',
    login: 'updatedUser'
  };

  // Création du service simulé.
  const userServiceMock = {
    getStudentById: jest.fn(),
    updateStudent: jest.fn()
  };

  // Simulation de l'identifiant présent dans l'URL.
  const routeMock = {
    snapshot: {
      paramMap: convertToParamMap({ id: '1' })
    }
  };

  beforeEach(async () => {

    // Réinitialise les mocks avant chaque test.
    jest.resetAllMocks();

    // Rétablit un identifiant valide par défaut.
    routeMock.snapshot.paramMap =
      convertToParamMap({ id: '1' });

    // Simule la récupération de l'étudiant.
    userServiceMock.getStudentById.mockReturnValue(
      of(studentMock)
    );

    // Simule une mise à jour réussie.
    userServiceMock.updateStudent.mockReturnValue(
      of(undefined)
    );

    // Empêche l'affichage réel des alertes.
    jest.spyOn(window, 'alert').mockImplementation(() => {});

    // Empêche l'affichage des erreurs dans la console.
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await TestBed.configureTestingModule({
      imports: [StudentEditComponent],

      providers: [
        provideRouter([]),

        // Injecte le service simulé.
        {
          provide: UserService,
          useValue: userServiceMock
        },

        // Injecte les paramètres simulés de l'URL.
        {
          provide: ActivatedRoute,
          useValue: routeMock
        }
      ]
    }).compileComponents();

    // Simule la navigation.
    router = TestBed.inject(Router);

    jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(StudentEditComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {

    // Restaure les méthodes originales espionnées.
    jest.restoreAllMocks();
  });

  // FU-07 : vérifie l'instanciation du composant.
  it('should create', () => {

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  // FU-21 : vérifie une mise à jour valide.
  it('should update the student and navigate to details', () => {

    // Arrange : charge les informations initiales.
    fixture.detectChanges();

    // Modifie les valeurs du formulaire.
    component.editForm.setValue(updatedStudent);

    // Act : soumet le formulaire.
    component.onSubmit();

    // Assert : vérifie l'appel du service.
    expect(userServiceMock.updateStudent)
      .toHaveBeenCalledTimes(1);

    expect(userServiceMock.updateStudent)
      .toHaveBeenCalledWith(1, updatedStudent);

    // Vérifie le message de confirmation.
    expect(window.alert).toHaveBeenCalledWith(
      'Étudiant modifié avec succès !'
    );

    // Vérifie le retour vers la fiche de l'étudiant.
    expect(router.navigate)
      .toHaveBeenCalledWith(['/students', 1]);
  });

  // FU-52 : vérifie le préremplissage du formulaire.
  it('should populate the form with student details', () => {

    // Act : déclenche ngOnInit().
    fixture.detectChanges();

    // Assert : vérifie la récupération de l'étudiant.
    expect(userServiceMock.getStudentById)
      .toHaveBeenCalledTimes(1);

    expect(userServiceMock.getStudentById)
      .toHaveBeenCalledWith(1);

    // Vérifie les valeurs du formulaire.
    expect(component.editForm.getRawValue()).toEqual({
      firstName: 'Test',
      lastName: 'User',
      login: 'testUser'
    });

    expect(component.editForm.valid).toBe(true);
  });

  // FU-53 : vérifie le rejet d'un identifiant invalide.
  it('should not load a student with an invalid id', () => {

    // Arrange : simule un identifiant invalide.
    routeMock.snapshot.paramMap =
      convertToParamMap({ id: 'abc' });

    // Act : déclenche ngOnInit().
    fixture.detectChanges();

    // Assert : vérifie qu'aucune récupération n'est effectuée.
    expect(userServiceMock.getStudentById)
      .not.toHaveBeenCalled();

    expect(component.errorMessage).toBe(
      'Identifiant étudiant invalide.'
    );
  });

  // FU-54 : vérifie le rejet d'un formulaire invalide.
  it('should not submit an invalid form', () => {

    // Arrange : charge les informations de l'étudiant.
    fixture.detectChanges();

    // Supprime une valeur obligatoire.
    component.editForm.controls.firstName.setValue('');

    expect(component.editForm.invalid).toBe(true);

    // Act : tente de soumettre le formulaire.
    component.onSubmit();

    // Assert : vérifie qu'aucune mise à jour n'est effectuée.
    expect(userServiceMock.updateStudent)
      .not.toHaveBeenCalled();

    expect(router.navigate).not.toHaveBeenCalled();
  });

  // FU-55 : vérifie la gestion d'un échec de mise à jour.
  it('should handle an error when updating a student', () => {

    // Arrange : charge et modifie les informations.
    fixture.detectChanges();

    component.editForm.setValue(updatedStudent);

    // Simule une erreur du serveur.
    const error = {
      status: 500,
      message: 'Erreur serveur'
    };

    userServiceMock.updateStudent.mockReturnValue(
      throwError(() => error)
    );

    // Act : soumet le formulaire.
    component.onSubmit();

    // Assert : vérifie l'appel du service.
    expect(userServiceMock.updateStudent)
      .toHaveBeenCalledWith(1, updatedStudent);

    // Vérifie le traitement de l'erreur.
    expect(component.errorMessage).toBe(
      'Impossible de modifier cet étudiant.'
    );

    expect(console.error).toHaveBeenCalledWith(
      'Erreur de modification :',
      error
    );

    // Vérifie l'absence de redirection et de confirmation.
    expect(router.navigate).not.toHaveBeenCalled();
    expect(window.alert).not.toHaveBeenCalled();
  });

  // FU-56 : vérifie la gestion d'un échec de récupération.
  it('should handle an error when loading a student', () => {

    // Arrange : simule une erreur de récupération.
    userServiceMock.getStudentById.mockReturnValue(
      throwError(() => ({
        status: 404,
        message: 'Étudiant introuvable'
      }))
    );

    // Act : déclenche ngOnInit().
    fixture.detectChanges();

    // Assert : vérifie l'appel du service.
    expect(userServiceMock.getStudentById)
      .toHaveBeenCalledWith(1);

    // Vérifie le message d'erreur.
    expect(component.errorMessage).toBe(
      'Impossible de récupérer cet étudiant.'
    );

    // Vérifie que le formulaire reste vide.
    expect(component.editForm.getRawValue()).toEqual({
      firstName: '',
      lastName: '',
      login: ''
    });
  });
});