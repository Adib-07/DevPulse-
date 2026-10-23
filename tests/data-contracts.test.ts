import test, { describe } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

describe('Data Contracts & Integrity Tests', () => {
  const rootDir = process.cwd()

  test('tasks.json matches schema and has valid developer sprint items', () => {
    const raw = fs.readFileSync(path.join(rootDir, 'tasks.json'), 'utf-8')
    const data = JSON.parse(raw)
    assert.ok(data.developer, 'Must have developer field')
    assert.ok(Array.isArray(data.tasks), 'tasks must be an array')
    assert.ok(data.tasks.length > 0, 'tasks array must not be empty')

    for (const task of data.tasks) {
      assert.ok(task.id, 'Task must have an id')
      assert.ok(task.title, 'Task must have a title')
      assert.ok(['Critical', 'High', 'Medium', 'Low'].includes(task.priority), `Invalid priority: ${task.priority}`)
      assert.ok(['Open', 'In Progress', 'In Review', 'Resolved', 'To Do'].includes(task.status), `Invalid status: ${task.status}`)
    }
  })

  test('github.json matches schema and has valid repository telemetry', () => {
    const raw = fs.readFileSync(path.join(rootDir, 'github.json'), 'utf-8')
    const data = JSON.parse(raw)
    assert.ok(data.source, 'Must specify source')
    assert.ok(Array.isArray(data.pull_requests), 'pull_requests must be an array')

    for (const pr of data.pull_requests) {
      assert.ok(pr.id !== undefined, 'PR must have an id')
      assert.ok(pr.title, 'PR must have a title')
      assert.ok(pr.author, 'PR must have an author')
      assert.ok(pr.status, 'PR must have a status')
      assert.ok(pr.review_status, 'PR must have a review_status')
      assert.ok(pr.checks, 'PR must have checks object')
      assert.ok(pr.checks.tests, 'PR checks must contain tests status')
      assert.ok(pr.checks.build, 'PR checks must contain build status')
    }
  })

  test('alerts.json matches schema and contains active system alerts and service telemetry', () => {
    const raw = fs.readFileSync(path.join(rootDir, 'alerts.json'), 'utf-8')
    const data = JSON.parse(raw)
    assert.ok(Array.isArray(data.services), 'services must be an array')
    assert.ok(Array.isArray(data.active_alerts), 'active_alerts must be an array')

    for (const service of data.services) {
      assert.ok(service.name, 'Service must have a name')
      assert.ok(['Healthy', 'Warning', 'Critical', 'Degraded'].includes(service.status), `Invalid service status: ${service.status}`)
      assert.ok(typeof service.cpu_usage_percent === 'number', 'cpu_usage_percent must be a number')
      assert.ok(typeof service.memory_usage_percent === 'number', 'memory_usage_percent must be a number')
    }

    for (const alert of data.active_alerts) {
      assert.ok(alert.id, 'Alert must have an id')
      assert.ok(['Critical', 'Warning', 'Info'].includes(alert.severity), `Invalid alert severity: ${alert.severity}`)
      assert.ok(alert.message, 'Alert must have a message')
    }
  })
})
