from PIL import Image, ImageDraw, ImageFont
import os

# Create function to draw boxes with proper text fitting
def create_flow_diagram(filename, title, subtitle, diagram_type="energy"):
    # Create a new image with dark background matching VibeLux theme
    width = 1800
    height = 1400
    bg_color = (15, 23, 42)  # gray-950
    img = Image.new('RGB', (width, height), color=bg_color)
    draw = ImageDraw.Draw(img)

    # Try to use system fonts with smaller sizes
    try:
        title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 32)
        header_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 18)
        body_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 14)
        small_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 12)
    except:
        title_font = ImageFont.load_default()
        header_font = ImageFont.load_default()
        body_font = ImageFont.load_default()
        small_font = ImageFont.load_default()

    # VibeLux colors
    purple = (147, 51, 234)
    green = (34, 197, 94)
    yellow = (245, 158, 11)
    blue = (59, 130, 246)
    red = (239, 68, 68)
    gray_800 = (31, 41, 55)
    gray_700 = (55, 65, 81)
    gray_400 = (156, 163, 175)
    white = (255, 255, 255)

    # Draw rounded rectangle
    def draw_box(x, y, w, h, color, border_color=gray_400):
        # Simple rectangle with border
        draw.rectangle([x, y, x+w, y+h], fill=color, outline=border_color, width=2)

    # Draw text that fits in box
    def draw_text_in_box(text_lines, x, y, w, h, font, color):
        line_count = len(text_lines)
        total_height = line_count * 16  # Approximate line height
        start_y = y + (h - total_height) // 2
        
        for i, line in enumerate(text_lines):
            text_y = start_y + i * 16
            # Simple left-aligned text with padding
            draw.text((x + 10, text_y), line, font=font, fill=color)

    # Title
    title_bbox = draw.textbbox((0, 0), title, font=title_font)
    title_width = title_bbox[2] - title_bbox[0]
    draw.text(((width - title_width) // 2, 40), title, font=title_font, fill=white)
    
    subtitle_bbox = draw.textbbox((0, 0), subtitle, font=header_font)
    subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
    draw.text(((width - subtitle_width) // 2, 80), subtitle, font=header_font, fill=green)

    if diagram_type == "energy":
        # ENERGY OPTIMIZATION FLOW DIAGRAM
        
        # Layer 1: Inputs (4 boxes)
        y1 = 140
        box_h = 80
        box_w = 300
        spacing = 80
        start_x = (width - (4 * box_w + 3 * spacing)) // 2

        inputs = [
            ["Grid Pricing", "$0.08-$0.35/kWh", "Real-time rates"],
            ["Weather Data", "Natural light sensors", "Temperature/humidity"],
            ["Crop Requirements", "DLI targets", "Growth stage"],
            ["Facility Sensors", "PPFD, CO2", "Environmental data"]
        ]

        for i, lines in enumerate(inputs):
            x = start_x + i * (box_w + spacing)
            draw_box(x, y1, box_w, box_h, gray_700)
            draw_text_in_box(lines, x, y1, box_w, box_h, small_font, white)

        # Arrows down
        arrow_y = y1 + box_h + 20
        for i in range(4):
            x = start_x + i * (box_w + spacing) + box_w // 2
            draw.line([(x, y1 + box_h), (x, arrow_y)], fill=gray_400, width=2)
            draw.polygon([(x-5, arrow_y-5), (x+5, arrow_y-5), (x, arrow_y)], fill=gray_400)

        # Layer 2: Algorithms (2 boxes)
        y2 = arrow_y + 30
        algo_w = 500
        algo_spacing = 150
        algo_x = (width - (2 * algo_w + algo_spacing)) // 2

        algos = [
            ["Smart Optimization", "• Adaptive baseline learning", "• Historical patterns", "• Peak demand response"],
            ["DLI Compensation", "• Off-peak banking (150%)", "• Peak reduction (50-75%)", "• Spectral optimization"]
        ]

        for i, lines in enumerate(algos):
            x = algo_x + i * (algo_w + algo_spacing)
            draw_box(x, y2, algo_w, box_h + 20, green)
            draw_text_in_box(lines, x, y2, algo_w, box_h + 20, body_font, white)

        # Arrows down
        arrow_y2 = y2 + box_h + 40
        for i in range(2):
            x = algo_x + i * (algo_w + algo_spacing) + algo_w // 2
            draw.line([(x, y2 + box_h + 20), (x, arrow_y2)], fill=gray_400, width=2)
            draw.polygon([(x-5, arrow_y2-5), (x+5, arrow_y2-5), (x, arrow_y2)], fill=gray_400)

        # Layer 3: Rules Engine
        y3 = arrow_y2 + 30
        rules_w = 1000
        rules_x = (width - rules_w) // 2
        draw_box(rules_x, y3, rules_w, box_h + 20, red)
        draw_text_in_box([
            "Energy Optimization Rules Engine",
            "• Crop constraints (min PPFD, photoperiod)",
            "• Safety guardrails (never compromise yield)",
            "• Compliance & quality rules"
        ], rules_x, y3, rules_w, box_h + 20, body_font, white)

        # Arrows down
        arrow_y3 = y3 + box_h + 40
        for i in range(3):
            x = rules_x + 200 + i * 300
            draw.line([(x, y3 + box_h + 20), (x, arrow_y3)], fill=gray_400, width=2)
            draw.polygon([(x-5, arrow_y3-5), (x+5, arrow_y3-5), (x, arrow_y3)], fill=gray_400)

        # Layer 4: Execution
        y4 = arrow_y3 + 30
        exec_w = 320
        exec_spacing = 100
        exec_x = (width - (3 * exec_w + 2 * exec_spacing)) // 2

        execution = [
            ["Lighting Control", "• Dim to 30-70%", "• Deep red mode", "• Zone control"],
            ["HVAC Control", "• Temperature adjust", "• Fan speed", "• Dehumidification"],
            ["Demand Response", "• Grid events", "• Load shedding", "• Revenue capture"]
        ]

        for i, lines in enumerate(execution):
            x = exec_x + i * (exec_w + exec_spacing)
            draw_box(x, y4, exec_w, box_h + 10, yellow)
            draw_text_in_box(lines, x, y4, exec_w, box_h + 10, small_font, bg_color)

        # Arrows down
        arrow_y4 = y4 + box_h + 30
        for i in range(3):
            x = exec_x + i * (exec_w + exec_spacing) + exec_w // 2
            draw.line([(x, y4 + box_h + 10), (x, arrow_y4)], fill=gray_400, width=2)
            draw.polygon([(x-5, arrow_y4-5), (x+5, arrow_y4-5), (x, arrow_y4)], fill=gray_400)

        # Layer 5: Results
        y5 = arrow_y4 + 30
        result_w = 350
        result_spacing = 80
        result_x = (width - (3 * result_w + 2 * result_spacing)) // 2

        results = [
            ["Energy Savings", "30-50% reduction", "$15-25K/month"],
            ["Grid Revenue", "$50-125K/year", "Demand response"],
            ["Yield Protection", "100% DLI target", "25% increase"]
        ]

        for i, lines in enumerate(results):
            x = result_x + i * (result_w + result_spacing)
            draw_box(x, y5, result_w, box_h, green)
            draw_text_in_box(lines, x, y5, result_w, box_h, body_font, white)

        # Example box
        example_y = y5 + box_h + 40
        example_w = 1200
        example_x = (width - example_w) // 2
        draw_box(example_x, example_y, example_w, 60, gray_700, green)
        draw_text_in_box([
            "Example: Peak Hour (2PM @ $0.35/kWh)",
            "Grid alert → Check DLI (65% complete) → Reduce to 50% + deep red → Save $125/hour"
        ], example_x, example_y, example_w, 60, body_font, white)

    else:  # Revenue sharing diagram
        # REVENUE SHARING MODEL DIAGRAM
        
        # Top section - How it works
        y1 = 140
        section_w = 1400
        section_x = (width - section_w) // 2
        
        # Step boxes
        step_h = 100
        step_w = 320
        step_spacing = 30
        steps_x = (width - (4 * step_w + 3 * step_spacing)) // 2
        
        steps = [
            ["1. Application", "• 2-minute process", "• Basic facility info", "• Energy usage data"],
            ["2. Analysis", "• AI optimization audit", "• Savings calculation", "• Custom proposal"],
            ["3. Installation", "• Professional setup", "• System integration", "• No upfront cost"],
            ["4. Savings Split", "• Monitor savings", "• 80/20 split", "• Monthly payments"]
        ]
        
        for i, lines in enumerate(steps):
            x = steps_x + i * (step_w + step_spacing)
            color = purple if i == 0 else blue if i == 1 else yellow if i == 2 else green
            draw_box(x, y1, step_w, step_h, color)
            draw_text_in_box(lines, x, y1, step_w, step_h, body_font, white)
            
            # Arrow between steps
            if i < 3:
                arrow_x = x + step_w + step_spacing // 2
                draw.line([(x + step_w, y1 + step_h // 2), (arrow_x - 5, y1 + step_h // 2)], fill=gray_400, width=2)
                draw.polygon([
                    (arrow_x - 5, y1 + step_h // 2 - 5),
                    (arrow_x - 5, y1 + step_h // 2 + 5),
                    (arrow_x, y1 + step_h // 2)
                ], fill=gray_400)
        
        # Middle section - Revenue flow
        y2 = y1 + step_h + 80
        flow_h = 300
        flow_w = 1200
        flow_x = (width - flow_w) // 2
        
        # Draw main revenue flow box
        draw_box(flow_x, y2, flow_w, flow_h, gray_800, green)
        
        # Monthly savings breakdown
        savings_y = y2 + 20
        draw.text((flow_x + flow_w // 2 - 100, savings_y), "Monthly Energy Savings", font=header_font, fill=white)
        
        # Example calculation
        calc_y = savings_y + 40
        calc_lines = [
            "Example: 50,000 sq ft facility",
            "Previous monthly bill: $50,000",
            "Optimized monthly bill: $35,000",
            "Total monthly savings: $15,000"
        ]
        for i, line in enumerate(calc_lines):
            draw.text((flow_x + 50, calc_y + i * 25), line, font=body_font, fill=white)
        
        # Split visualization
        split_y = calc_y + 120
        split_w = 800
        split_x = flow_x + (flow_w - split_w) // 2
        
        # Grower portion (80%)
        grower_w = int(split_w * 0.8)
        draw_box(split_x, split_y, grower_w, 60, green)
        draw.text((split_x + grower_w // 2 - 80, split_y + 20), "Your Savings: $12,000 (80%)", font=body_font, fill=white)
        
        # VibeLux portion (20%)
        vibelux_w = int(split_w * 0.2)
        draw_box(split_x + grower_w, split_y, vibelux_w, 60, blue)
        draw.text((split_x + grower_w + 20, split_y + 20), "VibeLux: $3,000", font=small_font, fill=white)
        
        # Bottom section - Benefits
        y3 = y2 + flow_h + 60
        benefit_h = 120
        benefit_w = 350
        benefit_spacing = 50
        benefits_x = (width - (3 * benefit_w + 2 * benefit_spacing)) // 2
        
        benefits = [
            ["Zero Risk", "• $0 upfront investment", "• No equipment purchase", "• Pay only from savings", "• Cancel anytime"],
            ["Guaranteed Savings", "• 30-50% energy reduction", "• AI optimization 24/7", "• Grid revenue capture", "• Performance guarantee"],
            ["Full Service", "• Professional installation", "• Ongoing monitoring", "• System maintenance", "• Regular optimization"]
        ]
        
        for i, lines in enumerate(benefits):
            x = benefits_x + i * (benefit_w + benefit_spacing)
            draw_box(x, y3, benefit_w, benefit_h, gray_700)
            draw_text_in_box(lines, x, y3, benefit_w, benefit_h, small_font, white)
        
        # Qualification criteria
        qual_y = y3 + benefit_h + 40
        qual_w = 1000
        qual_x = (width - qual_w) // 2
        draw_box(qual_x, qual_y, qual_w, 80, gray_700, yellow)
        draw_text_in_box([
            "Qualification Requirements",
            "• Minimum 5,000 sq ft cultivation space",
            "• $10,000+ monthly energy spend",
            "• Compatible control system (Argus, Priva, TrolMaster, etc.)"
        ], qual_x, qual_y, qual_w, 80, body_font, white)

    # Save the image
    downloads_path = os.path.expanduser('~/Downloads')
    output_path = os.path.join(downloads_path, filename)
    img.save(output_path, 'JPEG', quality=95)
    return output_path

# Create both diagrams
energy_path = create_flow_diagram(
    'vibelux_energy_optimization_flow_fixed.jpg',
    'VibeLux Energy Optimization Flow',
    'Revenue Sharing: $0 Upfront • 80/20 Split • 30-50% Savings',
    'energy'
)
print(f"Energy optimization flow saved to: {energy_path}")

revenue_path = create_flow_diagram(
    'vibelux_revenue_sharing_model.jpg',
    'VibeLux Revenue Sharing Model',
    'How We Share Success With Our Growers',
    'revenue'
)
print(f"Revenue sharing model saved to: {revenue_path}")