import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, Rectangle, Circle, FancyArrowPatch
from matplotlib.patches import ConnectionPatch
import numpy as np

# VibeLux color scheme
COLORS = {
    'bg_dark': '#0f172a',      # gray-950
    'bg_medium': '#1f2937',    # gray-800
    'bg_light': '#374151',     # gray-700
    'purple': '#9333ea',       # purple-600
    'purple_light': '#a855f7', # purple-500
    'green': '#22c55e',        # green-500
    'green_light': '#4ade80',  # green-400
    'blue': '#3b82f6',         # blue-500
    'yellow': '#fbbf24',       # yellow-400
    'text_primary': '#f8fafc', # gray-50
    'text_secondary': '#d1d5db' # gray-300
}

def create_slide_template(ax, title, subtitle=""):
    """Create a consistent slide template"""
    ax.set_xlim(0, 16)
    ax.set_ylim(0, 9)
    ax.axis('off')
    
    # Background
    ax.add_patch(Rectangle((0, 0), 16, 9, facecolor=COLORS['bg_dark']))
    
    # Header gradient
    gradient = np.linspace(0, 1, 256).reshape(1, -1)
    gradient = np.vstack((gradient, gradient))
    ax.imshow(gradient, extent=[0, 16, 7.5, 9], aspect='auto', cmap='Purples_r', alpha=0.3)
    
    # Title
    ax.text(8, 8.2, title, fontsize=28, fontweight='bold', color=COLORS['text_primary'],
            ha='center', va='center')
    
    # Subtitle
    if subtitle:
        ax.text(8, 7.4, subtitle, fontsize=14, color=COLORS['text_secondary'],
                ha='center', va='center')
    
    return ax

def create_title_slide():
    """Create title slide"""
    fig, ax = plt.subplots(1, 1, figsize=(16, 9))
    ax.set_xlim(0, 16)
    ax.set_ylim(0, 9)
    ax.axis('off')
    
    # Gradient background
    ax.add_patch(Rectangle((0, 0), 16, 9, facecolor=COLORS['bg_dark']))
    
    # Add gradient overlay
    for i in range(20):
        alpha = 0.02 * (20 - i) / 20
        ax.add_patch(Circle((8, 4.5), 0.5 + i*0.3, facecolor=COLORS['purple'], alpha=alpha))
    
    # Logo area (placeholder)
    ax.add_patch(Circle((8, 6), 1, facecolor=COLORS['green'], alpha=0.8))
    ax.text(8, 6, 'V', fontsize=48, fontweight='bold', color='white', ha='center', va='center')
    
    # Title
    ax.text(8, 4, 'VibeLux Platform', fontsize=42, fontweight='bold', 
            color=COLORS['text_primary'], ha='center', va='center')
    
    # Tagline
    ax.text(8, 3, 'The Future of Controlled Environment Agriculture', 
            fontsize=18, color=COLORS['purple_light'], ha='center', va='center')
    
    # Key stats
    stats = ['500+ Features', '$0 Upfront Cost', '30-50% Energy Savings', '80/20 Revenue Share']
    for i, stat in enumerate(stats):
        x = 2 + i * 3.5
        ax.add_patch(FancyBboxPatch((x-1.5, 0.5), 3, 0.8, 
                                    boxstyle="round,pad=0.1", 
                                    facecolor=COLORS['bg_medium'],
                                    edgecolor=COLORS['green'],
                                    linewidth=2))
        ax.text(x, 0.9, stat, fontsize=12, color=COLORS['green_light'], 
                ha='center', va='center', fontweight='bold')
    
    plt.tight_layout()
    return fig

