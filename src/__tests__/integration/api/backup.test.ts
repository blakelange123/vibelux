import { NextRequest } from 'next/server'
import { POST as createBackup } from '@/app/api/admin/backup/create/route'
import { GET as listBackups } from '@/app/api/admin/backup/list/route'

// Mock authentication
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn().mockResolvedValue({
    userId: 'admin-user-id',
  }),
}))

describe('/api/admin/backup', () => {
  describe('POST /create', () => {
    it('creates a backup successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/backup/create', {
        method: 'POST',
        body: JSON.stringify({
          includeUserData: true,
          includeLogs: false,
          description: 'Test backup',
        }),
      })

      const response = await createBackup(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.backup).toHaveProperty('id')
      expect(data.backup).toHaveProperty('filename')
    })

    it('requires authentication', async () => {
      // Mock unauthenticated request
      jest.mocked(require('@clerk/nextjs/server')).auth.mockResolvedValueOnce({
        userId: null,
      })

      const request = new NextRequest('http://localhost:3000/api/admin/backup/create', {
        method: 'POST',
        body: JSON.stringify({}),
      })

      const response = await createBackup(request)

      expect(response.status).toBe(401)
    })
  })

  describe('GET /list', () => {
    it('returns list of backups', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/backup/list')

      const response = await listBackups(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveProperty('backups')
      expect(data).toHaveProperty('total')
      expect(Array.isArray(data.backups)).toBe(true)
    })

    it('supports pagination', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/backup/list?limit=5&offset=10')

      const response = await listBackups(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.limit).toBe(5)
      expect(data.offset).toBe(10)
    })
  })
})