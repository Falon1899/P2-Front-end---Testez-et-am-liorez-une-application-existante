import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController
} from '@angular/common/http/testing';

import { UserService } from './user.service';
import { Register } from '../models/Register';
import { Login } from '../models/Login';
import { Student } from '../models/Students';
import { UpdateStudent } from '../models/UpdateStudent';

describe('UserService', () => {

  let service: UserService;
  let httpTestingController: HttpTestingController;

  // Données fictives réutilisables dans les tests.
  const studentMock: Student = {
    id: 1,
    firstName: 'Test',
    lastName: 'User',
    login: 'testUser'
  };

  beforeEach(() => {

    // Configuration de l'environnement de test Angular.
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    // Récupération du véritable service à tester.
    service = TestBed.inject(UserService);

    // Récupération du contrôleur des requêtes HTTP simulées.
    httpTestingController = TestBed.inject(
      HttpTestingController
    );
  });

  afterEach(() => {

    // Vérifie qu'aucune requête HTTP inattendue
    // ou non traitée ne subsiste après chaque test.
    httpTestingController.verify();
  });

  // US-01 : vérifie l'instanciation du service.
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // US-02 : vérifie la requête d'inscription.
  it('should register a user', () => {

    // Arrange : préparation des données.
    const user: Register = {
      firstName: 'Test',
      lastName: 'User',
      login: 'testUser',
      password: 'Password123!'
    };

    const response = { message: 'Inscription réussie' };

    // Act : exécution de la méthode réelle.
    service.register(user).subscribe(result => {
      expect(result).toEqual(response);
    });

    // Assert : vérification de la requête HTTP.
    const req = httpTestingController.expectOne('/api/register');

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(user);

    // Simule la réponse du backend.
    req.flush(response);
  });

  // US-03 : vérifie la connexion et la réception du JWT.
  it('should login and return a JWT token', () => {

    const credentials: Login = {
      login: 'testUser',
      password: 'Password123!'
    };

    const token = 'fake-jwt-token';

    service.login(credentials).subscribe(result => {
      expect(result).toBe(token);
    });

    const req = httpTestingController.expectOne('/api/login');

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(credentials);
    expect(req.request.responseType).toBe('text');

    req.flush(token);
  });

  // US-04 : vérifie la récupération des étudiants.
  it('should return the list of students', () => {

    const students: Student[] = [studentMock];

    service.getStudents().subscribe(result => {
      expect(result).toEqual(students);
    });

    const req = httpTestingController.expectOne('/api/users');

    expect(req.request.method).toBe('GET');

    req.flush(students);
  });

  // US-05 : vérifie la récupération d'un étudiant par ID.
  it('should return a student by id', () => {

    service.getStudentById(1).subscribe(result => {
      expect(result).toEqual(studentMock);
    });

    const req = httpTestingController.expectOne(
      '/api/students/1'
    );

    expect(req.request.method).toBe('GET');

    req.flush(studentMock);
  });

  // US-06 : vérifie la modification d'un étudiant.
  it('should update a student', () => {

    const updatedStudent: UpdateStudent = {
      firstName: 'Updated',
      lastName: 'User',
      login: 'testUser'
    };

    const response: Student = {
      id: 1,
      ...updatedStudent
    };

    service.updateStudent(1, updatedStudent)
      .subscribe(result => {
        expect(result).toEqual(response);
      });

    const req = httpTestingController.expectOne(
      '/api/students/1'
    );

    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedStudent);

    req.flush(response);
  });

  // US-07 : vérifie la suppression d'un étudiant.
  it('should delete a student', () => {

    const successCallback = jest.fn();

    service.deleteStudent(1).subscribe({
      complete: successCallback
    });

    const req = httpTestingController.expectOne(
      '/api/students/1'
    );

    expect(req.request.method).toBe('DELETE');

    // Simule une réponse HTTP 204 sans contenu.
    req.flush(null, {
      status: 204,
      statusText: 'No Content'
    });

    expect(successCallback).toHaveBeenCalledTimes(1);
  });

  // US-08 : vérifie la propagation d'une erreur HTTP 401.
  it('should return an error when login fails', () => {

    const credentials: Login = {
      login: 'testUser',
      password: 'wrongPassword'
    };

    const errorCallback = jest.fn();
    const successCallback = jest.fn();

    service.login(credentials).subscribe({
      next: successCallback,
      error: errorCallback
    });

    const req = httpTestingController.expectOne('/api/login');

    req.flush('Unauthorized', {
      status: 401,
      statusText: 'Unauthorized'
    });

    expect(successCallback).not.toHaveBeenCalled();
    expect(errorCallback).toHaveBeenCalledTimes(1);

    expect(errorCallback).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 401
      })
    );
  });
});