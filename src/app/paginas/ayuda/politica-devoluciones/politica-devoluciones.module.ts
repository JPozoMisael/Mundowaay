import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PoliticaDevolucionesPageRoutingModule } from './politica-devoluciones-routing.module';
import { SharedModule } from 'src/app/shared/shared-module';
import { PoliticaDevolucionesPage } from './politica-devoluciones.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    IonicModule,
    PoliticaDevolucionesPageRoutingModule
  ],
  declarations: [PoliticaDevolucionesPage]
})
export class PoliticaDevolucionesPageModule {}
