import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MetodosDePagoPage } from './metodos-de-pago.page';

describe('MetodosDePagoPage', () => {
  let component: MetodosDePagoPage;
  let fixture: ComponentFixture<MetodosDePagoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MetodosDePagoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
