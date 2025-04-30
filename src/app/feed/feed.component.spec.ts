import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CookieService } from 'ngx-cookie-service';
import { FeedComponent } from './feed.component';

describe('FeedComponent', () => {
  let component: FeedComponent;
  let fixture: ComponentFixture<FeedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FeedComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: CookieService, useClass: class {
          get(key: string): string {
            return '';  // Simuler un utilisateur non authentifié pour simplifier
          }
        }}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedComponent);
    component = fixture.componentInstance;
    
    // Désactiver ngOnInit pour éviter les appels HTTP réels
    spyOn(component, 'ngOnInit');
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should have pagination methods', () => {
    component.articles = [
      { title: 'Article 1', link: 'link1', summary: 'summary1' as any },
      { title: 'Article 2', link: 'link2', summary: 'summary2' as any }
    ];
    component.currentPage = 1;
    component.articlesPerPage = 1;
    
    expect(component.paginatedArticles.length).toBe(1);
    expect(component.totalPages).toBe(2);
  });

  it('should change page when goToPage is called with valid page', () => {
    component.articles = [
      { title: 'Article 1', link: 'link1', summary: 'summary1' as any },
      { title: 'Article 2', link: 'link2', summary: 'summary2' as any }
    ];
    component.currentPage = 1;
    component.articlesPerPage = 1;
    
    component.goToPage(2);
    
    expect(component.currentPage).toBe(2);
  });
  
  it('should not change page when goToPage is called with invalid page', () => {
    component.articles = [{ title: 'Article', link: 'link', summary: 'summary' as any }];
    component.currentPage = 1;
    component.articlesPerPage = 1;
    
    component.goToPage(0);  // Page invalide
    expect(component.currentPage).toBe(1);
    
    component.goToPage(2);  // Page trop grande
    expect(component.currentPage).toBe(1);
  });
});
