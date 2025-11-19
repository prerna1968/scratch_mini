import { useMemo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import type { Block, Sprite } from '../types'

type WorkspaceProps = {
  sprite: Sprite
  disabled?: boolean
  onUpdateBlockParams: (blockId: string, params: Record<string, string | number | undefined>) => void
  onRemoveBlock: (blockId: string) => void
}

type BlockItemProps = {
  block: Block
  spriteId: string
  disabled?: boolean
  onUpdateBlockParams: WorkspaceProps['onUpdateBlockParams']
  onRemoveBlock: WorkspaceProps['onRemoveBlock']
}

function useWorkspaceDrop(id: string, spriteId: string, parentId: string | null, enabled = true) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    disabled: !enabled,
    data: enabled ? { spriteId, parentId } : undefined
  })

  return { setNodeRef, isOver }
}

function BlockParamsEditor({
  block,
  disabled,
  onUpdate
}: {
  block: Block
  disabled?: boolean
  onUpdate: (params: Record<string, unknown>) => void
}) {
  switch (block.type) {
    case 'move':
      return (
        <label>
          steps
          <input
            type="number"
            value={block.params.steps ?? ''}
            disabled={disabled}
            onChange={(event) => onUpdate({ steps: Number(event.target.value || 0) || 0 })}
          />
        </label>
      )
    case 'turn':
      return (
        <label>
          degrees
          <input
            type="number"
            value={block.params.degrees ?? ''}
            disabled={disabled}
            onChange={(event) => onUpdate({ degrees: Number(event.target.value || 0) || 0 })}
          />
        </label>
      )
    case 'goto':
      return (
        <>
          <label>
            x
            <input
              type="number"
              value={block.params.x ?? ''}
              disabled={disabled}
              onChange={(event) => onUpdate({ x: Number(event.target.value) })}
            />
          </label>
          <label>
            y
            <input
              type="number"
              value={block.params.y ?? ''}
              disabled={disabled}
              onChange={(event) => onUpdate({ y: Number(event.target.value) })}
            />
          </label>
        </>
      )
    case 'repeat':
      return (
        <label>
          times
          <input
            type="number"
            min={1}
            value={block.params.times ?? 2}
            disabled={disabled}
            onChange={(event) => onUpdate({ times: Math.max(1, Number(event.target.value) || 1) })}
          />
        </label>
      )
    case 'say':
    case 'think':
      return (
        <>
          <label>
            text
            <input
              value={block.params.text ?? ''}
              disabled={disabled}
              onChange={(event) => onUpdate({ text: event.target.value })}
            />
          </label>
          <label>
            seconds
            <input
              type="number"
              min={0.1}
              step="0.1"
              value={block.params.seconds ?? 2}
              disabled={disabled}
              onChange={(event) => onUpdate({ seconds: Math.max(0.1, Number(event.target.value) || 1) })}
            />
          </label>
        </>
      )
    default:
      return null
  }
}

function BlockItem({ block, spriteId, disabled, onUpdateBlockParams, onRemoveBlock }: BlockItemProps) {
  const isRepeat = block.type === 'repeat'
  const { setNodeRef: setRepeatRef, isOver: repeatOver } = useWorkspaceDrop(
    `repeat-${block.id}`,
    spriteId,
    block.id,
    isRepeat
  )

  const hasChildren = (block.children?.length ?? 0) > 0

  return (
    <div className={`block block-${block.type}`}>
      <header className="block-head">
        <span className="block-type">{block.type}</span>
        <button
          type="button"
          className="block-delete"
          disabled={disabled}
          onClick={() => onRemoveBlock(block.id)}
        >
          ✕
        </button>
      </header>
      <div className="block-body">
        <BlockParamsEditor
          block={block}
          disabled={disabled}
          onUpdate={(params) =>
            onUpdateBlockParams(
              block.id,
              params as Record<string, string | number | undefined>
            )
          }
        />
      </div>
      {isRepeat && (
        <div
          ref={setRepeatRef}
          className="repeat-slot"
          data-over={repeatOver ? 'true' : 'false'}
        >
          {hasChildren ? (
            block.children!.map((child) => (
              <BlockItem
                key={child.id}
                block={child}
                spriteId={spriteId}
                disabled={disabled}
                onUpdateBlockParams={onUpdateBlockParams}
                onRemoveBlock={onRemoveBlock}
              />
            ))
          ) : (
            <p className="placeholder">Drop blocks here to repeat</p>
          )}
        </div>
      )}
    </div>
  )
}

export default function Workspace({ sprite, disabled = false, onUpdateBlockParams, onRemoveBlock }: WorkspaceProps) {
  const script = useMemo(() => sprite.scripts[0], [sprite.scripts])
  const { setNodeRef: setRootNodeRef, isOver: rootIsOver } = useWorkspaceDrop(
    `workspace-${sprite.id}`,
    sprite.id,
    null
  )

  return (
    <section className="panel workspace-panel">
      <h2 className="panel-title">
        Workspace — <span style={{ color: sprite.color }}>{sprite.name}</span>
      </h2>
      <div
        ref={setRootNodeRef}
        className="workspace-canvas"
        data-over={rootIsOver ? 'true' : 'false'}
      >
        {script && script.blocks.length > 0 ? (
          script.blocks.map((block) => (
            <BlockItem
              key={block.id}
              block={block}
              spriteId={sprite.id}
              disabled={disabled}
              onUpdateBlockParams={onUpdateBlockParams}
              onRemoveBlock={onRemoveBlock}
            />
          ))
        ) : (
          <p className="placeholder">Drag blocks from the palette to build a script.</p>
        )}
      </div>
    </section>
  )
}