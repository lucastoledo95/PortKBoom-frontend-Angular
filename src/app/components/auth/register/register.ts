import { Component, inject, OnInit, signal, ViewChild} from '@angular/core';
import { RouterLink } from '@angular/router';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiMaster } from '../../../services/api-master';
import { validatorLogin } from '../../../utils/validators';
import { TitleDynamicService } from '../../../services/title-dynamic.service';
import { NotificationService } from '../../../services/notification.service';
import { RecaptchaModule, RecaptchaComponent } from 'ng-recaptcha'; 
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  imports: [RouterLink, ReactiveFormsModule, RecaptchaModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register implements OnInit {

  title = inject(TitleDynamicService);
  notification = inject(NotificationService);
  captchaToken = signal<string | null>(null); // recaptcha do google
  @ViewChild('captchaRef') captchaRef!: RecaptchaComponent;

  ApiMaster = inject(ApiMaster);

  logo = this.ApiMaster.logoUrl;
  banner = this.ApiMaster.bannerLoginUrl;

  formRegister!: FormGroup;


  onCaptchaResolved(token: string | null) {
    this.captchaToken.set(token);
    this.formRegister.get('recaptcha')?.setValue(token);
  }

  ngOnInit(): void {
    this.title.set('Cadastro');


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

      data_nascimento: new FormControl(''), // validator será adicionado depois

      telefone: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\(\d{2}\)\s?\d{4,5}-\d{4}$/)
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
    
      recaptcha: new FormControl('',
      Validators.required,
    )
  }, {
      validators: this.passwordsIguaisValidator
    });

    // adicionar validator que depende de outro control
    this.formRegister.controls['cpf_cnpj'].addValidators(
      validatorLogin.cpfOuCnpj(() => this.formRegister.controls['tipo_pessoa'].value)
    );

    // revalidar CPF/CNPJ quando o tipo mudar
    this.formRegister.controls['tipo_pessoa'].valueChanges.subscribe(tipo => {
      this.formRegister.controls['cpf_cnpj'].updateValueAndValidity();

      const dnValid = this.formRegister.controls['data_nascimento'];
      dnValid.clearValidators();
      if (tipo === 'pf') {
        dnValid.addValidators([
          Validators.required,
          validatorLogin.dataNascimento()
        ]);
      } else {
        dnValid.clearValidators();
        dnValid.addValidators([
          validatorLogin.dataNascimento(),
        ]);
      }
      dnValid.updateValueAndValidity();


    });



  }
constructor(private http: HttpClient) {
  
  this.ApiMaster.onLoginError.subscribe(() => {

    // Resetar captcha
    if (this.captchaRef) this.captchaRef.reset();

    // limpar form
    this.formRegister.get('recaptcha')?.reset();
    this.captchaToken.set(null);
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

  mascaraCpfCnpj(event: Event) {
    const input = event.target as HTMLInputElement;
    let valor = input.value;
    // remove qualquer coisa que não seja número
    valor = valor.replace(/\D/g, '');
    // limita a 14 dígitos (maior: CNPJ)
    valor = valor.slice(0, 14);
    input.value = valor;
    this.formRegister.get('cpf_cnpj')?.setValue(valor, { emitEvent: false });
  }

  mascaraData(event: Event) {
    const input = event.target as HTMLInputElement;
    let valor = input.value.replace(/\D/g, ""); // remove tudo que nao for número
    if (valor.length > 8) {
      valor = valor.slice(0, 8);
    }
    // Aplica a máscara DD/MM/YYYY
    if (valor.length > 4) {
      valor = valor.replace(/^(\d{2})(\d{2})(\d{0,4})$/, "$1/$2/$3");
    } else if (valor.length > 2) {
      valor = valor.replace(/^(\d{2})(\d{0,2})$/, "$1/$2");
    }
    input.value = valor;
    this.formRegister.get('data_nascimento')?.setValue(valor, { emitEvent: false });
  }


  mascaraTelefone(event: Event) {
    const input = event.target as HTMLInputElement;
    let valor = input.value;
    // Pega o que era antes de formatar
    const lastValue = input.getAttribute('data-last') || '';
    const isDeleting = valor.length < lastValue.length;
    // somente números
    let numeros = valor.replace(/\D/g, '');
    numeros = numeros.slice(0, 11);
    // Se está deletando // corrigido bug de deletar
    if (isDeleting) {
      input.setAttribute('data-last', numeros);
      input.value = numeros;
      this.formRegister.get('telefone')?.setValue(numeros, { emitEvent: false });
      return;
    }
    // Aplicar formatação
    if (numeros.length === 11) {
      // celular completo
      valor = numeros.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (numeros.length === 10) {
      // fixo completo
      valor = numeros.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
    } else if (numeros.length > 6) {
      // parcial celular
      valor = numeros.replace(/^(\d{2})(\d{5})(\d{0,4})$/, '($1) $2-$3');
    } else if (numeros.length > 2) {
      // parcial fixo
      valor = numeros.replace(/^(\d{2})(\d{0,4})$/, '($1) $2');
    } else if (numeros.length > 0) {
      valor = numeros.replace(/^(\d{0,2})$/, '($1');
    } else {
      valor = '';
    }
    input.setAttribute('data-last', valor);
    input.value = valor;
    this.formRegister.get('telefone')?.setValue(valor, { emitEvent: false });
  }



  onSubmit() {

    // Marca tudo como touched antes de validar
    this.formRegister.markAllAsTouched();

     const token = this.captchaToken();
    if (!token) {
      this.notification.error('CAPTCHA inválido, tente novamente.');
      return;
    }

    if (this.formRegister.invalid) {
      this.notification.error('Informações incorretas.');
      return;
    }

    const value = this.formRegister.value;

    if (value.tipo_pessoa !== 'pf' && value.tipo_pessoa !== 'pj') {
      this.notification.error('Selecione o tipo de pessoa.');
      return;
    }

    // Prepara os dados para enviar
    const dados = {
      name: value.name!,
      email: value.email!,
      password: value.password!,
      password_confirmation: value.password_confirmation!,
      tipo_pessoa: value.tipo_pessoa,
      cpf_cnpj: value.cpf_cnpj!,
      telefone: value.telefone!,
      inscricao_estadual: value.inscricao_estadual || '',
      data_nascimento: null as string | null,
      recaptcha_token: token
    };

    //  conveter data de  dd/mm/yyyy para dd-mm-yyyy para enviar a API 
    if (value.tipo_pessoa === 'pf' && value.data_nascimento) {
      dados.data_nascimento = value.data_nascimento.replace(/\//g, '-');
    }

    //  remover inscrição estadual caso sej PF
    if (value.tipo_pessoa === 'pf' && value.inscricao_estadual) {
      dados.inscricao_estadual = '';
    }

    // caso seja PJ envia vazio
    if (value.tipo_pessoa === 'pj') {
      dados.data_nascimento = '';
    }
    //console.log(dados)
    this.ApiMaster.onRegister(dados);
  }


}
