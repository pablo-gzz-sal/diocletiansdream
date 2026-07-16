import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { WpService } from './wp-service';

describe('WpService', () => {
  let service: WpService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(WpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
