import { TestBed } from '@angular/core/testing';

import { ConfidentialityService } from './confidentiality.service';

describe('ConfidentialityService', () => {
  let service: ConfidentialityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfidentialityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
