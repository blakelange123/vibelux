// Stub services
export const emailService = {
  send: async () => ({ messageId: 'stub' })
};

export const smsService = {
  send: async () => ({ sid: 'stub' })
};

export const storageService = {
  upload: async () => ({ url: '/placeholder.jpg' }),
  delete: async () => true
};
