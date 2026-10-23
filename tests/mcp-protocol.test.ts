import test, { describe } from 'node:test'
import assert from 'node:assert/strict'
import { GET, POST } from '../app/api/mcp/route.ts'
import { MCP_PROTOCOL_VERSION } from '../lib/mcp/types.ts'

describe('Official MCP Protocol Server (/api/mcp)', () => {
  test('GET returns online status and registered MCP 2025-11-25 tools', async () => {
    const req = new Request('http://localhost:3000/api/mcp', { method: 'GET' })
    const res = await GET(req)
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.equal(json.status, 'online')
    assert.equal(json.protocolVersion, MCP_PROTOCOL_VERSION)
    assert.equal(json.toolsCount, 7)
    assert.ok(Array.isArray(json.tools))
    assert.equal(json.tools.length, 7)
  })

  test('GET supports Streamable HTTP / Server-Sent Events (SSE)', async () => {
    const req = new Request('http://localhost:3000/api/mcp', {
      method: 'GET',
      headers: { Accept: 'text/event-stream' },
    })
    const res = await GET(req)
    assert.equal(res.status, 200)
    assert.ok(res.headers.get('content-type')?.includes('text/event-stream'))
  })

  test('POST handles "initialize" lifecycle negotiation', async () => {
    const req = new Request('http://localhost:3000/api/mcp', {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2025-11-25',
          capabilities: {},
          clientInfo: { name: 'alexa-test-client', version: '1.0.0' },
        },
      }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.equal(json.jsonrpc, '2.0')
    assert.equal(json.id, 1)
    assert.equal(json.result.protocolVersion, '2025-11-25')
    assert.equal(json.result.serverInfo.name, 'devpulse-mcp-server')
  })

  test('POST handles "ping" request', async () => {
    const req = new Request('http://localhost:3000/api/mcp', {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'ping-1',
        method: 'ping',
      }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.equal(json.id, 'ping-1')
    assert.deepEqual(json.result, {})
  })

  test('POST handles "tools/list" discovery', async () => {
    const req = new Request('http://localhost:3000/api/mcp', {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
      }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.ok(Array.isArray(json.result.tools))
    assert.equal(json.result.tools.length, 7)
    const names = json.result.tools.map((t: { name: string }) => t.name)
    assert.ok(names.includes('get_my_high_priority_bugs'))
    assert.ok(names.includes('list_repository_issues'))
    assert.ok(names.includes('list_pull_requests_needing_attention'))
    assert.ok(names.includes('summarize_recent_activity'))
    assert.ok(names.includes('search_technical_documentation'))
    assert.ok(names.includes('get_repository_health_summary'))
    assert.ok(names.includes('recommend_next_action'))
  })

  test('POST executes "tools/call" for get_my_high_priority_bugs', async () => {
    const req = new Request('http://localhost:3000/api/mcp', {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'get_my_high_priority_bugs',
          arguments: { assignee: 'Alex', limit: 2 },
        },
      }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.equal(json.id, 3)
    assert.equal(json.result.isError, false)
    assert.ok(Array.isArray(json.result.content))
    assert.ok(json.result.content[0].text.includes('BUG-101'))
    assert.ok(json.result.content[0].text.includes('BUG-102'))
    assert.equal(json.result.structuredData.count, 2)
  })

  test('POST rejects tool invocation with missing required arguments with -32602', async () => {
    const req = new Request('http://localhost:3000/api/mcp', {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'search_technical_documentation',
          arguments: {}, // missing required "query"
        },
      }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.equal(json.error.code, -32602)
    assert.ok(json.error.message.includes('missing required parameter "query"'))
  })

  test('POST rejects unknown tool with -32601', async () => {
    const req = new Request('http://localhost:3000/api/mcp', {
      method: 'POST',
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 5,
        method: 'tools/call',
        params: {
          name: 'non_existent_tool',
        },
      }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.equal(json.error.code, -32601)
  })

  test('POST rejects malformed JSON with -32700 Parse error', async () => {
    const req = new Request('http://localhost:3000/api/mcp', {
      method: 'POST',
      body: '{ invalid json ]',
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.equal(json.error.code, -32700)
  })

  test('POST handles batch JSON-RPC requests', async () => {
    const req = new Request('http://localhost:3000/api/mcp', {
      method: 'POST',
      body: JSON.stringify([
        { jsonrpc: '2.0', id: 'b1', method: 'ping' },
        { jsonrpc: '2.0', id: 'b2', method: 'tools/list' },
      ]),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    assert.equal(res.status, 200)
    const json = await res.json()
    assert.ok(Array.isArray(json))
    assert.equal(json.length, 2)
    assert.equal(json[0].id, 'b1')
    assert.equal(json[1].id, 'b2')
  })
})
