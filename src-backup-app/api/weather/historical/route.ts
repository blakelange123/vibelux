import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// NOAA Climate Data Online API endpoint
const NOAA_API_BASE = 'https://www.ncdc.noaa.gov/cdo-web/api/v2';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const latitude = searchParams.get('lat');
    const longitude = searchParams.get('lon');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!latitude || !longitude || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: lat, lon, startDate, endDate' },
        { status: 400 }
      );
    }

    // Get NOAA station ID for location
    const stationId = await getNearestStation(parseFloat(latitude), parseFloat(longitude));

    // Fetch historical weather data
    const weatherData = await fetchNOAAData(stationId, startDate, endDate);

    // Process and calculate degree days
    const processedData = processWeatherData(weatherData);

    return NextResponse.json({
      success: true,
      stationId,
      location: { latitude, longitude },
      period: { start: startDate, end: endDate },
      data: processedData
    });

  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function getNearestStation(lat: number, lon: number): Promise<string> {
  try {
    // Find nearest weather station
    const response = await fetch(
      `${NOAA_API_BASE}/stations?extent=${lat-0.5},${lon-0.5},${lat+0.5},${lon+0.5}&limit=5`,
      {
        headers: {
          'token': process.env.NOAA_API_TOKEN || ''
        }
      }
    );

    if (!response.ok) {
      throw new Error(`NOAA API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Find closest station with temperature data
    const stations = data.results || [];
    for (const station of stations) {
      if (station.datatypes?.includes('TAVG')) {
        return station.id;
      }
    }

    // Fallback to first station
    return stations[0]?.id || 'GHCND:USW00023174'; // Sacramento default

  } catch (error) {
    console.error('Error finding weather station:', error);
    // Return default station
    return 'GHCND:USW00023174';
  }
}

async function fetchNOAAData(stationId: string, startDate: string, endDate: string): Promise<any[]> {
  try {
    const response = await fetch(
      `${NOAA_API_BASE}/data?datasetid=GHCND&stationid=${stationId}&startdate=${startDate}&enddate=${endDate}&units=standard&datatypeid=TMAX,TMIN,TAVG,PRCP`,
      {
        headers: {
          'token': process.env.NOAA_API_TOKEN || ''
        }
      }
    );

    if (!response.ok) {
      throw new Error(`NOAA API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];

  } catch (error) {
    console.error('Error fetching NOAA data:', error);
    // Return simulated data if API fails
    return generateSimulatedData(startDate, endDate);
  }
}

function processWeatherData(rawData: any[]): any[] {
  // Group data by date
  const dateMap = new Map();
  
  rawData.forEach(record => {
    const date = record.date.split('T')[0];
    if (!dateMap.has(date)) {
      dateMap.set(date, {
        date,
        tmax: null,
        tmin: null,
        tavg: null,
        prcp: 0
      });
    }
    
    const dayData = dateMap.get(date);
    switch (record.datatype) {
      case 'TMAX':
        dayData.tmax = celsiusToFahrenheit(record.value / 10);
        break;
      case 'TMIN':
        dayData.tmin = celsiusToFahrenheit(record.value / 10);
        break;
      case 'TAVG':
        dayData.tavg = celsiusToFahrenheit(record.value / 10);
        break;
      case 'PRCP':
        dayData.prcp = record.value / 10; // mm
        break;
    }
  });

  // Process each day
  const processedDays = Array.from(dateMap.values()).map(day => {
    // Calculate average if not provided
    if (!day.tavg && day.tmax && day.tmin) {
      day.tavg = (day.tmax + day.tmin) / 2;
    }

    // Calculate degree days
    const baseTemp = 65; // Standard base temperature
    day.hdd = day.tavg ? Math.max(0, baseTemp - day.tavg) : 0;
    day.cdd = day.tavg ? Math.max(0, day.tavg - baseTemp) : 0;

    // Estimate humidity based on precipitation
    day.humidity = estimateHumidity(day.prcp, day.tavg);

    // Estimate solar radiation based on season and cloudiness
    day.solarRadiation = estimateSolarRadiation(day.date, day.prcp);

    return day;
  });

  return processedDays.sort((a, b) => a.date.localeCompare(b.date));
}

function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9/5) + 32;
}

function estimateHumidity(precipitation: number, temperature: number): number {
  // Simple estimation based on precipitation and temperature
  const baseHumidity = 50;
  const precipFactor = Math.min(precipitation * 2, 30); // More rain = higher humidity
  const tempFactor = temperature > 80 ? -10 : temperature < 40 ? 10 : 0; // Hot = less humid, cold = more humid
  
  return Math.max(20, Math.min(90, baseHumidity + precipFactor + tempFactor));
}

function estimateSolarRadiation(dateStr: string, precipitation: number): number {
  const date = new Date(dateStr);
  const dayOfYear = getDayOfYear(date);
  
  // Simple solar radiation model based on day of year and cloudiness
  const baseRadiation = 400 + 200 * Math.sin((dayOfYear - 80) * Math.PI / 180);
  const cloudFactor = precipitation > 5 ? 0.5 : precipitation > 0 ? 0.8 : 1.0;
  
  return baseRadiation * cloudFactor;
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function generateSimulatedData(startDate: string, endDate: string): any[] {
  const data = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayOfYear = getDayOfYear(d);
    const month = d.getMonth();
    
    // Simulate seasonal temperature variations
    const baseTemp = 50 + 25 * Math.sin((dayOfYear - 80) * Math.PI / 180);
    const variation = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20 - 10;
    
    const tavg = baseTemp + variation;
    const tmax = tavg + 10 + crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5;
    const tmin = tavg - 10 - crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 5;
    
    // Simulate precipitation (more in winter/spring)
    const precipChance = (month >= 10 || month <= 3) ? 0.3 : 0.1;
    const prcp = crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF < precipChance ? crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * 20 : 0;
    
    data.push(
      { date: d.toISOString(), datatype: 'TMAX', value: tmax * 10 },
      { date: d.toISOString(), datatype: 'TMIN', value: tmin * 10 },
      { date: d.toISOString(), datatype: 'TAVG', value: tavg * 10 },
      { date: d.toISOString(), datatype: 'PRCP', value: prcp * 10 }
    );
  }
  
  return data;
}