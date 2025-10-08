import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrensaPage } from './prensa.page';

describe('PrensaPage', () => {
  let component: PrensaPage;
  let fixture: ComponentFixture<PrensaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PrensaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
