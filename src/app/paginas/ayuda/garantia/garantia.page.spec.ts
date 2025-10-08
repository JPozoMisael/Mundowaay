import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GarantiaPage } from './garantia.page';

describe('GarantiaPage', () => {
  let component: GarantiaPage;
  let fixture: ComponentFixture<GarantiaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GarantiaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
