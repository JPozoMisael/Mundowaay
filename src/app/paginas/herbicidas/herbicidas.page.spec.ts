import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HerbicidasPage } from './herbicidas.page';

describe('HerbicidasPage', () => {
  let component: HerbicidasPage;
  let fixture: ComponentFixture<HerbicidasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HerbicidasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
