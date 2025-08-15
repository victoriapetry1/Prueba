import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PruebaMaps } from './prueba-maps';

describe('PruebaMaps', () => {
  let component: PruebaMaps;
  let fixture: ComponentFixture<PruebaMaps>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PruebaMaps]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PruebaMaps);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
