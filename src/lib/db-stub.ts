// Stub database connection
export const db = {
  query: async () => ({ rows: [] }),
  connect: async () => {},
  end: async () => {}
};

export const prisma = new Proxy({}, {
  get: () => new Proxy({}, {
    get: () => async () => null
  })
});
