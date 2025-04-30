import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizComponent } from './quiz.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';

describe('QuizComponent', () => {
  let component: QuizComponent;
  let fixture: ComponentFixture<QuizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        QuizComponent, 
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule
      ],
      providers: [
        { provide: CookieService, useValue: { get: () => '' } }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuizComponent);
    component = fixture.componentInstance;
    
    // Désactiver ngOnInit pour éviter les appels HTTP externes
    spyOn(component, 'ngOnInit').and.stub();
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default quiz data', () => {
    expect(component.quizData).toBeDefined();
    expect(component.quizData.age).toBe('');
    expect(component.quizData.gender).toBe('');
    expect(component.quizData.mental_state).toBe('');
    expect(component.quizData.physical_state).toBe('');
    expect(component.quizData.stress_level).toBe('');
    expect(component.quizData.mood).toBe('');
  });

  it('should validate quiz data with appropriate error messages', () => {
    // Réinitialiser l'état
    component.quizData = {
      age: '',
      gender: '',
      mental_state: '',
      physical_state: '',
      stress_level: '',
      mood: ''
    };
    component.errorMessage = '';
    component.previousQuizCompleted = false;
    
    // Cas 1: Aucune donnée (pour un nouvel utilisateur)
    expect(component.validateQuizData()).toBeFalse();
    expect(component.errorMessage).toContain('age');
    
    // Cas 2: Âge invalide
    component.errorMessage = '';
    component.quizData.age = '5'; // Trop jeune
    expect(component.validateQuizData()).toBeFalse();
    expect(component.errorMessage).toContain('valid age');
    
    // Cas 3: Âge valide mais genre manquant
    component.errorMessage = '';
    component.quizData.age = '30';
    expect(component.validateQuizData()).toBeFalse();
    expect(component.errorMessage).toContain('gender');
    
    // Cas 4: Âge et genre corrects, mais état mental manquant
    component.errorMessage = '';
    component.quizData.gender = 'male';
    expect(component.validateQuizData()).toBeFalse();
    expect(component.errorMessage).toContain('mental state');
    
    // Cas 5: Remplir tous les champs
    component.quizData.mental_state = 'good';
    component.quizData.physical_state = 'normal';
    component.quizData.stress_level = 'low';
    component.quizData.mood = 'happy';
    
    expect(component.validateQuizData()).toBeTrue();
    expect(component.errorMessage).toBe('');
  });
});
