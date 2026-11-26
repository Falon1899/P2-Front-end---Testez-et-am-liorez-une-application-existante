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

import { StudentDetailComponent } from './student-detail.component';
import { Student } from '../../core/models/Students';

describe('StudentDetailComponent - Integration', () => {

  let component: StudentDetailComponent;
  let fixture: ComponentFixture<StudentDetailComponent>;
  let httpTestingController: HttpTestingController;
  let router: Router;

  // Simule l'identifiant présent dans l'URL.
  const routeMock = {
    snapshot: {
      paramMap: convertToParamMap({ id: '1' })
    }
  };

  // Étudiant fictif renvoyé par le backend.
  const mockStudent: Student = {
    id: 1,
    firstName: 'Test',
    lastName: 'User',
    login: 'testUser'
  };

  beforeEach(async () => {

    // Simule la confirmation de suppression.
    jest.spyOn(window, 'confirm').mockReturnValue(true);

    // Empêche l'affichage réel des alertes.
    jest.spyOn(window, 'alert').mockImplementation(() => {});

    // Masque les logs pendant le test.
    jest.spyOn(console, 'log').mockImplementation(() => {});

    await TestBed.configureTestingModule({

      imports: [StudentDetailComponent],

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

    // Intercepte uniquement la demande de navigation.
    jest.spyOn(router, 'navigate').mockResolvedValue(true);

    // Crée le véritable composant.
    fixture = TestBed.createComponent(StudentDetailComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {

    // Restaure les méthodes originales espionnées.
    jest.restoreAllMocks();

    // Vérifie l'absence de requêtes HTTP inattendues.
    httpTestingController.verify();
  });

  // FI-04 : vérifie le chargement et la suppression
  // d'un étudiant depuis la véritable interface HTML.
  it('should load and delete a student through the real UserService', () => {

    // ARRANGE

    // Vérifie qu'aucun étudiant n'est initialement chargé.
    expect(component.student).toBeNull();

    // Déclenche ngOnInit() et le chargement de l'étudiant.
    fixture.detectChanges();

    // Intercepte la requête de récupération.
    const getRequest = httpTestingController.expectOne(
      '/api/students/1'
    );

    // Vérifie la méthode HTTP.
    expect(getRequest.request.method).toBe('GET');

    // Simule la réponse du backend.
    getRequest.flush(mockStudent);

    // Actualise le template HTML.
    fixture.detectChanges();

    // Vérifie les données reçues par le composant.
    expect(component.student).toEqual(mockStudent);

    // Récupère le véritable template HTML.
    const element: HTMLElement = fixture.nativeElement;

    // Vérifie l'affichage des informations.
    expect(element.textContent).toContain('Test');
    expect(element.textContent).toContain('User');
    expect(element.textContent).toContain('testUser');

    // Récupère le bouton de suppression.
    const deleteButton = element.querySelector(
      'button[type="button"]'
    ) as HTMLButtonElement;

    expect(deleteButton).not.toBeNull();

    // ACT

    // Simule un clic sur le bouton Supprimer.
    deleteButton.click();

    // ASSERT

    // Vérifie la demande de confirmation.
    expect(window.confirm).toHaveBeenCalledWith(
      'Voulez-vous vraiment supprimer Test User ?'
    );

    // Intercepte la requête générée
    // par le véritable UserService.
    const deleteRequest = httpTestingController.expectOne(
      '/api/students/1'
    );

    // Vérifie la méthode HTTP de suppression.
    expect(deleteRequest.request.method).toBe('DELETE');

    // Vérifie qu'aucune confirmation ni navigation
    // n'intervient avant la réponse du backend.
    expect(window.alert).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();

    // Simule une suppression réussie sans contenu.
    deleteRequest.flush(null, {
      status: 204,
      statusText: 'No Content'
    });

    // Vérifie la confirmation de suppression.
    expect(window.alert).toHaveBeenCalledTimes(1);

    expect(window.alert).toHaveBeenCalledWith(
      'Étudiant supprimé avec succès !'
    );

    // Vérifie la demande de retour vers la liste.
    expect(router.navigate).toHaveBeenCalledTimes(1);

    expect(router.navigate).toHaveBeenCalledWith(
      ['/students']
    );
  });
});