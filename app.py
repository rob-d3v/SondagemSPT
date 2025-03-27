import os
from flask import Flask, render_template, request, jsonify, send_from_directory
from services.pdf_generator import generate_spt_report

app = Flask(__name__)

# Ensure the pdfs directory exists
@app.before_request
def setup():
    pdf_dir = os.path.join(app.root_path, 'static', 'pdfs')
    if not os.path.exists(pdf_dir):
        os.makedirs(pdf_dir)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/preview', methods=['POST'])
def preview():
    try:
        data = request.json
        form_data = data.get('formData', {})
        soil_layers = data.get('soilLayers', [])
        spt_data = data.get('sptData', [])
        
        # Render the preview template with the data
        preview_html = render_template('components/preview.html', 
                                      form_data=form_data,
                                      soil_layers=soil_layers,
                                      spt_data=spt_data)
        
        return jsonify({
            'success': True,
            'html': preview_html
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

@app.route('/api/generate-pdf', methods=['POST'])
def generate_pdf():
    try:
        data = request.json
        form_data = data.get('formData', {})
        soil_layers = data.get('soilLayers', [])
        spt_data = data.get('sptData', [])
        
        # Pre-process data to handle empty strings
        for i, layer in enumerate(soil_layers):
            layer['start_depth'] = float(layer.get('start_depth', 0) or 0)
            layer['end_depth'] = float(layer.get('end_depth', 0) or 0)
            layer['description'] = layer.get('description', '') or ''
            
            # Ensure start_depth of current layer matches end_depth of previous layer
            if i > 0:
                prev_end_depth = float(soil_layers[i-1].get('end_depth', 0) or 0)
                layer['start_depth'] = prev_end_depth
        
        for i, data_point in enumerate(spt_data):
            # Use soil layer end depth if available
            if i < len(soil_layers):
                data_point['depth'] = float(soil_layers[i].get('end_depth', 0) or 0)
            else:
                data_point['depth'] = float(data_point.get('depth', 0) or 0)
            
            # Set amostra to index+1 if not provided
            if not data_point.get('amostra'):
                data_point['amostra'] = str(i + 1)
                
            data_point['golpes_inicial'] = int(data_point.get('golpes_inicial', 0) or 0)
            data_point['golpes_final'] = int(data_point.get('golpes_final', 0) or 0)
            data_point['has_water_level'] = bool(data_point.get('has_water_level', False))
        
        # Sort data by depth for proper rendering
        soil_layers.sort(key=lambda x: x['start_depth'])
        spt_data.sort(key=lambda x: x['depth'])
        
        # Generate the PDF
        pdf_filename = generate_spt_report(form_data, soil_layers, spt_data)
        
        return jsonify({
            'success': True,
            'pdfPath': pdf_filename
        })
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/download-pdf/<path:filename>')
def download_pdf(filename):
    pdf_dir = os.path.join(app.root_path, 'static', 'pdfs')
    return send_from_directory(pdf_dir, filename)

if __name__ == '__main__':
    app.run(debug=True)