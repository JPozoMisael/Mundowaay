import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SemillasPage } from './semillas.page';

describe('SemillasPage', () => {
  let component: SemillasPage;
  let fixture: ComponentFixture<SemillasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SemillasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
