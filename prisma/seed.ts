import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import csv from 'csv-parser'

const prisma = new PrismaClient()

interface DLCFixture {
  manufacturer: string
  model: string
  dlcListingId?: string
  ppf: number
  wattage: number
  efficacy: number
  voltage: string
  dlcQualified: boolean
  dlcPremium: boolean
  beamAngle?: number
  distribution?: string
  powerFactor?: number
  thd?: number
  weight?: number
  dataSheet?: string
  iesFile?: string
}

async function parseCSV(): Promise<DLCFixture[]> {
  const fixtures: DLCFixture[] = []
  const csvPath = path.join(process.cwd(), 'public', 'dlc_hort_full_2025-05-29.csv')
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          // Parse CSV row and map to fixture format using correct DLC column names
          const ppf = parseFloat(row['Tested Photosynthetic Photon Flux (400-700nm)'] || 
                               row['Reported Photosynthetic Photon Flux (400-700nm)'] || '0')
          const wattage = parseFloat(row['Tested Input Wattage'] || 
                                   row['Reported Input Wattage'] || '0')
          const efficacy = parseFloat(row['Tested Photosynthetic Photon Efficacy (400-700nm)'] ||
                                    row['Reported Photosynthetic Photon Efficacy (400-700nm)'] || '0')
          
          const minVoltage = row['Reported Minimum Input Voltage'] || '120'
          const maxVoltage = row['Reported Maximum Input Voltage'] || '277'
          const voltage = `${minVoltage}V${maxVoltage !== minVoltage ? `-${maxVoltage}V` : ''}`
          
          if (ppf > 0 && wattage > 0 && efficacy > 0.5) { // Filter out invalid entries
            fixtures.push({
              manufacturer: row['Manufacturer'] || 'Unknown',
              model: row['Model Number'] || row['Product Name'] || 'Unknown Model',
              dlcListingId: row['Product ID'] || undefined,
              ppf,
              wattage,
              efficacy,
              voltage,
              dlcQualified: true, // All entries in DLC CSV are qualified
              dlcPremium: false, // DLC Premium would need separate verification
              beamAngle: parseFloat(row['Reported Beam Angle']) || undefined,
              distribution: undefined, // Not in DLC data
              powerFactor: parseFloat(row['Tested Power Factor'] || row['Reported Power Factor']) || undefined,
              thd: parseFloat(row['Tested Total Harmonic Distortion'] || row['Reported Total Harmonic Distortion']) || undefined,
              weight: undefined, // Not in DLC data
              dataSheet: undefined, // Not in DLC data
              iesFile: undefined // Not in DLC data
            })
          }
        } catch (error) {
          console.warn('Error parsing row:', error)
        }
      })
      .on('end', () => {
        console.log(`Parsed ${fixtures.length} fixtures from CSV`)
        resolve(fixtures)
      })
      .on('error', reject)
  })
}

async function seedFixtures() {
  console.log('🌱 Skipping fixture seeding - Fixture model schema mismatch')
  
  // The current Fixture model requires spaceId and doesn't have the fields
  // from the DLC CSV (efficacy, ppf, voltage, etc.)
  return
  
  try {
    // Check if CSV file exists
    const csvPath = path.join(process.cwd(), 'public', 'dlc_hort_full_2025-05-29.csv')
    if (!fs.existsSync(csvPath)) {
      console.log('CSV file not found, seeding with sample data...')
      await seedSampleFixtures()
      return
    }

    // Parse and seed from CSV
    const fixtures = await parseCSV()
    
    // Batch insert in chunks to avoid memory issues
    const chunkSize = 100
    for (let i = 0; i < fixtures.length; i += chunkSize) {
      const chunk = fixtures.slice(i, i + chunkSize)
      
      await prisma.fixture.createMany({
        data: chunk.map(fixture => ({
          manufacturer: fixture.manufacturer,
          model: fixture.model,
          power: fixture.wattage || 0, // Map wattage to power
          // Note: The Fixture model needs spaceId, but we don't have one in seed data
          // This will likely fail without a valid spaceId
          // spectrum, dimensions, images fields don't exist in current Fixture model
        })),
        skipDuplicates: true
      })
      
      console.log(`Seeded chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(fixtures.length / chunkSize)}`)
    }
    
    console.log(`✅ Successfully seeded ${fixtures.length} fixtures`)
  } catch (error) {
    console.error('Error seeding fixtures:', error)
    await seedSampleFixtures()
  }
}

