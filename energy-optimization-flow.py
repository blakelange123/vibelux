import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, Rectangle, Circle
import numpy as np
import os

# Create figure and axis
fig, ax = plt.subplots(1, 1, figsize=(16, 12))
ax.set_xlim(0, 100)
ax.set_ylim(0, 100)
ax.axis('off')

# Define colors
primary_color = '#10b981'  # Green
secondary_color = '#3b82f6'  # Blue
accent_color = '#f59e0b'    # Yellow
warning_color = '#ef4444'   # Red
bg_color = '#1f2937'        # Dark gray
text_color = '#ffffff'      # White

# Set background color
fig.patch.set_facecolor(bg_color)
ax.set_facecolor(bg_color)

# Title
ax.text(50, 95, 'VibeLux Energy Optimization Flow', 
        fontsize=24, fontweight='bold', color=text_color, 
        ha='center', va='center')

ax.text(50, 90, 'Revenue-Sharing Model: $0 Upfront • 80/20 Split • 30-50% Energy Savings', 
        fontsize=14, color=primary_color, ha='center', va='center')

# Define box style
def create_box(x, y, width, height, text, color, text_size=10):
    box = FancyBboxPatch((x, y), width, height,
                         boxstyle="round,pad=0.1",
                         facecolor=color,
                         edgecolor='white',
                         linewidth=2)
    ax.add_patch(box)
    
    # Add text
    lines = text.split('\n')
    line_height = height / (len(lines) + 1)
    for i, line in enumerate(lines):
        ax.text(x + width/2, y + height - (i+1)*line_height, line,
                fontsize=text_size, color=text_color,
                ha='center', va='center', weight='bold')

# Define arrow style
def create_arrow(x1, y1, x2, y2, text='', curved=False):
    if curved:
        # Create curved arrow using Arc
        mid_x = (x1 + x2) / 2
        mid_y = (y1 + y2) / 2 + 5
        ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle='->', color='white', lw=2,
                                  connectionstyle="arc3,rad=0.3"))
    else:
        ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle='->', color='white', lw=2))
    
    if text:
        mid_x = (x1 + x2) / 2
        mid_y = (y1 + y2) / 2
        ax.text(mid_x, mid_y + 1, text, fontsize=9, color=accent_color,
                ha='center', va='center', weight='bold',
                bbox=dict(boxstyle="round,pad=0.3", facecolor=bg_color, edgecolor=accent_color))

# Layer 1: Input Sources (Top)
create_box(5, 75, 18, 8, 'Real-Time\nGrid Pricing\n($0.08-$0.35/kWh)', secondary_color, 9)
create_box(27, 75, 18, 8, 'Weather Data\n& Natural Light\nSensors', secondary_color, 9)
create_box(49, 75, 18, 8, 'Crop Requirements\nDLI Targets\nGrowth Stage', secondary_color, 9)
create_box(71, 75, 18, 8, 'Facility Sensors\nPPFD, Temp, CO2\nHumidity', secondary_color, 9)

# Layer 2: Core Algorithms (Middle-Upper)
create_box(15, 58, 30, 10, 'Smart Optimization Algorithms\n• Adaptive Baseline Learning\n• Historical Pattern Analysis\n• Peak Demand Response', primary_color, 9)
create_box(55, 58, 30, 10, 'DLI Compensation Engine\n• Off-Peak Banking (150%)\n• Peak Reduction (50-75%)\n• Spectral Optimization', primary_color, 9)

# Layer 3: Rules & Safety (Middle)
create_box(25, 42, 50, 10, 'Energy Optimization Rules Engine\n• Crop-Specific Constraints (Min PPFD, Photoperiod)\n• Safety Guardrails (Never Compromise Yield)\n• Compliance & Quality Rules', warning_color, 9)

# Layer 4: Execution (Middle-Lower)
create_box(10, 25, 20, 10, 'Lighting Control\n• Dim to 70%\n• Deep Red Mode\n• Zone Control', accent_color, 9)
create_box(35, 25, 20, 10, 'HVAC Optimization\n• Temperature Adj\n• Fan Speed\n• Dehumidification', accent_color, 9)
create_box(60, 25, 20, 10, 'Demand Response\n• Grid Events\n• Load Shedding\n• Revenue Gen', accent_color, 9)

# Layer 5: Outputs (Bottom)
create_box(5, 8, 28, 10, 'Energy Savings\n30-50% Reduction\n$15-25K/month saved', primary_color, 10)
create_box(36, 8, 28, 10, 'Grid Revenue\n$50-125K/year\nDemand Response', primary_color, 10)
create_box(67, 8, 28, 10, 'Yield Protection\n100% DLI Achievement\n25% Yield Increase', primary_color, 10)

# Draw arrows from inputs to algorithms
create_arrow(14, 75, 25, 68)
create_arrow(36, 75, 35, 68)
create_arrow(58, 75, 65, 68)
create_arrow(80, 75, 75, 68)

# Draw arrows from algorithms to rules engine
create_arrow(30, 58, 40, 52)
create_arrow(70, 58, 60, 52)

# Draw arrows from rules to execution
create_arrow(35, 42, 20, 35)
create_arrow(50, 42, 45, 35)
create_arrow(65, 42, 70, 35)

# Draw arrows from execution to outputs
create_arrow(20, 25, 19, 18)
create_arrow(45, 25, 50, 18)
create_arrow(70, 25, 81, 18)

# Add time labels
ax.text(93, 79, 'Every 5 sec', fontsize=8, color=accent_color, rotation=-90, va='center')
ax.text(93, 63, 'Real-time', fontsize=8, color=accent_color, rotation=-90, va='center')
ax.text(93, 47, 'Validation', fontsize=8, color=accent_color, rotation=-90, va='center')
ax.text(93, 30, 'Execution', fontsize=8, color=accent_color, rotation=-90, va='center')
ax.text(93, 13, 'Results', fontsize=8, color=accent_color, rotation=-90, va='center')

# Add example scenario box
scenario_text = """Example: Peak Hour (2 PM, $0.35/kWh)
1. Grid signal: High price alert
2. DLI check: 65% complete (on track)
3. Algorithm: Reduce to 50% + deep red
4. Safety check: Min 400 PPFD ✓
5. Execute: Dim lights, save 35%
6. Result: $125 saved this hour"""

ax.text(50, 2, scenario_text, fontsize=9, color=text_color,
        ha='center', va='top',
        bbox=dict(boxstyle="round,pad=0.5", facecolor='#374151', edgecolor=primary_color, linewidth=2))

# Add small logos/icons
circle1 = Circle((5, 90), 2, color=primary_color)
ax.add_patch(circle1)
ax.text(5, 90, '$', fontsize=16, color='white', ha='center', va='center', weight='bold')

circle2 = Circle((95, 90), 2, color=accent_color)
ax.add_patch(circle2)
ax.text(95, 90, '⚡', fontsize=14, color='white', ha='center', va='center')

# Save the figure
downloads_path = os.path.expanduser('~/Downloads')
output_path = os.path.join(downloads_path, 'vibelux_energy_optimization_flow.jpg')
plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor=bg_color, 
            edgecolor='none', format='jpg', quality=95)
plt.close()

print(f"Energy optimization flow diagram saved to: {output_path}")