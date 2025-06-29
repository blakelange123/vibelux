from PIL import Image, ImageDraw, ImageFont
import os

# Create a new image with dark background matching VibeLux theme
width = 1800
height = 1400
# Dark gray background like the website
bg_color = (15, 23, 42)  # rgb(15, 23, 42) - gray-950
img = Image.new('RGB', (width, height), color=bg_color)
draw = ImageDraw.Draw(img)

# Try to use a basic font, fallback to default if not available
try:
    # Try to find a system font
    title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 36)
    header_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 20)
    body_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 16)
    small_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 14)
except:
    # Fallback to default font
    title_font = ImageFont.load_default()
    header_font = ImageFont.load_default()
    body_font = ImageFont.load_default()
    small_font = ImageFont.load_default()

# VibeLux color scheme
purple = (147, 51, 234)  # Purple-600
green = (34, 197, 94)    # Green-500
yellow = (245, 158, 11)  # Yellow-500
blue = (59, 130, 246)    # Blue-500
red = (239, 68, 68)      # Red-500
gray_800 = (31, 41, 55)  # Gray-800
gray_700 = (55, 65, 81)  # Gray-700
gray_400 = (156, 163, 175)  # Gray-400
white = (255, 255, 255)

# Helper function to draw a rounded rectangle
def draw_rounded_rect(draw, coords, radius, fill, outline=None, width=2):
    x1, y1, x2, y2 = coords
    # Main rectangle
    draw.rectangle([x1+radius, y1, x2-radius, y2], fill=fill)
    draw.rectangle([x1, y1+radius, x2, y2-radius], fill=fill)
    # Corners
    draw.pieslice([x1, y1, x1+2*radius, y1+2*radius], 180, 270, fill=fill)
    draw.pieslice([x2-2*radius, y1, x2, y1+2*radius], 270, 360, fill=fill)
    draw.pieslice([x1, y2-2*radius, x1+2*radius, y2], 90, 180, fill=fill)
    draw.pieslice([x2-2*radius, y2-2*radius, x2, y2], 0, 90, fill=fill)
    # Outline if specified
    if outline:
        draw.arc([x1, y1, x1+2*radius, y1+2*radius], 180, 270, fill=outline, width=width)
        draw.arc([x2-2*radius, y1, x2, y1+2*radius], 270, 360, fill=outline, width=width)
        draw.arc([x1, y2-2*radius, x1+2*radius, y2], 90, 180, fill=outline, width=width)
        draw.arc([x2-2*radius, y2-2*radius, x2, y2], 0, 90, fill=outline, width=width)
        draw.line([x1+radius, y1, x2-radius, y1], fill=outline, width=width)
        draw.line([x1+radius, y2, x2-radius, y2], fill=outline, width=width)
        draw.line([x1, y1+radius, x1, y2-radius], fill=outline, width=width)
        draw.line([x2, y1+radius, x2, y2-radius], fill=outline, width=width)

