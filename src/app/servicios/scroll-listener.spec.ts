import { TestBed } from '@angular/core/testing';

import { ScrollListener } from './scroll-listener';

describe('ScrollListener', () => {
  let service: ScrollListener;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScrollListener);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
