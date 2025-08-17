import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaParcela } from './mapa-parcela';

describe('MapaParcela', () => {
  let component: MapaParcela;
  let fixture: ComponentFixture<MapaParcela>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaParcela]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapaParcela);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
