import { v4 as uuid } from 'uuid'
import type { Block, BlockType } from '../types'

export function createBlock(type: BlockType): Block {
  const base: Block = {
    id: uuid(),
    type,
    params: {}
  }

  switch (type) {
    case 'move':
      base.params.steps = 20
      break
    case 'turn':
      base.params.degrees = 90
      break
    case 'goto':
      base.params.x = 0
      base.params.y = 0
      break
    case 'repeat':
      base.params.times = 2
      base.children = []
      break
    case 'say':
      base.params.text = 'Hello!'
      base.params.seconds = 2
      break
    case 'think':
      base.params.text = 'Hmm...'
      base.params.seconds = 2
      break
    default:
      break
  }

  return base
}

export function cloneBlock(block: Block): Block {
  return {
    ...block,
    params: { ...block.params },
    children: block.children ? block.children.map(cloneBlock) : undefined
  }
}

export function cloneBlocks(blocks: Block[]): Block[] {
  return blocks.map(cloneBlock)
}

export function appendBlock(
  blocks: Block[],
  parentId: string | null,
  block: Block
): Block[] {
  if (!parentId) {
    return [...blocks, block]
  }

  return blocks.map((current) => {
    if (current.id === parentId) {
      const children = current.children ?? []
      return {
        ...current,
        children: [...children, block]
      }
    }

    if (current.children) {
      const nextChildren = appendBlock(current.children, parentId, block)
      if (nextChildren !== current.children) {
        return {
          ...current,
          children: nextChildren
        }
      }
    }

    return current
  })
}

export function updateBlockParams(
  blocks: Block[],
  blockId: string,
  params: Record<string, unknown>
): Block[] {
  return blocks.map((block) => {
    if (block.id === blockId) {
      return {
        ...block,
        params: { ...block.params, ...params }
      }
    }

    if (block.children) {
      const children = updateBlockParams(block.children, blockId, params)
      if (children !== block.children) {
        return {
          ...block,
          children
        }
      }
    }

    return block
  })
}

export function removeBlock(blocks: Block[], blockId: string): Block[] {
  let changed = false

  const filtered = blocks
    .map((block) => {
      if (block.id === blockId) {
        changed = true
        return null
      }
      if (block.children) {
        const children = removeBlock(block.children, blockId)
        if (children !== block.children) {
          changed = true
          return {
            ...block,
            children
          }
        }
      }
      return block
    })
    .filter((block): block is Block => block !== null)

  return changed ? filtered : blocks
}

