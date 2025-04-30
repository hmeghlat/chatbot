import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { ConfidentialityDialogComponent } from '../components/privacy-policy.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule,
        LoginComponent
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    
    // Désactivation de ngOnInit pour éviter les appels externes
    spyOn(component, 'ngOnInit').and.stub();
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default form state', () => {
    expect(component.isLoginActive).toBeTrue();
    expect(component.username).toBe('');
    expect(component.password).toBe('');
    expect(component.passwordSignup).toBe('');
  });

  it('should toggle between login and signup forms', () => {
    // État initial (login actif)
    expect(component.isLoginActive).toBeTrue();
    
    // Basculer vers le formulaire d'inscription
    component.toggleForm(false);
    expect(component.isLoginActive).toBeFalse();
    
    // Revenir au formulaire de connexion
    component.toggleForm(true);
    expect(component.isLoginActive).toBeTrue();
  });

  it('should show privacy policy dialog when initiating signup without acceptance', () => {
    // Vérifier que le dialog n'est pas affiché au départ
    expect(component.showConfidentialityPolicy).toBeFalse();
    
    // Espionner la méthode d'affichage de la politique
    spyOn(component, 'viewPrivacyPolicy').and.callThrough();
    
    // Initier l'inscription sans avoir accepté la politique
    component.acceptedPolicy = false;
    component.initiateSignup();
    
    // Vérifier que la méthode a été appelée
    expect(component.viewPrivacyPolicy).toHaveBeenCalled();
    expect(component.showConfidentialityPolicy).toBeTrue();
  });

  it('should proceed with signup when policy is already accepted', () => {
    // Espionner la méthode d'inscription
    spyOn(component, 'onSignup');
    
    // Simuler que la politique a déjà été acceptée
    component.acceptedPolicy = true;
    
    // Initier l'inscription
    component.initiateSignup();
    
    // Vérifier que l'inscription se poursuit directement
    expect(component.onSignup).toHaveBeenCalled();
  });

  it('should correctly handle privacy policy response', () => {
    // Cas d'acceptation
    component.onConfidentialityResponse(true);
    expect(component.acceptedPolicy).toBeTrue();
    expect(component.showConfidentialityPolicy).toBeFalse();
    
    // Réinitialiser
    component.acceptedPolicy = false;
    component.authMessage = '';
    
    // Cas de refus
    component.onConfidentialityResponse(false);
    expect(component.acceptedPolicy).toBeFalse();
    expect(component.showConfidentialityPolicy).toBeFalse();
    expect(component.authMessage).toContain('must accept');
  });
  
  it('should correctly verify token expiration', () => {
    // Créer un token expiré
    const expiredDate = Math.floor(Date.now() / 1000) - 3600; // 1 heure dans le passé
    const expiredPayload = { exp: expiredDate };
    const expiredToken = `header.${btoa(JSON.stringify(expiredPayload))}.signature`;
    
    // Créer un token valide
    const validDate = Math.floor(Date.now() / 1000) + 3600; // 1 heure dans le futur
    const validPayload = { exp: validDate };
    const validToken = `header.${btoa(JSON.stringify(validPayload))}.signature`;
    
    // Vérifier la détection correcte
    expect(component.isTokenExpired(expiredToken)).toBeTrue();
    expect(component.isTokenExpired(validToken)).toBeFalse();
    
    // Vérifier la gestion des tokens invalides
    expect(component.isTokenExpired('invalid.token')).toBeTrue();
  });
});
