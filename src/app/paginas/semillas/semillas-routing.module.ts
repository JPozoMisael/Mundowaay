import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SemillasPage } from './semillas.page';

const routes: Routes = [
  {
    path: '',
    component: SemillasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SemillasPageRoutingModule {}
