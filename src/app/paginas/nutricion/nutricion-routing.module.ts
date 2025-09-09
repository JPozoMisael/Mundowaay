import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NutricionPage } from './nutricion.page';

const routes: Routes = [
  {
    path: '',
    component: NutricionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NutricionPageRoutingModule {}
