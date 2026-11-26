import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

import { StudentDetailComponent } from './student-detail.component';
import { UserService } from '../../core/service/user.service';

describe('StudentDetailComponent', () => {
  let component: StudentDetailComponent;
  let fixture: ComponentFixture<StudentDetailComponent>;

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

  beforeEach(async () => {

    // Réinitialise les mocks avant chaque test.
    jest.resetAllMocks();

    // Simule la récupération d'un étudiant.
    userServiceMock.getStudentById.mockReturnValue(
      of(studentMock)
    );

    await TestBed.configureTestingModule({
      imports: [StudentDetailComponent],

      providers: [
        provideRouter([]),

        // Remplace le véritable UserService.
        {
          provide: UserService,
          useValue: userServiceMock
        },

        // Simule un identifiant présent dans l'URL.
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

    fixture = TestBed.createComponent(StudentDetailComponent);
    component = fixture.componentInstance;

    // Déclenche ngOnInit().
    fixture.detectChanges();
  });

  // Vérifie que le composant peut être instancié.
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});