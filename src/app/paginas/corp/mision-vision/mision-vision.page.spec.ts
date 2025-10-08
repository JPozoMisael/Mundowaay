import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MisionVisionPage } from './mision-vision.page';

describe('MisionVisionPage', () => {
  let component: MisionVisionPage;
  let fixture: ComponentFixture<MisionVisionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MisionVisionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
