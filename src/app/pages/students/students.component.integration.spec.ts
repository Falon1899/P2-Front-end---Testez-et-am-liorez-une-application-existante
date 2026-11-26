import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { StudentsComponent } from './students.component';
import { authInterceptor } from '../../core/interceptors/auth.interceptor';
import { Student } from '../../core/models/Students';

describe('StudentsComponent - Integration', () => {

  let component: StudentsComponent;
  let fixture: ComponentFixture<StudentsComponent>;
  let httpTestingController: HttpTestingController;

  // Token fictif simulant une authentification préalable.
  const token = 'fake-jwt-token';

  // Liste fictive renvoyée par le backend.
  const mockStudents: Student[] = [
    {
      id: 1,
      firstName: 'Test',
      lastName: 'User',
      login: 'testUser'
    },
    {
      id: 2,
      firstName: 'Second',
      lastName: 'User',
      login: 'user123'
    }
  ];

  beforeEach(async () => {

    // Simule un utilisateur déjà authentifié.
    sessionStorage.setItem('token', token);

    // Empêche l'affichage des logs pendant le test.
    jest.spyOn(console, 'log').mockImplementation(() => {});

    await TestBed.configureTestingModule({

      imports: [StudentsComponent],

      providers: [

        // Configure le véritable client HTTP
        // avec le véritable intercepteur JWT.
        provideHttpClient(
          withInterceptors([authInterceptor])
        ),

        // Remplace le backend HTTP par un backend de test.
        provideHttpClientTesting(),

        // Fournit le véritable routeur Angular.
        provideRouter([])
      ]
    }).compileComponents();

    // Récupère le contrôleur HTTP de test.
    httpTestingController = TestBed.inject(
      HttpTestingController
    );

    // Crée le véritable composant.
    fixture = TestBed.createComponent(StudentsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {

    // Nettoie le stockage de session.
    sessionStorage.removeItem('token');

    // Restaure les méthodes originales espionnées.
    jest.restoreAllMocks();

    // Vérifie l'absence de requêtes HTTP inattendues.
    httpTestingController.verify();
  });

  // FI-03 : vérifie l'intégration du composant,
  // du service utilisateur et de l'intercepteur JWT.
  it('should load and display students with JWT authentication', () => {

    // ARRANGE

    // Vérifie que la liste est initialement vide.
    expect(component.students).toEqual([]);

    // ACT

    // Déclenche ngOnInit() et la récupération des étudiants.
    fixture.detectChanges();

    // ASSERT

    // Intercepte la requête HTTP générée
    // par le véritable UserService.
    const request = httpTestingController.expectOne(
      '/api/users'
    );

    // Vérifie la méthode HTTP utilisée.
    expect(request.request.method).toBe('GET');

    // Vérifie que le véritable intercepteur
    // a ajouté le token JWT à la requête.
    expect(
      request.request.headers.get('Authorization')
    ).toBe(`Bearer ${token}`);

    // Vérifie que la liste reste vide
    // tant que le backend n'a pas répondu.
    expect(component.students).toEqual([]);

    // Simule la réponse HTTP du backend.
    request.flush(mockStudents);

    // Actualise le template avec les données reçues.
    fixture.detectChanges();

    // Vérifie que le composant a reçu
    // les informations transmises par le service.
    expect(component.students).toEqual(mockStudents);

    // Récupère le véritable template HTML.
    const element: HTMLElement = fixture.nativeElement;

    // Récupère les lignes du tableau des étudiants.
    const rows = element.querySelectorAll('tbody tr');

    // Vérifie que les deux étudiants sont affichés.
    expect(rows.length).toBe(2);

    // Vérifie les informations du premier étudiant.
    expect(rows[0].textContent).toContain('Test');
    expect(rows[0].textContent).toContain('User');
    expect(rows[0].textContent).toContain('testUser');

    // Vérifie les informations du second étudiant.
    expect(rows[1].textContent).toContain('Second');
    expect(rows[1].textContent).toContain('User');
    expect(rows[1].textContent).toContain('user123');

    // Vérifie que le message de liste vide a disparu.
    expect(element.textContent)
      .not.toContain('Aucun étudiant à afficher.');
  });
});