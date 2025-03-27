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
    
    # Draw border
    c.rect(10*mm, 10*mm, width-20*mm, height-20*mm, stroke=1, fill=0)
    
    # Draw header section
    draw_header(c, width, height, form_data)
    
    # Draw main content
    draw_content(c, width, height, form_data, soil_layers, spt_data)
    
    # Draw footer
    draw_footer(c, width, height, form_data)
    
    # Save the PDF
    c.save()
    
    return filename

def draw_header(c, width, height, form_data):
    # Draw the header with title and company info
    header_y = height - 20*mm
    header_height = 30*mm
    
    # Draw header box
    c.rect(15*mm, header_y - header_height, width - 30*mm, header_height, stroke=1, fill=0)
    
    # Draw title
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(width/2, header_y - 15*mm, "RELATÓRIO DE SONDAGEM SPT")
    
    # Draw company logo or name
    if form_data.get('company_name'):
        c.setFont("Helvetica-Bold", 12)
        c.drawString(20*mm, header_y - 10*mm, form_data.get('company_name'))

def draw_content(c, width, height, form_data, soil_layers, spt_data):
    # Draw the main content with soil layers and SPT data
    y_content_start = height - 60*mm
    content_height = 150*mm  # Increased height for more content
    
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
    
    # Draw column headers
    c.setFont("Helvetica-Bold", 8)
    c.drawCentredString(x_start + col1_width/2, y_content_start + 5*mm, "CAMADAS DETECTADAS")
    c.drawCentredString(x_start + col1_width + col2_width/2, y_content_start + 5*mm, "ESCALA DAS COTAS")
    
    # Draw vertical text for "AMOSTRA REVESTIDA"
    c.saveState()
    c.rotate(90)
    c.drawString(y_content_start - content_height/2, -(x_start + col1_width + col2_width + col3_width/2), "AMOSTRA REVESTIDA")
    c.restoreState()
    
    # Draw "CAMADAS DETECTADAS" header for the right column
    c.drawCentredString(x_start + col1_width + col2_width + col3_width + col4_width/2, y_content_start + 5*mm, "CAMADAS DETECTADAS")
    
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
    
    # Draw SPT chart grid
    draw_spt_chart_grid(c, x_start + col1_width + col2_width + col3_width, y_content_start_actual, col4_width, content_height - (y_content_start - y_content_start_actual))
    
    # Draw soil layers
    draw_soil_layers(c, x_start, y_content_start_actual, col1_width, content_height - (y_content_start - y_content_start_actual), soil_layers, spt_data)
    
    # Draw depth scale
    draw_depth_scale(c, x_start + col1_width, y_content_start_actual, col2_width, content_height - (y_content_start - y_content_start_actual), soil_layers, spt_data)
    
    # Draw SPT data points and lines
    draw_spt_data(c, x_start + col1_width + col2_width + col3_width, y_content_start_actual, col4_width, content_height - (y_content_start - y_content_start_actual), spt_data)
    
    # Draw observations
    y_obs = y_content_start - content_height - 5*mm
    draw_observations(c, x_start, y_obs, content_width, 25*mm, form_data, spt_data)

def draw_soil_layers(c, x, y, width, height, soil_layers, spt_data):
    # Calculate total depth for scaling
    max_depth = 0
    if soil_layers:
        max_depth = max([float(layer.get('end_depth', 0)) for layer in soil_layers])
    
    if max_depth == 0:
        max_depth = 15  # Default if no layers
    
    # Calculate scale factor
    scale = height / max_depth
    
    # Draw depth markers and horizontal lines
    c.setFont("Helvetica", 8)
    for depth in range(int(max_depth) + 1):
        y_pos = y - depth * scale
        c.drawString(x + 2*mm, y_pos - 3*mm, f"{depth:.1f}")
        c.line(x, y_pos, x + width, y_pos)
    
    # Define subcol widths
    subcol1_width = width * 0.2  # PROFUND
    subcol2_width = width * 0.1  # N.A.
    subcol3_width = width * 0.7  # CLASSIFICAÇÃO
    
    # Draw soil layer descriptions
    c.setFont("Helvetica", 8)
    for i, layer in enumerate(soil_layers):
        start_depth = float(layer.get('start_depth', 0))
        end_depth = float(layer.get('end_depth', 0))
        description = layer.get('description', '')
        
        # Calculate positions
        y_start = y - start_depth * scale
        y_end = y - end_depth * scale
        y_mid = (y_start + y_end) / 2
        
        # Draw description in the middle of the layer
        if description:
            # Wrap text if needed
            max_width = subcol3_width * 0.9
            words = description.split()
            lines = []
            current_line = []
            
            for word in words:
                test_line = ' '.join(current_line + [word])
                if c.stringWidth(test_line, "Helvetica", 8) < max_width:
                    current_line.append(word)
                else:
                    if current_line:
                        lines.append(' '.join(current_line))
                    current_line = [word]
            
            if current_line:
                lines.append(' '.join(current_line))
            
            # Draw each line
            for j, line in enumerate(lines):
                c.drawString(x + subcol1_width + subcol2_width + 2*mm, y_mid - 3*mm - j*10, line)
    
    # Check for water level
    water_level_data = next((data for data in spt_data if data.get('has_water_level', False)), None)
    if water_level_data:
        water_depth = float(water_level_data.get('depth', 0))
        y_water = y - water_depth * scale
        
        # Draw water level indicator in N.A. column
        c.setFillColorRGB(0, 0, 1)  # Blue
        c.drawString(x + subcol1_width + 2*mm, y_water - 3*mm, "Água")
        
        # Draw water level line
        c.setStrokeColorRGB(0, 0, 1)  # Blue
        c.setDash(1, 2)  # Dashed line
        c.line(x, y_water, x + width, y_water)
        c.setStrokeColorRGB(0, 0, 0)  # Back to black
        c.setDash(1, 0)  # Solid line

