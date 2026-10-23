import test, { describe } from 'node:test'
import assert from 'node:assert/strict'

// DevPulse Command Engine Parser Test Suite
function parseDevPulseIntent(rawCommand: string): { action: string; filter?: string; query?: string } {
  const normalized = rawCommand.toLowerCase().trim()
  const stripped = normalized.replace(/^(alexa,?\s*|devpulse,?\s*|hey devpulse,?\s*)/i, '').trim()

  if (stripped.includes('high-priority') || stripped.includes('critical bugs') || stripped.includes('critical tasks')) {
    return { action: 'filter_tasks', filter: 'Critical' }
  }
  if (stripped.includes('task') || stripped.includes('sprint')) {
    return { action: 'tasks', filter: 'All' }
  }
  if (stripped.includes('alert') || stripped.includes('incident') || stripped.includes('sentinel')) {
    return { action: 'alerts', filter: 'All' }
  }
  if (stripped.includes('repo') || stripped.includes('health') || stripped.includes('git')) {
    return { action: 'repository' }
  }
  if (stripped.includes('pull request') || stripped.includes('pr')) {
    return { action: 'pull_requests', filter: 'All' }
  }
  if (stripped.includes('clear') || stripped.includes('reset')) {
    return { action: 'clear_filters' }
  }
  return { action: 'overview' }
}

describe('Voice Command Engine Intent Classification', () => {
  test('correctly handles wake words and filters critical tasks', () => {
    const res1 = parseDevPulseIntent('Alexa, what are the top two high-priority bugs assigned to me?')
    assert.equal(res1.action, 'filter_tasks')
    assert.equal(res1.filter, 'Critical')

    const res2 = parseDevPulseIntent('Hey DevPulse, show critical bugs')
    assert.equal(res2.action, 'filter_tasks')
    assert.equal(res2.filter, 'Critical')
  })

  test('handles shorthand developer commands without wake word', () => {
    const res = parseDevPulseIntent('show sprint tasks')
    assert.equal(res.action, 'tasks')
  })

  test('correctly routes repository health inquiries', () => {
    const res = parseDevPulseIntent('Alexa, check repository health')
    assert.equal(res.action, 'repository')
  })

  test('correctly routes alert queries', () => {
    const res = parseDevPulseIntent('DevPulse, show system alerts')
    assert.equal(res.action, 'alerts')
  })

  test('correctly routes reset and clear requests', () => {
    const res = parseDevPulseIntent('reset workspace')
    assert.equal(res.action, 'clear_filters')
  })
})
