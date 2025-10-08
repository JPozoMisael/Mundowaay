import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MetodosDePagoPage } from './metodos-de-pago.page';

const routes: Routes = [
  {
    path: '',
    component: MetodosDePagoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MetodosDePagoPageRoutingModule {}
