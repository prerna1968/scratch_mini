import { describe, it, expect } from 'vitest'
import { createBlock, cloneBlock, cloneBlocks, appendBlock, updateBlockParams, removeBlock } from './blocks'
import type { Block } from '../types'

describe('blocks utility functions', () => {
  describe('createBlock', () => {
    it('should create a move block with default params', () => {
      const block = createBlock('move')
      expect(block.type).toBe('move')
      expect(block.params.steps).toBe(20)
      expect(block.id).toBeDefined()
    })

    it('should create a turn block with default params', () => {
      const block = createBlock('turn')
      expect(block.type).toBe('turn')
      expect(block.params.degrees).toBe(90)
    })

    it('should create a goto block with default params', () => {
      const block = createBlock('goto')
      expect(block.type).toBe('goto')
      expect(block.params.x).toBe(0)
      expect(block.params.y).toBe(0)
    })

    it('should create a repeat block with children array', () => {
      const block = createBlock('repeat')
      expect(block.type).toBe('repeat')
      expect(block.params.times).toBe(2)
      expect(block.children).toEqual([])
    })

    it('should create a say block with default params', () => {
      const block = createBlock('say')
      expect(block.type).toBe('say')
      expect(block.params.text).toBe('Hello!')
      expect(block.params.seconds).toBe(2)
    })

    it('should create a think block with default params', () => {
      const block = createBlock('think')
      expect(block.type).toBe('think')
      expect(block.params.text).toBe('Hmm...')
      expect(block.params.seconds).toBe(2)
    })
  })

  describe('cloneBlock', () => {
    it('should create a deep copy of a block', () => {
      const original = createBlock('move')
      const cloned = cloneBlock(original)
      
      expect(cloned).toEqual(original)
      expect(cloned).not.toBe(original)
      expect(cloned.params).not.toBe(original.params)
    })

    it('should clone nested children', () => {
      const repeat = createBlock('repeat')
      repeat.children = [createBlock('move'), createBlock('turn')]
      
      const cloned = cloneBlock(repeat)
      
      expect(cloned.children).toHaveLength(2)
      expect(cloned.children![0]).not.toBe(repeat.children![0])
    })
  })

  describe('cloneBlocks', () => {
    it('should clone an array of blocks', () => {
      const blocks = [createBlock('move'), createBlock('turn')]
      const cloned = cloneBlocks(blocks)
      
      expect(cloned).toHaveLength(2)
      expect(cloned[0]).not.toBe(blocks[0])
      expect(cloned[1]).not.toBe(blocks[1])
    })
  })

  describe('appendBlock', () => {
    it('should append block to the end when parentId is null', () => {
      const blocks = [createBlock('move')]
      const newBlock = createBlock('turn')
      
      const result = appendBlock(blocks, null, newBlock)
      
      expect(result).toHaveLength(2)
      expect(result[1]).toBe(newBlock)
    })

    it('should append block to parent children', () => {
      const repeat = createBlock('repeat')
      repeat.children = []
      const blocks = [repeat]
      const newBlock = createBlock('move')
      
      const result = appendBlock(blocks, repeat.id, newBlock)
      
      expect(result[0].children).toHaveLength(1)
      expect(result[0].children![0]).toBe(newBlock)
    })

    it('should handle nested parent search', () => {
      const repeat1 = createBlock('repeat')
      const repeat2 = createBlock('repeat')
      repeat1.children = [repeat2]
      repeat2.children = []
      
      const blocks = [repeat1]
      const newBlock = createBlock('move')
      
      const result = appendBlock(blocks, repeat2.id, newBlock)
      
      expect(result[0].children![0].children).toHaveLength(1)
    })
  })

  describe('updateBlockParams', () => {
    it('should update block params at root level', () => {
      const block = createBlock('move')
      const blocks = [block]
      
      const result = updateBlockParams(blocks, block.id, { steps: 50 })
      
      expect(result[0].params.steps).toBe(50)
    })

    it('should update nested block params', () => {
      const repeat = createBlock('repeat')
      const move = createBlock('move')
      repeat.children = [move]
      const blocks = [repeat]
      
      const result = updateBlockParams(blocks, move.id, { steps: 100 })
      
      expect(result[0].children![0].params.steps).toBe(100)
    })

    it('should preserve other params', () => {
      const block = createBlock('say')
      const blocks = [block]
      
      const result = updateBlockParams(blocks, block.id, { text: 'Hi!' })
      
      expect(result[0].params.text).toBe('Hi!')
      expect(result[0].params.seconds).toBe(2)
    })
  })

  describe('removeBlock', () => {
    it('should remove block from root level', () => {
      const block1 = createBlock('move')
      const block2 = createBlock('turn')
      const blocks = [block1, block2]
      
      const result = removeBlock(blocks, block1.id)
      
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(block2.id)
    })

    it('should remove block from children', () => {
      const repeat = createBlock('repeat')
      const move = createBlock('move')
      repeat.children = [move]
      const blocks = [repeat]
      
      const result = removeBlock(blocks, move.id)
      
      expect(result[0].children).toHaveLength(0)
    })

    it('should return original array if block not found', () => {
      const blocks = [createBlock('move')]
      
      const result = removeBlock(blocks, 'nonexistent-id')
      
      expect(result).toBe(blocks)
    })
  })
})

