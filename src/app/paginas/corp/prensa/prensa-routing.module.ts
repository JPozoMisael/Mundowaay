import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PrensaPage } from './prensa.page';

const routes: Routes = [
  {
    path: '',
    component: PrensaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrensaPageRoutingModule {}
