import type { Sprite } from '../types'

type StageProps = {
  sprites: Sprite[]
  selectedId: string
  onSelect: (id: string) => void
}

export default function Stage({ sprites, selectedId, onSelect }: StageProps) {
  return (
    <section className="panel stage-panel">
      <h2 className="panel-title">Stage</h2>
      <div className="stage-surface">
        {sprites.map((sprite) => {
          const isSelected = sprite.id === selectedId
          const bubble = sprite.bubble
          return (
            <button
              key={sprite.id}
              type="button"
              className={[
                'sprite-node',
                isSelected ? 'sprite-selected' : '',
                sprite._flash ? 'sprite-flash' : ''
              ].join(' ')}
              style={{
                position: 'absolute',
                left: `${sprite.x}px`,
                top: `${sprite.y}px`,
                width: `${sprite.width}px`,
                height: `${sprite.height}px`,
                transform: `rotate(${sprite.rotation}deg)`,
                transformOrigin: 'center center',
                backgroundColor: sprite.color
              }}
              onClick={() => onSelect(sprite.id)}
            >
              <div className="sprite-face">
                <div className="sprite-eyes">
                  <div className="sprite-eye"></div>
                  <div className="sprite-eye"></div>
                </div>
                <div className="sprite-mouth"></div>
              </div>
              <span className="sprite-label">{sprite.name}</span>
              {sprite.currentAnimation && (
                <span className="sprite-status">{sprite.currentAnimation}</span>
              )}
              {bubble && bubble.text && (
                <span className={`sprite-bubble sprite-bubble-${bubble.kind}`}>{bubble.text}</span>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}

