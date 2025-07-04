// Visual effects and animations for enhanced user feedback
// Provides smooth transitions, hover effects, and interaction feedback

export interface AnimationState {
  startTime: number;
  duration: number;
  from: any;
  to: any;
  easing: (t: number) => number;
  onComplete?: () => void;
}

// Easing functions for smooth animations
export const Easings = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => (--t) * t * t + 1,
  easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeOutElastic: (t: number) => {
    if (t === 0 || t === 1) return t;
    const p = 0.3;
    return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
  },
  easeOutBounce: (t: number) => {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else if (t < 2 / 2.75) {
      return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
    } else if (t < 2.5 / 2.75) {
      return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
    } else {
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  }
};

// Animation manager for coordinating multiple animations
export class AnimationManager {
  private animations: Map<string, AnimationState> = new Map();
  private animationFrame: number | null = null;
  private lastTime: number = 0;
  
  // Add a new animation
  animate(id: string, from: any, to: any, duration: number, easing: (t: number) => number = Easings.easeOutQuad, onComplete?: () => void) {
    this.animations.set(id, {
      startTime: performance.now(),
      duration,
      from,
      to,
      easing,
      onComplete
    });
    
    if (!this.animationFrame) {
      this.start();
    }
  }
  
  // Get current animation value
  getValue(id: string, defaultValue: any): any {
    const animation = this.animations.get(id);
    if (!animation) return defaultValue;
    
    const elapsed = performance.now() - animation.startTime;
    const progress = Math.min(elapsed / animation.duration, 1);
    const easedProgress = animation.easing(progress);
    
    if (progress >= 1) {
      this.animations.delete(id);
      if (animation.onComplete) animation.onComplete();
      return animation.to;
    }
    
    // Interpolate based on value type
    if (typeof animation.from === 'number' && typeof animation.to === 'number') {
      return animation.from + (animation.to - animation.from) * easedProgress;
    }
    
    // Interpolate objects (e.g., {x, y} positions)
    if (typeof animation.from === 'object' && typeof animation.to === 'object') {
      const result: any = {};
      for (const key in animation.from) {
        if (typeof animation.from[key] === 'number' && typeof animation.to[key] === 'number') {
          result[key] = animation.from[key] + (animation.to[key] - animation.from[key]) * easedProgress;
        }
      }
      return result;
    }
    
    return animation.to;
  }
  
  // Check if animation is running
  isAnimating(id: string): boolean {
    return this.animations.has(id);
  }
  
  // Stop animation
  stop(id: string) {
    this.animations.delete(id);
  }
  
  // Start animation loop
  private start() {
    const animate = (time: number) => {
      if (this.animations.size === 0) {
        this.animationFrame = null;
        return;
      }
      
      this.lastTime = time;
      this.animationFrame = requestAnimationFrame(animate);
    };
    
    this.animationFrame = requestAnimationFrame(animate);
  }
  
  // Clear all animations
  clear() {
    this.animations.clear();
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
}

// Hover effect manager
export class HoverEffectManager {
  private hoverStates: Map<string, { startTime: number; isHovering: boolean }> = new Map();
  
  setHover(id: string, isHovering: boolean) {
    const current = this.hoverStates.get(id);
    if (!current || current.isHovering !== isHovering) {
      this.hoverStates.set(id, {
        startTime: performance.now(),
        isHovering
      });
    }
  }
  
  getHoverProgress(id: string, duration: number = 200): number {
    const state = this.hoverStates.get(id);
    if (!state) return 0;
    
    const elapsed = performance.now() - state.startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    return state.isHovering ? progress : 1 - progress;
  }
  
  clear() {
    this.hoverStates.clear();
  }
}

// Visual feedback effects
export class VisualEffects {
  // Draw glow effect
  static drawGlow(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string, intensity: number = 1) {
    ctx.save();
    
    // Create gradient
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    const alpha = Math.min(intensity * 0.5, 1);
    gradient.addColorStop(0, color.replace('rgb', 'rgba').replace(')', `, ${alpha})`));
    gradient.addColorStop(0.5, color.replace('rgb', 'rgba').replace(')', `, ${alpha * 0.5})`));
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    
    ctx.restore();
  }
  
  // Draw pulse effect
  static drawPulse(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string, progress: number) {
    ctx.save();
    
    const pulseRadius = radius + (radius * 0.5 * progress);
    const alpha = 1 - progress;
    
    ctx.strokeStyle = color.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
  }
  
