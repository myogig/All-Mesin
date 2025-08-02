from app import db
from datetime import datetime
from sqlalchemy import Integer, String, Text, DateTime, Boolean

class PMData(db.Model):
    __tablename__ = 'pm_data'
    
    id = db.Column(Integer, primary_key=True, autoincrement=True)
    no = db.Column(Integer, unique=True, nullable=False)
    id_msn = db.Column(String(100), nullable=False)
    alamat = db.Column(String(255), nullable=False)
    pengelola = db.Column(String(100), nullable=False)
    periode_pm = db.Column(String(100))
    tgl_selesai_pm = db.Column(String(50))
    status = db.Column(String(50), default='Outstanding')
    teknisi = db.Column(String(100), nullable=False)
    notes = db.Column(Text)
    created_at = db.Column(DateTime, default=datetime.utcnow)
    updated_at = db.Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'no': self.no,
            'id_msn': self.id_msn,
            'alamat': self.alamat,
            'pengelola': self.pengelola,
            'periode_pm': self.periode_pm or '',
            'tgl_selesai_pm': self.tgl_selesai_pm or '',
            'status': self.status,
            'teknisi': self.teknisi,
            'notes': self.notes or ''
        }
