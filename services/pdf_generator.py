import os
import io
from datetime import datetime
from flask import current_app
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.lib.colors import blue, red, black

def generate_spt_report(form_data, soil_layers, spt_data):
    # Create filename based on report number or timestamp
    filename = f"Laudo_SPT_{form_data.get('laudo_numero', datetime.now().strftime('%Y%m%d%H%M%S'))}.pdf"
    pdf_dir = os.path.join(current_app.root_path, 'static', 'pdfs')
    pdf_path = os.path.join(pdf_dir, filename)
    
    # Create PDF document
    c = canvas.Canvas(pdf_path, pagesize=A4)
    width, height = A4
    
    # Set up styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'Title',
        parent=styles['Heading1'],
        fontSize=14,
        alignment=1,  # Center
        spaceAfter=10
    )
    
    # Remove limite_sondagem and profundidade_atingida from form_data if present
    if 'limite_sondagem' in form_data:
        del form_data['limite_sondagem']
    if 'profundidade_atingida' in form_data:
        del form_data['profundidade_atingida']
    
    # Draw border
    c.rect(10*mm, 10*mm, width-20*mm, height-20*mm, stroke=1, fill=0)
    
    # Remove header section completely
    # draw_header(c, width, height, form_data)
    
    # Draw main content - adjust y position since header is removed
    draw_content(c, width, height, form_data, soil_layers, spt_data)
    
    # Draw footer
    draw_footer(c, width, height, form_data)
    
    # Save the PDF
    c.save()
    
    return filename

# Remove or comment out the draw_header function since we're not using it
# def draw_header(c, width, height, form_data):
#     ...

