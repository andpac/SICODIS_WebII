import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PgnRegionalizacionPresupuestoSeguimientoComponent } from './pgn-regionalizacion-presupuesto-seguimiento.component';

describe('PgnRegionalizacionPresupuestoSeguimientoComponent', () => {
  let component: PgnRegionalizacionPresupuestoSeguimientoComponent;
  let fixture: ComponentFixture<PgnRegionalizacionPresupuestoSeguimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PgnRegionalizacionPresupuestoSeguimientoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PgnRegionalizacionPresupuestoSeguimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});