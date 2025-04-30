import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CookieService } from 'ngx-cookie-service';
import { AccountDialogComponent } from './account-dialog.component';

describe('AccountDialogComponent', () => {
  let component: AccountDialogComponent;
  let fixture: ComponentFixture<AccountDialogComponent>;
  let cookieServiceSpy: jasmine.SpyObj<CookieService>;

  const mockDialogData = {
    username: 'testuser',
    age: '30',
    gender: 'male'
  };

  beforeEach(async () => {
    const cookieSpy = jasmine.createSpyObj('CookieService', ['get']);
    cookieSpy.get.and.returnValue('test-token');

    await TestBed.configureTestingModule({
      imports: [
        AccountDialogComponent,
        MatDialogModule,
        HttpClientTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
        { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } },
        { provide: CookieService, useValue: cookieSpy }
      ]
    })
    .compileComponents();

    cookieServiceSpy = TestBed.inject(CookieService) as jasmine.SpyObj<CookieService>;
    fixture = TestBed.createComponent(AccountDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with dialog data', () => {
    expect(component.updatedAccount.username).toBe(mockDialogData.username);
    expect(component.updatedAccount.age).toBe(mockDialogData.age);
    expect(component.updatedAccount.gender).toBe(mockDialogData.gender);
  });
});
