# Polygon Room Support - Testing Guide

## Overview
The Advanced Designer now supports non-rectangular (polygon) rooms! This feature allows you to design lighting layouts for L-shaped, T-shaped, U-shaped, and custom polygon rooms.

## How to Use

1. **Access the Advanced Designer**
   - Navigate to `/design/advanced` in your application

2. **Switch to Polygon Mode**
   - Look for the "Room Shape Editor" section
   - Click the "Polygon" button (next to "Rectangle")

3. **Create Your Room Shape**
   
   **Option A - Use Predefined Shapes:**
   - Click on one of the predefined shape buttons:
     - L-Shape
     - T-Shape  
     - U-Shape
     - Hexagon

   **Option B - Draw Custom Shape:**
   - Click anywhere on the canvas to add vertices
   - Minimum 3 vertices required to form a valid polygon
   - Click and drag existing vertices to adjust their position
   - Click on a vertex and press Delete to remove it (if more than 3 vertices exist)

4. **Configure Room Settings**
   - Set the room width and height (defines the bounding box)
   - Set mounting height for fixtures
   - Set target PPFD and other parameters
   - The actual room area will be calculated based on the polygon shape

5. **Place Fixtures**
   - Select a fixture from the library
   - Click inside the polygon to place fixtures
   - Fixtures can only be placed inside the polygon boundary
   - Use "Auto Layout" to generate an optimal layout for the polygon shape

6. **View Results**
   - The heat map will show PPFD distribution within the polygon boundaries
   - Metrics will be calculated based on the actual polygon area
   - Uniformity calculations are optimized for irregular shapes

## Features

- **Real-time Validation**: The editor validates your polygon shape and shows errors if invalid
- **Grid Snapping**: Enable grid snapping for precise vertex placement (0.25ft - 2ft grid)
- **Area Calculation**: Accurate area calculation using the shoelace formula
- **Optimized Layouts**: Auto-layout algorithm places fixtures optimally within polygon boundaries
- **PPFD Calculations**: Heat map only shows PPFD within the polygon area
- **Export Support**: Polygon room designs can be exported with full shape data

## Technical Details

- Vertices are stored as x,y coordinates in feet
- PPFD calculations use ray casting to determine if points are inside the polygon
- Uniformity uses min/avg ratio for better representation of irregular shapes
- Coverage calculations account for the actual polygon area

## Example Workflow

1. Click "Polygon" mode
2. Click "L-Shape" predefined shape
3. Adjust room dimensions to 20ft x 20ft
4. Select a fixture (e.g., 600W LED)
5. Click "Auto Layout" to generate optimal placement
6. View the heat map showing PPFD distribution
7. Export the design as JSON

The polygon room support makes it easy to design lighting for real-world grow rooms that aren't perfectly rectangular!