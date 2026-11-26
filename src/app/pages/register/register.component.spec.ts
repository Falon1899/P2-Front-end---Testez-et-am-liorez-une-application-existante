import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {

    // Configuration de l'environnement de test Angular.
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],

      providers: [
        // Fournit le client HTTP nécessaire à UserService.
        provideHttpClient(),

        // Remplace le backend HTTP réel par un backend de test.
        // Évite les véritables appels vers notre API Java.
        provideHttpClientTesting(),

        // Fournit les dépendances Router et ActivatedRoute.
        provideRouter([])
      ]
    }).compileComponents();

    // Création du composant.
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;

    // Déclenche la détection des changements
    // et l'initialisation du formulaire via ngOnInit().
    fixture.detectChanges();
  });

  // Vérifie que le composant peut être instancié.
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});