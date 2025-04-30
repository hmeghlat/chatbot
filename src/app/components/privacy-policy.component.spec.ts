import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConfidentialityDialogComponent } from './privacy-policy.component';
import { ConfidentialityService } from '../services/confidentiality.service';
import { of } from 'rxjs';

describe('ConfidentialityDialogComponent', () => {
  let component: ConfidentialityDialogComponent;
  let fixture: ComponentFixture<ConfidentialityDialogComponent>;

  beforeEach(async () => {
    // Créer un simple mock du service
    const confidentialityServiceMock = {
      getConfidentialityPolicy: jasmine.createSpy('getConfidentialityPolicy').and.returnValue(of({}))
    };
    
    await TestBed.configureTestingModule({
      imports: [ConfidentialityDialogComponent, HttpClientTestingModule],
      providers: [
        { provide: ConfidentialityService, useValue: confidentialityServiceMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfidentialityDialogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have accept and decline methods', () => {
    expect(component.onAccept).toBeDefined();
    expect(component.onDecline).toBeDefined();
  });

  it('should emit correct value on accept', () => {
    spyOn(component.accepted, 'emit');
    component.onAccept();
    expect(component.accepted.emit).toHaveBeenCalledWith(true);
  });

  it('should emit correct value on decline', () => {
    spyOn(component.accepted, 'emit');
    component.onDecline();
    expect(component.accepted.emit).toHaveBeenCalledWith(false);
  });
});
