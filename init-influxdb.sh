#!/bin/bash

# Initialize InfluxDB for Vibelux

echo "Initializing InfluxDB for Vibelux..."

# Wait for InfluxDB to be ready
sleep 5

# InfluxDB 3 uses SQL-based commands
# Create organization and buckets using the CLI

# Create the main sensor data bucket with different retention policies
influxdb3 query "
CREATE DATABASE vibelux_sensors;

-- Create tables for different sensor types
CREATE TABLE IF NOT EXISTS vibelux_sensors.temperature (
    time TIMESTAMP,
    room_id STRING,
    sensor_id STRING,
    value DOUBLE,
    unit STRING,
    quality INTEGER,
    PRIMARY KEY (time, room_id, sensor_id)
);

CREATE TABLE IF NOT EXISTS vibelux_sensors.humidity (
    time TIMESTAMP,
    room_id STRING,
    sensor_id STRING,
    value DOUBLE,
    unit STRING,
    quality INTEGER,
    PRIMARY KEY (time, room_id, sensor_id)
);

CREATE TABLE IF NOT EXISTS vibelux_sensors.co2 (
    time TIMESTAMP,
    room_id STRING,
    sensor_id STRING,
    value DOUBLE,
    unit STRING,
    quality INTEGER,
    PRIMARY KEY (time, room_id, sensor_id)
);

CREATE TABLE IF NOT EXISTS vibelux_sensors.light (
    time TIMESTAMP,
    room_id STRING,
    sensor_id STRING,
    ppfd DOUBLE,
    spectrum JSON,
    unit STRING,
    PRIMARY KEY (time, room_id, sensor_id)
);

CREATE TABLE IF NOT EXISTS vibelux_sensors.ph (
    time TIMESTAMP,
    room_id STRING,
    reservoir_id STRING,
    value DOUBLE,
    temperature DOUBLE,
    PRIMARY KEY (time, room_id, reservoir_id)
);

CREATE TABLE IF NOT EXISTS vibelux_sensors.ec (
    time TIMESTAMP,
    room_id STRING,
    reservoir_id STRING,
    value DOUBLE,
    temperature DOUBLE,
    tds DOUBLE,
    PRIMARY KEY (time, room_id, reservoir_id)
);

-- Create aggregated data tables
CREATE TABLE IF NOT EXISTS vibelux_sensors.hourly_avg (
    time TIMESTAMP,
    room_id STRING,
    metric STRING,
    avg_value DOUBLE,
    min_value DOUBLE,
    max_value DOUBLE,
    count INTEGER,
    PRIMARY KEY (time, room_id, metric)
);

CREATE TABLE IF NOT EXISTS vibelux_sensors.daily_summary (
    date DATE,
    room_id STRING,
    metric STRING,
    avg_value DOUBLE,
    min_value DOUBLE,
    max_value DOUBLE,
    std_dev DOUBLE,
    PRIMARY KEY (date, room_id, metric)
);
"

echo "InfluxDB initialized successfully!"
echo ""
echo "Databases created:"
echo "  - vibelux_sensors (main sensor data)"
echo ""
echo "Tables created:"
echo "  - temperature, humidity, co2, light, ph, ec"
echo "  - hourly_avg, daily_summary"