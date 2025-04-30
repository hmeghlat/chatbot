import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReportService } from './report.service';
import { CookieService } from 'ngx-cookie-service';

describe('ReportService', () => {
  let service: ReportService;
  let httpMock: HttpTestingController;
  let cookieServiceSpy: jasmine.SpyObj<CookieService>;

  beforeEach(() => {
    const cookieSpy = jasmine.createSpyObj('CookieService', ['get']);
    
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ReportService,
        { provide: CookieService, useValue: cookieSpy }
      ]
    });
    
    service = TestBed.inject(ReportService);
    httpMock = TestBed.inject(HttpTestingController);
    cookieServiceSpy = TestBed.inject(CookieService) as jasmine.SpyObj<CookieService>;
    
    // Setup default mock for JWT token
    cookieServiceSpy.get.and.returnValue('test-jwt-token');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('generateGeneralReport', () => {
    it('should make a GET request with auth headers and blob response type', () => {
      const mockBlob = new Blob(['test data'], { type: 'application/pdf' });
      
      service.generateGeneralReport().subscribe(response => {
        expect(response).toEqual(mockBlob);
      });
      
      const req = httpMock.expectOne('http://127.0.0.1:5000/account/report/general');
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-jwt-token');
      expect(req.request.responseType).toBe('blob');
      
      req.flush(mockBlob);
    });
  });

  describe('generateConversationReport', () => {
    it('should make a GET request with conversation ID, auth headers and blob response type', () => {
      const convId = '12345';
      const mockBlob = new Blob(['test conversation data'], { type: 'application/pdf' });
      
      service.generateConversationReport(convId).subscribe(response => {
        expect(response).toEqual(mockBlob);
      });
      
      const req = httpMock.expectOne(`http://127.0.0.1:5000/conversations/${convId}/report`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe('Bearer test-jwt-token');
      expect(req.request.responseType).toBe('blob');
      
      req.flush(mockBlob);
    });
  });

  describe('downloadReport', () => {
    it('should create an anchor element, trigger download and clean up', () => {
      // Create spies for browser APIs
      const mockUrl = 'blob:mockedurl';
      spyOn(window.URL, 'createObjectURL').and.returnValue(mockUrl);
      spyOn(window.URL, 'revokeObjectURL');
      
      const mockAnchor = jasmine.createSpyObj('HTMLAnchorElement', ['click']);
      spyOn(document, 'createElement').and.returnValue(mockAnchor);
      spyOn(document.body, 'appendChild');
      spyOn(document.body, 'removeChild');
      
      const blob = new Blob(['test data'], { type: 'application/pdf' });
      const fileName = 'test-report.pdf';
      
      service.downloadReport(blob, fileName);
      
      expect(window.URL.createObjectURL).toHaveBeenCalledWith(blob);
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockAnchor.href).toBe(mockUrl);
      expect(mockAnchor.download).toBe(fileName);
      expect(document.body.appendChild).toHaveBeenCalledWith(mockAnchor);
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
      expect(document.body.removeChild).toHaveBeenCalledWith(mockAnchor);
    });
  });
});
