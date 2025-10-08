import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Components
import { AppHeaderComponent } from '../components/app-header/app-header.component';
import { FooterComponent } from '../components/footer/footer.component';
import { LoginModalComponent } from '../components/login-modal/login-modal.component';
import { LocationModalComponent } from '../components/location-modal/location-modal.component';

@NgModule({
  declarations: [
    FooterComponent, 
    LoginModalComponent, 
    LocationModalComponent,
    AppHeaderComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RouterModule   // necesario para routerLink / routerLinkActive
  ],
  exports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RouterModule,   // también exportamos RouterModule
    FooterComponent,
    LoginModalComponent,
    LocationModalComponent,
    AppHeaderComponent   // ahora se puede usar <app-header> en cualquier módulo que importe SharedModule
  ]
})
export class SharedModule {}
