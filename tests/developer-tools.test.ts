import test, { describe } from 'node:test'
import assert from 'node:assert/strict'
import { executeTool, MCP_TOOLS } from '../lib/mcp/tools.ts'
import { DeveloperDataConnector } from '../lib/mcp/data-connector.ts'

describe('7 Core Developer MCP Tools Execution', () => {
  const connector = new DeveloperDataConnector({ mode: 'demo_fixture' })

  test('Tool A: list_repository_issues retrieves and filters issues', async () => {
    const { result, trace } = await executeTool(
      'list_repository_issues',
      { status: 'open', limit: 5 },
      'list open issues',
      connector
    )
    assert.equal(result.isError, false)
    assert.ok(result.content[0].text.includes('Repository issues'))
    assert.equal(trace.status, 'success')
    assert.ok(trace.sourceReferences.length > 0)
  })

  test('Tool B: get_my_high_priority_bugs applies deterministic severity ranking', async () => {
    const { result, trace } = await executeTool(
      'get_my_high_priority_bugs',
      { assignee: 'Alex', limit: 2 },
      'What are my two highest-priority open bugs?',
      connector
    )
    assert.equal(result.isError, false)
    const text = result.content[0].text
    assert.ok(text.includes('BUG-101'))
    assert.ok(text.includes('BUG-102'))

    // Critical must appear before High
    const pos101 = text.indexOf('BUG-101')
    const pos102 = text.indexOf('BUG-102')
    assert.ok(pos101 < pos102, 'BUG-101 (Critical) must rank before BUG-102 (High)')

    assert.equal(trace.toolName, 'get_my_high_priority_bugs')
    assert.equal(trace.sourceReferences.length, 2)
  })

  test('Tool B: handles unknown assignee honestly without fabricating data', async () => {
    const { result, trace } = await executeTool(
      'get_my_high_priority_bugs',
      { assignee: 'NonExistentEngineer', limit: 2 },
      'my bugs',
      connector
    )
    assert.equal(result.isError, false)
    assert.ok(result.content[0].text.includes('No open bugs found'))
    assert.equal(trace.sourceReferences.length, 0)
  })

  test('Tool C: list_pull_requests_needing_attention identifies blockers', async () => {
    const { result, trace } = await executeTool(
      'list_pull_requests_needing_attention',
      { reason: 'checks_failing' },
      'failing PRs',
      connector
    )
    assert.equal(result.isError, false)
    assert.ok(result.content[0].text.includes('PR #202'))
    assert.ok(result.content[0].text.includes('3 unit tests failed'))
    assert.equal(trace.status, 'success')
  })

  test('Tool D: summarize_recent_activity returns factual commit hashes', async () => {
    const { result, trace } = await executeTool(
      'summarize_recent_activity',
      { limit: 3 },
      'recent commits',
      connector
    )
    assert.equal(result.isError, false)
    assert.ok(result.content[0].text.includes('4e827ed'))
    assert.ok(result.content[0].text.includes('Adib Sunasra'))
    assert.equal(trace.sourceReferences.length, 3)
  })

  test('Tool E: search_technical_documentation finds relevant specifications', async () => {
    const { result, trace } = await executeTool(
      'search_technical_documentation',
      { query: 'MCP' },
      'find MCP docs',
      connector
    )
    assert.equal(result.isError, false)
    assert.ok(result.content[0].text.includes('Model Context Protocol'))
    assert.ok(result.content[0].text.includes('https://modelcontextprotocol.io/specification/2025-11-25'))
    assert.equal(trace.status, 'success')
  })

  test('Tool F: get_repository_health_summary calculates transparent score', async () => {
    const { result, trace } = await executeTool(
      'get_repository_health_summary',
      {},
      'repo health',
      connector
    )
    assert.equal(result.isError, false)
    assert.ok(result.content[0].text.includes('Repository Health Summary'))
    assert.ok(result.content[0].text.includes('PR #202 has failing unit tests'))
    assert.equal(trace.status, 'success')
  })

  test('Tool G: recommend_next_action generates read-only investigations', async () => {
    const { result, trace } = await executeTool(
      'recommend_next_action',
      { focusArea: 'all' },
      'what next',
      connector
    )
    assert.equal(result.isError, false)
    assert.ok(result.content[0].text.includes('Recommended Next Actions (Read-Only)'))
    assert.ok(result.content[0].text.includes('Fix failing unit tests in PR #202'))
    assert.equal(trace.status, 'success')
  })

  test('All 7 tools are documented in MCP_TOOLS array with valid JSON schema', () => {
    assert.equal(MCP_TOOLS.length, 7)
    for (const tool of MCP_TOOLS) {
      assert.ok(tool.name, 'Tool must have a name')
      assert.ok(tool.description, 'Tool must have a description')
      assert.equal(tool.inputSchema.type, 'object')
      assert.ok(tool.inputSchema.properties, 'Tool must define properties')
    }
  })
})
