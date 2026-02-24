import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ReportsSgrComponent } from './components/reports-sgr/reports-sgr.component';
import { ReportsSgpComponent } from './components/reports-sgp/reports-sgp.component';
import { ReportsMapComponent } from './components/reports-map/reports-map.component';
import { ReportsSgpDistComponent } from './components/reports-sgp-dist/reports-sgp-dist.component';
import { ReportsSgpBudgetComponent } from './components/reports-sgp-budget/reports-sgp-budget.component';
import { SgrPlanBienalCajaComponent } from './components/sgr-plan-bienal-caja/sgr-plan-bienal-caja.component';
import { ReportsSgrComparativeComponent } from './components/reports-sgr-comparative/reports-sgr-comparative.component';
import { IacComparativeVsBudgetComponent} from './components/iac-comparative-vs-budget/iac-comparative-vs-budget.component';
import { SgrPlanBienalRecursosComponent } from './components/sgr-plan-bienal-recursos/sgr-plan-bienal-recursos.component';
import { FaqComponent } from './components/faq/faq.component';
import { ToolsComponent } from './components/tools/tools.component';
import { ComparativoIacVsPresupuestoComponent } from './components/comparativo-iac-vs-presupuesto/comparativo-iac-vs-presupuesto.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PropuestaResumenSgrComponent } from './components/propuesta-resumen-sgr/propuesta-resumen-sgr.component';
import { HighchartsDashboardComponent } from './components/highcharts-dashboard/highcharts-dashboard.component';
import { PresupuestoYRecaudoComponent } from './components/presupuesto-y-recaudo/presupuesto-y-recaudo.component';
import { GraphicsSgpComponent } from './components/graphics-sgp/graphics-sgp.component';
import { ReporteFuncionamientoComponent } from './components/reporte-funcionamiento/reporte-funcionamiento.component';
import { ReportsSgpResguardosComponent } from './components/reports-sgp-resguardos/reports-sgp-resguardos.component';
import { HistoricoSgpComponent } from './components/historico-sgp/historico-sgp.component';
import { SgpInicioComponent } from './components/sgp-inicio/sgp-inicio.component';
import { SgpDetallePresupuestalComponent } from './components/sgp-detalle-presupuestal/sgp-detalle-presupuestal.component';
import { SgpComparativaComponent } from './components/sgp-comparativa/sgp-comparativa.component';
import { PgnRegionalizacionPresupuestoProgramacionComponent } from './components/pgn-regionalizacion-presupuesto-programacion/pgn-regionalizacion-presupuesto-programacion.component';
import { PgnComparativaRegionalizacionComponent } from './components/pgn-comparativa-regionalizacion/pgn-comparativa-regionalizacion.component';
import { SgpEficienciasComponent } from './components/sgp-eficiencias/sgp-eficiencias.component';
import { SgrRecaudoMensualComponent } from './components/sgr-recaudo-mensual/sgr-recaudo-mensual.component';
import { SgrComparativoComponent } from './components/sgr-comparativo/sgr-comparativo.component';
import { SgrProgramacionComponent } from './components/sgr-programacion/sgr-programacion.component';
import { SgrRecaudoDirectasComponent } from './components/sgr-recaudo-directas/sgr-recaudo-directas.component';
import { SgrMontosCorrientesConstantesComponent } from './components/sgr-montos-corrientes-constantes/sgr-montos-corrientes-constantes.component';
import { PgnInversionPorSectorComponent } from './components/pgn-inversion-por-sector/pgn-inversion-por-sector.component';
import { PgnRegionalizacionPresupuestoSeguimientoComponent } from './components/pgn-regionalizacion-presupuesto-seguimiento/pgn-regionalizacion-presupuesto-seguimiento.component';

// User Management Imports
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { UserListComponent } from './components/admin/user-list/user-list.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'reports-sgr', component: ReportsSgrComponent },    
    { path: 'reports-sgp-dist', component: ReportsSgpDistComponent },
    { path: 'reports-sgp-budget', component: ReportsSgpBudgetComponent },    
    { path: 'reports-sgr-comparative', component: ReportsSgrComparativeComponent },    
    { path: 'iac-comparative-vs-budget', component: IacComparativeVsBudgetComponent },
    { path: 'comparativo-iac-presupuesto', component: ComparativoIacVsPresupuestoComponent },    
    { path: 'faq', component: FaqComponent },
    { path: 'tools', component: ToolsComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'dashboard2', component: HighchartsDashboardComponent },
    { path: 'propuesta-resumen-sgr', component: PropuestaResumenSgrComponent }, // Redirect to home for any unknown routes    
    { path: 'graphics-sgp', component: GraphicsSgpComponent},
    { path: 'reports-map', component: ReportsMapComponent },
    { path: 'reporte-funcionamiento', component: ReporteFuncionamientoComponent },    
    { path: 'sgp-inicio', component: SgpInicioComponent},
    { path: 'sgp-resguardos', component: ReportsSgpResguardosComponent},
    { path: 'sgp-historico', component: HistoricoSgpComponent},
    { path: 'sgp-documentos-anexos', component: ReportsSgpComponent },
    { path: 'sgp-detalle-presupuestal', component: SgpDetallePresupuestalComponent },
    { path: 'sgp-comparativa', component: SgpComparativaComponent },    
    { path: 'sgp-eficiencia', component: SgpEficienciasComponent },    
    { path: 'sgr-presupuesto-y-recaudo', component: PresupuestoYRecaudoComponent },
    { path: 'sgr-recaudo-mensual', component: SgrRecaudoMensualComponent },
    { path: 'sgr-comparativo', component: SgrComparativoComponent },
    { path: 'sgr-programacion', component: SgrProgramacionComponent },
    { path: 'sgr-recaudo-directas', component: SgrRecaudoDirectasComponent },
    { path: 'sgr-montos-corrientes-constantes', component: SgrMontosCorrientesConstantesComponent },
    { path: 'sgr-plan-de-recursos', component: SgrPlanBienalRecursosComponent },
    { path: 'sgr-plan-bienal-caja', component: SgrPlanBienalCajaComponent },
    { path: 'pgn-inversion-por-sector', component:PgnInversionPorSectorComponent},
    { path: 'pgn-regionalizacion', component: PgnRegionalizacionPresupuestoProgramacionComponent },
    { path: 'pgn-seguimiento', component: PgnRegionalizacionPresupuestoSeguimientoComponent },
    { path: 'pgn-comparativa-regionalizacion', component: PgnComparativaRegionalizacionComponent },

    // ========== User Management Routes ==========
    // Administración (protegido solo para administradores)
    {
        path: 'admin',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['SuperAdministrador', 'Administrador'] },
        children: [
            {
                path: 'usuarios',
                component: UserListComponent,
                data: { breadcrumb: 'Gestión de Usuarios' }
            },
            {
                path: '',
                redirectTo: 'usuarios',
                pathMatch: 'full'
            }
        ]
    },

    // Perfil de usuario (solo autenticado, sin restricción de rol)
    {
        path: 'mi-perfil',
        component: UserProfileComponent,
        canActivate: [authGuard],
        data: { breadcrumb: 'Mi Perfil' }
    },

    // Página de acceso no autorizado
    {
        path: 'unauthorized',
        component: UnauthorizedComponent
    }
];