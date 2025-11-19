import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DndContext } from '@dnd-kit/core'
import Palette from './Palette'

describe('Palette Component', () => {
  it('should render motion category', () => {
    render(
      <DndContext>
        <Palette />
      </DndContext>
    )
    
    expect(screen.getByText('Motion')).not.toBeNull()
  })

  it('should render looks category', () => {
    render(
      <DndContext>
        <Palette />
      </DndContext>
    )
    
    expect(screen.getByText('Looks')).not.toBeNull()
  })

  it('should render all motion blocks', () => {
    render(
      <DndContext>
        <Palette />
      </DndContext>
    )
    
    expect(screen.getByText('Move steps')).not.toBeNull()
    expect(screen.getByText('Turn degrees')).not.toBeNull()
    expect(screen.getByText('Go to x/y')).not.toBeNull()
    expect(screen.getByText('Repeat')).not.toBeNull()
  })

  it('should render all looks blocks', () => {
    render(
      <DndContext>
        <Palette />
      </DndContext>
    )
    
    expect(screen.getByText(/Say/)).not.toBeNull()
    expect(screen.getByText(/Think/)).not.toBeNull()
  })
})

