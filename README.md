# Scratch Mini 🎨

Scratch Mini is a lightweight visual coding playground inspired by MIT Scratch. Build scripts by dragging motion and looks blocks, wire them up per sprite, and run the whole scene with a single Play button. When two sprites collide, the hero feature swaps their current animations, making interactions feel alive!

## ✨ Features

### 1. Motion Animations
- **Move ___ steps**: Move sprites forward by a specified number of steps
- **Turn ___ degrees**: Rotate sprites by a specified angle
- **Go to x: ___ y: ___**: Jump sprites to specific coordinates
- **Repeat animation**: Loop blocks a specified number of times with nested block support

### 2. Looks Animations
- **Say ___ for ___ seconds**: Display speech bubbles with custom text and duration
- **Think ___ for ___ seconds**: Display thought bubbles (italicized) with custom text and duration

### 3. Multiple Sprites Support
- **Dynamic sprite creation**: Add new sprites with the "+ Add Sprite" button
- **Sprite deletion**: Remove sprites individually (must keep at least one)
- **Independent animations**: Each sprite has its own script and runs independently
- **Color-coded sprites**: Each sprite has a unique color for easy identification
- **Cute sprite characters**: Sprites display with animated faces (eyes and mouth)

### 4. Hero Feature - Collision-Based Animation Swap ⭐
- **Collision detection**: Automatically detects when two sprites overlap
- **Animation swapping**: When sprites collide, their current animations swap
- **Visual feedback**: Collision triggers a flash animation on both sprites
- **Notification system**: Displays a prominent message when collisions occur
- **Dynamic interaction**: Creates emergent behavior and surprises in the playground

### 5. Enhanced User Interface
- **Beautiful gradient background**: Modern purple gradient matching Scratch aesthetic
- **Polished controls**: Play/Stop buttons with hover effects
- **Sprite strip**: Visual sprite selector with color indicators and delete buttons
- **Drag-and-drop**: Intuitive block palette with smooth drag interactions
- **Responsive stage**: Clean stage area with gradient background
- **Block nesting**: Repeat blocks support nested children with drop zones

## Getting Started

```bash
# install dependencies
npm install

# start the dev server
npm run dev

# run lint checks
npm run lint

# build for production
npm run build
```

The app ships with Vite + React 19 + TypeScript + @dnd-kit for drag-and-drop.

## Project Structure

```
src/
  App.tsx               # application shell, runtime wiring, DnD handling
  runtime.ts            # async block runner + collision hero feature
  types.ts              # Block, Script, Sprite shared types
  components/
    Palette.tsx         # draggable block palette
    Stage.tsx           # sprite stage display
    Workspace.tsx       # droppable scripting area with inline editors
  utils/
    blocks.ts           # helpers for block creation & mutations
```

## Deployment

You need to provide both the GitHub repository URL and a live deployment (Vercel, Netlify, or similar).

### Vercel

1. Push this repo to GitHub.
2. Visit [vercel.com](https://vercel.com) and create a new project.
3. Import the GitHub repo, keep the defaults:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Deploy. The generated URL is your live link.

### Netlify

1. Push this repo to GitHub.
2. Head to [app.netlify.com](https://app.netlify.com) → Add new site → Import an existing project.
3. Choose the GitHub repo and set:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Deploy. Netlify provides the live URL instantly; customise it under Site settings if desired.

### Static Hosting

```bash
npm run build
```

Upload the `dist/` folder to any static host (S3, Cloudflare Pages, GitHub Pages). For GitHub Pages you can deploy with `npm i -g vercel` or `netlify-cli`, or copy the contents into the `gh-pages` branch.

## 🎮 How to Use

### Basic Usage
1. **Select a sprite**: Click on any sprite in the sprite strip to select it
2. **Drag blocks**: Drag blocks from the palette on the left into the workspace
3. **Configure blocks**: Edit parameters (steps, degrees, text, seconds) directly in each block
4. **Nest blocks**: Drag blocks into the "Repeat" block to create loops
5. **Run animations**: Click "▶ Play All" to run all sprite scripts simultaneously
6. **Stop animations**: Click "■ Stop" to halt all animations

### Testing Motion Animations
1. Add a "Move steps" block and set steps to `50`
2. Add a "Turn degrees" block and set degrees to `45`
3. Add a "Go to x/y" block and set coordinates (e.g., x: `100`, y: `100`)
4. Add a "Repeat" block, set times to `3`, and drag motion blocks inside
5. Click "▶ Play All" to see the animations

### Testing Looks Animations
1. Add a "Say" block and type a message (e.g., "Hello!")
2. Set duration to `2` seconds
3. Add a "Think" block with a different message
4. Click "▶ Play All" to see speech and thought bubbles appear

### Testing Multiple Sprites
1. Click "+ Add Sprite" to create a new sprite
2. Each sprite gets a random name and color
3. Build different scripts for different sprites
4. Click "▶ Play All" to see all sprites animate independently
5. Delete sprites by clicking the ✕ button (must keep at least one)

### Testing the Hero Feature (Collision Detection)
1. Create or select two sprites on the stage
2. For **Sprite 1**: Add "Move 50 steps" + "Repeat 10 times"
3. For **Sprite 2**: Add "Move -50 steps" (or "Turn 180" then "Move 50") + "Repeat 10 times"
4. Position sprites facing each other on the stage
5. Click "▶ Play All"
6. Watch for the collision:
   - Both sprites will **flash** with a yellow glow
   - Their **animations swap** (Sprite 1 adopts Sprite 2's movement and vice versa)
   - A **notification banner** appears at the top showing the collision
7. The swapped animations continue until the scripts complete

### Pro Tips 💡
- Use the **Repeat** block to create complex looping animations
- Combine **Move** and **Turn** blocks to create circular paths
- Use **Say** blocks to debug or show sprite status
- Try making sprites move toward each other to trigger collisions
- The collision swap creates emergent behavior - experiment!

## License

MIT – use it however you like. Contributions welcome!
