import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelClima } from './panel-clima';

describe('PanelClima', () => {
  let component: PanelClima;
  let fixture: ComponentFixture<PanelClima>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelClima]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelClima);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
