// src/runtime.ts
import type { Block, Script, Sprite } from './types'


export const delay = (ms: number) => new Promise(r => setTimeout(r, ms))


export type RuntimeContext = {
  sprites: Sprite[]
  onUpdate: (s: Sprite) => void
  onSay: (s: Sprite, text: string, ms: number) => void
  onThink: (s: Sprite, text: string, ms: number) => void
  onCollision?: (a: Sprite, b: Sprite) => void
  shouldStop: () => boolean
  collisionPairs?: Set<string>
  scriptMapping?: Map<string, string>
  executionQueues?: Map<string, Block[]>
}


function aabbOverlap(a: Sprite, b: Sprite) {
  return !(
    a.x + a.width < b.x ||
    b.x + b.width < a.x ||
    a.y + a.height < b.y ||
    b.y + b.height < a.y
  )
}


export function checkCollisionsAndSwap(
  sprites: Sprite[],
  collisionPairs: Set<string>,
  scriptMapping: Map<string, string>,
  executionQueues: Map<string, Block[]>,
  onSwap?: (a: Sprite, b: Sprite) => void,
  onCollision?: (a: Sprite, b: Sprite) => void
) {
  for (let i = 0; i < sprites.length; i++) {
    for (let j = i + 1; j < sprites.length; j++) {
      const a = sprites[i]
      const b = sprites[j]      
      const pairKey = [a.id, b.id].sort().join('-')
      
      if (aabbOverlap(a, b) && !collisionPairs.has(pairKey)) {
        collisionPairs.add(pairKey)

        const queueA = executionQueues.get(a.id) ?? []
        const queueB = executionQueues.get(b.id) ?? []
        
        const motionQueueA = queueA.filter(block => block.type !== 'say' && block.type !== 'think')
        const motionQueueB = queueB.filter(block => block.type !== 'say' && block.type !== 'think')
        const looksQueueA = queueA.filter(block => block.type === 'say' || block.type === 'think')
        const looksQueueB = queueB.filter(block => block.type === 'say' || block.type === 'think')        
        executionQueues.set(a.id, [...motionQueueB, ...looksQueueA])
        executionQueues.set(b.id, [...motionQueueA, ...looksQueueB])
        
        const aTarget = scriptMapping.get(a.id) ?? a.id
        const bTarget = scriptMapping.get(b.id) ?? b.id
        scriptMapping.set(a.id, bTarget)
        scriptMapping.set(b.id, aTarget)

        // Swap animation indicator only for non-looks actions
        const tmpAnim = a.currentAnimation ?? null
        const aAnimIsLooks = tmpAnim === 'say' || tmpAnim === 'think'
        const bAnimIsLooks = (b.currentAnimation ?? null) === 'say' || (b.currentAnimation ?? null) === 'think'
        
        if (!aAnimIsLooks && !bAnimIsLooks) {
        a.currentAnimation = b.currentAnimation ?? null
        b.currentAnimation = tmpAnim
        }
        
        a._flash = true
        b._flash = true
        if (onSwap) onSwap(a, b)
        if (onCollision) onCollision(a, b)
      }
    }
  }
}

export async function runBlock(
  sprite: Sprite,
  block: Block,
  ctx: RuntimeContext
) {
  if (ctx.shouldStop()) return
  sprite.currentAnimation = block.type

  switch (block.type) {
    case 'move': {
      const steps = Number(block.params.steps) || 20
      const rad = (sprite.rotation * Math.PI) / 180
      const dx = Math.cos(rad) * steps
      const dy = Math.sin(rad) * steps
      sprite.x += dx
      sprite.y += dy
      ctx.onUpdate(sprite)
      await delay(250)
      break
    }
    case 'turn': {
      const deg = Number(block.params.degrees) || 90
      sprite.rotation = (sprite.rotation + deg) % 360
      ctx.onUpdate(sprite)
      await delay(150)
      break
    }
    case 'goto': {
      const x = Number(block.params.x)
      const y = Number(block.params.y)
      sprite.x = Number.isFinite(x) ? x : sprite.x
      sprite.y = Number.isFinite(y) ? y : sprite.y
      ctx.onUpdate(sprite)
      await delay(250)
      break
    }
    case 'repeat': {
      const times = Math.max(0, Math.min(50, Number(block.params.times) || 0))
      const children = block.children ?? []
      ctx.onUpdate(sprite)
      for (let i = 0; i < times; i++) {
        for (const child of children) {
          await runBlock(sprite, child, ctx)
          if (ctx.shouldStop()) return
        }
      }
      break
    }
    case 'say': {
      const text = `${block.params.text ?? ''}`
      const seconds = Number(block.params.seconds) || 1
      const ms = seconds * 1000
      ctx.onUpdate(sprite)
      sprite.bubble = { text, kind: 'say' }
      ctx.onSay(sprite, text, ms)
      await delay(ms)
      sprite.bubble = null
      ctx.onSay(sprite, '', 0)
      break
    }
    case 'think': {
      const text = `${block.params.text ?? ''}`
      const seconds = Number(block.params.seconds) || 1
      const ms = seconds * 1000
      ctx.onUpdate(sprite)
      sprite.bubble = { text, kind: 'think' }
      ctx.onThink(sprite, text, ms)
      await delay(ms)
      sprite.bubble = null
      ctx.onThink(sprite, '', 0)
      break
    }
    default: {
      ctx.onUpdate(sprite)
      break
    }
  }

  checkCollisionsAndSwap(
    ctx.sprites,
    ctx.collisionPairs ?? new Set(),
    ctx.scriptMapping ?? new Map(),
    ctx.executionQueues ?? new Map(),
    (a, b) => {
      ctx.onUpdate(a)
      ctx.onUpdate(b)
    },
    ctx.onCollision
  )
}

export async function runScript(
  sprite: Sprite,
  script: Script,
  ctx: RuntimeContext
) {
  for (const block of script.blocks) {
    await runBlock(sprite, block, ctx)
    if (ctx.shouldStop()) return
  }
}

function flattenBlocks(blocks: Block[]): Block[] {
  const result: Block[] = []

  for (const block of blocks) {
    if (block.type === 'repeat') {
      const times = Math.max(0, Math.min(50, Number(block.params.times) || 0))
      const children = block.children ?? []
      for (let i = 0; i < times; i++) {
        result.push(...flattenBlocks(children))
      }
    } else {
      result.push(block)
    }
  }

  return result
}

export async function runSpriteScripts(
  sprite: Sprite,
  ctx: RuntimeContext
) {
  const allBlocks: Block[] = []
  for (const script of sprite.scripts) {
    allBlocks.push(...flattenBlocks(script.blocks))
  }
  if (!ctx.executionQueues) {
    ctx.executionQueues = new Map()
  }
  ctx.executionQueues.set(sprite.id, [...allBlocks])
  while (ctx.executionQueues.get(sprite.id)?.length) {
    const block = ctx.executionQueues.get(sprite.id)?.shift()
    if (!block) break
    if (ctx.shouldStop()) return

    await runBlock(sprite, block, ctx)
  }
  sprite.currentAnimation = null
  ctx.onUpdate(sprite)
}