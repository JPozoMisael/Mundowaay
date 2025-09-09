import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AcaricidasPage } from './acaricidas.page';

describe('AcaricidasPage', () => {
  let component: AcaricidasPage;
  let fixture: ComponentFixture<AcaricidasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AcaricidasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
