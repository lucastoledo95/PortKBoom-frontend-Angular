import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiMaster } from '../../../services/api-master';
import { validatorLogin } from '../../../utils/validators';
import { TitleDynamicService } from '../../../services/title-dynamic.service';
import { NotificationService } from '../../../services/notification.service';
import { RecaptchaModule } from 'ng-recaptcha';

@Component({
  selector: 'app-register',
  imports: [RouterLink, ReactiveFormsModule, RecaptchaModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register implements OnInit {

  title = inject(TitleDynamicService);
  notification = inject(NotificationService);
  ApiMaster = inject(ApiMaster);

  logo = this.ApiMaster.logoUrl;
  banner = this.ApiMaster.bannerLoginUrl;

  formRegister!: FormGroup;

  ngOnInit(): void {
    this.title.set('Cadastro');

    // 1) Criar grupo primeiro
    this.formRegister = new FormGroup({
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(100),
      ]),

      email: new FormControl('', [
        Validators.required,
        validatorLogin.email(),
      ]),

      tipo_pessoa: new FormControl<'pf' | 'pj' | ''>('', [
        Validators.required,
      ]),

      cpf_cnpj: new FormControl('', [
        Validators.required
        // validator será adicionado depois
      ]),

      telefone: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/),
      ]),

      inscricao_estadual: new FormControl(''),

      password: new FormControl('', [
        Validators.required,
        Validators.pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/
        ),
      ]),

      password_confirmation: new FormControl('', [
        Validators.required,
      ]),
    }, {
      validators: this.passwordsIguaisValidator
    });

    // adicionar validator que depende de outro control
    this.formRegister.controls['cpf_cnpj'].addValidators(
      validatorLogin.cpfOuCnpj(() => this.formRegister.controls['tipo_pessoa'].value)
    );

    // Revalidar CPF/CNPJ quando o tipo mudar
    this.formRegister.controls['tipo_pessoa'].valueChanges.subscribe(() => {
      this.formRegister.controls['cpf_cnpj'].updateValueAndValidity();
    });
  }

  passwordsIguaisValidator(group: AbstractControl) {
    const password = group.get('password')?.value;
    const confirm = group.get('password_confirmation')?.value;

    if (!password || !confirm) return null;

    return password === confirm
      ? null
      : { senhasDiferentes: true };
  }

  onSubmit() {

    if (this.formRegister.invalid) {
      this.notification.error('Informações incorretas.');
      return;
    }
    
  const value = this.formRegister.value;

  if (value.tipo_pessoa !== 'pf' && value.tipo_pessoa !== 'pj') {
    this.notification.error('Selecione o tipo de pessoa.');
    return;
  }

    const dados = {
      name: this.formRegister.value.name!,
      email: this.formRegister.value.email!,
      password: this.formRegister.value.password!,
      password_confirmation: this.formRegister.value.password_confirmation!,
      tipo_pessoa: value.tipo_pessoa,
      cpf_cnpj: this.formRegister.value.cpf_cnpj!,
      telefone: this.formRegister.value.telefone!,
      inscricao_estadual: this.formRegister.value.inscricao_estadual || ''
    };

    this.ApiMaster.onRegister(dados);
  }

}
