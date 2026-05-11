import { create } from "zustand";
import type { AgreementKey, RegisterForm } from "../type/register";

type RegisterStore = RegisterForm & {
  setField: <K extends keyof RegisterForm>(
    key: K,
    value: RegisterForm[K]
  ) => void;

  setAgreement: (key: AgreementKey, value: boolean) => void;
  setAllAgreements: (value: boolean) => void;

  addAllergy: (value: string) => void;
  removeAllergy: (value: string) => void;
  toggleAllergy: (value: string) => void;

  resetRegister: () => void;
};

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

export const useRegisterStore = create<RegisterStore>((set) => ({
  ...initialState,

  setField: (key, value) => {
    set({ [key]: value } as Pick<RegisterStore, typeof key>);
  },

  setAgreement: (key, value) => {
    set((state) => ({
      agreements: {
        ...state.agreements,
        [key]: value,
      },
    }));
  },

  setAllAgreements: (value) => {
    set({
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
    if (!trimmed) return;

    set((state) => {
      if (state.allergies.includes(trimmed)) return state;

      return {
        allergies: [...state.allergies, trimmed],
      };
    });
  },

  removeAllergy: (value) => {
    set((state) => ({
      allergies: state.allergies.filter((item) => item !== value),
    }));
  },

  toggleAllergy: (value) => {
    set((state) => {
      if (state.allergies.includes(value)) {
        return {
          allergies: state.allergies.filter((item) => item !== value),
        };
      }

      return {
        allergies: [...state.allergies, value],
      };
    });
  },

  resetRegister: () => {
    set(initialState);
  },
}));