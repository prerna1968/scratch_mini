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
    
    expect(screen.getByText('Motion')).toBeInTheDocument()
  })

  it('should render looks category', () => {
    render(
      <DndContext>
        <Palette />
      </DndContext>
    )
    
    expect(screen.getByText('Looks')).toBeInTheDocument()
  })

  it('should render all motion blocks', () => {
    render(
      <DndContext>
        <Palette />
      </DndContext>
    )
    
    expect(screen.getByText('Move steps')).toBeInTheDocument()
    expect(screen.getByText('Turn degrees')).toBeInTheDocument()
    expect(screen.getByText('Go to x/y')).toBeInTheDocument()
    expect(screen.getByText('Repeat')).toBeInTheDocument()
  })

  it('should render all looks blocks', () => {
    render(
      <DndContext>
        <Palette />
      </DndContext>
    )
    
    expect(screen.getByText(/Say/)).toBeInTheDocument()
    expect(screen.getByText(/Think/)).toBeInTheDocument()
  })
})

