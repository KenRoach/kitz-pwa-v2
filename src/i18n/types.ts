export type Locale = 'es-PA' | 'en-US' | 'pt-BR';

export interface Dictionary {
  nav: {
    chat: string;
    contacts: string;
    quotes: string;
    more: string;
  };
  chat: {
    placeholder: string;
    send: string;
    stop: string;
    voiceHint: string;
    credits: string;
    newChat: string;
    agentPicker: string;
  };
  contacts: {
    title: string;
    search: string;
    add: string;
    empty: string;
    call: string;
    whatsapp: string;
  };
  quotes: {
    title: string;
    create: string;
    search: string;
    empty: string;
    draft: string;
    sent: string;
    accepted: string;
    rejected: string;
  };
  common: {
    loading: string;
    error: string;
    retry: string;
    cancel: string;
    save: string;
    delete: string;
    back: string;
    offline: string;
    install: string;
    installHint: string;
  };
  auth: {
    login: string;
    email: string;
    otp: string;
    verifyCode: string;
    logout: string;
  };
}
