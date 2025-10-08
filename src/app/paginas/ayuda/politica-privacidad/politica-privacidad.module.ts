import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { SharedModule } from 'src/app/shared/shared-module';
import { PoliticaPrivacidadPageRoutingModule } from './politica-privacidad-routing.module';

import { PoliticaPrivacidadPage } from './politica-privacidad.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    IonicModule,
    PoliticaPrivacidadPageRoutingModule
  ],
  declarations: [PoliticaPrivacidadPage]
})
export class PoliticaPrivacidadPageModule {}
