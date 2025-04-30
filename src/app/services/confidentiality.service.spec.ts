import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ConfidentialityService } from './confidentiality.service';

describe('ConfidentialityService', () => {
  let service: ConfidentialityService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ConfidentialityService]
    });
    
    service = TestBed.inject(ConfidentialityService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getConfidentialityPolicy', () => {
    it('should return the confidentiality policy from API', () => {
      const mockPolicy = {
        title: 'Politique de confidentialité',
        content: 'Contenu de la politique de confidentialité...',
        lastUpdated: '2023-01-01'
      };
      
      service.getConfidentialityPolicy().subscribe(policy => {
        expect(policy).toEqual(mockPolicy);
      });
      
      const req = httpMock.expectOne('http://127.0.0.1:5000/confidentiality');
      expect(req.request.method).toBe('GET');
      req.flush(mockPolicy);
    });

    it('should handle errors properly', () => {
      service.getConfidentialityPolicy().subscribe({
        next: () => fail('Expected an error, not a successful response'),
        error: error => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
        }
      });
      
      const req = httpMock.expectOne('http://127.0.0.1:5000/confidentiality');
      req.flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });
});
