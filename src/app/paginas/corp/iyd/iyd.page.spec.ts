import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IydPage } from './iyd.page';

describe('IydPage', () => {
  let component: IydPage;
  let fixture: ComponentFixture<IydPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(IydPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