def draw_depth_scale(c, x, y, width, height, soil_layers, spt_data):
    # Calculate total depth for scaling
    max_depth = 0
    if soil_layers:
        max_depth = max([float(layer.get('end_depth', 0)) for layer in soil_layers])
    
    if max_depth == 0:
        max_depth = 15  # Default if no layers
    
    # Calculate scale factor
    scale = height / max_depth
    
    # Draw depth markers and horizontal lines
    c.setFont("Helvetica", 8)
    for depth in range(int(max_depth) + 1):
        y_pos = y - depth * scale
        
        # Draw depth value
        c.drawCentredString(x + width/2, y_pos - 3*mm, f"{depth:.1f}")
        
        # Draw horizontal line
        c.line(x, y_pos, x + width, y_pos)
    
    # Draw sample numbers
    for i, data_point in enumerate(spt_data):
        depth = float(data_point.get('depth', 0))
        y_pos = y - depth * scale
        
        # Draw sample number
        c.drawCentredString(x + width/2, y_pos - 8*mm, f"{i+1}")

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
    
    # Draw labels for INICIAL and FINAL
    c.setFont("Helvetica-Bold", 7)
    c.setFillColorRGB(1, 0, 0)  # Red for INICIAL
    c.drawString(x + 5*mm, y - 5*mm, "(INICIAL)")
    c.setFillColorRGB(0, 0, 1)  # Blue for FINAL
    c.drawString(x + grid_width - 20*mm, y - 5*mm, "(FINAL)")
    c.setFillColorRGB(0, 0, 0)  # Back to black

def draw_spt_data(c, x, y, width, height, spt_data):
    # Calculate total depth for scaling
    max_depth = 0
    if spt_data:
        max_depth = max([float(data.get('depth', 0)) for data in spt_data])
    
    if max_depth == 0:
        max_depth = 15  # Default if no data
    
    # Calculate scale factor
    scale = height / max_depth
    
    # Calculate grid dimensions
    grid_width = width * 0.9
    
    # Number of vertical lines (0-50 in steps of 5)
    num_v_lines = 11
    v_spacing = grid_width / (num_v_lines - 1)
    
    # Draw SPT data points and connect with lines
    if len(spt_data) > 0:
        # Prepare points for lines
        inicial_points = []
        final_points = []
        
        for data_point in spt_data:
            depth = float(data_point.get('depth', 0))
            golpes_inicial = int(data_point.get('golpes_inicial', 0))
            golpes_final = int(data_point.get('golpes_final', 0))
            
            # Calculate positions
            y_pos = y - depth * scale
            
            # Calculate x positions based on SPT values (0-50 scale)
            x_inicial = x + (golpes_inicial / 50) * grid_width
            x_final = x + (golpes_final / 50) * grid_width
            
            # Store points for lines
            inicial_points.append((x_inicial, y_pos))
            final_points.append((x_final, y_pos))
            
            # Draw data points
            c.setFillColorRGB(1, 0, 0)  # Red for inicial
            c.circle(x_inicial, y_pos, 2*mm, fill=1)
            
            c.setFillColorRGB(0, 0, 1)  # Blue for final
            c.circle(x_final, y_pos, 2*mm, fill=1)
            
            # Draw SPT values next to points
            c.setFont("Helvetica", 6)
            c.setFillColorRGB(1, 0, 0)
            c.drawString(x_inicial + 3*mm, y_pos, str(golpes_inicial))
            c.setFillColorRGB(0, 0, 1)
            c.drawString(x_final + 3*mm, y_pos, str(golpes_final))
        
        # Draw lines connecting points
        c.setFillColorRGB(0, 0, 0)  # Reset fill color
        
        # Draw inicial line (red)
        c.setStrokeColorRGB(1, 0, 0)
        c.setLineWidth(0.5)
        for i in range(len(inicial_points) - 1):
            c.line(inicial_points[i][0], inicial_points[i][1], 
                   inicial_points[i+1][0], inicial_points[i+1][1])
        
        # Draw final line (blue)
        c.setStrokeColorRGB(0, 0, 1)
        for i in range(len(final_points) - 1):
            c.line(final_points[i][0], final_points[i][1], 
                   final_points[i+1][0], final_points[i+1][1])
        
        # Reset stroke color
        c.setStrokeColorRGB(0, 0, 0)
        c.setLineWidth(1)

