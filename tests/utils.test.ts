import test, { describe } from 'node:test'
import assert from 'node:assert/strict'
import { cn } from '../lib/utils.ts'

describe('Utility Functions', () => {
  test('cn merges classes and resolves tailwind conflicts', () => {
    const result = cn('px-2 py-1', 'px-4', undefined, null, false && 'hidden')
    assert.equal(result, 'py-1 px-4')
  })

  test('cn handles complex conditional expressions', () => {
    const isCritical = true
    const isHidden = false
    const result = cn(
      'rounded-md text-sm',
      isCritical ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-300',
      isHidden && 'opacity-0'
    )
    assert.equal(result, 'rounded-md text-sm bg-red-500 text-white')
  })
})
