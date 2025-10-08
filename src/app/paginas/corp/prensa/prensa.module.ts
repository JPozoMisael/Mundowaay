import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { SharedModule } from 'src/app/shared/shared-module';
import { PrensaPageRoutingModule } from './prensa-routing.module';

import { PrensaPage } from './prensa.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    IonicModule,
    PrensaPageRoutingModule
  ],
  declarations: [PrensaPage]
})
export class PrensaPageModule {}