  // Draw selection outline with animation
  static drawSelectionOutline(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, progress: number, color: string = '#fbbf24') {
    ctx.save();
    
    const offset = 3 + (2 * Math.sin(progress * Math.PI * 2));
    const cornerRadius = 5;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.lineDashOffset = progress * 10;
    
    // Draw rounded rectangle
    ctx.beginPath();
    ctx.moveTo(x - width/2 - offset + cornerRadius, y - height/2 - offset);
    ctx.lineTo(x + width/2 + offset - cornerRadius, y - height/2 - offset);
    ctx.quadraticCurveTo(x + width/2 + offset, y - height/2 - offset, x + width/2 + offset, y - height/2 - offset + cornerRadius);
    ctx.lineTo(x + width/2 + offset, y + height/2 + offset - cornerRadius);
    ctx.quadraticCurveTo(x + width/2 + offset, y + height/2 + offset, x + width/2 + offset - cornerRadius, y + height/2 + offset);
    ctx.lineTo(x - width/2 - offset + cornerRadius, y + height/2 + offset);
    ctx.quadraticCurveTo(x - width/2 - offset, y + height/2 + offset, x - width/2 - offset, y + height/2 + offset - cornerRadius);
    ctx.lineTo(x - width/2 - offset, y - height/2 - offset + cornerRadius);
    ctx.quadraticCurveTo(x - width/2 - offset, y - height/2 - offset, x - width/2 - offset + cornerRadius, y - height/2 - offset);
    ctx.closePath();
    ctx.stroke();
    
    ctx.restore();
  }
  
  // Draw snap indicator
  static drawSnapIndicator(ctx: CanvasRenderingContext2D, x: number, y: number, type: 'grid' | 'object', progress: number) {
    ctx.save();
    
    const size = 8 + (4 * progress);
    const alpha = 1 - progress * 0.5;
    
    ctx.fillStyle = type === 'grid' ? `rgba(59, 130, 246, ${alpha})` : `rgba(168, 85, 247, ${alpha})`;
    
    // Draw cross
    ctx.fillRect(x - size/2, y - 1, size, 2);
    ctx.fillRect(x - 1, y - size/2, 2, size);
    
    // Draw circle
    ctx.strokeStyle = ctx.fillStyle;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
  }
  
  // Draw drag preview
  static drawDragPreview(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, rotation: number = 0) {
    ctx.save();
    
    ctx.translate(x, y);
    ctx.rotate(rotation * Math.PI / 180);
    
    // Semi-transparent fill
    ctx.fillStyle = 'rgba(139, 92, 246, 0.3)';
    ctx.fillRect(-width/2, -height/2, width, height);
    
    // Dashed outline
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.8)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(-width/2, -height/2, width, height);
    
    ctx.restore();
  }
  
  // Draw connection line with animation
  static drawConnectionLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, progress: number, color: string = '#3b82f6') {
    ctx.save();
    
    const currentX2 = x1 + (x2 - x1) * progress;
    const currentY2 = y1 + (y2 - y1) * progress;
    
    // Draw gradient line
    const gradient = ctx.createLinearGradient(x1, y1, currentX2, currentY2);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
    gradient.addColorStop(1, color);
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(currentX2, currentY2);
    ctx.stroke();
    
    // Draw end point
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(currentX2, currentY2, 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  // Draw tooltip
  static drawTooltip(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, progress: number) {
    ctx.save();
    
    const padding = 8;
    const fontSize = 12;
    ctx.font = `${fontSize}px sans-serif`;
    const metrics = ctx.measureText(text);
    const width = metrics.width + padding * 2;
    const height = fontSize + padding * 2;
    
    // Animate position and opacity
    const offsetY = -10 * (1 - progress);
    const alpha = progress;
    
    // Draw background
    ctx.fillStyle = `rgba(31, 41, 55, ${alpha * 0.95})`;
    ctx.strokeStyle = `rgba(75, 85, 99, ${alpha})`;
    ctx.lineWidth = 1;
    
    const tooltipX = x - width / 2;
    const tooltipY = y - height - 10 + offsetY;
    
    // Rounded rectangle
    const radius = 4;
    ctx.beginPath();
    ctx.moveTo(tooltipX + radius, tooltipY);
    ctx.lineTo(tooltipX + width - radius, tooltipY);
    ctx.quadraticCurveTo(tooltipX + width, tooltipY, tooltipX + width, tooltipY + radius);
    ctx.lineTo(tooltipX + width, tooltipY + height - radius);
    ctx.quadraticCurveTo(tooltipX + width, tooltipY + height, tooltipX + width - radius, tooltipY + height);
    ctx.lineTo(tooltipX + radius, tooltipY + height);
    ctx.quadraticCurveTo(tooltipX, tooltipY + height, tooltipX, tooltipY + height - radius);
    ctx.lineTo(tooltipX, tooltipY + radius);
    ctx.quadraticCurveTo(tooltipX, tooltipY, tooltipX + radius, tooltipY);
    ctx.closePath();
    
    ctx.fill();
    ctx.stroke();
    
    // Draw arrow
    ctx.beginPath();
    ctx.moveTo(x - 4, tooltipY + height);
    ctx.lineTo(x, tooltipY + height + 4);
    ctx.lineTo(x + 4, tooltipY + height);
    ctx.closePath();
    ctx.fill();
    
    // Draw text
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, tooltipY + height / 2);
    
    ctx.restore();
  }
}