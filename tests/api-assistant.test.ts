import test, { describe } from 'node:test'
import assert from 'node:assert/strict'
import { GET, POST } from '../app/api/assistant/route.ts'

describe('Assistant API Route Handler', () => {
  test('GET returns online status and endpoint metadata', async () => {
    const res = await GET()
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.equal(json.status, 'online')
    assert.equal(json.endpoint, '/api/assistant')
    assert.equal(json.model, 'gemini-2.5-flash')
    assert.ok(Array.isArray(json.allowedActions))
    assert.ok(json.allowedActions.includes('overview'))
    assert.ok(json.allowedActions.includes('filter_tasks'))
    assert.ok(typeof json.geminiConfigured === 'boolean')
  })

  test('POST rejects non-JSON or invalid request bodies', async () => {
    const req = new Request('http://localhost:3000/api/assistant', {
      method: 'POST',
      body: 'invalid-json',
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    assert.equal(res.status, 400)
    const json = await res.json()
    assert.ok(json.error.includes('Invalid JSON'))
  })

  test('POST rejects empty or missing command string', async () => {
    const req = new Request('http://localhost:3000/api/assistant', {
      method: 'POST',
      body: JSON.stringify({ command: '   ' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    assert.equal(res.status, 400)
    const json = await res.json()
    assert.ok(json.error.includes('command string is required'))
  })

  test('POST rejects commands exceeding maximum character length', async () => {
    const longCommand = 'A'.repeat(501)
    const req = new Request('http://localhost:3000/api/assistant', {
      method: 'POST',
      body: JSON.stringify({ command: longCommand }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    assert.equal(res.status, 400)
    const json = await res.json()
    assert.ok(json.error.includes('maximum permitted length'))
  })

  test('POST returns 503 when Gemini API key is unconfigured', async () => {
    const originalGeminiKey = process.env.GEMINI_API_KEY
    const originalGoogleKey = process.env.GOOGLE_API_KEY
    const originalApiKey = process.env.API_KEY

    delete process.env.GEMINI_API_KEY
    delete process.env.GOOGLE_API_KEY
    delete process.env.API_KEY

    try {
      const req = new Request('http://localhost:3000/api/assistant', {
        method: 'POST',
        body: JSON.stringify({ command: 'Show critical tasks' }),
        headers: { 'Content-Type': 'application/json' },
      })
      const res = await POST(req)
      assert.equal(res.status, 503)
      const json = await res.json()
      assert.ok(json.error.includes('Gemini AI assistant is not configured'))
    } finally {
      if (originalGeminiKey) process.env.GEMINI_API_KEY = originalGeminiKey
      if (originalGoogleKey) process.env.GOOGLE_API_KEY = originalGoogleKey
      if (originalApiKey) process.env.API_KEY = originalApiKey
    }
  })
})