def create_cfd_showcase():
    """Create 3D Designer & CFD Analysis showcase"""
    fig, ax = plt.subplots(1, 1, figsize=(16, 9))
    ax = create_slide_template(ax, "3D Designer with Advanced CFD Analysis", 
                              "Industry-Leading Computational Fluid Dynamics")
    
    # Main CFD visualization area
    main_box = FancyBboxPatch((1, 1.5), 9, 5, boxstyle="round,pad=0.1",
                              facecolor=COLORS['bg_medium'], edgecolor=COLORS['purple'])
    ax.add_patch(main_box)
    
    # CFD visualization elements
    # Flow lines
    for i in range(8):
        y = 2 + i * 0.5
        ax.arrow(1.5, y, 7.5, 0.2 * np.sin(i), head_width=0.15, 
                head_length=0.2, fc=COLORS['blue'], alpha=0.6)
    
    # Heat map gradient
    heat_x = np.linspace(2, 8, 100)
    heat_y = np.linspace(2, 6, 100)
    X, Y = np.meshgrid(heat_x, heat_y)
    Z = np.sin(X/2) * np.cos(Y/2)
    contour = ax.contourf(X, Y, Z, levels=10, cmap='RdYlBu_r', alpha=0.5)
    
    # Feature boxes
    features = [
        ("Multiple Turbulence Models", "k-ε, k-ω SST, LES, RANS"),
        ("Real-time Mesh Generation", "Adaptive refinement"),
        ("Plant Transpiration Modeling", "Moisture & heat transfer"),
        ("Photorealistic Ray Tracing", "Path tracing & SSAO")
    ]
    
    for i, (title, desc) in enumerate(features):
        x = 11
        y = 5.5 - i * 1.2
        
        box = FancyBboxPatch((x, y-0.4), 4.5, 0.9, boxstyle="round,pad=0.05",
                            facecolor=COLORS['bg_light'], edgecolor=COLORS['green'])
        ax.add_patch(box)
        
        ax.text(x + 0.2, y, title, fontsize=12, fontweight='bold', 
                color=COLORS['green_light'])
        ax.text(x + 0.2, y - 0.3, desc, fontsize=10, 
                color=COLORS['text_secondary'])
    
    # Bottom highlight
    highlight_box = FancyBboxPatch((1, 0.3), 14, 0.8, boxstyle="round,pad=0.1",
                                  facecolor=COLORS['purple'], alpha=0.8)
    ax.add_patch(highlight_box)
    ax.text(8, 0.7, "Industry's Most Advanced 3D Visualization & Analysis Tools", 
            fontsize=14, fontweight='bold', color='white', ha='center', va='center')
    
    plt.tight_layout()
    return fig

def create_ai_ml_features():
    """Create AI/ML capabilities slide"""
    fig, ax = plt.subplots(1, 1, figsize=(16, 9))
    ax = create_slide_template(ax, "AI-Powered Intelligence", 
                              "Machine Learning & Computer Vision")
    
    # Central AI brain
    center = (8, 4)
    ax.add_patch(Circle(center, 1.5, facecolor=COLORS['purple'], alpha=0.8))
    ax.text(center[0], center[1], 'AI/ML\nCore', fontsize=16, fontweight='bold',
            color='white', ha='center', va='center')
    
    # Feature nodes
    features = [
        ("GPT-4 Integration", "Natural language insights", (3, 6)),
        ("Computer Vision", "Disease & pest detection", (13, 6)),
        ("Predictive Analytics", "Yield & energy forecasting", (3, 2)),
        ("Reinforcement Learning", "Continuous optimization", (13, 2)),
        ("Pattern Recognition", "Historical analysis", (5, 5.5)),
        ("Anomaly Detection", "Real-time alerts", (11, 5.5)),
        ("Neural Networks", "Custom ML models", (5, 2.5)),
        ("Edge Computing", "Local processing", (11, 2.5))
    ]
    
    for title, desc, pos in features:
        # Connection line
        ax.plot([center[0], pos[0]], [center[1], pos[1]], 
                color=COLORS['green'], alpha=0.3, linewidth=2)
        
        # Feature box
        box = FancyBboxPatch((pos[0]-1.8, pos[1]-0.4), 3.6, 0.8,
                            boxstyle="round,pad=0.05",
                            facecolor=COLORS['bg_medium'],
                            edgecolor=COLORS['green'])
        ax.add_patch(box)
        
        ax.text(pos[0], pos[1]+0.1, title, fontsize=11, fontweight='bold',
                color=COLORS['green_light'], ha='center')
        ax.text(pos[0], pos[1]-0.2, desc, fontsize=9,
                color=COLORS['text_secondary'], ha='center')
    
    plt.tight_layout()
    return fig