def draw_content(c, width, height, form_data, soil_layers, spt_data):
    # Draw the main content with soil layers and SPT data
    # Move content up since header is removed
    y_content_start = height - 20*mm  # Adjusted from 50*mm to 20*mm
    content_height = 190*mm  # Increased height since header is removed
    
    # Define column widths
    x_start = 15*mm
    content_width = width - 30*mm
    
    # Column widths based on the example
    col1_width = content_width * 0.35  # CAMADAS DETECTADAS (left)
    col2_width = content_width * 0.10  # ESCALA DAS COTAS
    col3_width = content_width * 0.05  # AMOSTRA REVESTIDA
    col4_width = content_width * 0.50  # CAMADAS DETECTADAS (right with SPT chart)
    
    # Draw main content box
    c.rect(x_start, y_content_start - content_height, content_width, content_height, stroke=1, fill=0)
    
    # Draw column headers as part of the table structure
    header_height = 8*mm
    c.rect(x_start, y_content_start, content_width, header_height, stroke=1, fill=0)
    
    # Draw column dividers in header
    c.line(x_start + col1_width, y_content_start, x_start + col1_width, y_content_start + header_height)
    c.line(x_start + col1_width + col2_width, y_content_start, x_start + col1_width + col2_width, y_content_start + header_height)
    c.line(x_start + col1_width + col2_width + col3_width, y_content_start, x_start + col1_width + col2_width + col3_width, y_content_start + header_height)
    
    # Draw column headers
    c.setFont("Helvetica-Bold", 8)
    c.drawCentredString(x_start + col1_width/2, y_content_start + 3*mm, "CAMADAS DETECTADAS")
    c.drawCentredString(x_start + col1_width + col2_width/2, y_content_start + 3*mm, "ESCALA DAS COTAS")
    
    # Draw vertical text for "AMOSTRA REVESTIDA"
    c.saveState()
    c.rotate(90)
    c.drawString(y_content_start + header_height/2, -(x_start + col1_width + col2_width + col3_width/2), "AMOSTRA REVESTIDA")
    c.restoreState()
    
    # Draw "CAMADAS DETECTADAS" header for the right column
    c.drawCentredString(x_start + col1_width + col2_width + col3_width + col4_width/2, y_content_start + 3*mm, "CAMADAS DETECTADAS")
    
    # Draw column dividers
    c.line(x_start + col1_width, y_content_start, x_start + col1_width, y_content_start - content_height)
    c.line(x_start + col1_width + col2_width, y_content_start, x_start + col1_width + col2_width, y_content_start - content_height)
    c.line(x_start + col1_width + col2_width + col3_width, y_content_start, x_start + col1_width + col2_width + col3_width, y_content_start - content_height)
    
    # Draw subheaders
    c.setFont("Helvetica-Bold", 7)
    
    # Draw subheaders for left CAMADAS DETECTADAS
    # Draw horizontal line for subheaders
    c.line(x_start, y_content_start - 8*mm, x_start + content_width, y_content_start - 8*mm)
    
    # Draw subcols for left CAMADAS DETECTADAS
    subcol1_width = col1_width * 0.2  # PROFUND
    subcol2_width = col1_width * 0.1  # N.A.
    subcol3_width = col1_width * 0.7  # CLASSIFICAÇÃO
    
    c.drawCentredString(x_start + subcol1_width/2, y_content_start - 5*mm, "PROFUND. (m)")
    c.drawCentredString(x_start + subcol1_width + subcol2_width/2, y_content_start - 5*mm, "N.A.")
    c.drawCentredString(x_start + subcol1_width + subcol2_width + subcol3_width/2, y_content_start - 5*mm, "CLASSIFICAÇÃO")
    
    # Draw vertical lines for subcols in left CAMADAS DETECTADAS
    c.line(x_start + subcol1_width, y_content_start - 8*mm, x_start + subcol1_width, y_content_start - content_height)
    c.line(x_start + subcol1_width + subcol2_width, y_content_start - 8*mm, x_start + subcol1_width + subcol2_width, y_content_start - content_height)
    
    # Draw subheaders for ESCALA DAS COTAS
    c.drawCentredString(x_start + col1_width + col2_width/2, y_content_start - 5*mm, "PROF.")
    
    # Draw subheaders for right CAMADAS DETECTADAS
    # First subheader: GOLPES P/30cm
    c.drawCentredString(x_start + col1_width + col2_width + col3_width + col4_width/2, y_content_start - 5*mm, "GOLPES P/30cm")
    
    # Draw horizontal line for INICIAL/FINAL subheaders
    y_subheader2 = y_content_start - 12*mm
    c.line(x_start + col1_width + col2_width + col3_width, y_subheader2, x_start + content_width, y_subheader2)
    
    # Draw INICIAL/FINAL subheaders
    subcol4_width = col4_width * 0.5  # INICIAL
    subcol5_width = col4_width * 0.5  # FINAL
    
    c.setFillColorRGB(1, 0, 0)  # Red for INICIAL
    c.drawCentredString(x_start + col1_width + col2_width + col3_width + subcol4_width/2, y_subheader2 - 5*mm, "(INICIAL)")
    
    c.setFillColorRGB(0, 0, 1)  # Blue for FINAL
    c.drawCentredString(x_start + col1_width + col2_width + col3_width + subcol4_width + subcol5_width/2, y_subheader2 - 5*mm, "(FINAL)")
    
    c.setFillColorRGB(0, 0, 0)  # Back to black
    
    # Draw vertical line between INICIAL and FINAL
    c.line(x_start + col1_width + col2_width + col3_width + subcol4_width, y_subheader2, 
           x_start + col1_width + col2_width + col3_width + subcol4_width, y_content_start - content_height)
    
    # Draw horizontal line below all subheaders
    y_content_start_actual = y_subheader2 - 8*mm
    c.line(x_start, y_content_start_actual, x_start + content_width, y_content_start_actual)
    
    # Calculate space for observations at the bottom of the content area
    obs_height = 25*mm
    y_obs = y_content_start - content_height + obs_height  # Position observations inside the main content box
    
    # Draw observations as part of the main content
    draw_observations(c, x_start, y_obs, content_width, obs_height, form_data, spt_data, soil_layers)
    
    # Adjust content height for the main sections to account for observations
    adjusted_content_height = content_height - obs_height
    
    # Draw SPT chart grid
    draw_spt_chart_grid(c, x_start + col1_width + col2_width + col3_width, y_content_start_actual, col4_width, adjusted_content_height - (y_content_start - y_content_start_actual))
    
    # Draw soil layers
    draw_soil_layers(c, x_start, y_content_start_actual, col1_width, adjusted_content_height - (y_content_start - y_content_start_actual), soil_layers, spt_data)
    
    # Draw depth scale
    draw_depth_scale(c, x_start + col1_width, y_content_start_actual, col2_width, adjusted_content_height - (y_content_start - y_content_start_actual), soil_layers, spt_data)
    
    # Draw SPT data points and lines
    draw_spt_data(c, x_start + col1_width + col2_width + col3_width, y_content_start_actual, col4_width, adjusted_content_height - (y_content_start - y_content_start_actual), spt_data)

