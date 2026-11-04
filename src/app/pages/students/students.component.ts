import { Component } from '@angular/core';

import { OnInit, inject } from '@angular/core';
import { UserService } from '../../core/service/user.service';
import { Student } from '../../core/models/Students';

@Component({
  selector: 'app-students',
  imports: [],
  templateUrl: './students.component.html',
  styleUrl: './students.component.css'
})
export class StudentsComponent implements OnInit {

  private userService = inject(UserService);

  // Contiendra les étudiants renvoyés par le backend
  students: Student[] = [];

  ngOnInit(): void {
    this.userService.getStudents().subscribe({
      next: (data) => {
        this.students = data;
        console.log('Étudiants récupérés :', data);
      },
      error: (error) => {
        console.error('Erreur de récupération des étudiants :', error);
      }
    });
  }
}