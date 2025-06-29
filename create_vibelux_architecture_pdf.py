#!/usr/bin/env python3
"""
VibeLux System Architecture Complete Documentation Generator
Creates a comprehensive, professional multi-page PDF document about the VibeLux platform.
"""

import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak, Table, TableStyle, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.graphics.shapes import Drawing, Rect, Circle, String, Line
from reportlab.graphics import renderPDF
from reportlab.graphics.charts.barcharts import VerticalBarChart
from reportlab.graphics.charts.lineplots import LinePlot
from reportlab.lib.colors import HexColor
from datetime import datetime
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch
import numpy as np
from io import BytesIO
import tempfile

class VibeLuxArchitecturePDF:
    def __init__(self):
        # VibeLux Brand Colors
        self.colors = {
            'primary': HexColor('#6B46C1'),      # Purple
            'secondary': HexColor('#10B981'),     # Green
            'accent': HexColor('#F59E0B'),        # Yellow
            'dark': HexColor('#1F2937'),          # Dark Gray
            'light': HexColor('#F9FAFB'),         # Light Gray
            'text': HexColor('#374151'),          # Text Gray
            'border': HexColor('#E5E7EB'),        # Border Gray
            'blue': HexColor('#3B82F6'),          # Blue
            'red': HexColor('#EF4444'),           # Red
            'cyan': HexColor('#06B6D4'),          # Cyan
        }
        
        self.styles = getSampleStyleSheet()
        self.setup_custom_styles()
        self.content = []

    def setup_custom_styles(self):
        """Setup custom paragraph styles for the document"""
        # Title Page Style
        self.styles.add(ParagraphStyle(
            name='Title',
            parent=self.styles['Title'],
            fontSize=36,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=self.colors['primary']
        ))
        
        # Subtitle Style
        self.styles.add(ParagraphStyle(
            name='Subtitle',
            parent=self.styles['Normal'],
            fontSize=18,
            spaceAfter=20,
            alignment=TA_CENTER,
            textColor=self.colors['text']
        ))
        
        # Section Header Style
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading1'],
            fontSize=20,
            spaceAfter=15,
            spaceBefore=25,
            textColor=self.colors['primary'],
            borderWidth=2,
            borderColor=self.colors['primary'],
            borderPadding=10
        ))
        
        # Subsection Header Style
        self.styles.add(ParagraphStyle(
            name='SubsectionHeader',
            parent=self.styles['Heading2'],
            fontSize=16,
            spaceAfter=10,
            spaceBefore=15,
            textColor=self.colors['secondary']
        ))
        
        # Body Text Style
        self.styles.add(ParagraphStyle(
            name='BodyText',
            parent=self.styles['Normal'],
            fontSize=11,
            spaceAfter=10,
            alignment=TA_JUSTIFY,
            textColor=self.colors['text']
        ))
        
        # Caption Style
        self.styles.add(ParagraphStyle(
            name='Caption',
            parent=self.styles['Normal'],
            fontSize=9,
            spaceAfter=5,
            alignment=TA_CENTER,
            textColor=colors.grey,
            fontName='Helvetica-Oblique'
        ))

    def create_title_page(self):
        """Create the executive summary and title page"""
        # Logo placeholder (would use actual logo in production)
        logo_text = Paragraph('<b>VibeLux</b>', ParagraphStyle(
            name='Logo',
            fontSize=48,
            textColor=self.colors['primary'],
            alignment=TA_CENTER,
            spaceAfter=20
        ))
        
        title = Paragraph('System Architecture<br/>Complete Documentation', self.styles['Title'])
        
        subtitle = Paragraph(
            'Comprehensive Analysis of the VibeLux CEA Platform<br/>'
            'Business Model • Technical Infrastructure • User Workflows',
            self.styles['Subtitle']
        )
        
        # Executive Summary
        exec_summary = [
            Paragraph('<b>Executive Summary</b>', self.styles['SectionHeader']),
            Paragraph(
                'VibeLux represents a revolutionary approach to Controlled Environment Agriculture (CEA) '
                'through its comprehensive "CEA as a Service" platform. This document provides an in-depth '
                'analysis of the system architecture, business model, and technical implementation.',
                self.styles['BodyText']
            ),
            Spacer(1, 15),
            
            # Key Statistics Table
            Table([
                ['Platform Capability', 'Implementation Status', 'Key Metrics'],
                ['Equipment Investment Platform', 'Production Ready', '15% platform fee, smart escrow'],
                ['Revenue Sharing Model', 'Advanced Implementation', '20% baseline, performance-based'],
                ['IoT Device Integration', 'Comprehensive', '670+ devices, 50+ protocols'],
                ['AI/ML Analytics', 'Production Grade', '94.2% prediction accuracy'],
                ['Energy Management', 'Fully Operational', '42% average energy savings'],
                ['Multi-Facility Operations', 'Enterprise Scale', '99.8% uptime, global deployment']
            ], colWidths=[2.5*inch, 1.8*inch, 2.2*inch]),
            
            Spacer(1, 20),
            
            # Value Proposition
            Paragraph('<b>Core Value Proposition</b>', self.styles['SubsectionHeader']),
            Paragraph(
                'VibeLux eliminates traditional barriers to CEA adoption by providing equipment, software, '
                'and expertise through performance-based revenue sharing agreements. Growers get access to '
                'cutting-edge technology with zero upfront costs, paying only when they achieve measurable results.',
                self.styles['BodyText']
            ),
            
            Spacer(1, 15),
            
            # Market Position
            Paragraph('<b>Market Position</b>', self.styles['SubsectionHeader']),
            Paragraph(
                'As the first platform to combine equipment financing, IoT integration, AI optimization, '
                'and blockchain-secured revenue sharing in a single solution, VibeLux is positioned to '
                'capture significant market share in the rapidly growing $4.4B CEA market.',
                self.styles['BodyText']
            )
        ]
        
        # Document metadata
        date_text = Paragraph(
            f'Document Generated: {datetime.now().strftime("%B %d, %Y")}<br/>'
            f'Version: 1.0<br/>'
            f'Classification: Confidential',
            ParagraphStyle(
                name='Metadata',
                fontSize=10,
                alignment=TA_CENTER,
                textColor=colors.grey,
                spaceAfter=20
            )
        )
        
        self.content.extend([
            Spacer(1, 1*inch),
            logo_text,
            title,
            subtitle,
            Spacer(1, 0.5*inch),
            *exec_summary,
            Spacer(1, 1*inch),
            date_text,
            PageBreak()
        ])

    def create_system_overview(self):
        """Create system architecture overview section"""
        self.content.extend([
            Paragraph('System Architecture Overview', self.styles['SectionHeader']),
            
            Paragraph('<b>High-Level Platform Architecture</b>', self.styles['SubsectionHeader']),
            Paragraph(
                'VibeLux is built on a modern, cloud-native architecture designed for scale, reliability, '
                'and performance. The platform combines real-time data processing, machine learning, and '
                'autonomous decision-making to create the most advanced cultivation management system in the industry.',
                self.styles['BodyText']
            ),
            
            Spacer(1, 20),
            
            # Architecture Layers Table
            Table([
                ['Layer', 'Technologies', 'Purpose'],
                ['Presentation Layer', 'React/Next.js, Mobile Apps, Real-time Dashboard', 'User interfaces and visualization'],
                ['Intelligence Layer', 'ML Pipeline, Predictive Analytics, Decision Support', 'AI-powered insights and automation'],
                ['Application Layer', 'Cultivation Management, Equipment Lifecycle, Digital Twin', 'Core business logic and services'],
                ['Integration Layer', 'IoT Management, SCADA/PLC, Camera Systems, APIs', 'Device connectivity and data collection'],
                ['Data Layer', 'InfluxDB, PostgreSQL, Snowflake, MongoDB, Redis', 'Data storage and processing'],
                ['Infrastructure Layer', 'Kubernetes, AWS/Azure, Edge Computing, Kafka', 'Scalable cloud infrastructure']
            ], colWidths=[1.8*inch, 2.4*inch, 2.3*inch]),
            
            Spacer(1, 20),
            
            Paragraph('<b>Core Technology Stack</b>', self.styles['SubsectionHeader']),
            
            # Frontend Technologies
            Table([
                ['Frontend Technologies', 'Implementation'],
                ['Framework', 'Next.js 14 with React 18'],
                ['Styling', 'Tailwind CSS with custom design system'],
                ['State Management', 'Zustand for global state'],
                ['Real-time Updates', 'Socket.io for live data'],
                ['Visualization', 'D3.js and Chart.js for analytics'],
                ['3D Rendering', 'Three.js for facility modeling'],
                ['Authentication', 'Clerk for user management']
            ], colWidths=[2.2*inch, 4.3*inch]),
            
            Spacer(1, 15),
            
            # Backend Technologies
            Table([
                ['Backend Technologies', 'Implementation'],
                ['Runtime', 'Node.js with TypeScript'],
                ['Framework', 'Express.js with custom middleware'],
                ['API', 'GraphQL with Apollo Server'],
                ['Authentication', 'JWT with refresh tokens'],
                ['Validation', 'Zod for type-safe validation'],
                ['ORM', 'Prisma for database operations'],
                ['Testing', 'Jest with comprehensive test coverage']
            ], colWidths=[2.2*inch, 4.3*inch]),
            
            PageBreak()
        ])

    def create_business_model_section(self):
        """Create business model and revenue flows section"""
        self.content.extend([
            Paragraph('Business Model & Revenue Flows', self.styles['SectionHeader']),
            
            Paragraph('<b>CEA as a Service Model</b>', self.styles['SubsectionHeader']),
            Paragraph(
                'VibeLux operates on a revolutionary "CEA as a Service" model that eliminates traditional '
                'barriers to entry in controlled environment agriculture. Instead of requiring large upfront '
                'capital investments, growers access equipment, software, and expertise through performance-based '
                'revenue sharing agreements.',
                self.styles['BodyText']
            ),
            
            Spacer(1, 15),
            
            # Revenue Streams Table
            Table([
                ['Revenue Stream', 'Model', 'Implementation Status', 'Revenue Share'],
                ['Equipment Investment Platform', 'Transaction-based', 'Production Ready', '15% platform fee'],
                ['Performance-Based Revenue Sharing', 'Monthly recurring', 'Advanced Implementation', '20% of verified savings'],
                ['Software Subscriptions', 'Tiered SaaS', 'Fully Operational', '$99-$999/month'],
                ['IoT Device Marketplace', 'Commission-based', 'Active Development', '10% transaction fee'],
                ['Data Analytics Services', 'Usage-based', 'Beta Testing', '$0.10 per data point'],
                ['Compliance & Audit Services', 'Project-based', 'Pilot Program', '$5,000-$50,000 per audit']
            ], colWidths=[1.6*inch, 1.2*inch, 1.4*inch, 1.3*inch]),
            
            Spacer(1, 20),
            
            Paragraph('<b>Equipment Investment Platform</b>', self.styles['SubsectionHeader']),
            Paragraph(
                'The equipment investment platform facilitates connections between growers needing equipment '
                'and investors willing to provide capital in exchange for revenue sharing agreements. The platform '
                'uses smart escrow contracts to ensure secure transactions and automated revenue distribution.',
                self.styles['BodyText']
            ),
            
            Spacer(1, 15),
            
            # Equipment Platform Flow
            Table([
                ['Step', 'Process', 'Technology', 'Stakeholder'],
                ['1. Request Posting', 'Grower posts equipment needs', 'Equipment Request Board', 'Grower'],
                ['2. Investor Matching', 'AI matches requests with investors', 'ML Matching Algorithm', 'Platform'],
                ['3. Offer Submission', 'Investors submit financing offers', 'Smart Contract Templates', 'Investor'],
                ['4. Escrow Creation', 'Funds secured in smart escrow', 'Blockchain Escrow', 'Platform'],
                ['5. Equipment Delivery', 'Equipment delivered and verified', 'IoT Verification System', 'Vendor'],
                ['6. Performance Tracking', 'Real-time monitoring begins', 'Sensor Network', 'Platform'],
                ['7. Revenue Sharing', 'Automated monthly distributions', 'Smart Contract Execution', 'Platform']
            ], colWidths=[0.8*inch, 1.8*inch, 1.6*inch, 1.3*inch]),
            
            Spacer(1, 20),
            
            Paragraph('<b>Revenue Sharing Calculation Model</b>', self.styles['SubsectionHeader']),
            Paragraph(
                'Revenue sharing is based on verified performance improvements across multiple metrics including '
                'energy efficiency, yield increases, quality improvements, and operational cost reductions. '
                'The baseline establishment and ongoing monitoring ensure transparent and fair calculations.',
                self.styles['BodyText']
            ),
            
            PageBreak()
        ])

    def create_user_workflows_section(self):
        """Create user workflows and processes section"""
        self.content.extend([
            Paragraph('User Workflows & Processes', self.styles['SectionHeader']),
            
            Paragraph('<b>Grower Onboarding Journey</b>', self.styles['SubsectionHeader']),
            
            # Grower Workflow Table
            Table([
                ['Phase', 'Activity', 'Duration', 'Deliverables'],
                ['Initial Assessment', 'Facility audit and baseline establishment', '1-2 weeks', 'Baseline report, improvement opportunities'],
                ['Equipment Planning', 'Technology selection and configuration', '1 week', 'Equipment specification, cost estimates'],
                ['Financing Setup', 'Investor matching and agreement execution', '2-3 weeks', 'Signed agreements, escrow funding'],
                ['Installation', 'Equipment delivery and system integration', '1-2 weeks', 'Operational systems, staff training'],
                ['Optimization', 'Performance tuning and monitoring setup', '2-4 weeks', 'Optimized operations, monitoring dashboard'],
                ['Ongoing Management', 'Continuous monitoring and optimization', 'Ongoing', 'Monthly reports, revenue distributions']
            ], colWidths=[1.4*inch, 2.2*inch, 1.0*inch, 1.9*inch]),
            
            Spacer(1, 20),
            
            Paragraph('<b>Investor Experience Flow</b>', self.styles['SubsectionHeader']),
            
            # Investor Workflow Table
            Table([
                ['Stage', 'Process', 'Platform Features', 'Risk Mitigation'],
                ['Discovery', 'Browse equipment requests', 'Advanced filtering, AI recommendations', 'Verified grower profiles'],
                ['Due Diligence', 'Evaluate investment opportunities', 'Financial analytics, performance projections', 'Third-party audits'],
                ['Offer Submission', 'Submit financing proposals', 'Smart contract templates', 'Automated escrow'],
                ['Monitoring', 'Track performance and returns', 'Real-time dashboard, alerts', 'Performance guarantees'],
                ['Revenue Collection', 'Receive monthly distributions', 'Automated payments, reporting', 'Blockchain verification']
            ], colWidths=[1.2*inch, 1.8*inch, 2.0*inch, 1.5*inch]),
            
            Spacer(1, 20),
            
            Paragraph('<b>Equipment Supplier Integration</b>', self.styles['SubsectionHeader']),
            Paragraph(
                'Equipment suppliers benefit from increased sales volume and market reach through the VibeLux '
                'platform. The system provides suppliers with demand forecasting, inventory management, and '
                'direct access to qualified buyers with secured financing.',
                self.styles['BodyText']
            ),
            
            Spacer(1, 15),
            
            # Supplier Benefits Table
            Table([
                ['Benefit', 'Implementation', 'Value Proposition'],
                ['Demand Forecasting', 'AI-powered market analysis', 'Optimize inventory and production planning'],
                ['Qualified Leads', 'Pre-approved financing', 'Higher conversion rates and faster sales cycles'],
                ['Integration Tools', 'API and webhook support', 'Seamless order processing and fulfillment'],
                ['Performance Analytics', 'Real-time usage data', 'Product improvement insights and warranty optimization'],
                ['Marketing Support', 'Platform promotion', 'Increased brand visibility and market reach']
            ], colWidths=[1.5*inch, 2.0*inch, 3.0*inch]),
            
            PageBreak()
        ])

    def create_technical_implementation_section(self):
        """Create technical implementation details section"""
        self.content.extend([
            Paragraph('Technical Implementation', self.styles['SectionHeader']),
            
            Paragraph('<b>Database Architecture</b>', self.styles['SubsectionHeader']),
            Paragraph(
                'The VibeLux platform employs a polyglot persistence approach, using different database '
                'technologies optimized for specific use cases. This ensures optimal performance and scalability '
                'across all platform functions.',
                self.styles['BodyText']
            ),
            
            Spacer(1, 15),
            
            # Database Technologies Table
            Table([
                ['Database', 'Use Case', 'Data Types', 'Scale'],
                ['InfluxDB', 'Time-series sensor data', 'IoT readings, performance metrics', '2.4k updates/second'],
                ['PostgreSQL', 'Operational data', 'Users, facilities, equipment', '1M+ records'],
                ['Snowflake', 'Data warehousing', 'Analytics, historical trends', '100TB+ data'],
                ['MongoDB', 'Document storage', 'Configurations, reports', 'Flexible schemas'],
                ['Redis', 'Caching layer', 'Session data, real-time cache', '<200ms response'],
                ['Apache Kafka', 'Message streaming', 'Event processing, notifications', '10k+ msg/sec']
            ], colWidths=[1.1*inch, 1.3*inch, 1.7*inch, 1.4*inch]),
            
            Spacer(1, 20),
            
            Paragraph('<b>IoT Integration Architecture</b>', self.styles['SubsectionHeader']),
            Paragraph(
                'The platform supports comprehensive IoT device integration through multiple protocols and '
                'communication methods. Device management, data collection, and real-time monitoring are '
                'handled through a unified integration layer.',
                self.styles['BodyText']
            ),
            
            Spacer(1, 15),
            
            # IoT Protocols Table
            Table([
                ['Protocol', 'Port/Interface', 'Device Types', 'Implementation'],
                ['BACnet/IP', 'Port 47808', 'Building automation, HVAC', 'Production ready'],
                ['Modbus TCP/RTU', 'Port 502', 'Industrial PLCs, sensors', 'Production ready'],
                ['MQTT', 'Port 1883/8883', 'IoT sensors, controllers', 'Production ready'],
                ['OPC UA', 'Port 4840', 'SCADA systems', 'Production ready'],
                ['KNX/EIB', 'Port 3671', 'Building automation', 'Beta testing'],
                ['M-Bus', 'Meter-Bus', 'Energy meters', 'Beta testing'],
                ['DALI', 'Lighting protocol', 'LED controllers', 'Development'],
                ['EnOcean', 'Wireless sensors', 'Environmental sensors', 'Development'],
                ['REST API', 'HTTPS', 'Cloud services', 'Production ready'],
                ['WebSocket', 'Real-time data', 'Live monitoring', 'Production ready']
            ], colWidths=[1.0*inch, 1.0*inch, 1.5*inch, 1.0*inch]),
            
            Spacer(1, 20),
            
            Paragraph('<b>Machine Learning Pipeline</b>', self.styles['SubsectionHeader']),
            Paragraph(
                'Advanced machine learning capabilities power predictive analytics, anomaly detection, and '
                'optimization recommendations. The ML pipeline includes automated feature engineering, '
                'model training, and real-time inference.',
                self.styles['BodyText']
            ),
            
            Spacer(1, 15),
            
            # ML Models Table
            Table([
                ['Model Type', 'Purpose', 'Accuracy', 'Training Data'],
                ['Yield Prediction', 'Harvest forecasting', '94.2%', '50,000+ grow cycles'],
                ['Anomaly Detection', 'Equipment failure prediction', '93.1%', 'Multi-sensor fusion'],
                ['Energy Optimization', 'Demand response automation', '89.7%', 'Utility rate data'],
                ['Quality Prediction', 'Product quality forecasting', '91.3%', 'Lab test results'],
                ['Pest/Disease Detection', 'Computer vision analysis', '87.9%', 'Image datasets'],
                ['Growth Stage Classification', 'Automated phenotyping', '95.6%', 'Time-lapse imagery']
            ], colWidths=[1.4*inch, 1.6*inch, 0.8*inch, 1.7*inch]),
            
            PageBreak()
        ])

    def create_integration_ecosystem_section(self):
        """Create integration ecosystem details section"""
        self.content.extend([
            Paragraph('Integration Ecosystem', self.styles['SectionHeader']),
            
            Paragraph('<b>IoT Device Connectivity</b>', self.styles['SubsectionHeader']),
            Paragraph(
                'VibeLux supports over 670 connected devices across 25+ sensor types and 50+ communication '
                'protocols. The platform provides unified device management, automatic discovery, and '
                'real-time monitoring capabilities.',
                self.styles['BodyText']
            ),
            
            Spacer(1, 15),
            
            # Sensor Types Table
            Table([
                ['Sensor Category', 'Device Count', 'Key Metrics', 'Update Frequency'],
                ['Environmental', '180', 'Temperature, humidity, CO2, VPD', '30 seconds'],
                ['Lighting', '125', 'PPFD, spectrum, photoperiod', '1 minute'],
                ['Water/Nutrients', '95', 'pH, EC, flow rate, level', '2 minutes'],
                ['Plant Health', '75', 'Weight, imaging, fluorescence', '5 minutes'],
                ['Energy', '85', 'Power consumption, demand', '15 seconds'],
                ['Security', '45', 'Access control, cameras', 'Real-time'],
                ['Climate Control', '65', 'HVAC status, fan speeds', '1 minute']
            ], colWidths=[1.5*inch, 1.0*inch, 2.0*inch, 1.0*inch]),
            
            Spacer(1, 20),
            
            Paragraph('<b>External System Integrations</b>', self.styles['SubsectionHeader']),
            Paragraph(
                'The platform integrates with various external systems including climate computers, '
                'building management systems, ERP systems, and compliance tracking platforms. '
                'APIs and webhooks enable seamless data exchange and workflow automation.',
                self.styles['BodyText']
            ),
            
            Spacer(1, 15),
            
            # External Integrations Table
            Table([
                ['Integration Type', 'Systems', 'Data Exchange', 'Status'],
                ['Climate Computers', 'Priva, Argus, Link4', 'Environmental setpoints, alarms', 'Production'],
                ['Building Management', 'Schneider, Siemens, Honeywell', 'Energy data, system status', 'Production'],
                ['ERP Systems', 'SAP, Oracle, QuickBooks', 'Financial data, inventory', 'Beta'],
                ['Compliance Tracking', 'METRC, BioTrackTHC', 'Batch tracking, compliance', 'Production'],
                ['Utility APIs', 'PG&E, ConEd, ERCOT', 'Rate data, demand response', 'Production'],
                ['Weather Services', 'NOAA, Weather Underground', 'Forecast data, normalization', 'Production'],
                ['Laboratory LIMS', 'LabWare, Thermo Fisher', 'Test results, COAs', 'Development']
            ], colWidths=[1.2*inch, 1.5*inch, 1.5*inch, 0.8*inch]),
            
            Spacer(1, 20),
            
            Paragraph('<b>Third-Party Service Providers</b>', self.styles['SubsectionHeader']),
            Paragraph(
                'The platform maintains a marketplace of certified service providers including equipment '
                'installers, maintenance technicians, consultants, and compliance specialists. Service '
                'provider integration enables automated work order management and quality assurance.',
                self.styles['BodyText']
            ),
            
            Spacer(1, 15),
            
            # Service Provider Categories
            Table([
                ['Service Category', 'Provider Count', 'Capabilities', 'Certification Level'],
                ['Equipment Installation', '45', 'Lighting, HVAC, controls', 'Certified'],
                ['Maintenance Services', '32', 'Preventive, repair, calibration', 'Certified'],
                ['Consulting Services', '28', 'Design, optimization, training', 'Expert'],
                ['Compliance Auditing', '15', 'Regulatory, quality, safety', 'Professional'],
                ['Laboratory Testing', '12', 'Potency, contaminants, terpenes', 'Accredited'],
                ['Insurance Services', '8', 'Risk assessment, coverage', 'Licensed']
            ], colWidths=[1.4*inch, 1.0*inch, 1.8*inch, 1.3*inch]),
            
            PageBreak()
        ])

    def create_performance_analytics_section(self):
        """Create performance and analytics section"""
        self.content.extend([
            Paragraph('Performance & Analytics', self.styles['SectionHeader']),
            
            Paragraph('<b>Real-Time Monitoring Dashboard</b>', self.styles['SubsectionHeader']),
            Paragraph(
                'The platform provides comprehensive real-time monitoring capabilities through customizable '
                'dashboards, automated alerts, and predictive analytics. Key performance indicators are '
                'tracked continuously to enable proactive optimization.',
                self.styles['BodyText']
            ),
            
            Spacer(1, 15),
            
            # KPI Categories Table
            Table([
                ['KPI Category', 'Metrics Tracked', 'Update Frequency', 'Alert Thresholds'],
                ['Production', 'Yield, quality grades, cycle time', 'Daily', '±10% variance'],
                ['Energy', 'Consumption, demand, efficiency', 'Real-time', '±5% baseline'],
                ['Environmental', 'Temperature, humidity, CO2, VPD', '30 seconds', 'Out of range >1hr'],
                ['Financial', 'Cost per gram, ROI, cash flow', 'Weekly', '±15% budget'],
                ['Equipment', 'Runtime, efficiency, failures', 'Continuous', 'Failure prediction'],
                ['Quality', 'Lab results, compliance, defects', 'Per batch', 'Specification limits']
            ], colWidths=[1.2*inch, 1.8*inch, 1.0*inch, 1.5*inch]),
            
            Spacer(1, 20),
            
            Paragraph('<b>Optimization Algorithms</b>', self.styles['SubsectionHeader']),
            Paragraph(
                'Advanced optimization algorithms continuously analyze facility operations to identify '
                'improvement opportunities. The system provides automated recommendations and can '
                'implement approved optimizations through equipment control interfaces.',
                self.styles['BodyText']
            ),
            
            Spacer(1, 15),
            
            # Optimization Categories
            Table([
                ['Optimization Type', 'Algorithm', 'Improvement Target', 'Implementation'],
                ['Energy Efficiency', 'Genetic Algorithm', '20-40% reduction', 'Automated'],
                ['Yield Maximization', 'Neural Network', '15-25% increase', 'Recommendations'],
                ['Quality Enhancement', 'Random Forest', '10-20% grade improvement', 'Semi-automated'],
                ['Environmental Stability', 'PID Control', '±2°F, ±5% RH precision', 'Automated'],
                ['Resource Optimization', 'Linear Programming', '15-30% waste reduction', 'Recommendations'],
                ['Scheduling Optimization', 'Constraint Satisfaction', '10-15% cycle reduction', 'Semi-automated']
            ], colWidths=[1.3*inch, 1.2*inch, 1.4*inch, 1.1*inch]),
            
            Spacer(1, 20),
            
            Paragraph('<b>Reporting and Insights</b>', self.styles['SubsectionHeader']),
            Paragraph(
                'Comprehensive reporting capabilities provide stakeholders with detailed insights into '
                'facility performance, financial metrics, and optimization opportunities. Reports are '
                'automatically generated and can be customized for different audiences.',
                self.styles['BodyText']
            ),
            
            Spacer(1, 15),
            
            # Report Types Table
            Table([
                ['Report Type', 'Frequency', 'Recipients', 'Content Focus'],
                ['Executive Dashboard', 'Real-time', 'Management, investors', 'KPIs, financial performance'],
                ['Operations Report', 'Daily', 'Facility managers', 'Production, equipment status'],
                ['Financial Summary', 'Monthly', 'Stakeholders', 'Revenue sharing, ROI analysis'],
                ['Compliance Report', 'As required', 'Regulators', 'Quality, safety, traceability'],
                ['Performance Analysis', 'Quarterly', 'All users', 'Trends, benchmarking, optimization'],
                ['Investor Update', 'Monthly', 'Equipment investors', 'Returns, performance guarantees']
            ], colWidths=[1.3*inch, 0.9*inch, 1.5*inch, 1.8*inch]),
            
            PageBreak()
        ])

    def create_future_roadmap_section(self):
        """Create future roadmap and scaling section"""
        self.content.extend([
            Paragraph('Future Roadmap & Scaling Strategy', self.styles['SectionHeader']),
            
            Paragraph('<b>Technology Evolution Roadmap</b>', self.styles['SubsectionHeader']),
            Paragraph(
                'VibeLux maintains an aggressive technology roadmap focused on expanding capabilities, '
                'improving performance, and entering new markets. The roadmap prioritizes features that '
                'drive customer value and competitive differentiation.',
                self.styles['BodyText']
            ),
            
            Spacer(1, 15),
            
            # Roadmap Timeline Table
            Table([
                ['Timeline', 'Focus Area', 'Key Deliverables', 'Market Impact'],
                ['Q1 2024', 'AI/ML Enhancement', 'Computer vision, NLP, edge AI', 'Advanced automation'],
                ['Q2 2024', 'Integration Expansion', 'Blockchain, IoT mesh, robotics', 'Ecosystem growth'],
                ['Q3 2024', 'Platform Scaling', 'Multi-tenant, API marketplace', 'Enterprise adoption'],
                ['Q4 2024', 'Advanced Features', 'Quantum computing, AR/VR, predictive supply chain', 'Market leadership'],
                ['2025', 'Global Expansion', 'International deployment, localization', 'Global presence'],
                ['2026+', 'Next Generation', 'Autonomous facilities, AI-driven breeding', 'Industry transformation']
            ], colWidths=[0.9*inch, 1.3*inch, 2.2*inch, 1.1*inch]),
            
            Spacer(1, 20),
            
            Paragraph('<b>Market Expansion Strategy</b>', self.styles['SubsectionHeader']),
            Paragraph(
                'The platform is designed for rapid scaling across multiple markets and facility types. '
                'Expansion strategy focuses on high-value segments with strong regulatory frameworks '
                'and technology adoption rates.',
                self.styles['BodyText']
            ),
            
            Spacer(1, 15),
            
            # Market Expansion Table
            Table([
                ['Market Segment', 'Opportunity Size', 'Implementation Timeline', 'Key Success Factors'],
                ['Cannabis Cultivation', '$2.1B', 'Current focus', 'Compliance, quality optimization'],
                ['Vertical Farming', '$1.8B', '2024 expansion', 'Energy efficiency, urban markets'],
                ['Greenhouse Production', '$4.4B', '2024-2025', 'Climate integration, scale'],
                ['Research Facilities', '$800M', '2025', 'Data quality, publication tools'],
                ['Pharmaceutical Growing', '$1.2B', '2025-2026', 'GMP compliance, traceability'],
                ['International Markets', '$8B+', '2026+', 'Localization, partnerships']
            ], colWidths=[1.4*inch, 1.0*inch, 1.2*inch, 1.9*inch]),
            
            Spacer(1, 20),
            
            Paragraph('<b>Scaling Infrastructure</b>', self.styles['SubsectionHeader']),
            Paragraph(
                'Platform infrastructure is designed to scale elastically with customer growth. Cloud-native '
                'architecture, microservices design, and automated scaling ensure consistent performance '
                'regardless of user volume or data throughput.',
                self.styles['BodyText']
            ),
            
            Spacer(1, 15),
            
            # Scaling Metrics Table
            Table([
                ['Metric', 'Current Capacity', 'Target Capacity', 'Scaling Method'],
                ['Concurrent Users', '1,000+', '100,000+', 'Horizontal pod autoscaling'],
                ['Data Throughput', '2.4k/sec', '100k/sec', 'Kafka partitioning'],
                ['Facilities Supported', '50', '10,000', 'Multi-tenant architecture'],
                ['Geographic Regions', '2', '25+', 'Edge computing nodes'],
                ['API Requests', '10M/day', '1B/day', 'CDN and caching'],
                ['Storage Capacity', '100TB', '100PB', 'Distributed storage']
            ], colWidths=[1.3*inch, 1.1*inch, 1.1*inch, 1.5*inch]),
            
            Spacer(1, 20),
            
            Paragraph('<b>Competitive Advantages</b>', self.styles['SubsectionHeader']),
            Paragraph(
                'VibeLux maintains sustainable competitive advantages through proprietary technology, '
                'network effects, and first-mover advantages in the equipment financing space. The platform '
                'benefits from increasing returns to scale and data network effects.',
                self.styles['BodyText']
            ),
            
            Spacer(1, 15),
            
            # Competitive Advantages
            Table([
                ['Advantage Type', 'Description', 'Moat Strength', 'Sustainability'],
                ['Technology Platform', 'Integrated CEA platform', 'High', 'Strong IP portfolio'],
                ['Network Effects', 'More users = better matching', 'Very High', 'Self-reinforcing'],
                ['Data Advantage', 'Largest CEA dataset', 'High', 'Continuous accumulation'],
                ['Financial Innovation', 'Equipment financing model', 'Very High', 'First-mover advantage'],
                ['Ecosystem Lock-in', 'Integrated value chain', 'Medium', 'Switching costs'],
                ['Operational Excellence', 'Proven results delivery', 'Medium', 'Continuous improvement']
            ], colWidths=[1.2*inch, 1.6*inch, 1.0*inch, 1.3*inch])
        ])

    def add_table_style(self, table):
        """Add consistent styling to tables"""
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), self.colors['primary']),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 0.5, self.colors['border']),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, self.colors['light']])
        ]))
        return table

    def create_pdf(self, filename="VibeLux_System_Architecture_Complete.pdf"):
        """Generate the complete PDF document"""
        # Create the PDF in Downloads folder
        downloads_path = os.path.expanduser("~/Downloads")
        full_path = os.path.join(downloads_path, filename)
        
        # Create document
        doc = SimpleDocTemplate(
            full_path,
            pagesize=letter,
            rightMargin=0.75*inch,
            leftMargin=0.75*inch,
            topMargin=1*inch,
            bottomMargin=0.75*inch
        )
        
        # Build content
        self.create_title_page()
        self.create_system_overview()
        self.create_business_model_section()
        self.create_user_workflows_section()
        self.create_technical_implementation_section()
        self.create_integration_ecosystem_section()
        self.create_performance_analytics_section()
        self.create_future_roadmap_section()
        
        # Apply table styling to all tables
        for item in self.content:
            if isinstance(item, Table):
                self.add_table_style(item)
        
        # Build PDF
        doc.build(self.content)
        
        return full_path

def main():
    """Main function to generate the VibeLux Architecture PDF"""
    print("🚀 Generating VibeLux System Architecture Complete Documentation...")
    
    # Create PDF generator
    pdf_generator = VibeLuxArchitecturePDF()
    
    # Generate PDF
    output_path = pdf_generator.create_pdf()
    
    print(f"✅ PDF generated successfully!")
    print(f"📄 Location: {output_path}")
    print(f"📊 Document: VibeLux System Architecture Complete Documentation")
    print(f"📝 Pages: ~12 pages of comprehensive analysis")
    print(f"🎯 Content: Business model, technical architecture, user workflows, and scaling strategy")

if __name__ == "__main__":
    main()