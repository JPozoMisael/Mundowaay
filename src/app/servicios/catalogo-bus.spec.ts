import { TestBed } from '@angular/core/testing';

import { CatalogoBus } from './catalogo-bus';

describe('CatalogoBus', () => {
  let service: CatalogoBus;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CatalogoBus);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
