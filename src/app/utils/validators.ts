import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

function validarCPF(cpf: string): boolean {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const calc = (base: string, fator: number) =>
    base.split('').reduce((soma, num) => soma + +num * fator--, 0);

  const dv1 = (calc(cpf.slice(0, 9), 10) * 10) % 11 % 10;
  const dv2 = (calc(cpf.slice(0, 10), 11) * 10) % 11 % 10;

  return dv1 === +cpf[9] && dv2 === +cpf[10];
}

function validarCNPJ(cnpj: string): boolean {
  cnpj = cnpj.replace(/\D/g, '');
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;

  const calc = (base: string, pesos: number[]) =>
    base.split('').reduce((soma, num, i) => soma + +num * pesos[i], 0);

  const base = cnpj.slice(0, 12);
  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const pesos2 = [6].concat(pesos1);

  const dv1 = 11 - (calc(base, pesos1) % 11);
  const dv2 = 11 - (calc(base + (dv1 >= 10 ? 0 : dv1), pesos2) % 11);

  const validDV1 = dv1 >= 10 ? 0 : dv1;
  const validDV2 = dv2 >= 10 ? 0 : dv2;

  return validDV1 === +cnpj[12] && validDV2 === +cnpj[13];
}

export const validatorLogin = {
  email: (): ValidatorFn => {
    const emailFormato =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
    return (control: AbstractControl): ValidationErrors | null => {
      const val = control.value;
      if (!val) return null;
      return emailFormato.test(val) ? null : { emailInvalido: true };
    };
  },

  cpf: (): ValidatorFn => {
    return (control: AbstractControl): ValidationErrors | null => {
      const val = control.value;
      if (!val) return null;
      const digitos = val.replace(/\D/g, '');
      return validarCPF(digitos) ? null : { cpfInvalido: true };
    };
  },

  cnpj: (): ValidatorFn => {
    return (control: AbstractControl): ValidationErrors | null => {
      const val = control.value;
      if (!val) return null;
      const digitos = val.replace(/\D/g, '');
      return validarCNPJ(digitos) ? null : { cnpjInvalido: true };
    };
  },

  campoLogin: (): ValidatorFn => {
    const emailFormato =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;

    return (control: AbstractControl): ValidationErrors | null => {
      const val = control.value?.toString().trim();
      if (!val) return null;

      if (val.includes('@')) {
        return emailFormato.test(val) ? null : { emailInvalido: true };
      }

      const digitos = val.replace(/\D/g, '');

      if (digitos.length >= 11 && digitos.length <= 14) {
        if (digitos.length <= 11) {
          return validarCPF(digitos) ? null : { cpfInvalido: true };
        } else {
          return validarCNPJ(digitos) ? null : { cnpjInvalido: true };
        }
      }

      if (digitos.length > 14) {
        return { tamanhoInvalido: true };
      }

      return { loginInvalido: true };
    };
  },

  cpfOuCnpj: (): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const val = control.value?.toString().trim();
    if (!val) return null;

    // só números
    if (!/^\d+$/.test(val)) {
      return { apenasNumeros: true };
    }

    if (val.length === 11) {
      return validarCPF(val) ? null : { cpfInvalido: true };
    }

    if (val.length === 14) {
      return validarCNPJ(val) ? null : { cnpjInvalido: true };
    }

    return { tamanhoInvalido: true };
  };
},

};

