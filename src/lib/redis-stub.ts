// Stub Redis connection
export const redis = {
  get: async () => null,
  set: async () => 'OK',
  del: async () => 1,
  expire: async () => 1,
  hget: async () => null,
  hset: async () => 1,
  hmget: async () => [],
  hmset: async () => 'OK',
  zadd: async () => 1,
  zrange: async () => [],
  publish: async () => 1,
  subscribe: async () => {},
  on: () => {}
};
