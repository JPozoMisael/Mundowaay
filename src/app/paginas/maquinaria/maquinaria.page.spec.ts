import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaquinariaPage } from './maquinaria.page';

describe('MaquinariaPage', () => {
  let component: MaquinariaPage;
  let fixture: ComponentFixture<MaquinariaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MaquinariaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
