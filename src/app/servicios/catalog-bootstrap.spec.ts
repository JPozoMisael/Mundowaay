import { TestBed } from '@angular/core/testing';

import { CatalogBootstrap } from './catalog-bootstrap';

describe('CatalogBootstrap', () => {
  let service: CatalogBootstrap;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CatalogBootstrap);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
