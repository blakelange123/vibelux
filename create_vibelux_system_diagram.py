#!/usr/bin/env python3
"""
VibeLux System Architecture Diagram Generator
Creates a comprehensive system diagram showing all key processes and flows
"""

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, ConnectionPatch, Circle
import numpy as np

# Set up the figure
fig, ax = plt.subplots(figsize=(24, 18))
ax.set_xlim(0, 24)
ax.set_ylim(0, 18)
ax.axis('off')

# Define color scheme
colors = {
    'user': '#4CAF50',           # Green for users
    'core': '#2196F3',           # Blue for core systems
    'marketplace': '#FF9800',    # Orange for marketplace
    'revenue': '#9C27B0',        # Purple for revenue sharing
    'investment': '#E91E63',     # Pink for investment
    'analytics': '#00BCD4',      # Cyan for analytics
    'automation': '#795548',     # Brown for automation
    'api': '#607D8B',           # Blue Grey for APIs
    'data': '#FFC107',          # Amber for data
    'flow': '#666666'           # Grey for flows
}

# Helper function to create rounded rectangle
def create_box(x, y, width, height, color, text, fontsize=10, text_color='white'):
    box = FancyBboxPatch(
        (x, y), width, height,
        boxstyle="round,pad=0.1",
        facecolor=color,
        edgecolor='white',
        linewidth=2,
        alpha=0.9
    )
    ax.add_patch(box)
    
    # Add text
    ax.text(x + width/2, y + height/2, text, 
            ha='center', va='center', fontsize=fontsize, 
            color=text_color, weight='bold', wrap=True)

# Helper function to create arrow
def create_arrow(start_x, start_y, end_x, end_y, color=colors['flow'], style='->', width=2):
    ax.annotate('', xy=(end_x, end_y), xytext=(start_x, start_y),
                arrowprops=dict(arrowstyle=style, color=color, lw=width, alpha=0.8))

# Helper function to create curved arrow
def create_curved_arrow(start_x, start_y, end_x, end_y, curve=0.3, color=colors['flow']):
    mid_x = (start_x + end_x) / 2
    mid_y = (start_y + end_y) / 2 + curve
    
    # Create bezier curve
    import matplotlib.path as mpath
    Path = mpath.Path
    
    verts = [(start_x, start_y), (mid_x, mid_y), (end_x, end_y)]
    codes = [Path.MOVETO, Path.CURVE3, Path.CURVE3]
    
    path = Path(verts, codes)
    patch = mpatches.PathPatch(path, facecolor='none', edgecolor=color, linewidth=2, alpha=0.8)
    ax.add_patch(patch)
    
    # Add arrowhead
    ax.annotate('', xy=(end_x, end_y), xytext=(end_x-0.2, end_y-0.2),
                arrowprops=dict(arrowstyle='->', color=color, lw=2, alpha=0.8))

# Title
ax.text(12, 17.5, 'VibeLux Complete System Architecture', 
        ha='center', va='center', fontsize=24, weight='bold', color='#333333')

# === USER TYPES (Top Layer) ===
# Growers
create_box(1, 15.5, 3, 1.5, colors['user'], 'GROWERS\n• Facility Operators\n• Cultivation Teams\n• Farm Managers', 9)

# Investors
create_box(5, 15.5, 3, 1.5, colors['user'], 'INVESTORS\n• Equipment Funders\n• Revenue Partners\n• VCs/Angel Investors', 9)

# Equipment Suppliers
create_box(9, 15.5, 3, 1.5, colors['user'], 'EQUIPMENT\nSUPPLIERS\n• Lighting Vendors\n• HVAC Companies\n• Tech Providers', 9)

# Service Providers
create_box(13, 15.5, 3, 1.5, colors['user'], 'SERVICE\nPROVIDERS\n• Consultants\n• Maintenance Teams\n• Integration Partners', 9)

