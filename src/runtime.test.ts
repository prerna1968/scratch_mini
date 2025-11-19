import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkCollisionsAndSwap, delay, type RuntimeContext } from './runtime'
import type { Sprite } from './types'

describe('runtime collision detection', () => {
  let spriteA: Sprite
  let spriteB: Sprite
  let collisionPairs: Set<string>
  let scriptMapping: Map<string, string>
  let executionQueues: Map<string, any[]>

  beforeEach(() => {
    spriteA = {
      id: 'sprite-a',
      name: 'Sprite A',
      color: '#ff0000',
      x: 100,
      y: 100,
      rotation: 0,
      width: 72,
      height: 72,
      scripts: [{ id: 'script-a', blocks: [] }],
      currentAnimation: null,
      bubble: null,
      _flash: false,
    }

    spriteB = {
      id: 'sprite-b',
      name: 'Sprite B',
      color: '#00ff00',
      x: 200,
      y: 200,
      rotation: 0,
      width: 72,
      height: 72,
      scripts: [{ id: 'script-b', blocks: [] }],
      currentAnimation: null,
      bubble: null,
      _flash: false,
    }

    collisionPairs = new Set()
    scriptMapping = new Map()
    executionQueues = new Map()
  })

  describe('checkCollisionsAndSwap', () => {
    it('should detect collision when sprites overlap', () => {
      // Position sprites to overlap
      spriteA.x = 100
      spriteA.y = 100
      spriteB.x = 120 // Within 72px width
      spriteB.y = 120 // Within 72px height

      const onSwap = vi.fn()
      const onCollision = vi.fn()

      checkCollisionsAndSwap(
        [spriteA, spriteB],
        collisionPairs,
        scriptMapping,
        executionQueues,
        onSwap,
        onCollision
      )

      expect(onCollision).toHaveBeenCalledWith(spriteA, spriteB)
      expect(onSwap).toHaveBeenCalledWith(spriteA, spriteB)
    })

    it('should not detect collision when sprites are far apart', () => {
      // Position sprites far apart
      spriteA.x = 100
      spriteA.y = 100
      spriteB.x = 300
      spriteB.y = 300

      const onSwap = vi.fn()
      const onCollision = vi.fn()

      checkCollisionsAndSwap(
        [spriteA, spriteB],
        collisionPairs,
        scriptMapping,
        executionQueues,
        onSwap,
        onCollision
      )

      expect(onCollision).not.toHaveBeenCalled()
      expect(onSwap).not.toHaveBeenCalled()
    })

    it('should swap execution queues on collision', () => {
      // Position sprites to overlap
      spriteA.x = 100
      spriteA.y = 100
      spriteB.x = 120
      spriteB.y = 120

      // Set up queues
      const queueA = ['block1', 'block2']
      const queueB = ['block3', 'block4']
      executionQueues.set('sprite-a', queueA)
      executionQueues.set('sprite-b', queueB)

      checkCollisionsAndSwap(
        [spriteA, spriteB],
        collisionPairs,
        scriptMapping,
        executionQueues
      )

      // Queues should be swapped
      expect(executionQueues.get('sprite-a')).toEqual(queueB)
      expect(executionQueues.get('sprite-b')).toEqual(queueA)
    })

    it('should mark sprites with flash flag', () => {
      // Position sprites to overlap
      spriteA.x = 100
      spriteA.y = 100
      spriteB.x = 120
      spriteB.y = 120

      checkCollisionsAndSwap(
        [spriteA, spriteB],
        collisionPairs,
        scriptMapping,
        executionQueues
      )

      expect(spriteA._flash).toBe(true)
      expect(spriteB._flash).toBe(true)
    })

    it('should prevent multiple swaps for same pair', () => {
      // Position sprites to overlap
      spriteA.x = 100
      spriteA.y = 100
      spriteB.x = 120
      spriteB.y = 120

      const onCollision = vi.fn()

      // First collision
      checkCollisionsAndSwap(
        [spriteA, spriteB],
        collisionPairs,
        scriptMapping,
        executionQueues,
        undefined,
        onCollision
      )

      expect(onCollision).toHaveBeenCalledTimes(1)

      // Second collision check - should not trigger again
      checkCollisionsAndSwap(
        [spriteA, spriteB],
        collisionPairs,
        scriptMapping,
        executionQueues,
        undefined,
        onCollision
      )

      expect(onCollision).toHaveBeenCalledTimes(1) // Still only 1
    })

    it('should swap animation indicators', () => {
      // Position sprites to overlap
      spriteA.x = 100
      spriteA.y = 100
      spriteA.currentAnimation = 'move'
      spriteB.x = 120
      spriteB.y = 120
      spriteB.currentAnimation = 'turn'

      checkCollisionsAndSwap(
        [spriteA, spriteB],
        collisionPairs,
        scriptMapping,
        executionQueues
      )

      expect(spriteA.currentAnimation).toBe('turn')
      expect(spriteB.currentAnimation).toBe('move')
    })
  })

  describe('delay', () => {
    it('should delay execution by specified milliseconds', async () => {
      const start = Date.now()
      await delay(100)
      const end = Date.now()
      
      expect(end - start).toBeGreaterThanOrEqual(95) // Allow small margin
    })
  })
})

