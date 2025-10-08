import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SucursalesPage } from './sucursales.page';

describe('SucursalesPage', () => {
  let component: SucursalesPage;
  let fixture: ComponentFixture<SucursalesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SucursalesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