# Buyers/Distributors
create_box(17, 15.5, 3, 1.5, colors['user'], 'BUYERS/\nDISTRIBUTORS\n• Restaurants\n• Grocery Chains\n• Distributors', 9)

# Research/Academic
create_box(21, 15.5, 2.5, 1.5, colors['user'], 'RESEARCH/\nACADEMIC\n• Universities\n• Research Labs', 9)

# === CORE PLATFORM (Central Layer) ===
# Main VibeLux Platform
create_box(8, 12.5, 8, 2, colors['core'], 
          'VIBELUX CORE PLATFORM\n• Cultivation Management • Facility Design • 3D Visualization\n• Environmental Controls • Energy Management • Automation Engine\n• Real-time Monitoring • Analytics Dashboard • AI Optimization', 12)

# === KEY MODULES (Left Side) ===
# Revenue Sharing System
create_box(0.5, 10, 4, 2, colors['revenue'], 
          'REVENUE SHARING SYSTEM\n• Baseline Establishment\n• Performance Tracking\n• Savings Calculation\n• Automated Billing\n• Contract Management\n• Dispute Resolution', 10)

# Investment Management
create_box(0.5, 7.5, 4, 2, colors['investment'], 
          'INVESTMENT MANAGEMENT\n• YEP (Yield Enhancement)\n• GAAS (Growing as Service)\n• Hybrid Models\n• Equipment Financing\n• Performance Guarantees\n• ROI Tracking', 10)

# Facility Management
create_box(0.5, 5, 4, 2, colors['automation'], 
          'FACILITY MANAGEMENT\n• Multi-site Operations\n• Environmental Optimization\n• Equipment Monitoring\n• Maintenance Scheduling\n• Compliance Tracking\n• Safety Systems', 10)

# === MARKETPLACE (Right Side) ===
# Equipment Marketplace
create_box(19, 10, 4.5, 2, colors['marketplace'], 
          'EQUIPMENT MARKETPLACE\n• Equipment Board\n• Request/Offer System\n• Escrow Services\n• Equipment Leasing\n• Performance Guarantees\n• Vendor Network', 10)

# Produce Marketplace
create_box(19, 7.5, 4.5, 2, colors['marketplace'], 
          'PRODUCE MARKETPLACE\n• Fresh Produce Trading\n• Quality Certifications\n• Logistics Coordination\n• Contract Farming\n• Price Discovery\n• Supply Chain Management', 10)

# Service Marketplace
create_box(19, 5, 4.5, 2, colors['marketplace'], 
          'SERVICE MARKETPLACE\n• Maintenance Services\n• Consulting Services\n• Installation Teams\n• Training Programs\n• Certification Services\n• Technical Support', 10)

# === ANALYTICS & DATA (Bottom Center) ===
create_box(6, 2.5, 5, 2, colors['analytics'], 
          'ANALYTICS & REPORTING\n• Performance Analytics\n• Financial Reporting\n• Predictive Modeling\n• Benchmarking\n• ROI Analysis\n• Market Intelligence', 11)

create_box(12, 2.5, 5, 2, colors['data'], 
          'DATA MANAGEMENT\n• Time-series Database\n• Real-time Processing\n• Data Validation\n• API Integration\n• Backup & Recovery\n• Data Security', 11)

# === INTEGRATION LAYER (Bottom) ===
create_box(2, 0.5, 4, 1.5, colors['api'], 
          'SENSOR INTEGRATION\n• Environmental Sensors\n• Energy Meters\n• Growth Monitoring\n• Quality Sensors', 9)

create_box(7, 0.5, 4, 1.5, colors['api'], 
          'SYSTEM INTEGRATION\n• BACnet/Modbus\n• MQTT/OPC-UA\n• REST APIs\n• Webhooks', 9)

create_box(12, 0.5, 4, 1.5, colors['api'], 
          'EXTERNAL APIS\n• Weather Data\n• Utility Companies\n• Payment Processing\n• Compliance Systems', 9)

