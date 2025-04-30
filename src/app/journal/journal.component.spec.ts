import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { JournalComponent } from './journal.component';
import { CookieService } from 'ngx-cookie-service';

describe('JournalComponent', () => {
  let component: JournalComponent;
  let fixture: ComponentFixture<JournalComponent>;
  let localStorageSpy: jasmine.Spy;

  beforeEach(async () => {
    // Mock localStorage
    localStorageSpy = spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(localStorage, 'setItem');

    await TestBed.configureTestingModule({
      imports: [
        JournalComponent,
        NoopAnimationsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule
      ],
      providers: [
        CookieService
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JournalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty entries', () => {
    expect(component.entries.length).toBe(0);
    expect(component.tenWords.length).toBe(0);
    expect(localStorageSpy).toHaveBeenCalled();
  });

  it('should toggle section expansion', () => {
    // Vérifier l'état initial
    expect(component.isSectionExpanded('entry')).toBeTrue();
    
    // Basculer l'état
    component.toggleSection('entry');
    
    // Vérifier que l'état a changé
    expect(component.isSectionExpanded('entry')).toBeFalse();
  });

  it('should add a word to tenWords', () => {
    component.currentWord = 'Testing';
    component.addWord();
    
    expect(component.tenWords.length).toBe(1);
    expect(component.tenWords[0]).toBe('Testing');
    expect(component.currentWord).toBe('');
  });

  it('should not add a word if empty', () => {
    component.currentWord = '';
    component.addWord();
    
    expect(component.tenWords.length).toBe(0);
  });

  it('should not add a word if already at max words', () => {
    for (let i = 0; i < component.maxWords; i++) {
      component.tenWords.push(`Word ${i}`);
    }
    
    component.currentWord = 'Extra Word';
    component.addWord();
    
    expect(component.tenWords.length).toBe(component.maxWords);
  });
});
