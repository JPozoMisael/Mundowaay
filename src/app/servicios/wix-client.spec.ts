import { TestBed } from '@angular/core/testing';

import { WixClient } from './wix-client';

describe('WixClient', () => {
  let service: WixClient;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WixClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
