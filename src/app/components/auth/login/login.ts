import { Component, inject, OnInit, signal } from '@angular/core';
import { ApiMaster, LoginDados } from '../../../services/api-master';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { validatorLogin } from '../../../utils/validator-login';
import { TitleDynamicService } from '../../../services/title-dynamic.service';
import { NotificationService } from '../../../services/notification.service';
import { RecaptchaModule } from 'ng-recaptcha';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule, RecaptchaModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  title = inject(TitleDynamicService);
  notification = inject(NotificationService)
  captchaToken = signal<string | null>(null);

  ApiMaster = inject(ApiMaster);
  logo = this.ApiMaster.logoUrl;
  banner = this.ApiMaster.bannerLoginUrl;

  formLogin = new FormGroup({
    login: new FormControl('', [
      Validators.required,
      validatorLogin.campoLogin()
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/)
    ]),
    /*  
  recaptcha: new FormControl('',
      Validators.required,
    )
      */
  });


  constructor(private http: HttpClient) {
    //  this.ApiMaster.getUser();

  }

/* 
  onCaptchaResolved(token: string | null) {
    this.captchaToken.set(token);
    this.formLogin.get('recaptcha')?.setValue(token);
  }
*/

  ngOnInit(): void {

    this.title.set('Identificação'); // titulo da rota.
  }

  onSubmit() {
 /*     const token = this.captchaToken();
    if (!token) {
      this.notification.error('CAPTCHA inválido, tente novamente.');
      return
    }
*/

    if (this.formLogin.invalid) {
      this.notification.error('Informações incorretas.');
      return
    }

    const { login, password } = this.formLogin.value;

    const dados: LoginDados = {
      login: login ?? '',
      password: password ?? '',
      //recaptcha_token: token
    };

    this.ApiMaster.onLogin(dados)
  }




}
