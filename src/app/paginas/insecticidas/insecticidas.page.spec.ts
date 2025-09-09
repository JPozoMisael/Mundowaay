import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InsecticidasPage } from './insecticidas.page';

describe('InsecticidasPage', () => {
  let component: InsecticidasPage;
  let fixture: ComponentFixture<InsecticidasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(InsecticidasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
