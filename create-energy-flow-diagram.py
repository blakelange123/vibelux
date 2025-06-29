from PIL import Image, ImageDraw, ImageFont
import os

# Create a new image with white background
width = 1600
height = 1200
img = Image.new('RGB', (width, height), color='white')
draw = ImageDraw.Draw(img)

# Try to use a basic font, fallback to default if not available
try:
    # Try to find a system font
    title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 32)
    header_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 24)
    body_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 18)
    small_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 16)
except:
    # Fallback to default font
    title_font = ImageFont.load_default()
    header_font = ImageFont.load_default()
    body_font = ImageFont.load_default()
    small_font = ImageFont.load_default()

# Define colors
green = (16, 185, 129)
blue = (59, 130, 246)
yellow = (245, 158, 11)
red = (239, 68, 68)
gray = (31, 41, 55)
light_gray = (229, 231, 235)

# Helper function to draw a rounded rectangle
def draw_rounded_rect(draw, coords, radius, fill, outline=None, width=1):
    x1, y1, x2, y2 = coords
    draw.rectangle([x1+radius, y1, x2-radius, y2], fill=fill, outline=outline, width=width)
    draw.rectangle([x1, y1+radius, x2, y2-radius], fill=fill, outline=outline, width=width)
    draw.pieslice([x1, y1, x1+2*radius, y1+2*radius], 180, 270, fill=fill, outline=outline, width=width)
    draw.pieslice([x2-2*radius, y1, x2, y1+2*radius], 270, 360, fill=fill, outline=outline, width=width)
    draw.pieslice([x1, y2-2*radius, x1+2*radius, y2], 90, 180, fill=fill, outline=outline, width=width)
    draw.pieslice([x2-2*radius, y2-2*radius, x2, y2], 0, 90, fill=fill, outline=outline, width=width)

# Helper function to draw text with wrapping
def draw_text_wrapped(draw, text, position, font, color, max_width):
    x, y = position
    lines = text.split('\n')
    for line in lines:
        draw.text((x, y), line, font=font, fill=color, anchor="mm")
        y += font.size + 5

