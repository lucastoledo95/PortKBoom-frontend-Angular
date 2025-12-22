import { Component, inject, OnInit, signal, ViewChild  } from '@angular/core';
import { ApiMaster, LoginDados } from '../../../services/api-master';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { validatorLogin } from '../../../utils/validators';
import { TitleDynamicService } from '../../../services/title-dynamic.service';
import { NotificationService } from '../../../services/notification.service';
import { RecaptchaModule, RecaptchaComponent } from 'ng-recaptcha'; 
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
  @ViewChild('captchaRef') captchaRef!: RecaptchaComponent;


  ApiMaster = inject(ApiMaster);
  logo = this.ApiMaster.logoUrl;
  banner = this.ApiMaster.bannerLoginUrl;

showPassword = false;

  formLogin = new FormGroup({
    login: new FormControl('', [
      Validators.required,
      validatorLogin.campoLogin()
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/)
    ]),
      
  recaptcha: new FormControl('',
      Validators.required,
    )
      
  });


  constructor(private http: HttpClient) {
    //  this.ApiMaster.getUser();

  this.ApiMaster.onLoginError.subscribe(() => {

    // Resetar captcha
    if (this.captchaRef) this.captchaRef.reset();

    // limpar form
    this.formLogin.get('recaptcha')?.reset();
    this.captchaToken.set(null);
  });

  }


  onCaptchaResolved(token: string | null) {
    this.captchaToken.set(token);
    this.formLogin.get('recaptcha')?.setValue(token);
  }


  ngOnInit(): void {

    this.title.set('Identificação'); // titulo da rota.
  }

  onSubmit() {

     // Marca tudo como touched antes de validar
    this.formLogin.markAllAsTouched();

     const token = this.captchaToken();
    if (!token) {
      this.notification.error('CAPTCHA inválido, tente novamente.');
      return
    }

    if (this.formLogin.invalid) {
      this.notification.error('Informações incorretas.');
      return
    }

    const { login, password } = this.formLogin.value;

    const dados: LoginDados = {
      login: login ?? '',
      password: password ?? '',
      recaptcha_token: token
    };

    this.ApiMaster.onLogin(dados)
  }

togglePassword() {
  this.showPassword = !this.showPassword;
}


}
