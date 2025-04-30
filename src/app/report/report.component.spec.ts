import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReportsComponent } from './report.component';
import { ReportService } from '../services/report.service';
import { of } from 'rxjs';

describe('ReportsComponent', () => {
  let component: ReportsComponent;
  let fixture: ComponentFixture<ReportsComponent>;
  let reportServiceSpy: jasmine.SpyObj<ReportService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ReportService', ['generateGeneralReport', 'generateConversationReport', 'downloadReport']);
    
    await TestBed.configureTestingModule({
      imports: [ReportsComponent, HttpClientTestingModule],
      providers: [
        { provide: ReportService, useValue: spy }
      ]
    })
    .compileComponents();

    reportServiceSpy = TestBed.inject(ReportService) as jasmine.SpyObj<ReportService>;
    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
