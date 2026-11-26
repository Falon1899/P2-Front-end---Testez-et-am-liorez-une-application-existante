import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  Router,
  provideRouter,
  convertToParamMap
} from '@angular/router';
import { of, throwError } from 'rxjs';

import { StudentDetailComponent } from './student-detail.component';
import { UserService } from '../../core/service/user.service';

describe('StudentDetailComponent', () => {

  let component: StudentDetailComponent;
  let fixture: ComponentFixture<StudentDetailComponent>;
  let router: Router;

  // Création d'un étudiant fictif.
  const studentMock = {
    id: 1,
    firstName: 'Test',
    lastName: 'User',
    login: 'testUser'
  };

  // Création du service simulé.
  const userServiceMock = {
    getStudentById: jest.fn(),
    deleteStudent: jest.fn()
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

    // Simule la récupération d'un étudiant.
    userServiceMock.getStudentById.mockReturnValue(
      of(studentMock)
    );

    // Simule une suppression réussie.
    userServiceMock.deleteStudent.mockReturnValue(
      of(undefined)
    );

    // Simule les fenêtres de confirmation et d'alerte.
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    jest.spyOn(window, 'alert').mockImplementation(() => {});

    // Empêche l'affichage des logs pendant les tests.
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await TestBed.configureTestingModule({
      imports: [StudentDetailComponent],

      providers: [
        provideRouter([]),

        // Remplace le véritable UserService.
        {
          provide: UserService,
          useValue: userServiceMock
        },

        // Remplace les paramètres réels de l'URL.
        {
          provide: ActivatedRoute,
          useValue: routeMock
        }
      ]
    }).compileComponents();

    // Simule la navigation sans changer réellement de page.
    router = TestBed.inject(Router);

    jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(StudentDetailComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {

    // Restaure les méthodes originales espionnées.
    jest.restoreAllMocks();
  });

  // FU-06 : vérifie l'instanciation du composant.
  it('should create', () => {

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  // FU-20 : vérifie la récupération et l'affichage de l'étudiant.
  it('should load and display student details', () => {

    // Act : déclenche ngOnInit().
    fixture.detectChanges();

    // Assert : vérifie l'identifiant transmis au service.
    expect(userServiceMock.getStudentById)
      .toHaveBeenCalledTimes(1);

    expect(userServiceMock.getStudentById)
      .toHaveBeenCalledWith(1);

    // Vérifie les informations stockées dans le composant.
    expect(component.student).toEqual(studentMock);

    // Vérifie l'affichage des informations dans le HTML.
    const element: HTMLElement = fixture.nativeElement;

    expect(element.textContent).toContain('Test');
    expect(element.textContent).toContain('User');
    expect(element.textContent).toContain('testUser');
  });

  // FU-48 : vérifie le rejet d'un identifiant invalide.
  it('should not load a student with an invalid id', () => {

    // Arrange : simule un identifiant invalide dans l'URL.
    routeMock.snapshot.paramMap =
      convertToParamMap({ id: 'abc' });

    // Act : déclenche ngOnInit().
    fixture.detectChanges();

    // Assert : vérifie qu'aucune récupération n'est effectuée.
    expect(userServiceMock.getStudentById)
      .not.toHaveBeenCalled();

    expect(component.student).toBeNull();

    expect(console.error).toHaveBeenCalledWith(
      'Identifiant étudiant invalide'
    );
  });

  // FU-49 : vérifie une suppression confirmée.
  it('should delete the student when confirmed', () => {

    // Arrange : charge l'étudiant.
    fixture.detectChanges();

    // Simule l'acceptation de la confirmation.
    jest.spyOn(window, 'confirm').mockReturnValue(true);

    // Act : déclenche la suppression.
    component.deleteStudent();

    // Assert : vérifie la demande de confirmation.
    expect(window.confirm).toHaveBeenCalledWith(
      'Voulez-vous vraiment supprimer Test User ?'
    );

    // Vérifie l'appel du service avec le bon identifiant.
    expect(userServiceMock.deleteStudent)
      .toHaveBeenCalledTimes(1);

    expect(userServiceMock.deleteStudent)
      .toHaveBeenCalledWith(1);

    // Vérifie le message de confirmation.
    expect(window.alert).toHaveBeenCalledWith(
      'Étudiant supprimé avec succès !'
    );

    // Vérifie le retour à la liste des étudiants.
    expect(router.navigate)
      .toHaveBeenCalledWith(['/students']);
  });

  // FU-50 : vérifie l'annulation de la suppression.
  it('should not delete the student when confirmation is refused', () => {

    // Arrange : charge l'étudiant.
    fixture.detectChanges();

    // Simule le refus de la confirmation.
    jest.spyOn(window, 'confirm').mockReturnValue(false);

    // Act : tente de supprimer l'étudiant.
    component.deleteStudent();

    // Assert : vérifie qu'une confirmation a été demandée.
    expect(window.confirm).toHaveBeenCalledTimes(1);

    // Vérifie qu'aucune suppression n'est effectuée.
    expect(userServiceMock.deleteStudent)
      .not.toHaveBeenCalled();

    expect(router.navigate).not.toHaveBeenCalled();
    expect(window.alert).not.toHaveBeenCalled();
  });

  // FU-51 : vérifie la gestion d'un échec de suppression.
  it('should handle an error when deleting a student', () => {

    // Arrange : charge l'étudiant.
    fixture.detectChanges();

    // Simule une erreur du serveur.
    const error = {
      status: 500,
      message: 'Erreur serveur'
    };

    userServiceMock.deleteStudent.mockReturnValue(
      throwError(() => error)
    );

    // Act : déclenche la suppression.
    component.deleteStudent();

    // Assert : vérifie l'appel du service.
    expect(userServiceMock.deleteStudent)
      .toHaveBeenCalledWith(1);

    // Vérifie la journalisation de l'erreur.
    expect(console.error).toHaveBeenCalledWith(
      'Erreur lors de la suppression :',
      error
    );

    // Vérifie le message d'erreur affiché à l'utilisateur.
    expect(window.alert).toHaveBeenCalledWith(
      "Impossible de supprimer l'étudiant."
    );

    // Vérifie qu'aucune redirection n'est effectuée.
    expect(router.navigate).not.toHaveBeenCalled();
  });
});