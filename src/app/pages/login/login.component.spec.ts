import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {

    // Configuration de l'environnement de test Angular.
    await TestBed.configureTestingModule({
      imports: [LoginComponent],

      providers: [
        // Fournit le client HTTP nécessaire à UserService.
        provideHttpClient(),

        // Remplace le backend HTTP réel par un backend de test.
        // Évite les véritables appels vers notre API Java.
        provideHttpClientTesting(),

        // Fournit les dépendances du routeur Angular.
        provideRouter([])
      ]
    }).compileComponents();

    // Création du composant.
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;

    // Déclenche le cycle de détection des changements.
    fixture.detectChanges();
  });

  // Vérifie que le composant peut être instancié.
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});