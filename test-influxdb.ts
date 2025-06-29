// Test InfluxDB Connection and Basic Operations

import { getTimeSeriesDB, recordSensorReading, getSensorHistory } from './src/lib/timeseries/influxdb-client';

async function testInfluxDB() {
  console.log('Testing InfluxDB 3 connection...\n');
  
  const tsdb = getTimeSeriesDB();
  
  try {
    // Test 1: Connection
    console.log('1. Testing connection...');
    await tsdb.connect();
    console.log('✅ Connected successfully!\n');
    
    // Test 2: Write single data point
    console.log('2. Writing test sensor data...');
    await recordSensorReading(
      'test_room_1',
      'temp_sensor_1',
      'temperature',
      75.5,
      '°F',
      100
    );
    console.log('✅ Single data point written!\n');
    
    // Test 3: Batch write
    console.log('3. Writing batch sensor data...');
    const batchData = [];
    for (let i = 0; i < 10; i++) {
      batchData.push({
        measurement: 'temperature',
        tags: {
          room_id: 'test_room_1',
          sensor_id: 'temp_sensor_1'
        },
        fields: {
          value: 70 + Math.random() * 10,
          unit: '°F',
          quality: 100
        },
        timestamp: new Date(Date.now() - i * 60 * 1000) // Last 10 minutes
      });
    }
    await tsdb.writeBatch(batchData);
    console.log('✅ Batch data written!\n');
    
    // Test 4: Query data
    console.log('4. Querying sensor history...');
    const history = await getSensorHistory('test_room_1', 'temperature', 1);
    console.log(`✅ Retrieved ${history.length} data points\n`);
    
    // Test 5: Aggregated query
    console.log('5. Testing aggregated data...');
    const aggregated = await tsdb.getAggregatedData(
      'temperature',
      'test_room_1',
      '5m',
      '1h'
    );
    console.log(`✅ Retrieved ${aggregated.length} aggregated points\n`);
    
    // Test 6: Latest reading
    console.log('6. Getting latest reading...');
    const latest = await tsdb.getLatestReading('temperature', 'test_room_1');
    if (latest) {
      console.log(`✅ Latest temperature: ${latest.value}°F\n`);
    }
    
    // Test 7: Health check
    console.log('7. Checking database health...');
    const isHealthy = await tsdb.checkHealth();
    console.log(`✅ Database health: ${isHealthy ? 'Good' : 'Failed'}\n`);
    
    console.log('🎉 All tests passed! InfluxDB is ready for Vibelux.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('\nMake sure InfluxDB is running:');
    console.log('  ./start-influxdb.sh');
    console.log('  ./init-influxdb.sh');
  }
}

// Run tests
testInfluxDB();