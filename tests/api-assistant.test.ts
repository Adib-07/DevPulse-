import test, { describe } from 'node:test'
import assert from 'node:assert/strict'
import { GET, POST } from '../app/api/assistant/route.ts'

describe('DevPulse Assistant & Intent Routing API', () => {
  test('GET returns online status, MCP endpoint metadata, and registered tools', async () => {
    const res = await GET()
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.equal(json.status, 'online')
    assert.equal(json.endpoint, '/api/assistant')
    assert.equal(json.mcpEndpoint, '/api/mcp')
    assert.ok(Array.isArray(json.registeredTools))
    assert.ok(json.registeredTools.includes('get_my_high_priority_bugs'))
    assert.ok(json.registeredTools.includes('list_pull_requests_needing_attention'))
    assert.ok(json.registeredTools.includes('get_repository_health_summary'))
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

  test('Primary Demonstration: executes "What are my two highest-priority open bugs?"', async () => {
    const req = new Request('http://localhost:3000/api/assistant', {
      method: 'POST',
      body: JSON.stringify({ command: 'What are my two highest-priority open bugs?' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    assert.equal(res.status, 200)
    const json = await res.json()

    assert.equal(json.tool, 'get_my_high_priority_bugs')
    assert.ok(json.response.includes('BUG-101'))
    assert.ok(json.response.includes('BUG-102'))
    assert.ok(json.response.includes('Critical'))

    // Verify visible execution trace
    assert.ok(json.trace)
    assert.equal(json.trace.toolName, 'get_my_high_priority_bugs')
    assert.equal(json.trace.status, 'success')
    assert.ok(json.trace.durationMs >= 0)
    assert.ok(json.trace.sourceReferences.length >= 2)
    assert.equal(json.trace.sourceReferences[0].identifier, 'BUG-101')
    assert.equal(json.trace.sourceReferences[1].identifier, 'BUG-102')
  })

  test('Routes pull request attention queries to MCP tool', async () => {
    const req = new Request('http://localhost:3000/api/assistant', {
      method: 'POST',
      body: JSON.stringify({ command: 'Which pull requests need my attention?' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    assert.equal(res.status, 200)
    const json = await res.json()

    assert.equal(json.tool, 'list_pull_requests_needing_attention')
    assert.ok(json.response.includes('PR #'))
    assert.ok(json.trace)
    assert.equal(json.trace.status, 'success')
  })
})
