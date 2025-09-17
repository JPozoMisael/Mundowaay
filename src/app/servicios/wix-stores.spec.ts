import { TestBed } from '@angular/core/testing';

import { WixStores } from './wix-stores';

describe('WixStores', () => {
  let service: WixStores;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WixStores);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
