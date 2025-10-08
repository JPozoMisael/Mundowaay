import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ComoComprarPage } from './como-comprar.page';

const routes: Routes = [
  {
    path: '',
    component: ComoComprarPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComoComprarPageRoutingModule {}
