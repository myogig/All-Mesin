from flask import render_template, request, jsonify, send_file, flash, redirect, url_for
from app import app, db
from models import PMData
import pandas as pd
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.units import inch
from io import BytesIO
import os
from datetime import datetime

@app.route('/')
def index():
    """Main page with the machine maintenance table"""
    machines = PMData.query.order_by(PMData.no).all()
    return render_template('index.html', machines=machines)

@app.route('/api/machines')
def get_machines():
    """API endpoint to get all machines"""
    machines = PMData.query.order_by(PMData.no).all()
    return jsonify([machine.to_dict() for machine in machines])

@app.route('/api/machine/<id_msn>')
def get_machine_by_id(id_msn):
    """API endpoint to get machine by ID"""
    machine = PMData.query.filter_by(id_msn=id_msn).first()
    if machine:
        return jsonify(machine.to_dict())
    return jsonify({'error': 'Machine not found'}), 404

@app.route('/api/machine/new', methods=['POST'])
def create_machine():
    """Create new machine record"""
    try:
        data = request.get_json()
        
        # Get next auto-increment number
        last_machine = PMData.query.order_by(PMData.no.desc()).first()
        next_no = (last_machine.no + 1) if last_machine else 1
        
        new_machine = PMData(
            no=next_no,
            id_msn=data['id_msn'],
            alamat=data['alamat'],
            pengelola=data['pengelola'],
            teknisi=data['teknisi'],
            status='Outstanding'
        )
        
        db.session.add(new_machine)
        db.session.commit()
        
        return jsonify({'success': True, 'machine': new_machine.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/machine/edit', methods=['PUT'])
def edit_machine():
    """Edit existing machine record"""
    try:
        data = request.get_json()
        machine = PMData.query.filter_by(id_msn=data['id_msn']).first()
        
        if not machine:
            return jsonify({'success': False, 'error': 'Machine not found'}), 404
        
        machine.alamat = data['alamat']
        machine.pengelola = data['pengelola']
        machine.teknisi = data['teknisi']
        machine.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({'success': True, 'machine': machine.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/machine/update-pm', methods=['PUT'])
def update_pm():
    """Update PM data for a machine"""
    try:
        data = request.get_json()
        machine = PMData.query.filter_by(id_msn=data['id_msn']).first()
        
        if not machine:
            return jsonify({'success': False, 'error': 'Machine not found'}), 404
        
        machine.periode_pm = data['periode_pm']
        machine.status = 'Outstanding'
        machine.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({'success': True, 'machine': machine.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/machine/complete-pm', methods=['PUT'])
def complete_pm():
    """Complete PM for a machine"""
    try:
        data = request.get_json()
        machine = PMData.query.filter_by(id_msn=data['id_msn']).first()
        
        if not machine:
            return jsonify({'success': False, 'error': 'Machine not found'}), 404
        
        machine.tgl_selesai_pm = data['tgl_selesai_pm']
        machine.status = 'Done'
        machine.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({'success': True, 'machine': machine.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/machine/delete-pm', methods=['PUT'])
def delete_pm():
    """Delete PM data (clear periode_pm and tgl_selesai_pm)"""
    try:
        data = request.get_json()
        machine = PMData.query.filter_by(id_msn=data['id_msn']).first()
        
        if not machine:
            return jsonify({'success': False, 'error': 'Machine not found'}), 404
        
        machine.periode_pm = None
        machine.tgl_selesai_pm = None
        machine.status = 'Outstanding'
        machine.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({'success': True, 'machine': machine.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/machine/delete-all', methods=['DELETE'])
def delete_all_machine():
    """Delete entire machine record"""
    try:
        data = request.get_json()
        machine = PMData.query.filter_by(id_msn=data['id_msn']).first()
        
        if not machine:
            return jsonify({'success': False, 'error': 'Machine not found'}), 404
        
        db.session.delete(machine)
        db.session.commit()
        
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/machine/notes', methods=['PUT'])
def update_notes():
    """Update notes for a machine"""
    try:
        data = request.get_json()
        machine = PMData.query.filter_by(id_msn=data['id_msn']).first()
        
        if not machine:
            return jsonify({'success': False, 'error': 'Machine not found'}), 404
        
        machine.notes = data['notes']
        machine.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({'success': True, 'machine': machine.to_dict()})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/search')
def search_machines():
    """Search machines by pengelola, periode_pm, or status"""
    query = request.args.get('query', '')
    if not query:
        machines = PMData.query.order_by(PMData.no).all()
    else:
        machines = PMData.query.filter(
            db.or_(
                PMData.pengelola.ilike(f'%{query}%'),
                PMData.periode_pm.ilike(f'%{query}%'),
                PMData.status.ilike(f'%{query}%')
            )
        ).order_by(PMData.no).all()
    
    return jsonify([machine.to_dict() for machine in machines])

@app.route('/export/pdf')
def export_pdf():
    """Export machine data to PDF"""
    try:
        machines = PMData.query.order_by(PMData.no).all()
        
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72,
                              topMargin=72, bottomMargin=18)
        
        # Create data for table
        data = [['No', 'Id Msn', 'Alamat', 'Pengelola', 'Periode PM', 'Tgl Selesai PM', 'Status', 'Teknisi']]
        
        for machine in machines:
            data.append([
                str(machine.no),
                machine.id_msn,
                machine.alamat,
                machine.pengelola,
                machine.periode_pm or '',
                machine.tgl_selesai_pm or '',
                machine.status,
                machine.teknisi
            ])
        
        # Create table
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        # Build PDF
        story = []
        styles = getSampleStyleSheet()
        title = Paragraph("Data PM Mesin", styles['Title'])
        story.append(title)
        story.append(table)
        
        doc.build(story)
        
        buffer.seek(0)
        return send_file(buffer, as_attachment=True, download_name='data_pm_mesin.pdf', mimetype='application/pdf')
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/import/excel', methods=['POST'])
def import_excel():
    """Import machine data from Excel file"""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        # Read Excel file
        df = pd.read_excel(file)
        
        # Expected columns
        expected_columns = ['Id Msn', 'Alamat', 'Pengelola', 'Periode PM', 'Tgl Selesai PM', 'Status', 'Teknisi']
        
        # Check if all required columns exist
        missing_columns = [col for col in expected_columns if col not in df.columns]
        if missing_columns:
            return jsonify({'success': False, 'error': f'Missing columns: {missing_columns}'}), 400
        
        # Import data
        imported_count = 0
        for _, row in df.iterrows():
            # Check if machine already exists
            existing_machine = PMData.query.filter_by(id_msn=row['Id Msn']).first()
            
            if existing_machine:
                # Update existing machine
                existing_machine.alamat = row['Alamat']
                existing_machine.pengelola = row['Pengelola']
                existing_machine.periode_pm = row['Periode PM'] if pd.notna(row['Periode PM']) else None
                existing_machine.tgl_selesai_pm = row['Tgl Selesai PM'] if pd.notna(row['Tgl Selesai PM']) else None
                existing_machine.status = row['Status'] if pd.notna(row['Status']) else 'Outstanding'
                existing_machine.teknisi = row['Teknisi']
                existing_machine.updated_at = datetime.utcnow()
            else:
                # Create new machine
                last_machine = PMData.query.order_by(PMData.no.desc()).first()
                next_no = (last_machine.no + 1) if last_machine else 1
                
                new_machine = PMData(
                    no=next_no,
                    id_msn=row['Id Msn'],
                    alamat=row['Alamat'],
                    pengelola=row['Pengelola'],
                    periode_pm=row['Periode PM'] if pd.notna(row['Periode PM']) else None,
                    tgl_selesai_pm=row['Tgl Selesai PM'] if pd.notna(row['Tgl Selesai PM']) else None,
                    status=row['Status'] if pd.notna(row['Status']) else 'Outstanding',
                    teknisi=row['Teknisi']
                )
                db.session.add(new_machine)
            
            imported_count += 1
        
        db.session.commit()
        
        return jsonify({'success': True, 'message': f'Successfully imported {imported_count} records'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500
