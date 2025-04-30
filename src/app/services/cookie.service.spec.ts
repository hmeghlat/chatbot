import { TestBed } from '@angular/core/testing';
import { AuthCookieService } from './cookie.service';
import { CookieService } from 'ngx-cookie-service';

describe('AuthCookieService', () => {
  let service: AuthCookieService;
  let cookieServiceSpy: jasmine.SpyObj<CookieService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('CookieService', ['set', 'get', 'delete', 'check']);
    
    TestBed.configureTestingModule({
      providers: [
        AuthCookieService,
        { provide: CookieService, useValue: spy }
      ]
    });
    
    service = TestBed.inject(AuthCookieService);
    cookieServiceSpy = TestBed.inject(CookieService) as jasmine.SpyObj<CookieService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set token with correct parameters', () => {
    const token = 'test-jwt-token';
    service.setToken(token);
    
    expect(cookieServiceSpy.set).toHaveBeenCalledWith(
      'jwt_token', 
      token, 
      { sameSite: 'Lax', path: '/' }
    );
  });

  it('should get token from cookie service', () => {
    const token = 'test-jwt-token';
    cookieServiceSpy.get.and.returnValue(token);
    
    const result = service.getToken();
    
    expect(result).toBe(token);
    expect(cookieServiceSpy.get).toHaveBeenCalledWith('jwt_token');
  });

  it('should delete token with correct path', () => {
    service.deleteToken();
    
    expect(cookieServiceSpy.delete).toHaveBeenCalledWith('jwt_token', '/');
  });

  it('should check if token is available', () => {
    cookieServiceSpy.check.and.returnValue(true);
    
    const result = service.isTokenAvailable();
    
    expect(result).toBe(true);
    expect(cookieServiceSpy.check).toHaveBeenCalledWith('jwt_token');
  });

  it('should return false when token is not available', () => {
    cookieServiceSpy.check.and.returnValue(false);
    
    const result = service.isTokenAvailable();
    
    expect(result).toBe(false);
    expect(cookieServiceSpy.check).toHaveBeenCalledWith('jwt_token');
  });
});
