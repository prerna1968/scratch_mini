import { useMemo, useRef, useState } from 'react'
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { v4 as uuid } from 'uuid'
import type { BlockType, Sprite } from './types'
import Palette from './components/Palette'
import Workspace from './components/Workspace'
import Stage from './components/Stage'
import { appendBlock, createBlock, cloneBlocks, removeBlock, updateBlockParams } from './utils/blocks'
import { runSpriteScripts, type RuntimeContext } from './runtime'
import './App.css'

type DropData = {
  spriteId: string
  parentId: string | null
}

function createSprite(name: string, color: string, x: number, y: number): Sprite {
  return {
    id: uuid(),
    name,
    color,
    x,
    y,
    rotation: 0,
    width: 72,
    height: 72,
    scripts: [
      {
        id: uuid(),
        blocks: []
      }
    ],
    currentAnimation: null,
    bubble: null,
    _flash: false
  }
}

const INITIAL_SPRITES = [
  createSprite('Comet', '#ffbf69', 60, 60),
  createSprite('Bolt', '#40c9ff', 180, 160),
  createSprite('Nova', '#a29bfe', 320, 80)
]

export default function App() {
  const [sprites, setSprites] = useState<Sprite[]>(INITIAL_SPRITES)
  const [selectedId, setSelectedId] = useState<string>(INITIAL_SPRITES[0]?.id ?? '')
  const [isRunning, setIsRunning] = useState(false)
  const [collisionMessage, setCollisionMessage] = useState<string | null>(null)
  const shouldStopRef = useRef(false)
  const bubbleTimeouts = useRef<Record<string, number>>({})
  const flashTimeouts = useRef<Record<string, number>>({})
  const collisionTimeoutRef = useRef<number | undefined>(undefined)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const selectedSprite = useMemo(() => {
    return sprites.find((sprite) => sprite.id === selectedId) ?? sprites[0]
  }, [sprites, selectedId])

  const updateSpriteScripts = (spriteId: string, transform: (blocks: Sprite['scripts'][number]['blocks']) => Sprite['scripts'][number]['blocks']) => {
    setSprites((prev) =>
      prev.map((sprite) => {
        if (sprite.id !== spriteId) return sprite

        const hadScripts = sprite.scripts.length > 0
        const primary = hadScripts
          ? sprite.scripts[0]
          : {
              id: uuid(),
              blocks: []
            }
        const nextBlocks = transform(primary.blocks)
        const createdPrimary = !hadScripts

        if (!createdPrimary && nextBlocks === primary.blocks) {
          return sprite
        }

        const rest = hadScripts ? sprite.scripts.slice(1) : []
        return {
          ...sprite,
          scripts: [
            { ...primary, blocks: nextBlocks },
            ...rest
          ]
        }
      })
    )
  }

  const handleDragEnd = (event: DragEndEvent) => {
    if (isRunning) return

    const blockType = event.active.data.current?.blockType as BlockType | undefined
    const dropData = event.over?.data.current as DropData | undefined

    if (!blockType || !dropData) return

    const newBlock = createBlock(blockType)
    updateSpriteScripts(dropData.spriteId, (blocks) => appendBlock(blocks, dropData.parentId, newBlock))
  }

  const handleUpdateBlockParams = (spriteId: string, blockId: string, params: Record<string, string | number | undefined>) => {
    updateSpriteScripts(spriteId, (blocks) => updateBlockParams(blocks, blockId, params))
  }

  const handleRemoveBlock = (spriteId: string, blockId: string) => {
    updateSpriteScripts(spriteId, (blocks) => removeBlock(blocks, blockId))
  }

  const syncSpriteRuntimeState = (runtimeSprite: Sprite) => {
    setSprites((prev) =>
      prev.map((sprite) => {
        if (sprite.id !== runtimeSprite.id) return sprite
        return {
          ...sprite,
          x: runtimeSprite.x,
          y: runtimeSprite.y,
          rotation: runtimeSprite.rotation,
          currentAnimation: runtimeSprite.currentAnimation,
          _flash: runtimeSprite._flash ?? false
        }
      })
    )

    if (runtimeSprite._flash) {
      window.clearTimeout(flashTimeouts.current[runtimeSprite.id])
      flashTimeouts.current[runtimeSprite.id] = window.setTimeout(() => {
        setSprites((prev) =>
          prev.map((sprite) =>
            sprite.id === runtimeSprite.id ? { ...sprite, _flash: false } : sprite
          )
        )
      }, 300)
    }
  }

  const setBubble = (spriteId: string, text: string, kind: 'say' | 'think', ms: number) => {
    setSprites((prev) =>
      prev.map((sprite) =>
        sprite.id === spriteId
          ? { ...sprite, bubble: text ? { text, kind } : null }
          : sprite
      )
    )

    window.clearTimeout(bubbleTimeouts.current[spriteId])

    if (text && ms > 0) {
      bubbleTimeouts.current[spriteId] = window.setTimeout(() => {
        setSprites((prev) =>
          prev.map((sprite) =>
            sprite.id === spriteId ? { ...sprite, bubble: null } : sprite
          )
        )
      }, ms)
    }
  }

  const runAllSprites = async () => {
    if (isRunning) return

    shouldStopRef.current = false
    setIsRunning(true)

    const workingSprites: Sprite[] = sprites.map((sprite) => ({
      ...sprite,
      scripts: sprite.scripts.map((script) => ({
        ...script,
        blocks: cloneBlocks(script.blocks)
      })),
      bubble: null,
      _flash: false
    }))

    const ctx: RuntimeContext = {
      sprites: workingSprites,
      collisionPairs: new Set<string>(),
      scriptMapping: new Map<string, string>(),
      executionQueues: new Map(),
      onUpdate: syncSpriteRuntimeState,
      onSay: (sprite, text, ms) => {
        setBubble(sprite.id, text, 'say', ms)
      },
      onThink: (sprite, text, ms) => {
        setBubble(sprite.id, text, 'think', ms)
      },
      onCollision: (a, b) => {
        const message = `Collision! ${a.name} ↔️ ${b.name} - Animations swapped!`
        setCollisionMessage(message)
        window.clearTimeout(collisionTimeoutRef.current)
        collisionTimeoutRef.current = window.setTimeout(() => {
          setCollisionMessage(null)
        }, 3000)
      },
      shouldStop: () => shouldStopRef.current
    }

    try {
      await Promise.all(workingSprites.map((sprite) => runSpriteScripts(sprite, ctx)))
    } finally {
      shouldStopRef.current = false
      setIsRunning(false)
      setSprites((prev) =>
        prev.map((sprite) => ({
          ...sprite,
          currentAnimation: null,
          _flash: false
        }))
      )
    }
  }

  const stopAllSprites = () => {
    if (!isRunning) return
    shouldStopRef.current = true
    setIsRunning(false)
    Object.values(bubbleTimeouts.current).forEach((timeoutId) => window.clearTimeout(timeoutId))
    Object.values(flashTimeouts.current).forEach((timeoutId) => window.clearTimeout(timeoutId))
    bubbleTimeouts.current = {}
    flashTimeouts.current = {}
    setSprites((prev) =>
      prev.map((sprite) => ({
        ...sprite,
        currentAnimation: null,
        bubble: null,
        _flash: false
      }))
    )
    shouldStopRef.current = false
  }

  const addNewSprite = () => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#fd79a8', '#fdcb6e', '#55efc4']
    const names = ['Star', 'Flash', 'Spark', 'Blaze', 'Glow', 'Shine', 'Beam', 'Ray', 'Luna', 'Sol']
    
    const usedColors = sprites.map(s => s.color)
    const availableColors = colors.filter(c => !usedColors.includes(c))
    const color = availableColors.length > 0 ? availableColors[0] : colors[Math.floor(Math.random() * colors.length)]
    
    const baseName = names[Math.floor(Math.random() * names.length)]
    const existingNames = sprites.map(s => s.name)
    let name = baseName
    let counter = 1
    while (existingNames.includes(name)) {
      name = `${baseName}${counter}`
      counter++
    }
    
    const x = 50 + Math.random() * 200
    const y = 50 + Math.random() * 150
    
    const newSprite = createSprite(name, color, x, y)
    setSprites((prev) => [...prev, newSprite])
    setSelectedId(newSprite.id)
  }

  const deleteSprite = (spriteId: string) => {
    if (sprites.length <= 1) {
      alert('You must have at least one sprite!')
      return
    }
    
    setSprites((prev) => {
      const filtered = prev.filter(s => s.id !== spriteId)
      if (selectedId === spriteId) {
        setSelectedId(filtered[0]?.id ?? '')
      }
      return filtered
    })
  }

  if (!selectedSprite) {
    return null
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="app-shell">
        {collisionMessage && (
          <div className="collision-notification">
            {collisionMessage}
          </div>
        )}
        <header className="app-header">
          <div>
            <h1>Scratch Mini</h1>
            <p>Drag blocks from the palette, compose scripts, and press play to run every sprite. <strong>Hero Feature:</strong> When sprites collide, their animations swap!</p>
          </div>
          <div className="controls">
            <button type="button" onClick={runAllSprites} disabled={isRunning}>
              ▶ Play All
            </button>
            <button type="button" onClick={stopAllSprites} disabled={!isRunning}>
              ■ Stop
            </button>
          </div>
        </header>

        <div className="sprite-strip">
          <div className="sprite-list">
            {sprites.map((sprite) => (
              <div key={sprite.id} className="sprite-item">
                <button
                  type="button"
                  className={`sprite-btn ${sprite.id === selectedId ? 'active' : ''}`}
                  onClick={() => setSelectedId(sprite.id)}
                  disabled={isRunning}
                >
                  <span className="sprite-color-indicator" style={{ backgroundColor: sprite.color }}></span>
                  {sprite.name}
                </button>
                {sprites.length > 1 && (
                  <button
                    type="button"
                    className="sprite-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteSprite(sprite.id)
                    }}
                    disabled={isRunning}
                    title="Delete sprite"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            className="add-sprite-btn"
            onClick={addNewSprite}
            disabled={isRunning}
            title="Add new sprite"
          >
            + Add Sprite
          </button>
        </div>

        <main className="main-grid">
          <Palette />
          <Stage sprites={sprites} selectedId={selectedId} onSelect={setSelectedId} />
          <Workspace
            sprite={selectedSprite}
            disabled={isRunning}
            onUpdateBlockParams={(blockId, params) => handleUpdateBlockParams(selectedSprite.id, blockId, params)}
            onRemoveBlock={(blockId) => handleRemoveBlock(selectedSprite.id, blockId)}
          />
        </main>
      </div>
    </DndContext>
  )
}