# Helper function to draw centered text
def draw_text_centered(draw, text, x, y, font, color):
    # Get text size
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    # Draw centered
    draw.text((x - text_width//2, y - text_height//2), text, font=font, fill=color)

# Helper function to draw multiline text
def draw_multiline_text(draw, lines, x, y, font, color, line_spacing=5):
    for i, line in enumerate(lines):
        draw_text_centered(draw, line, x, y + i * (font.size + line_spacing), font, color)

# Draw title with gradient effect (purple to green like website)
draw_text_centered(draw, "VibeLux Energy Optimization Flow", width//2, 60, title_font, white)
draw_text_centered(draw, "Revenue-Sharing: $0 Upfront • 80/20 Split • 30-50% Energy Savings", 
                   width//2, 100, header_font, green)

# Layer 1: Input Sources (4 boxes)
y1 = 180
box_height = 90
box_width = 280
spacing = 100
start_x = (width - (4 * box_width + 3 * spacing)) // 2

# Input boxes
inputs = [
    ("Real-Time", "Grid Pricing", "$0.08-$0.35/kWh"),
    ("Weather Data", "Natural Light", "Sensors"),
    ("Crop Requirements", "DLI Targets", "Growth Stage"),
    ("Facility Sensors", "PPFD, Temp", "CO2, Humidity")
]

input_centers = []
for i, (line1, line2, line3) in enumerate(inputs):
    x = start_x + i * (box_width + spacing)
    draw_rounded_rect(draw, (x, y1, x+box_width, y1+box_height), 15, gray_700, gray_400, 2)
    draw_multiline_text(draw, [line1, line2, line3], x+box_width//2, y1+box_height//2, body_font, white)
    input_centers.append(x + box_width//2)

# Draw arrows down
arrow_y = y1 + box_height + 30
for x in input_centers:
    draw.line([(x, y1+box_height), (x, arrow_y)], fill=gray_400, width=3)
    # Arrow head
    draw.polygon([(x-8, arrow_y-8), (x+8, arrow_y-8), (x, arrow_y)], fill=gray_400)

# Layer 2: Core Algorithms (2 boxes)
y2 = arrow_y + 30
algo_width = 550
algo_spacing = 100
algo_start_x = (width - (2 * algo_width + algo_spacing)) // 2

algorithms = [
    ("Smart Optimization Algorithms", ["Adaptive Baseline Learning", "Historical Pattern Analysis", "Peak Demand Response"]),
    ("DLI Compensation Engine", ["Off-Peak Banking (150%)", "Peak Reduction (50-75%)", "Spectral Optimization"])
]

algo_centers = []
for i, (title, items) in enumerate(algorithms):
    x = algo_start_x + i * (algo_width + algo_spacing)
    # Gradient effect boxes
    draw_rounded_rect(draw, (x, y2, x+algo_width, y2+box_height+30), 15, green, gray_400, 2)
    draw_text_centered(draw, title, x+algo_width//2, y2+25, header_font, white)
    for j, item in enumerate(items):
        draw_text_centered(draw, f"• {item}", x+algo_width//2, y2+45+j*20, small_font, white)
    algo_centers.append(x + algo_width//2)

# Draw arrows down from algorithms
arrow_y2 = y2 + box_height + 60
for x in algo_centers:
    draw.line([(x, y2+box_height+30), (x, arrow_y2)], fill=gray_400, width=3)
    draw.polygon([(x-8, arrow_y2-8), (x+8, arrow_y2-8), (x, arrow_y2)], fill=gray_400)

# Layer 3: Rules Engine (1 wide box)
y3 = arrow_y2 + 30
rules_width = 1100
rules_x = (width - rules_width) // 2
draw_rounded_rect(draw, (rules_x, y3, rules_x+rules_width, y3+box_height+30), 15, red, gray_400, 2)
draw_text_centered(draw, "Energy Optimization Rules Engine", rules_x+rules_width//2, y3+25, header_font, white)
rules_items = [
    "• Crop-Specific Constraints (Min PPFD, Photoperiod Protection)",
    "• Safety Guardrails (Never Compromise Yield)",
    "• Compliance & Quality Rules"
]
for i, item in enumerate(rules_items):
    draw_text_centered(draw, item, rules_x+rules_width//2, y3+45+i*20, small_font, white)

# Draw arrows down from rules
arrow_y3 = y3 + box_height + 60
exec_positions = [width//4, width//2, 3*width//4]
for x in exec_positions:
    draw.line([(x, y3+box_height+30), (x, arrow_y3)], fill=gray_400, width=3)
    draw.polygon([(x-8, arrow_y3-8), (x+8, arrow_y3-8), (x, arrow_y3)], fill=gray_400)

# Layer 4: Execution (3 boxes)
y4 = arrow_y3 + 30
exec_width = 350
exec_spacing = 100
exec_start_x = (width - (3 * exec_width + 2 * exec_spacing)) // 2

execution = [
    ("Lighting Control", ["Dim to 30-70%", "Deep Red Mode", "Zone Control"]),
    ("HVAC Optimization", ["Temperature Adjust", "Fan Speed Control", "Dehumidification"]),
    ("Demand Response", ["Grid Events", "Load Shedding", "Revenue Generation"])
]

exec_centers = []
for i, (title, items) in enumerate(execution):
    x = exec_start_x + i * (exec_width + exec_spacing)
    draw_rounded_rect(draw, (x, y4, x+exec_width, y4+box_height+20), 15, yellow, gray_400, 2)
    draw_text_centered(draw, title, x+exec_width//2, y4+20, header_font, bg_color)
    for j, item in enumerate(items):
        draw_text_centered(draw, f"• {item}", x+exec_width//2, y4+40+j*18, small_font, bg_color)
    exec_centers.append(x + exec_width//2)

# Draw arrows down to results
arrow_y4 = y4 + box_height + 50
for x in exec_centers:
    draw.line([(x, y4+box_height+20), (x, arrow_y4)], fill=gray_400, width=3)
    draw.polygon([(x-8, arrow_y4-8), (x+8, arrow_y4-8), (x, arrow_y4)], fill=gray_400)

# Layer 5: Results (3 boxes)
y5 = arrow_y4 + 30
result_width = 380
result_spacing = 80
result_start_x = (width - (3 * result_width + 2 * result_spacing)) // 2

results = [
    ("Energy Savings", "30-50% Reduction", "$15-25K/month saved"),
    ("Grid Revenue", "$50-125K/year", "Demand Response"),
    ("Yield Protection", "100% DLI Target", "25% Yield Increase")
]

for i, (title, line1, line2) in enumerate(results):
    x = result_start_x + i * (result_width + result_spacing)
    # Green gradient boxes for results
    draw_rounded_rect(draw, (x, y5, x+result_width, y5+box_height+10), 15, green, gray_400, 2)
    draw_text_centered(draw, title, x+result_width//2, y5+20, header_font, white)
    draw_text_centered(draw, line1, x+result_width//2, y5+45, body_font, white)
    draw_text_centered(draw, line2, x+result_width//2, y5+65, body_font, white)

# Add example scenario at bottom
scenario_y = y5 + box_height + 60
scenario_width = 1200
scenario_x = (width - scenario_width) // 2
draw_rounded_rect(draw, (scenario_x, scenario_y, scenario_x+scenario_width, scenario_y+70), 15, gray_700, green, 2)
draw_text_centered(draw, "Example: Peak Hour (2PM @ $0.35/kWh)", scenario_x+scenario_width//2, scenario_y+20, body_font, green)
draw_text_centered(draw, "High price detected → DLI at 65% (on track) → Reduce to 50% + deep red → Safety check passed", 
                   scenario_x+scenario_width//2, scenario_y+40, small_font, white)
draw_text_centered(draw, "Execute dimming → Save $125 this hour", scenario_x+scenario_width//2, scenario_y+55, small_font, white)

# Add side labels for timing
timing_labels = [
    (y1 + box_height//2, "Every 5 sec", blue),
    (y2 + (box_height+30)//2, "Real-time", green),
    (y3 + (box_height+30)//2, "Validation", red),
    (y4 + (box_height+20)//2, "Execution", yellow),
    (y5 + (box_height+10)//2, "Results", green)
]

for y, label, color in timing_labels:
    draw_text_centered(draw, label, width - 80, y, small_font, color)

# Save the image
downloads_path = os.path.expanduser('~/Downloads')
output_path = os.path.join(downloads_path, 'vibelux_energy_optimization_flow.jpg')
img.save(output_path, 'JPEG', quality=95)

print(f"VibeLux-themed energy optimization flow diagram saved to: {output_path}")