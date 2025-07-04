#!/bin/bash

# Create stub implementations for missing dependencies

echo "Creating stub implementations for missing dependencies..."

# Create stubs for common missing dependencies
create_stub() {
    local file_path="$1"
    local content="$2"
    
    if [ ! -f "$file_path" ]; then
        mkdir -p "$(dirname "$file_path")"
        echo "$content" > "$file_path"
        echo "Created stub: $file_path"
    fi
}

# Stub for missing database connections
create_stub "src/lib/db-stub.ts" "// Stub database connection
export const db = {
  query: async () => ({ rows: [] }),
  connect: async () => {},
  end: async () => {}
};

export const prisma = new Proxy({}, {
  get: () => new Proxy({}, {
    get: () => async () => null
  })
});"

# Stub for missing Redis connection
create_stub "src/lib/redis-stub.ts" "// Stub Redis connection
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
};"

# Stub for missing InfluxDB connection
create_stub "src/lib/influxdb-stub.ts" "// Stub InfluxDB connection
export const influxDB = {
  write: async () => {},
  query: async () => [],
  close: async () => {}
};"

# Stub for missing Pusher connection
create_stub "src/lib/pusher-stub.ts" "// Stub Pusher connection
export const pusher = {
  trigger: async () => ({}),
  triggerBatch: async () => ({}),
  authenticate: () => ({ auth: '' })
};"

# Stub for missing services
create_stub "src/lib/services-stub.ts" "// Stub services
export const emailService = {
  send: async () => ({ messageId: 'stub' })
};

export const smsService = {
  send: async () => ({ sid: 'stub' })
};

export const storageService = {
  upload: async () => ({ url: '/placeholder.jpg' }),
  delete: async () => true
};"

# Create index file for easy imports
create_stub "src/lib/stubs/index.ts" "// Export all stubs
export * from '../db-stub';
export * from '../redis-stub';
export * from '../influxdb-stub';
export * from '../pusher-stub';
export * from '../services-stub';"

echo "Stub creation complete!"