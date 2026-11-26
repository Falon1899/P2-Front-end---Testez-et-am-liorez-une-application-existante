import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

import { StudentEditComponent } from './student-edit.component';
import { UserService } from '../../core/service/user.service';

describe('StudentEditComponent', () => {
  let component: StudentEditComponent;
  let fixture: ComponentFixture<StudentEditComponent>;

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
    updateStudent: jest.fn()
  };

  beforeEach(async () => {

    // Réinitialise les mocks avant chaque test.
    jest.resetAllMocks();

    // Simule la récupération de l'étudiant.
    userServiceMock.getStudentById.mockReturnValue(
      of(studentMock)
    );

    await TestBed.configureTestingModule({
      imports: [StudentEditComponent],

      providers: [
        provideRouter([]),

        // Injecte le service simulé.
        {
          provide: UserService,
          useValue: userServiceMock
        },

        // Simule l'identifiant présent dans l'URL.
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '1' })
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(StudentEditComponent);
    component = fixture.componentInstance;

    // Déclenche ngOnInit() et le préremplissage
    // du formulaire avec les données simulées.
    fixture.detectChanges();
  });

  // Vérifie que le composant peut être instancié.
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});