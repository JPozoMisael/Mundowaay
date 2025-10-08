import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SostenibilidadPage } from './sostenibilidad.page';

describe('SostenibilidadPage', () => {
  let component: SostenibilidadPage;
  let fixture: ComponentFixture<SostenibilidadPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SostenibilidadPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
