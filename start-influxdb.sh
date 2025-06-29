#!/bin/bash

# Start InfluxDB 3 Enterprise for Vibelux

echo "Starting InfluxDB 3 Enterprise for Vibelux..."

# Set environment variables
export INFLUXDB_DATA_DIR="/Users/blakelange/vibelux-app/influxdb-data"
export INFLUXDB_CONFIG_PATH="/Users/blakelange/vibelux-app/influxdb-config.toml"

# Create initial admin user and database
export INFLUXDB_ADMIN_USER=vibelux_admin
export INFLUXDB_ADMIN_PASSWORD=vibelux_secure_password_2024
export INFLUXDB_DB=vibelux_sensors

# Start InfluxDB
influxdb3 serve \
  --data-dir="$INFLUXDB_DATA_DIR" \
  --http-bind-address=":8086" \
  --reporting-disabled \
  2>&1 | tee influxdb.log &

# Save PID
echo $! > influxdb.pid

echo "InfluxDB started with PID: $(cat influxdb.pid)"
echo "HTTP endpoint: http://localhost:8086"
echo ""
echo "To stop InfluxDB, run: kill $(cat influxdb.pid)"
echo "To view logs: tail -f influxdb.log"