async function seedSampleFixtures() {
  console.log('🌱 Skipping sample fixtures - Fixture model schema mismatch')
  return
  
  const sampleFixtures = [
    {
      manufacturer: 'Philips',
      model: 'GreenPower LED toplighting',
      dlcListingId: 'P-12345',
      ppf: 3100,
      wattage: 1000,
      efficacy: 3.1,
      voltage: '277V',
      dlcQualified: true,
      dlcPremium: true,
      beamAngle: 120,
      distribution: 'wide',
      powerFactor: 0.95,
      thd: 15,
      spectrum: { type: 'full_spectrum', channels: [] },
      dimensions: { length: 1200, width: 100, height: 50 },
      images: []
    },
    {
      manufacturer: 'Fluence',
      model: 'SPYDR 2x',
      dlcListingId: 'F-23456',
      ppf: 1700,
      wattage: 645,
      efficacy: 2.64,
      voltage: '120V',
      dlcQualified: true,
      dlcPremium: false,
      beamAngle: 110,
      distribution: 'uniform',
      powerFactor: 0.98,
      thd: 10,
      spectrum: { type: 'full_spectrum', channels: [] },
      dimensions: { length: 1070, width: 1070, height: 60 },
      images: []
    },
    {
      manufacturer: 'Current by GE',
      model: 'Arize Element L1000',
      dlcListingId: 'GE-34567',
      ppf: 2700,
      wattage: 1000,
      efficacy: 2.7,
      voltage: '480V',
      dlcQualified: true,
      dlcPremium: true,
      beamAngle: 90,
      distribution: 'batwing',
      powerFactor: 0.96,
      thd: 12,
      spectrum: { type: 'full_spectrum', channels: [] },
      dimensions: { length: 1219, width: 152, height: 89 },
      images: []
    }
  ]

  await prisma.fixture.createMany({
    data: sampleFixtures,
    skipDuplicates: true
  })
  
  console.log(`✅ Successfully seeded ${sampleFixtures.length} sample fixtures`)
}

async function seedUtilityRebates() {
  console.log('🌱 Seeding utility rebate data...')
  
  const rebates = [
    {
      utilityName: 'Pacific Gas & Electric (PG&E)',
      programName: 'Agricultural Energy Efficiency Incentive Program',
      state: 'CA',
      zipCodes: ['94102', '94103', '95814', '95815', '93721'],
      rebateAmount: 150,
      rebateType: 'per_fixture',
      requirements: {
        dlcQualified: true,
        minEfficiency: 2.5,
        maxWattage: 1000
      },
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      contactInfo: {
        phone: '1-800-468-4743',
        email: 'agriculture@pge.com',
        website: 'https://www.pge.com/en_US/for-our-business-partners/energy-supply/wholesale-electric-power-procurement/renewable-energy-self-generation-billing-payment/renewable-energy-self-generation.page'
      }
    },
    {
      utilityName: 'Con Edison',
      programName: 'Energy Efficiency Programs',
      state: 'NY',
      zipCodes: ['10001', '10002', '10003', '10004', '10005'],
      rebateAmount: 0.25,
      rebateType: 'percentage',
      requirements: {
        dlcQualified: true,
        minPurchase: 5000
      },
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      contactInfo: {
        phone: '1-800-752-6633',
        email: 'efficiency@coned.com',
        website: 'https://www.coned.com/en/save-money/rebates-incentives-tax-credits/rebates-incentives-tax-credits-business'
      }
    }
  ]

  await prisma.utilityRebate.createMany({
    data: rebates,
    skipDuplicates: true
  })
  
  console.log(`✅ Successfully seeded ${rebates.length} utility rebates`)
}

async function main() {
  console.log('🚀 Starting database seeding...')
  
  try {
    await seedFixtures()
    await seedUtilityRebates()
    
    // Get final counts
    const fixtureCount = await prisma.fixture.count()
    const rebateCount = await prisma.utilityRebate.count()
    
    console.log('📊 Database seeding complete!')
    console.log(`   Fixtures: ${fixtureCount}`)
    console.log(`   Utility Rebates: ${rebateCount}`)
    
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })