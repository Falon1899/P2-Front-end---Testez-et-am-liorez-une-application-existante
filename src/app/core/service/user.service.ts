
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Register } from '../models/Register';
import { Login } from '../models/Login';
import { Student } from '../models/Students';

import { UpdateStudent } from '../models/UpdateStudent';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private httpClient: HttpClient) { }

  // Envoie les informations d'inscription au backend
  register(user: Register): Observable<Object> {
    return this.httpClient.post('/api/register', user);
  }

  // Envoie les identifiants au backend et récupère le token JWT
  login(user: Login): Observable<string> {
    return this.httpClient.post('/api/login', user, {
      responseType: 'text'
    });
  }

  // Récupère la liste des étudiants depuis le backend
  getStudents(): Observable<Student[]> {
    return this.httpClient.get<Student[]>('/api/users');
  }

  // Récupère les informations d'un étudiant à partir de son identifiant
  getStudentById(id: number): Observable<Student> {
    return this.httpClient.get<Student>(`/api/students/${id}`);
  }

  // Modifie les informations d'un étudiant existant
  updateStudent(id: number, student: UpdateStudent): Observable<Student> {
    return this.httpClient.put<Student>(`/api/students/${id}`, student);
}

  // Supprime un étudiant à partir de son identifiant
  deleteStudent(id: number): Observable<void> {
    return this.httpClient.delete<void>(`/api/students/${id}`);
}

}