def draw_observations(c, x, y, width, height, form_data, spt_data):
    # Draw observations box
    c.rect(x, y - height, width, height, stroke=1, fill=0)
    
    # Draw title
    c.setFont("Helvetica-Bold", 8)
    c.drawString(x + 5*mm, y - 5*mm, "Observação:")
    
    # Draw observations
    c.setFont("Helvetica", 8)
    
    # Standard observations
    observations = [
        f"- Limite de sondagem ao S.P.T.: {form_data.get('limite_sondagem', '')}",
        f"- Profundidade atingida: {form_data.get('profundidade_atingida', '')}m"
    ]
    
    # Add water level observation if present
    water_level_data = next((data for data in spt_data if data.get('has_water_level', False)), None)
    if water_level_data:
        observations.append(f"- Água com {water_level_data.get('depth', '')}m de profundidade")
    
    # Draw each observation
    for i, obs in enumerate(observations):
        c.drawString(x + 5*mm, y - 10*mm - i*5*mm, obs)
    
    # Draw report info table
    table_y = y - height + 5*mm
    table_height = 15*mm
    table_width = width - 10*mm
    
    # Draw table
    c.rect(x + 5*mm, table_y, table_width, table_height, stroke=1, fill=0)
    
    # Draw vertical dividers
    col_width = table_width / 4
    for i in range(1, 4):
        c.line(x + 5*mm + i*col_width, table_y, x + 5*mm + i*col_width, table_y + table_height)
    
    # Draw horizontal divider
    c.line(x + 5*mm, table_y + table_height/2, x + 5*mm + table_width, table_y + table_height/2)
    
    # Draw table headers
    c.setFont("Helvetica-Bold", 7)
    c.drawString(x + 10*mm, table_y + table_height - 5*mm, "LAUDO Nº")
    c.drawString(x + 10*mm + col_width, table_y + table_height - 5*mm, "OBRA")
    c.drawString(x + 10*mm + 2*col_width, table_y + table_height - 5*mm, "SPT")
    c.drawString(x + 10*mm + 3*col_width, table_y + table_height - 5*mm, "FL Nº")
    
    # Draw table values
    c.setFont("Helvetica", 7)
    c.drawString(x + 10*mm, table_y + 5*mm, form_data.get('laudo_numero', ''))
    c.drawString(x + 10*mm + col_width, table_y + 5*mm, form_data.get('obra', ''))
    c.drawString(x + 10*mm + 2*col_width, table_y + 5*mm, form_data.get('spt_numero', ''))
    c.drawString(x + 10*mm + 3*col_width, table_y + 5*mm, form_data.get('folha_numero', ''))

def draw_footer(c, width, height, form_data):
    # Draw the footer with company info and signatures
    footer_y = 30*mm
    
    # Draw title at the bottom
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(width/2, footer_y + 10*mm, "PERFIL GEOTÉCNICO")
    
    # Draw company info
    c.setFont("Helvetica-Bold", 8)
    c.drawString(20*mm, footer_y - 5*mm, form_data.get('responsavel', ''))
    
    # Draw client info
    c.setFont("Helvetica", 8)
    c.drawString(20*mm, footer_y - 10*mm, f"CLIENTE: {form_data.get('cliente', '')}")
    
    # Draw date
    c.drawString(width - 50*mm, footer_y - 10*mm, f"DATA: {form_data.get('data', datetime.now().strftime('%d/%m/%Y'))}")