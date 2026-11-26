import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { StudentsComponent } from './students.component';
import { UserService } from '../../core/service/user.service';

describe('StudentsComponent', () => {
  let component: StudentsComponent;
  let fixture: ComponentFixture<StudentsComponent>;

  // Création d'un service simulé avec Jest.
  const userServiceMock = {
    getStudents: jest.fn()
  };

  beforeEach(async () => {

    // Réinitialise les mocks avant chaque test.
    jest.resetAllMocks();

    // Simule le retour d'une liste vide d'étudiants.
    userServiceMock.getStudents.mockReturnValue(of([]));

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

    // Déclenche notamment ngOnInit().
    fixture.detectChanges();
  });

  // Vérifie que le composant peut être instancié.
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});