import { useSyncExternalStore } from "react";
import type { AgreementKey, RegisterForm } from "../type/register";

type RegisterActions = {
  setField: <K extends keyof RegisterForm>(key: K, value: RegisterForm[K]) => void;
  setAgreement: (key: AgreementKey, value: boolean) => void;
  setAllAgreements: (value: boolean) => void;
  addAllergy: (value: string) => void;
  removeAllergy: (value: string) => void;
  toggleAllergy: (value: string) => void;
  resetRegister: () => void;
};

type RegisterStore = RegisterForm & RegisterActions;

const initialState: RegisterForm = {
  agreements: {
    terms: false,
    privacy: false,
    age: false,
    marketing: false,
  },
  nickname: "",
  email: "",
  code: "",
  password: "",
  confirmPassword: "",
  introduce: "",
  address: "",
  allergies: [],
};

let registerState: RegisterForm = initialState;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

const setRegisterState = (
  updater: Partial<RegisterForm> | ((state: RegisterForm) => RegisterForm)
) => {
  registerState =
    typeof updater === "function" ? updater(registerState) : { ...registerState, ...updater };
  emit();
};

const actions: RegisterActions = {
  setField: (key, value) => {
    setRegisterState({ [key]: value } as Partial<RegisterForm>);
  },
  setAgreement: (key, value) => {
    setRegisterState((state) => ({
      ...state,
      agreements: {
        ...state.agreements,
        [key]: value,
      },
    }));
  },
  setAllAgreements: (value) => {
    setRegisterState({
      agreements: {
        terms: value,
        privacy: value,
        age: value,
        marketing: value,
      },
    });
  },
  addAllergy: (value) => {
    const trimmed = value.trim();
    if (!trimmed || registerState.allergies.includes(trimmed)) return;
    setRegisterState((state) => ({ ...state, allergies: [...state.allergies, trimmed] }));
  },
  removeAllergy: (value) => {
    setRegisterState((state) => ({
      ...state,
      allergies: state.allergies.filter((item) => item !== value),
    }));
  },
  toggleAllergy: (value) => {
    setRegisterState((state) => ({
      ...state,
      allergies: state.allergies.includes(value)
        ? state.allergies.filter((item) => item !== value)
        : [...state.allergies, value],
    }));
  },
  resetRegister: () => {
    setRegisterState(initialState);
  },
};

const getSnapshot = (): RegisterStore => ({
  ...registerState,
  ...actions,
});

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useRegisterStore = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
