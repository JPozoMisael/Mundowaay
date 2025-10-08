import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PoliticaDevolucionesPage } from './politica-devoluciones.page';

const routes: Routes = [
  {
    path: '',
    component: PoliticaDevolucionesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PoliticaDevolucionesPageRoutingModule {}
