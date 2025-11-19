export type BlockType = 'move' | 'turn' | 'goto' | 'repeat' | 'say' | 'think'

export interface Block {
  id: string
  type: BlockType
  params: Record<string, number | string | undefined>
  children?: Block[]
}

export interface Script {
  id: string
  blocks: Block[]
}

export interface Sprite {
  id: string
  name: string
  color: string
  x: number
  y: number
  rotation: number
  width: number
  height: number
  scripts: Script[]
  currentAnimation?: string | null
  bubble?: { text: string; kind: 'say' | 'think' } | null
  _flash?: boolean
}