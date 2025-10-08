import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComoComprarPage } from './como-comprar.page';

describe('ComoComprarPage', () => {
  let component: ComoComprarPage;
  let fixture: ComponentFixture<ComoComprarPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ComoComprarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