# Draw title
draw.text((width//2, 50), "VibeLux Energy Optimization Flow", font=title_font, fill=gray, anchor="mm")
draw.text((width//2, 90), "Revenue-Sharing: $0 Upfront • 80/20 Split • 30-50% Energy Savings", 
          font=header_font, fill=green, anchor="mm")

# Layer 1: Input Sources (4 boxes)
y1 = 150
box_height = 100
box_width = 300
spacing = 80

# Grid Pricing
x1 = 100
draw_rounded_rect(draw, (x1, y1, x1+box_width, y1+box_height), 10, blue, gray, 3)
draw_text_wrapped(draw, "Real-Time Grid Pricing\n$0.08-$0.35/kWh", 
                  (x1+box_width//2, y1+box_height//2), body_font, 'white', box_width-20)

# Weather Data
x1 += box_width + spacing
draw_rounded_rect(draw, (x1, y1, x1+box_width, y1+box_height), 10, blue, gray, 3)
draw_text_wrapped(draw, "Weather & Natural Light\nSensor Data", 
                  (x1+box_width//2, y1+box_height//2), body_font, 'white', box_width-20)

# Crop Requirements
x1 += box_width + spacing
draw_rounded_rect(draw, (x1, y1, x1+box_width, y1+box_height), 10, blue, gray, 3)
draw_text_wrapped(draw, "Crop Requirements\nDLI Targets & Stage", 
                  (x1+box_width//2, y1+box_height//2), body_font, 'white', box_width-20)

# Facility Sensors
x1 += box_width + spacing
draw_rounded_rect(draw, (x1, y1, x1+box_width, y1+box_height), 10, blue, gray, 3)
draw_text_wrapped(draw, "Facility Sensors\nPPFD, Temp, CO2", 
                  (x1+box_width//2, y1+box_height//2), body_font, 'white', box_width-20)

# Draw arrows down
arrow_y = y1 + box_height + 20
for x in [250, 630, 1010, 1390]:
    draw.line([(x, y1+box_height), (x, arrow_y)], fill=gray, width=3)
    draw.polygon([(x-10, arrow_y), (x+10, arrow_y), (x, arrow_y+15)], fill=gray)

# Layer 2: Core Algorithms (2 boxes)
y2 = arrow_y + 40
algo_width = 600

# Smart Optimization
x1 = 200
draw_rounded_rect(draw, (x1, y2, x1+algo_width, y2+box_height+20), 10, green, gray, 3)
draw_text_wrapped(draw, "Smart Optimization Algorithms\n• Adaptive Baseline Learning\n• Historical Pattern Analysis\n• Peak Demand Response", 
                  (x1+algo_width//2, y2+(box_height+20)//2), body_font, 'white', algo_width-40)

# DLI Compensation
x1 += algo_width + 100
draw_rounded_rect(draw, (x1, y2, x1+algo_width, y2+box_height+20), 10, green, gray, 3)
draw_text_wrapped(draw, "DLI Compensation Engine\n• Off-Peak Banking (150%)\n• Peak Reduction (50-75%)\n• Spectral Optimization", 
                  (x1+algo_width//2, y2+(box_height+20)//2), body_font, 'white', algo_width-40)

# Draw arrows down
arrow_y2 = y2 + box_height + 40
for x in [500, 1200]:
    draw.line([(x, y2+box_height+20), (x, arrow_y2)], fill=gray, width=3)
    draw.polygon([(x-10, arrow_y2), (x+10, arrow_y2), (x, arrow_y2+15)], fill=gray)

# Layer 3: Rules Engine (1 wide box)
y3 = arrow_y2 + 40
rules_width = 1200
x1 = (width - rules_width) // 2
draw_rounded_rect(draw, (x1, y3, x1+rules_width, y3+box_height+20), 10, red, gray, 3)
draw_text_wrapped(draw, "Energy Optimization Rules Engine\n• Crop-Specific Constraints (Min PPFD, Photoperiod Protection)\n• Safety Guardrails (Never Compromise Yield)\n• Compliance & Quality Rules", 
                  (x1+rules_width//2, y3+(box_height+20)//2), body_font, 'white', rules_width-40)

# Draw arrows down
arrow_y3 = y3 + box_height + 40
for x in [400, 800, 1200]:
    draw.line([(x, y3+box_height+20), (x, arrow_y3)], fill=gray, width=3)
    draw.polygon([(x-10, arrow_y3), (x+10, arrow_y3), (x, arrow_y3+15)], fill=gray)

# Layer 4: Execution (3 boxes)
y4 = arrow_y3 + 40
exec_width = 380

# Lighting Control
x1 = 180
draw_rounded_rect(draw, (x1, y4, x1+exec_width, y4+box_height), 10, yellow, gray, 3)
draw_text_wrapped(draw, "Lighting Control\n• Dim to 30-70%\n• Deep Red Mode\n• Zone Control", 
                  (x1+exec_width//2, y4+box_height//2), body_font, 'white', exec_width-20)

# HVAC Control
x1 += exec_width + 80
draw_rounded_rect(draw, (x1, y4, x1+exec_width, y4+box_height), 10, yellow, gray, 3)
draw_text_wrapped(draw, "HVAC Optimization\n• Temperature Adjust\n• Fan Speed Control\n• Dehumidification", 
                  (x1+exec_width//2, y4+box_height//2), body_font, 'white', exec_width-20)

# Demand Response
x1 += exec_width + 80
draw_rounded_rect(draw, (x1, y4, x1+exec_width, y4+box_height), 10, yellow, gray, 3)
draw_text_wrapped(draw, "Demand Response\n• Grid Events\n• Load Shedding\n• Revenue Generation", 
                  (x1+exec_width//2, y4+box_height//2), body_font, 'white', exec_width-20)

# Draw arrows down
arrow_y4 = y4 + box_height + 20
for x in [370, 820, 1270]:
    draw.line([(x, y4+box_height), (x, arrow_y4)], fill=gray, width=3)
    draw.polygon([(x-10, arrow_y4), (x+10, arrow_y4), (x, arrow_y4+15)], fill=gray)

# Layer 5: Results (3 boxes)
y5 = arrow_y4 + 40
result_width = 400

# Energy Savings
x1 = 150
draw_rounded_rect(draw, (x1, y5, x1+result_width, y5+box_height), 10, green, gray, 3)
draw_text_wrapped(draw, "Energy Savings\n30-50% Reduction\n$15-25K/month saved", 
                  (x1+result_width//2, y5+box_height//2), header_font, 'white', result_width-20)

# Grid Revenue
x1 += result_width + 75
draw_rounded_rect(draw, (x1, y5, x1+result_width, y5+box_height), 10, green, gray, 3)
draw_text_wrapped(draw, "Grid Revenue\n$50-125K/year\nDemand Response", 
                  (x1+result_width//2, y5+box_height//2), header_font, 'white', result_width-20)

# Yield Protection
x1 += result_width + 75
draw_rounded_rect(draw, (x1, y5, x1+result_width, y5+box_height), 10, green, gray, 3)
draw_text_wrapped(draw, "Yield Protection\n100% DLI Achievement\n25% Yield Increase", 
                  (x1+result_width//2, y5+box_height//2), header_font, 'white', result_width-20)

# Add example scenario at bottom
scenario_y = y5 + box_height + 50
scenario_width = 1200
scenario_x = (width - scenario_width) // 2
draw_rounded_rect(draw, (scenario_x, scenario_y, scenario_x+scenario_width, scenario_y+80), 10, light_gray, green, 3)
draw_text_wrapped(draw, "Example: Peak Hour (2PM @ $0.35/kWh) → High price detected → DLI at 65% (on track) → Reduce to 50% + deep red\nSafety check passed → Execute dimming → Save $125 this hour", 
                  (scenario_x+scenario_width//2, scenario_y+40), small_font, gray, scenario_width-40)

# Save the image
downloads_path = os.path.expanduser('~/Downloads')
output_path = os.path.join(downloads_path, 'vibelux_energy_optimization_flow.jpg')
img.save(output_path, 'JPEG', quality=95)

print(f"Energy optimization flow diagram saved to: {output_path}")