create_box(17, 0.5, 4, 1.5, colors['api'], 
          'CLOUD SERVICES\n• AWS/Azure\n• CDN\n• Backup Storage\n• AI/ML Services', 9)

# === WORKFLOW ARROWS ===

# User interactions with core platform
create_arrow(2.5, 15.5, 10, 14.5, colors['user'])  # Growers to Core
create_arrow(6.5, 15.5, 11, 14.5, colors['investment'])  # Investors to Core
create_arrow(10.5, 15.5, 12, 14.5, colors['marketplace'])  # Equipment to Core
create_arrow(14.5, 15.5, 13, 14.5, colors['marketplace'])  # Services to Core
create_arrow(18.5, 15.5, 14, 14.5, colors['marketplace'])  # Buyers to Core

# Core platform to modules
create_arrow(8, 13, 4.5, 11, colors['revenue'])  # Core to Revenue Sharing
create_arrow(8, 12.8, 4.5, 8.5, colors['investment'])  # Core to Investment
create_arrow(8, 12.6, 4.5, 6, colors['automation'])  # Core to Facility

# Core platform to marketplaces
create_arrow(16, 13, 19, 11, colors['marketplace'])  # Core to Equipment MP
create_arrow(16, 12.8, 19, 8.5, colors['marketplace'])  # Core to Produce MP
create_arrow(16, 12.6, 19, 6, colors['marketplace'])  # Core to Service MP

# Core to analytics and data
create_arrow(12, 12.5, 8.5, 4.5, colors['analytics'])  # Core to Analytics
create_arrow(12, 12.5, 14.5, 4.5, colors['data'])  # Core to Data

# Integration layer to data management
create_arrow(4, 2, 6, 3.5, colors['api'])  # Sensors to Data
create_arrow(9, 2, 12, 3.5, colors['api'])  # Systems to Data
create_arrow(14, 2, 14.5, 2.5, colors['api'])  # External APIs to Data
create_arrow(19, 2, 17, 3.5, colors['api'])  # Cloud to Data

# Revenue flows (curved arrows)
create_curved_arrow(2.5, 10, 6.5, 15.5, 2, colors['revenue'])  # Revenue to Investors
create_curved_arrow(2.5, 8.5, 2.5, 15.5, 3, colors['investment'])  # Investment to Growers

# Marketplace flows
create_curved_arrow(21.5, 10, 10.5, 15.5, 2, colors['marketplace'])  # Equipment to Suppliers
create_curved_arrow(21.5, 7.5, 18.5, 15.5, 2, colors['marketplace'])  # Produce to Buyers
create_curved_arrow(21.5, 5, 14.5, 15.5, 2, colors['marketplace'])  # Services to Providers

# === FINANCIAL FLOWS SECTION ===
ax.text(1, 12.3, 'FINANCIAL FLOWS', ha='left', va='center', fontsize=10, weight='bold', color=colors['revenue'])
ax.text(1, 12, '💰 Revenue Sharing', ha='left', va='center', fontsize=8, color=colors['revenue'])
ax.text(1, 11.7, '💳 Equipment Financing', ha='left', va='center', fontsize=8, color=colors['investment'])
ax.text(1, 11.4, '📊 Performance Payments', ha='left', va='center', fontsize=8, color=colors['analytics'])

# === DATA FLOWS SECTION ===
ax.text(19, 12.3, 'DATA FLOWS', ha='left', va='center', fontsize=10, weight='bold', color=colors['data'])
ax.text(19, 12, '📡 Real-time Monitoring', ha='left', va='center', fontsize=8, color=colors['data'])
ax.text(19, 11.7, '📈 Performance Analytics', ha='left', va='center', fontsize=8, color=colors['analytics'])
ax.text(19, 11.4, '🔄 Automated Optimization', ha='left', va='center', fontsize=8, color=colors['automation'])