# Add the missing function
def draw_spt_chart_grid(c, x, y, width, height):
    # Calculate grid dimensions
    grid_width = width
    grid_height = height
    
    # Number of vertical lines (0-50 in steps of 5)
    num_v_lines = 11
    v_spacing = grid_width / (num_v_lines - 1)
    
    # Draw vertical grid lines
    for i in range(num_v_lines):
        x_pos = x + i * v_spacing
        c.line(x_pos, y, x_pos, y - grid_height)
        
        # Draw SPT value at top
        if i > 0:  # Skip 0
            c.setFont("Helvetica", 6)
            c.drawCentredString(x_pos, y - 5*mm, str((i-1)*5))
    
    # Draw horizontal grid lines (every meter)
    max_depth = int(height / 10) + 1  # Approximate depth in meters
    for i in range(max_depth + 1):
        y_pos = y - i * 10*mm
        c.line(x, y_pos, x + grid_width, y_pos)

def draw_observations(c, x, y, width, height, form_data, spt_data, soil_layers):
    # Draw observations directly in the main content area
    # No need for a separate box
    
    # Draw title
    c.setFont("Helvetica-Bold", 8)
    c.drawString(x + 5*mm, y - 5*mm, "Observação:")
    
    # Calculate limite de sondagem and profundidade atingida from soil layers
    max_depth = 0
    if soil_layers:
        max_depth = max([float(layer.get('end_depth', 0)) for layer in soil_layers])
    
    # Standard observations
    observations = [
        f"- Limite de sondagem ao S.P.T.: {max_depth}m",
        f"- Profundidade atingida: {max_depth}m"
    ]
    
    # Add water level observation if present
    water_level_data = next((data for data in spt_data if data.get('has_water_level', False)), None)
    if water_level_data:
        observations.append(f"- Água com {water_level_data.get('depth', '')}m de profundidade")
    
    # Draw each observation
    for i, obs in enumerate(observations):
        c.drawString(x + 5*mm, y - 10*mm - i*5*mm, obs)

