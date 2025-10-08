import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/servicios/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
email: string = '';
  password: string = '';

  // Campos adicionales del formulario
  phone: string = '';
  name: string = '';
  acceptSms: boolean = false;
  acceptTerms: boolean = false;
  constructor(private modalctrl: ModalController,
    private auth: AuthService) { }

  ngOnInit() {
  }
    dismiss() {
    this.modalctrl.dismiss();
  }

  submit() {
    // Validación básica
    if (!this.email || !this.password) return;

    // Aquí llamas a tu servicio de login
    this.auth.login(this.email, this.password);

    // Cerrar modal
    this.dismiss();
  }

}
