import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MaquinariaPage } from './maquinaria.page';

const routes: Routes = [
  {
    path: '',
    component: MaquinariaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MaquinariaPageRoutingModule {}
