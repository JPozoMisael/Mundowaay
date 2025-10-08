import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PoliticaDevolucionesPage } from './politica-devoluciones.page';

describe('PoliticaDevolucionesPage', () => {
  let component: PoliticaDevolucionesPage;
  let fixture: ComponentFixture<PoliticaDevolucionesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PoliticaDevolucionesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
