export type RegisterStep = 1 | 2 | 3 | 4;

export type Agreements = {
  terms: boolean;
  privacy: boolean;
  age: boolean;
  marketing: boolean;
};

export type RegisterForm = {
  agreements: Agreements;

  nickname: string;
  email: string;
  code: string;
  password: string;
  confirmPassword: string;

  introduce: string;
  address: string;

  allergies: string[];
};

export type AgreementKey = keyof Agreements;