import { TestBed } from '@angular/core/testing';
import { ChatService } from './chat.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CookieService } from 'ngx-cookie-service';
import { of } from 'rxjs';

describe('ChatService', () => {
  let service: ChatService;
  let httpMock: HttpTestingController;
  let cookieServiceSpy: jasmine.SpyObj<CookieService>;

  beforeEach(() => {
    const cookieSpy = jasmine.createSpyObj('CookieService', ['get', 'set']);
    
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ChatService,
        { provide: CookieService, useValue: cookieSpy }
      ]
    });
    
    service = TestBed.inject(ChatService);
    httpMock = TestBed.inject(HttpTestingController);
    cookieServiceSpy = TestBed.inject(CookieService) as jasmine.SpyObj<CookieService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isGuestUser', () => {
    it('should return true when user has guest token but no JWT', () => {
      cookieServiceSpy.get.and.callFake((key: string) => {
        if (key === 'jwt') return '';
        if (key === 'guest_session') return 'guest-token-123';
        return '';
      });
      
      // @ts-ignore - accessing private method for testing
      expect(service.isGuestUser()).toBeTrue();
    });

    it('should return false when user has JWT token', () => {
      cookieServiceSpy.get.and.callFake((key: string) => {
        if (key === 'jwt') return 'jwt-token-123';
        return '';
      });
      
      // @ts-ignore - accessing private method for testing
      expect(service.isGuestUser()).toBeFalse();
    });
  });

  describe('registerGuestUser', () => {
    it('should not register if user already has JWT token', () => {
      cookieServiceSpy.get.and.callFake((key: string) => {
        if (key === 'jwt') return 'jwt-token-123';
        return '';
      });

      service.registerGuestUser().subscribe(response => {
        expect(response).toEqual({ status: 'already_registered' });
      });
      
      // No HTTP request should be made
      httpMock.expectNone(`http://127.0.0.1:5000/guest`);
    });

    it('should register guest user and store JWT token', () => {
      cookieServiceSpy.get.and.callFake((key: string) => {
        if (key === 'jwt') return '';
        if (key === 'guest_session') return 'guest-token-123';
        return '';
      });

      const mockResponse = { access_token: 'new-jwt-token' };
      
      service.registerGuestUser().subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(cookieServiceSpy.set).toHaveBeenCalledWith('jwt', 'new-jwt-token', { path: '/' });
      });
      
      const req = httpMock.expectOne(`http://127.0.0.1:5000/guest`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });

  describe('sendMessage', () => {
    it('should register guest user first if needed', () => {
      cookieServiceSpy.get.and.callFake((key: string) => {
        if (key === 'jwt') return '';
        if (key === 'guest_session') return 'guest-token-123';
        return '';
      });

      // Mock the registerGuestUser to return observable
      spyOn(service, 'registerGuestUser').and.returnValue(of({ access_token: 'new-jwt-token' }));
      
      service.sendMessage('Hello').subscribe();
      
      expect(service.registerGuestUser).toHaveBeenCalled();
      
      // After registration, it should call the /chat endpoint
      const req = httpMock.expectOne(`http://127.0.0.1:5000/chat`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ message: 'Hello', finalize: false });
      req.flush({ response: 'Hello there!' });
    });

    it('should send message directly for authenticated users', () => {
      cookieServiceSpy.get.and.callFake((key: string) => {
        if (key === 'jwt') return 'jwt-token-123';
        return '';
      });
      
      service.sendMessage('Hello').subscribe();
      
      const req = httpMock.expectOne(`http://127.0.0.1:5000/chat`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ message: 'Hello', finalize: false });
      req.flush({ response: 'Hello there!' });
    });
  });

  describe('getConversations', () => {
    it('should return empty array for guest users', () => {
      cookieServiceSpy.get.and.callFake((key: string) => {
        if (key === 'jwt') return '';
        if (key === 'guest_session') return 'guest-token-123';
        return '';
      });
      
      service.getConversations().subscribe(result => {
        expect(result).toEqual([]);
      });
      
      // No HTTP request should be made
      httpMock.expectNone(`http://127.0.0.1:5000/conversations`);
    });

    it('should fetch conversations for authenticated users', () => {
      cookieServiceSpy.get.and.callFake((key: string) => {
        if (key === 'jwt') return 'jwt-token-123';
        return '';
      });
      
      const mockConversations = [{ id: '1', title: 'Test Conversation' }];
      
      service.getConversations().subscribe(result => {
        expect(result).toEqual(mockConversations);
      });
      
      const req = httpMock.expectOne(`http://127.0.0.1:5000/conversations`);
      expect(req.request.method).toBe('GET');
      req.flush(mockConversations);
    });
  });

  describe('getConversationById', () => {
    it('should return empty conversation for guest users', () => {
      cookieServiceSpy.get.and.callFake((key: string) => {
        if (key === 'jwt') return '';
        if (key === 'guest_session') return 'guest-token-123';
        return '';
      });
      
      service.getConversationById('123').subscribe(result => {
        expect(result).toEqual({ messages: [] });
      });
      
      // No HTTP request should be made
      httpMock.expectNone(`http://127.0.0.1:5000/conversations/123`);
    });

    it('should fetch conversation by id for authenticated users', () => {
      cookieServiceSpy.get.and.callFake((key: string) => {
        if (key === 'jwt') return 'jwt-token-123';
        return '';
      });
      
      const mockConversation = { 
        messages: [{ 
          sender: 'user' as 'user' | 'bot', 
          text: 'Hello' 
        }] 
      };
      
      service.getConversationById('123').subscribe(result => {
        expect(result).toEqual(mockConversation);
      });
      
      const req = httpMock.expectOne(`http://127.0.0.1:5000/conversations/123`);
      expect(req.request.method).toBe('GET');
      req.flush(mockConversation);
    });
  });
});
