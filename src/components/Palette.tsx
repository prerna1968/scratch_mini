import type { CSSProperties } from 'react'
import { useDraggable } from '@dnd-kit/core'
import type { BlockType } from '../types'

type PaletteItem = {
  type: BlockType
  label: string
  hint?: string
}

const PALETTE_GROUPS: Array<{ title: string; color: string; blocks: PaletteItem[] }> = [
  {
    title: 'Motion',
    color: '#4C97FF',
    blocks: [
      { type: 'move', label: 'Move steps', hint: 'Move forward by steps' },
      { type: 'turn', label: 'Turn degrees', hint: 'Rotate by degrees' },
      { type: 'goto', label: 'Go to x/y', hint: 'Jump to coordinates' },
      { type: 'repeat', label: 'Repeat', hint: 'Loop inner blocks' }
    ]
  },
  {
    title: 'Looks',
    color: '#9966FF',
    blocks: [
      { type: 'say', label: 'Say', hint: 'Speech bubble' },
      { type: 'think', label: 'Think', hint: 'Thought bubble' }
    ]
  }
]

function DraggableBlock({ item, color }: { item: PaletteItem; color: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${item.type}`,
    data: { blockType: item.type }
  })

  const style: CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    borderColor: color,
    boxShadow: isDragging ? `0 6px 14px rgba(0,0,0,0.15)` : undefined,
    opacity: isDragging ? 0.8 : 1
  }

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className="palette-block" style={style}>
      <strong>{item.label}</strong>
      {item.hint && <span className="palette-hint">{item.hint}</span>}
    </div>
  )
}

export default function Palette() {
  return (
    <section className="panel">
      <h2 className="panel-title">Palette</h2>
      {PALETTE_GROUPS.map((group) => (
        <div key={group.title} className="palette-group">
          <h3 style={{ color: group.color }}>{group.title}</h3>
          <div className="palette-list">
            {group.blocks.map((block) => (
              <DraggableBlock key={block.type} item={block} color={group.color} />
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