def draw_footer(c, width, height, form_data):
    # Calculate the position based on the content area
    # This should be right after the main content area ends
    footer_y = 30*mm  # This is the position from the bottom of the page
    
    # Draw title at the bottom with minimal space
    c.setFont("Helvetica-Bold", 10)  # Reduced from 12
    c.drawCentredString(width/2, footer_y + 15*mm, "PERFIL GEOTÉCNICO")  # Moved up
    
    # Draw detailed footer table
    table_width = width - 30*mm
    table_height = 25*mm
    table_x = 15*mm
    table_y = footer_y  # Adjusted to be closer to the title
    
    # Draw main table outline
    c.rect(table_x, table_y, table_width, table_height, stroke=1, fill=0)
    
    # Try to load company logo
    try:
        logo_path = os.path.join(current_app.root_path, 'static', 'img', 'company_logo.png')
        if os.path.exists(logo_path):
            c.drawImage(logo_path, table_x + 2*mm, table_y + 5*mm, width=25*mm, height=15*mm)
    except:
        # If logo loading fails, just continue without it
        pass
    
    # Draw horizontal dividers - create multiple rows
    num_rows = 5
    row_height = table_height / num_rows
    for i in range(1, num_rows):
        c.line(table_x, table_y + i*row_height, table_x + table_width, table_y + i*row_height)
    
    # Draw vertical dividers - create columns
    col_width = table_width / 3
    for i in range(1, 3):
        c.line(table_x + i*col_width, table_y, table_x + i*col_width, table_y + table_height)
    
    # Draw company info
    c.setFont("Helvetica", 7)
    c.drawString(table_x + col_width + 5*mm, table_y + table_height - 5*mm, "EMPRESA:")
    c.drawString(table_x + col_width + 5*mm, table_y + table_height - 10*mm, form_data.get('empresa', ''))
    
    c.drawString(table_x + col_width + 5*mm, table_y + table_height - 15*mm, "ENDEREÇO:")
    c.drawString(table_x + col_width + 5*mm, table_y + table_height - 20*mm, form_data.get('endereco_empresa', ''))
    
    # Draw signatures
    c.drawString(table_x + 2*col_width + 5*mm, table_y + table_height - 5*mm, "RESPONSÁVEL TÉCNICO:")
    c.drawString(table_x + 2*col_width + 5*mm, table_y + table_height - 10*mm, form_data.get('responsavel_tecnico', ''))
    
    c.drawString(table_x + 2*col_width + 5*mm, table_y + table_height - 15*mm, "CREA:")
    c.drawString(table_x + 2*col_width + 5*mm, table_y + table_height - 20*mm, form_data.get('crea', ''))

def draw_spt_data(c, x, y, width, height, spt_data):
    # Calculate total depth for scaling
    max_depth = 0
    if spt_data:
        max_depth = max([float(data.get('depth', 0)) for data in spt_data])
    
    if max_depth == 0:
        max_depth = 15  # Default if no data
    
    # Calculate scale factor
    scale = height / max_depth
    
    # Calculate horizontal scale for SPT values
    # Assuming SPT values range from 0 to 50
    h_scale = width / 50
    
    # Sort data by depth
    sorted_data = sorted(spt_data, key=lambda d: float(d.get('depth', 0)))
    
    # Draw SPT data points and lines
    if len(sorted_data) > 0:
        # Prepare points for initial and final values
        initial_points = []
        final_points = []
        
        for data in sorted_data:
            depth = float(data.get('depth', 0))
            # Use the correct property names from your SPT data model
            initial = int(data.get('golpes_inicial', 0))
            final = int(data.get('golpes_final', 0))
            
            # Calculate positions
            y_pos = y - depth * scale
            x_initial = x + initial * h_scale
            x_final = x + final * h_scale
            
            # Store points for lines
            initial_points.append((x_initial, y_pos))
            final_points.append((x_final, y_pos))
            
            # Draw data points
            c.setFillColorRGB(1, 0, 0)  # Red for initial
            c.circle(x_initial, y_pos, 1.5*mm, fill=1)
            
            c.setFillColorRGB(0, 0, 1)  # Blue for final
            c.circle(x_final, y_pos, 1.5*mm, fill=1)
            
            # Draw values next to points
            c.setFont("Helvetica", 6)
            c.setFillColorRGB(1, 0, 0)  # Red for initial
            c.drawString(x_initial + 2*mm, y_pos, str(initial))
            
            c.setFillColorRGB(0, 0, 1)  # Blue for final
            c.drawString(x_final + 2*mm, y_pos, str(final))
        
        # Draw lines connecting points
        c.setFillColorRGB(0, 0, 0)  # Reset fill color
        
        # Draw initial line (red)
        c.setStrokeColorRGB(1, 0, 0)  # Red
        c.setLineWidth(0.5)
        
        for i in range(len(initial_points) - 1):
            c.line(initial_points[i][0], initial_points[i][1], 
                   initial_points[i+1][0], initial_points[i+1][1])
        
        # Draw final line (blue)
        c.setStrokeColorRGB(0, 0, 1)  # Blue
        
        for i in range(len(final_points) - 1):
            c.line(final_points[i][0], final_points[i][1], 
                   final_points[i+1][0], final_points[i+1][1])
        
        # Reset stroke color
        c.setStrokeColorRGB(0, 0, 0)
        c.setLineWidth(1)