# === KEY PROCESSES ANNOTATIONS ===
# Process flow numbers
process_steps = [
    (2.5, 16.8, "1", "Grower\nOnboarding"),
    (6.5, 16.8, "2", "Investment\nMatching"),
    (10.5, 16.8, "3", "Equipment\nSourcing"),
    (12, 11.8, "4", "Facility\nOptimization"),
    (8.5, 1.8, "5", "Performance\nMonitoring"),
    (21.5, 8.8, "6", "Marketplace\nTransactions")
]

for x, y, num, label in process_steps:
    # Create circular process indicator
    circle = Circle((x, y), 0.3, color=colors['flow'], alpha=0.8)
    ax.add_patch(circle)
    ax.text(x, y, num, ha='center', va='center', fontsize=12, weight='bold', color='white')
    ax.text(x, y-0.6, label, ha='center', va='center', fontsize=8, weight='bold', color=colors['flow'])

# === LEGEND ===
legend_elements = [
    mpatches.Patch(color=colors['user'], label='User Types'),
    mpatches.Patch(color=colors['core'], label='Core Platform'),
    mpatches.Patch(color=colors['revenue'], label='Revenue Sharing'),
    mpatches.Patch(color=colors['investment'], label='Investment Management'),
    mpatches.Patch(color=colors['marketplace'], label='Marketplaces'),
    mpatches.Patch(color=colors['analytics'], label='Analytics & Reporting'),
    mpatches.Patch(color=colors['data'], label='Data Management'),
    mpatches.Patch(color=colors['api'], label='Integration Layer')
]

ax.legend(handles=legend_elements, loc='lower left', bbox_to_anchor=(0, 0.02), 
          ncol=4, fontsize=10, frameon=True, fancybox=True, shadow=True)

# === TECHNOLOGY STACK INFO ===
tech_info = """
TECHNOLOGY STACK:
• Frontend: Next.js, React, TypeScript
• Backend: Node.js, Prisma, PostgreSQL
• Real-time: WebSockets, Server-Sent Events
• APIs: REST, GraphQL, MQTT, BACnet
• Cloud: AWS/Azure, CDN, Redis
• AI/ML: Claude, OpenAI, TensorFlow
• Security: Clerk Auth, JWT, RBAC
"""

ax.text(0.5, 4.5, tech_info, fontsize=8, va='top', ha='left', 
        bbox=dict(boxstyle="round,pad=0.5", facecolor='#f0f0f0', alpha=0.8))

# === KEY METRICS INFO ===
metrics_info = """
KEY PERFORMANCE METRICS:
• 670+ Connected Devices
• 99.98% System Uptime
• <200ms Response Time
• 2.4k Updates/Second
• Real-time Optimization
• Multi-protocol Support
"""

ax.text(23.5, 4.5, metrics_info, fontsize=8, va='top', ha='right', 
        bbox=dict(boxstyle="round,pad=0.5", facecolor='#e8f5e8', alpha=0.8))

# === REVENUE STREAMS INFO ===
revenue_info = """
REVENUE STREAMS:
• Platform Subscriptions (SaaS)
• Revenue Sharing (20-40%)
• Marketplace Commissions (15%)
• Equipment Financing Fees
• Professional Services
• Data & Analytics Licensing
"""

ax.text(12, 0.2, revenue_info, fontsize=8, va='bottom', ha='center', 
        bbox=dict(boxstyle="round,pad=0.5", facecolor='#fff3e0', alpha=0.8))

# Save the diagram
plt.tight_layout()
plt.savefig('/Users/blakelange/vibelux-app/vibelux_system_architecture.jpg', 
            dpi=300, bbox_inches='tight', facecolor='white', edgecolor='none')

print("VibeLux System Architecture Diagram created successfully!")
print("Saved as: /Users/blakelange/vibelux-app/vibelux_system_architecture.jpg")

# Display the plot
plt.show()