def create_energy_optimization():
    """Create energy optimization features slide"""
    fig, ax = plt.subplots(1, 1, figsize=(16, 9))
    ax = create_slide_template(ax, "Revolutionary Energy Optimization", 
                              "DLI Banking & Smart Grid Integration")
    
    # Time of day chart
    hours = np.arange(24)
    energy_rates = np.array([0.08]*6 + [0.15]*6 + [0.35]*6 + [0.15]*6)
    light_intensity = np.array([0]*6 + [1.5]*6 + [0.5]*6 + [1.2]*6)
    
    # Chart background
    chart_bg = FancyBboxPatch((1, 3), 7, 4, boxstyle="round,pad=0.1",
                             facecolor=COLORS['bg_medium'], edgecolor=COLORS['purple'])
    ax.add_patch(chart_bg)
    
    # Mini chart
    for i, (rate, intensity) in enumerate(zip(energy_rates[::2], light_intensity[::2])):
        x = 1.5 + i * 0.55
        # Rate bar
        ax.add_patch(Rectangle((x, 3.5), 0.4, rate*5, 
                              facecolor=COLORS['yellow'], alpha=0.6))
        # Intensity bar
        ax.add_patch(Rectangle((x, 3.5), 0.4, intensity*2, 
                              facecolor=COLORS['green'], alpha=0.8))
    
    ax.text(4.5, 6.7, "24-Hour Smart DLI Management", fontsize=14, 
            fontweight='bold', color=COLORS['text_primary'], ha='center')
    
    # Key features
    features = [
        ("Off-Peak Banking", "150% intensity", "Save for peak hours"),
        ("Peak Reduction", "50-75% dimming", "Maintain DLI targets"),
        ("Grid Integration", "$50-125K/year", "Demand response revenue"),
        ("Spectral Tuning", "Deep red mode", "Energy-efficient growth")
    ]
    
    for i, (title, metric, desc) in enumerate(features):
        x = 9 + (i % 2) * 3.5
        y = 5.5 - (i // 2) * 2
        
        box = FancyBboxPatch((x-1.5, y-0.6), 3, 1.2, boxstyle="round,pad=0.05",
                            facecolor=COLORS['bg_light'], edgecolor=COLORS['green'])
        ax.add_patch(box)
        
        ax.text(x, y+0.3, title, fontsize=12, fontweight='bold',
                color=COLORS['green_light'], ha='center')
        ax.text(x, y, metric, fontsize=11, fontweight='bold',
                color=COLORS['yellow'], ha='center')
        ax.text(x, y-0.3, desc, fontsize=9,
                color=COLORS['text_secondary'], ha='center')
    
    # Bottom banner
    banner = FancyBboxPatch((1, 0.5), 14, 1.2, boxstyle="round,pad=0.1",
                           facecolor=COLORS['green'], alpha=0.9)
    ax.add_patch(banner)
    ax.text(8, 1.1, "30-50% Energy Savings • $0 Upfront Cost • 80/20 Revenue Share", 
            fontsize=16, fontweight='bold', color='white', ha='center', va='center')
    
    plt.tight_layout()
    return fig

def create_platform_overview():
    """Create comprehensive platform overview"""
    fig, ax = plt.subplots(1, 1, figsize=(16, 9))
    ax = create_slide_template(ax, "Complete Platform Architecture", 
                              "67 Tool Categories • 500+ Features")
    
    # Categories with counts
    categories = [
        ("3D Design & CFD", 45, COLORS['purple']),
        ("Energy Optimization", 78, COLORS['green']),
        ("AI/ML Intelligence", 56, COLORS['blue']),
        ("Growing Operations", 89, COLORS['yellow']),
        ("Business Tools", 67, COLORS['purple_light']),
        ("Scientific Analysis", 92, COLORS['green_light']),
        ("Integration APIs", 34, COLORS['blue']),
        ("Reporting & Analytics", 41, COLORS['yellow'])
    ]
    
    # Create grid layout
    for i, (cat, count, color) in enumerate(categories):
        x = 2 + (i % 4) * 3.5
        y = 5 - (i // 4) * 2.5
        
        # Category box
        box = FancyBboxPatch((x-1.4, y-0.8), 2.8, 1.6, boxstyle="round,pad=0.1",
                            facecolor=COLORS['bg_medium'], edgecolor=color, linewidth=2)
        ax.add_patch(box)
        
        # Count circle
        ax.add_patch(Circle((x, y+0.3), 0.4, facecolor=color, alpha=0.8))
        ax.text(x, y+0.3, str(count), fontsize=14, fontweight='bold',
                color='white', ha='center', va='center')
        
        # Category name
        ax.text(x, y-0.3, cat, fontsize=11, fontweight='bold',
                color=COLORS['text_primary'], ha='center', va='center')
    
    plt.tight_layout()
    return fig

def create_customer_journey():
    """Create customer journey slide"""
    fig, ax = plt.subplots(1, 1, figsize=(16, 9))
    ax = create_slide_template(ax, "Simple 5-Step Journey", 
                              "From Application to Savings")
    
    steps = [
        ("Apply", "2 minutes", "Basic info", COLORS['purple']),
        ("AI Analysis", "Instant", "Custom plan", COLORS['blue']),
        ("Installation", "$0 cost", "Professional", COLORS['green']),
        ("Save Energy", "30-50%", "Immediate", COLORS['yellow']),
        ("Get Paid", "Monthly", "80% yours", COLORS['green_light'])
    ]
    
    y = 4.5
    for i, (title, time, desc, color) in enumerate(steps):
        x = 2 + i * 2.8
        
        # Step circle
        ax.add_patch(Circle((x, y), 0.8, facecolor=color, alpha=0.8))
        ax.text(x, y, str(i+1), fontsize=24, fontweight='bold',
                color='white', ha='center', va='center')
        
        # Step details
        ax.text(x, y-1.5, title, fontsize=14, fontweight='bold',
                color=COLORS['text_primary'], ha='center')
        ax.text(x, y-1.9, time, fontsize=12, fontweight='bold',
                color=color, ha='center')
        ax.text(x, y-2.3, desc, fontsize=10,
                color=COLORS['text_secondary'], ha='center')
        
        # Arrow
        if i < len(steps) - 1:
            arrow = FancyArrowPatch((x+0.8, y), (x+2, y),
                                  arrowstyle='->', mutation_scale=20,
                                  color=COLORS['text_secondary'], alpha=0.5)
            ax.add_patch(arrow)
    
    plt.tight_layout()
    return fig

def create_comprehensive_deck():
    """Create all slides and save"""
    slides = [
        (create_title_slide(), "title"),
        (create_cfd_showcase(), "cfd_analysis"),
        (create_ai_ml_features(), "ai_ml"),
        (create_energy_optimization(), "energy"),
        (create_platform_overview(), "platform"),
        (create_customer_journey(), "journey")
    ]
    
    # Save individual slides
    for fig, name in slides:
        fig.savefig(f'/Users/blakelange/Downloads/vibelux_pitch_{name}.jpg', 
                   dpi=300, bbox_inches='tight', facecolor=COLORS['bg_dark'])
        plt.close(fig)
    
    # Create combined presentation view
    fig_combined = plt.figure(figsize=(20, 24))
    
    for i, (slide_fig, name) in enumerate(slides):
        # Read the saved image and display in grid
        ax = fig_combined.add_subplot(3, 2, i+1)
        img = plt.imread(f'/Users/blakelange/Downloads/vibelux_pitch_{name}.jpg')
        ax.imshow(img)
        ax.axis('off')
    
    fig_combined.suptitle('VibeLux Platform - Complete Pitch Deck', 
                         fontsize=24, fontweight='bold', color=COLORS['text_primary'])
    fig_combined.patch.set_facecolor(COLORS['bg_dark'])
    plt.tight_layout()
    
    fig_combined.savefig('/Users/blakelange/Downloads/vibelux_pitch_deck_complete.jpg',
                        dpi=300, bbox_inches='tight', facecolor=COLORS['bg_dark'])
    plt.close(fig_combined)
    
    print("✅ Created comprehensive pitch deck with 6 slides")
    print("✅ Individual slides saved as separate files")
    print("✅ Combined deck saved as vibelux_pitch_deck_complete.jpg")
    print("\nKey features highlighted:")
    print("- 3D Designer with CFD Analysis (featured prominently)")
    print("- AI/ML capabilities including GPT-4 and computer vision")
    print("- Energy optimization with DLI banking")
    print("- Complete platform overview (500+ features)")
    print("- Simple customer journey")

if __name__ == "__main__":
    create_comprehensive_deck()