def draw_soil_layers(c, x, y, width, height, soil_layers, spt_data):
    # Calculate total depth for scaling
    max_depth = 0
    if soil_layers:
        max_depth = max([float(layer.get('end_depth', 0)) for layer in soil_layers])
    
    if max_depth == 0:
        max_depth = 15  # Default if no data
    
    # Calculate scale factor
    scale = height / max_depth
    
    # Draw soil layers
    c.setFont("Helvetica", 7)
    
    for layer in soil_layers:
        start_depth = float(layer.get('start_depth', 0))
        end_depth = float(layer.get('end_depth', 0))
        description = layer.get('description', '')
        
        # Calculate y positions
        y_start = y - start_depth * scale
        y_end = y - end_depth * scale
        
        # Draw depth marker
        c.setFont("Helvetica-Bold", 7)
        c.drawString(x + 2*mm, y_start - 3*mm, f"{start_depth:.2f}")
        
        # Draw layer description
        c.setFont("Helvetica", 7)
        
        # Split description into lines if too long
        max_chars_per_line = 30
        words = description.split()
        lines = []
        current_line = ""
        
        for word in words:
            if len(current_line + " " + word) <= max_chars_per_line:
                current_line += " " + word if current_line else word
            else:
                lines.append(current_line)
                current_line = word
        
        if current_line:
            lines.append(current_line)
        
        # Draw each line of the description
        for i, line in enumerate(lines):
            c.drawString(x + 10*mm, y_start - 3*mm - i*4*mm, line)
        
        # Draw water level if present
        water_level_data = next((data for data in spt_data if data.get('has_water_level', False)), None)
        if water_level_data:
            water_depth = float(water_level_data.get('depth', 0))
            water_y = y - water_depth * scale
            
            # Draw water level line
            c.setStrokeColorRGB(0, 0, 1)  # Blue
            c.setDash([2, 2], 0)
            c.line(x, water_y, x + width, water_y)
            
            # Draw water level text
            c.setFont("Helvetica", 6)
            c.setFillColorRGB(0, 0, 1)  # Blue
            c.drawString(x + 2*mm, water_y - 3*mm, f"ÁGUA {water_depth:.2f}m")
            
            # Reset colors and dash
            c.setStrokeColorRGB(0, 0, 0)
            c.setFillColorRGB(0, 0, 0)
            c.setDash([], 0)

def draw_depth_scale(c, x, y, width, height, soil_layers, spt_data):
    # Calculate total depth for scaling
    max_depth = 0
    if soil_layers:
        max_depth = max([float(layer.get('end_depth', 0)) for layer in soil_layers])
    
    if max_depth == 0:
        max_depth = 15  # Default if no data
    
    # Calculate scale factor
    scale = height / max_depth
    
    # Draw depth markers every meter
    c.setFont("Helvetica", 7)
    
    for depth in range(int(max_depth) + 1):
        y_pos = y - depth * scale
        
        # Draw horizontal line
        c.line(x, y_pos, x + width, y_pos)
        
        # Draw depth value
        c.drawCentredString(x + width/2, y_pos - 3*mm, str(depth))