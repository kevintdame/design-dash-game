import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

const isBase44Disabled = !appId || appId === 'null' || appId === 'undefined';

const mockAuth = {
  me: async () => ({ id: 'designer_kevin', email: 'kevin@example.com' }),
  resetPasswordRequest: async () => ({}),
  loginViaEmailPassword: async () => ({}),
  loginWithProvider: () => {},
  register: async () => ({}),
  verifyOtp: async () => ({ access_token: 'mock-token' }),
  setToken: () => {},
  resendOtp: async () => ({}),
  resetPassword: async () => ({})
};

const mockEntities = {
  GameSession: {
    create: async (data) => ({ id: String(Date.now()), ...data }),
    get: async (id) => ({ id }),
    filter: async () => []
  }
};

export const base44 = isBase44Disabled
  ? {
      auth: mockAuth,
      entities: mockEntities,
      integrations: {
        Core: {
          InvokeLLM: async () => ({ text: "{}" }),
          GenerateImage: async () => ({ url: "" })
        }
      }
    }
  : createClient({
      appId,
      token,
      functionsVersion,
      serverUrl: '',
      requiresAuth: false,
      appBaseUrl
    });
