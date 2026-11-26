import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { StudentsComponent } from './students.component';
import { UserService } from '../../core/service/user.service';
import { Student } from '../../core/models/Students';

describe('StudentsComponent', () => {

  let component: StudentsComponent;
  let fixture: ComponentFixture<StudentsComponent>;

  // Création d'un service simulé avec Jest.
  const userServiceMock = {
    getStudents: jest.fn()
  };

  // Liste fictive d'étudiants utilisée pour les tests.
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

    // Réinitialise les mocks avant chaque test.
    jest.resetAllMocks();

    // Simule par défaut le retour d'une liste vide.
    userServiceMock.getStudents.mockReturnValue(of([]));

    // Empêche l'affichage des logs pendant les tests.
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await TestBed.configureTestingModule({
      imports: [StudentsComponent],

      providers: [
        provideRouter([]),

        // Remplace le véritable UserService
        // par notre service simulé.
        {
          provide: UserService,
          useValue: userServiceMock
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {

    // Restaure les méthodes originales de console.
    jest.restoreAllMocks();
  });

  // FU-05 : vérifie l'instanciation du composant.
  it('should create', () => {

    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  // FU-19 : vérifie le chargement des étudiants.
  it('should load and display students on initialization', () => {

    // Arrange : simule le retour de deux étudiants.
    userServiceMock.getStudents.mockReturnValue(
      of(mockStudents)
    );

    // Act : déclenche ngOnInit().
    fixture.detectChanges();

    // Assert : vérifie que le service a été appelé.
    expect(userServiceMock.getStudents)
      .toHaveBeenCalledTimes(1);

    // Vérifie que les données sont stockées
    // dans la propriété students du composant.
    expect(component.students)
      .toEqual(mockStudents);

    // Vérifie que les étudiants sont affichés
    // dans le template HTML du composant.
    const element: HTMLElement = fixture.nativeElement;

    const rows = element.querySelectorAll('tbody tr');

    expect(rows.length).toBe(2);

    expect(rows[0].textContent).toContain('testUser');
    expect(rows[1].textContent).toContain('user123');
  });

  // FU-47 : vérifie la gestion d'une erreur de chargement.
  it('should handle an error when loading students', () => {

    // Arrange : crée une erreur fictive.
    const error = {
      status: 500,
      message: 'Erreur serveur'
    };

    // Simule une erreur renvoyée par le service.
    userServiceMock.getStudents.mockReturnValue(
      throwError(() => error)
    );

    // Act : déclenche ngOnInit().
    fixture.detectChanges();

    // Assert : vérifie que le service a été appelé.
    expect(userServiceMock.getStudents)
      .toHaveBeenCalledTimes(1);

    // Vérifie que la liste reste vide.
    expect(component.students).toEqual([]);

    // Vérifie que l'erreur a été traitée.
    expect(console.error).toHaveBeenCalledWith(
      'Erreur de récupération des étudiants :',
      error
    );
  });
});