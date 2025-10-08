import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GarantiaPage } from './garantia.page';

const routes: Routes = [
  {
    path: '',
    component: GarantiaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GarantiaPageRoutingModule {}
