# VEXUS VENTURES - Design System Tenets

## Core Design Principles

### 1. Responsive Breakpoint Strategy
- **Primary breakpoint: 1023px** - Content layout transitions (horizontal to vertical stacking)
- **Secondary breakpoint: 728px** - Navigation behavior and mobile optimizations
- **Tertiary breakpoint: 400px** - Typography and spacing adjustments for very narrow screens

### 2. Interactive Animation Philosophy
- **Scroll-triggered animations** over hover effects for primary content
- **Center-line activation** - Elements animate when crossing screen center (±100px threshold)
- **Staggered timing** - Sequential reveals with 0.2s intervals for cascading effects
- **Fluid motion** - All transitions use `cubic-bezier(0.4, 0, 0.2, 1)` for consistent easing

### 3. Navigation Behavior
- **Horizontal layout** above 728px with centered alignment
- **Vertical stacking** below 728px with reverse-order reveal animation
- **Transparency effects** triggered by header interaction zone
- **Glitch text effects** on hover with matrix-style character randomization

### 4. Typography Hierarchy
- **Cyber-title**: 3rem (2rem mobile) with cyan glow and letter-spacing
- **Section-titles**: 2rem with magenta color and 3px letter-spacing
- **Taglines**: 1.2rem with magenta color and 2px letter-spacing
- **Body text**: 1rem with #cccccc color and 1.7 line-height

### 5. Color Palette & Highlights
- **Primary cyan**: #00ffff for titles and primary elements
- **Primary magenta**: #ff00ff for accents and highlights
- **Background gradient**: 135deg from #0a0015 → #1a0033 → #0f0025
- **Text highlights**: `.highlight-cyan` and `.highlight-magenta` with glow effects

### 6. Card System Design
- **Dynamic sizing**: 350px → 300px → 280px based on screen width
- **3D effects**: Mirrored rotations (±5deg) for visual balance
- **Height reduction**: -20% in stacked mobile view (200px → 160px)
- **Scroll activation**: Center-line triggered animations replace hover states

### 7. Spacing & Layout
- **Container width**: 80vw maximum with auto centering
- **Grid gaps**: 2rem standard, 1rem mobile
- **Padding scales**: 2.5rem → 2rem → 1.75rem → 1.5rem based on breakpoints
- **Negative margins**: Applied at 400px breakpoint to prevent title truncation

### 8. Interactive Header System
- **Mouse tracking**: Radial gradients follow cursor position
- **Text revelation**: Brand text appears with proximity-based opacity
- **Particle effects**: Orbiting sprites with trail generation
- **Navigation hiding**: Automatic transparency when header is active

### 9. Performance Considerations
- **Minimal DOM manipulation**: Class-based state changes over inline styles
- **Efficient selectors**: Avoid deep nesting, use direct child selectors
- **Transition optimization**: Hardware acceleration with `translateZ(0)`
- **Event throttling**: Scroll handlers optimized for 60fps performance

### 10. Accessibility Standards
- **Keyboard navigation**: All interactive elements accessible via tab
- **Screen reader support**: Semantic HTML structure maintained
- **Motion preferences**: Respect `prefers-reduced-motion` for animations
- **Color contrast**: Minimum 4.5:1 ratio for all text elements

## Implementation Guidelines

### File Structure
- `template-base.html` - Base template with all design elements
- `vexus-style.css` - Complete stylesheet with responsive breakpoints
- `vexus-effects.js` - Interactive behaviors and scroll animations

### Class Naming Convention
- `.cyber-*` - Primary UI components
- `.vision-*` - Card-based content elements
- `.highlight-*` - Text emphasis classes
- `.active` - State-based animation triggers

### Content Patterns
- Hero sections with stats/metrics display
- Three-column card grids with scroll animations
- Text-heavy sections with highlighted key phrases
- Consistent footer with copyright information