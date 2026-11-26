import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import {
  ActivatedRoute,
  Router,
  provideRouter,
  convertToParamMap
} from '@angular/router';

import { StudentEditComponent } from './student-edit.component';
import { Student } from '../../core/models/Students';
import { UpdateStudent } from '../../core/models/UpdateStudent';

describe('StudentEditComponent - Integration', () => {

  let component: StudentEditComponent;
  let fixture: ComponentFixture<StudentEditComponent>;
  let httpTestingController: HttpTestingController;
  let router: Router;

  // Simule l'identifiant présent dans l'URL.
  const routeMock = {
    snapshot: {
      paramMap: convertToParamMap({ id: '1' })
    }
  };

  // Informations initiales de l'étudiant.
  const mockStudent: Student = {
    id: 1,
    firstName: 'Test',
    lastName: 'User',
    login: 'testUser'
  };

  // Nouvelles informations saisies par l'utilisateur.
  const updatedStudent: UpdateStudent = {
    firstName: 'Updated',
    lastName: 'Student',
    login: 'updatedUser'
  };

  beforeEach(async () => {

    // Empêche l'affichage réel des alertes.
    jest.spyOn(window, 'alert').mockImplementation(() => {});

    await TestBed.configureTestingModule({

      imports: [StudentEditComponent],

      providers: [

        // Configure le véritable client HTTP.
        provideHttpClient(),

        // Remplace le backend HTTP par un backend de test.
        provideHttpClientTesting(),

        // Configure le véritable routeur Angular.
        provideRouter([]),

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

    // Récupère le routeur Angular.
    router = TestBed.inject(Router);

    // Intercepte la demande de navigation.
    jest.spyOn(router, 'navigate').mockResolvedValue(true);

    // Crée le véritable composant.
    fixture = TestBed.createComponent(StudentEditComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {

    // Restaure les méthodes originales espionnées.
    jest.restoreAllMocks();

    // Vérifie l'absence de requêtes HTTP inattendues.
    httpTestingController.verify();
  });

  // FI-05 : vérifie le chargement et la modification
  // d'un étudiant depuis le véritable formulaire HTML.
  it('should load and update a student through the real UserService', () => {

    // ARRANGE

    // Déclenche ngOnInit() et le chargement de l'étudiant.
    fixture.detectChanges();

    // Intercepte la requête HTTP de récupération.
    const getRequest = httpTestingController.expectOne(
      '/api/students/1'
    );

    expect(getRequest.request.method).toBe('GET');

    // Simule la réponse du backend.
    getRequest.flush(mockStudent);

    // Actualise le formulaire HTML.
    fixture.detectChanges();

    // Récupère le véritable template HTML.
    const element: HTMLElement = fixture.nativeElement;

    // Récupère les champs du formulaire.
    const firstNameInput = element.querySelector(
      '#firstName'
    ) as HTMLInputElement;

    const lastNameInput = element.querySelector(
      '#lastName'
    ) as HTMLInputElement;

    const loginInput = element.querySelector(
      '#login'
    ) as HTMLInputElement;

    const submitButton = element.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;

    // Vérifie que les informations reçues du backend
    // ont correctement prérempli le formulaire HTML.
    expect(firstNameInput.value).toBe(mockStudent.firstName);
    expect(lastNameInput.value).toBe(mockStudent.lastName);
    expect(loginInput.value).toBe(mockStudent.login);

    // Simule la modification du prénom.
    firstNameInput.value = updatedStudent.firstName;
    firstNameInput.dispatchEvent(new Event('input'));

    // Simule la modification du nom.
    lastNameInput.value = updatedStudent.lastName;
    lastNameInput.dispatchEvent(new Event('input'));

    // Simule la modification de l'identifiant.
    loginInput.value = updatedStudent.login;
    loginInput.dispatchEvent(new Event('input'));

    // Actualise le formulaire.
    fixture.detectChanges();

    // Vérifie la synchronisation entre le HTML
    // et le formulaire réactif Angular.
    expect(component.editForm.getRawValue())
      .toEqual(updatedStudent);

    expect(component.editForm.valid).toBe(true);
    expect(submitButton.disabled).toBe(false);

    // ACT

    // Simule un clic sur le bouton d'enregistrement.
    submitButton.click();

    // ASSERT

    // Intercepte la requête HTTP de modification.
    const putRequest = httpTestingController.expectOne(
      '/api/students/1'
    );

    // Vérifie la méthode HTTP utilisée.
    expect(putRequest.request.method).toBe('PUT');

    // Vérifie les nouvelles données envoyées au backend.
    expect(putRequest.request.body).toEqual(updatedStudent);

    // Vérifie qu'aucune confirmation ni navigation
    // n'intervient avant la réponse du backend.
    expect(window.alert).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();

    // Simule la réponse contenant l'étudiant modifié.
    putRequest.flush({
      id: 1,
      ...updatedStudent
    });

    // Vérifie la confirmation de modification.
    expect(window.alert).toHaveBeenCalledTimes(1);

    expect(window.alert).toHaveBeenCalledWith(
      'Étudiant modifié avec succès !'
    );

    // Vérifie la demande de retour vers la fiche
    // de l'étudiant qui vient d'être modifié.
    expect(router.navigate).toHaveBeenCalledTimes(1);

    expect(router.navigate).toHaveBeenCalledWith(
      ['/students', 1]
    );

    // Vérifie l'absence de message d'erreur.
    expect(component.errorMessage).toBe('');
  });
});