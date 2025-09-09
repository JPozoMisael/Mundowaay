import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NutricionPage } from './nutricion.page';

describe('NutricionPage', () => {
  let component: NutricionPage;
  let fixture: ComponentFixture<NutricionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NutricionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
