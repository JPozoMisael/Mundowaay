import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FormularioPageRoutingModule } from './formulario-routing.module';
import { SharedModule } from 'src/app/shared/shared-module';
import { FormularioPage } from './formulario.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    IonicModule,
    FormularioPageRoutingModule
  ],
  declarations: [FormularioPage]
})
export class FormularioPageModule {}
