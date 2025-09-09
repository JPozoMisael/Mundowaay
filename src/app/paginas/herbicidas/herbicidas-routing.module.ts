import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HerbicidasPage } from './herbicidas.page';

const routes: Routes = [
  {
    path: '',
    component: HerbicidasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HerbicidasPageRoutingModule {}
