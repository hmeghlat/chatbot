import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';

describe('AppComponent', () => {
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        RouterTestingModule
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'chatbot-mental' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('chatbot-mental');
  });

  it('should redirect to landing page when at root path', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    
    spyOn<any>(app, 'isRootPath').and.returnValue(true);
    
    app.ngOnInit();
    
    expect(router.navigate).toHaveBeenCalledWith(['/landing']);
  });

  it('should not redirect when not at root path', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    
    spyOn<any>(app, 'isRootPath').and.returnValue(false);
    
    app.ngOnInit();
    
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
