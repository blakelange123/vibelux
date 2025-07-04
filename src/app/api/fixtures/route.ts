import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'
import { parseCSVRow, getFixtureCategory } from '@/lib/fixtures-data'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const ids = searchParams.get('ids') // For comparison page
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || 'All'
    const manufacturer = searchParams.get('manufacturer') || 'All'
    const minPPE = parseFloat(searchParams.get('minPPE') || '0')
    const maxPPE = parseFloat(searchParams.get('maxPPE') || '10')
    const minWattage = parseFloat(searchParams.get('minWattage') || '0')
    const maxWattage = parseFloat(searchParams.get('maxWattage') || '2000')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    // Read CSV file from public directory
    const csvPath = path.join(process.cwd(), 'public', 'data', 'dlc-fixtures.csv')
    console.log('Reading CSV from:', csvPath)
    const fileContent = await fs.readFile(csvPath, 'utf-8')
    console.log('CSV file read successfully, length:', fileContent.length)
    
    // Parse CSV
    console.log('Parsing CSV...')
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    })
    console.log('Parsed records count:', records.length)
    
    // Convert to fixture objects
    let fixtures = records.map((row: any, index: number) => {
      const fixture = parseCSVRow(row, index)
      return {
        ...fixture,
        category: getFixtureCategory(fixture)
      }
    })
    console.log('Converted fixtures count:', fixtures.length)
    
    // If specific IDs are requested (for comparison), return those fixtures
    if (ids) {
      const idList = ids.split(',').map(id => parseInt(id))
      const selectedFixtures = fixtures.filter((f: any) => idList.includes(f.id))
      return NextResponse.json({
        fixtures: selectedFixtures,
        total: selectedFixtures.length
      })
    }
    
    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase()
      fixtures = fixtures.filter((f: any) => 
        f.manufacturer.toLowerCase().includes(searchLower) ||
        f.modelNumber.toLowerCase().includes(searchLower) ||
        f.productName.toLowerCase().includes(searchLower) ||
        f.brand.toLowerCase().includes(searchLower)
      )
    }
    
    if (category !== 'All') {
      fixtures = fixtures.filter((f: any) => f.category === category)
    }
    
    if (manufacturer !== 'All') {
      fixtures = fixtures.filter((f: any) => f.manufacturer === manufacturer)
    }
    
    // Filter by PPE and wattage
    fixtures = fixtures.filter((f: any) => 
      f.reportedPPE >= minPPE && 
      f.reportedPPE <= maxPPE &&
      f.reportedWattage >= minWattage &&
      f.reportedWattage <= maxWattage
    )
    
    // Get unique manufacturers for filter
    const manufacturers = [...new Set(fixtures.map((f: any) => f.manufacturer))].sort()
    
    // Pagination
    const total = fixtures.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedFixtures = fixtures.slice(startIndex, endIndex)
    
    return NextResponse.json({
      fixtures: paginatedFixtures,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      manufacturers
    })
  } catch (error) {
    console.error('Error reading fixtures:', error)
    return NextResponse.json(
      { error: 'Failed to load fixtures' },
      { status: 500 }
    )
  }
}