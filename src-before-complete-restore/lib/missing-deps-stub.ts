// Additional stub implementations for any missing dependencies

// Stub for Stripe if needed
export const stripe = {
  customers: {
    create: async () => ({ id: 'cus_stub' }),
    retrieve: async () => ({ id: 'cus_stub' }),
    update: async () => ({ id: 'cus_stub' })
  },
  subscriptions: {
    create: async () => ({ id: 'sub_stub' }),
    retrieve: async () => ({ id: 'sub_stub' }),
    update: async () => ({ id: 'sub_stub' }),
    cancel: async () => ({ id: 'sub_stub' })
  },
  paymentIntents: {
    create: async () => ({ id: 'pi_stub' }),
    retrieve: async () => ({ id: 'pi_stub' })
  },
  checkout: {
    sessions: {
      create: async () => ({ id: 'cs_stub', url: '/checkout' })
    }
  }
};

// Stub for OpenAI if needed
export const openai = {
  chat: {
    completions: {
      create: async () => ({
        choices: [{ message: { content: 'Stub response' } }]
      })
    }
  }
};

// Stub for any weather API
export const weatherAPI = {
  getCurrentWeather: async () => ({
    temperature: 72,
    humidity: 50,
    conditions: 'Clear'
  }),
  getForecast: async () => ([])
};

// Stub for any analytics service
export const analytics = {
  track: async () => {},
  page: async () => {},
  identify: async () => {}
};

// Export a generic stub factory
export const createStub = (name: string) => {
  return new Proxy({}, {
    get: (target, prop) => {
      if (typeof prop === 'string') {
        return async (...args: any[]) => {
          console.warn(`Stub called: ${name}.${prop}`, args);
          return null;
        };
      }
      return undefined;
    }
  });
};