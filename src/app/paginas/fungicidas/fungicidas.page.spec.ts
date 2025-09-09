import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FungicidasPage } from './fungicidas.page';

describe('FungicidasPage', () => {
  let component: FungicidasPage;
  let fixture: ComponentFixture<FungicidasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FungicidasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
