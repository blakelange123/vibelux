import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, Rectangle
import os

# Disable mathtext to avoid font issues
plt.rcParams['text.usetex'] = False
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['Arial', 'Helvetica', 'DejaVu Sans']

# Create figure and axis
fig, ax = plt.subplots(1, 1, figsize=(14, 10))
ax.set_xlim(0, 100)
ax.set_ylim(0, 100)
ax.axis('off')

# Define colors
primary_color = '#10b981'  # Green
secondary_color = '#3b82f6'  # Blue
accent_color = '#f59e0b'    # Yellow
warning_color = '#ef4444'   # Red
bg_color = '#1f2937'        # Dark gray
text_color = '#000000'      # Black for better visibility

# Set white background for better visibility
fig.patch.set_facecolor('white')
ax.set_facecolor('white')

# Title
ax.text(50, 95, 'VibeLux Energy Optimization Flow', 
        fontsize=20, fontweight='bold', color='#1f2937', 
        ha='center', va='center')

ax.text(50, 90, 'Revenue-Sharing: $0 Upfront • 80/20 Split • 30-50% Savings', 
        fontsize=12, color=primary_color, ha='center', va='center', weight='bold')

# Define box style
def create_box(x, y, width, height, text, color, text_size=9):
    box = Rectangle((x, y), width, height,
                    facecolor=color,
                    edgecolor='#1f2937',
                    linewidth=2,
                    alpha=0.8)
    ax.add_patch(box)
    
    # Add text with proper line breaks
    lines = text.split('\n')
    line_height = height / (len(lines) + 1)
    for i, line in enumerate(lines):
        ax.text(x + width/2, y + height - (i+1)*line_height, line,
                fontsize=text_size, color='white',
                ha='center', va='center', weight='bold')

# Define arrow style
def create_arrow(x1, y1, x2, y2, text=''):
    ax.arrow(x1, y1, x2-x1, y2-y1, 
             head_width=1.5, head_length=1, 
             fc='#374151', ec='#374151', linewidth=2)
    
    if text:
        mid_x = (x1 + x2) / 2
        mid_y = (y1 + y2) / 2
        ax.text(mid_x, mid_y + 1, text, fontsize=8, color='#1f2937',
                ha='center', va='center', weight='bold')

# Layer 1: Input Sources (Top)
create_box(5, 75, 18, 8, 'Grid Pricing\n$0.08-$0.35/kWh', secondary_color)
create_box(27, 75, 18, 8, 'Weather Data\nNatural Light', secondary_color)
create_box(49, 75, 18, 8, 'Crop Requirements\nDLI Targets', secondary_color)
create_box(71, 75, 18, 8, 'Facility Sensors\nPPFD, Temp, CO2', secondary_color)

# Layer 2: Core Algorithms
create_box(15, 58, 30, 10, 'Smart Optimization\nAdaptive Learning\nPeak Response', primary_color)
create_box(55, 58, 30, 10, 'DLI Compensation\nOff-Peak Banking\nSpectral Optimization', primary_color)

# Layer 3: Rules Engine
create_box(25, 40, 50, 10, 'Safety & Rules Engine\nCrop Constraints • Never Compromise Yield\nMin PPFD • Photoperiod Protection', warning_color)

# Layer 4: Execution
create_box(10, 23, 20, 10, 'Lighting Control\nDim 30-70%\nDeep Red Mode', accent_color)
create_box(35, 23, 20, 10, 'HVAC Control\nTemp Adjust\nFan Speed', accent_color)
create_box(60, 23, 20, 10, 'Grid Response\nDemand Events\nRevenue Gen', accent_color)

# Layer 5: Results
create_box(5, 5, 28, 10, 'Energy Savings\n30-50% Reduction\n$15-25K/month', primary_color, 10)
create_box(36, 5, 28, 10, 'Grid Revenue\n$50-125K/year\nNo Upfront Cost', primary_color, 10)
create_box(67, 5, 28, 10, 'Yield Protection\n100% DLI Target\n25% Increase', primary_color, 10)

# Draw connecting lines (simplified arrows)
# Inputs to algorithms
for x in [14, 36, 58, 80]:
    ax.plot([x, x-10+15 if x < 50 else x-15+15], [75, 68], 'k-', linewidth=2)

# Algorithms to rules
ax.plot([30, 40], [58, 50], 'k-', linewidth=2)
ax.plot([70, 60], [58, 50], 'k-', linewidth=2)

# Rules to execution
ax.plot([35, 20], [40, 33], 'k-', linewidth=2)
ax.plot([50, 45], [40, 33], 'k-', linewidth=2)
ax.plot([65, 70], [40, 33], 'k-', linewidth=2)

# Execution to results
ax.plot([20, 19], [23, 15], 'k-', linewidth=2)
ax.plot([45, 50], [23, 15], 'k-', linewidth=2)
ax.plot([70, 81], [23, 15], 'k-', linewidth=2)

# Add example scenario
scenario_text = "Example: Peak Hour (2PM @ $0.35/kWh)\n1. High price detected → 2. DLI at 65% (on track) → 3. Reduce to 50% + deep red\n4. Safety check passed → 5. Execute dimming → 6. Save $125 this hour"

ax.text(50, -2, scenario_text, fontsize=10, color='#1f2937',
        ha='center', va='top', weight='bold',
        bbox=dict(boxstyle="round,pad=0.5", facecolor='#e5e7eb', edgecolor=primary_color, linewidth=2))

# Save the figure
downloads_path = os.path.expanduser('~/Downloads')
output_path = os.path.join(downloads_path, 'vibelux_energy_optimization_flow.jpg')
plt.savefig(output_path, dpi=300, bbox_inches='tight', 
            format='jpg', quality=95)
plt.close()

print(f"Energy optimization flow diagram saved to: {output_path}")