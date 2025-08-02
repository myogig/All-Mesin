# Machine Maintenance Management System

## Overview

This is a Flask-based web application for managing preventive maintenance (PM) schedules for machines. The system allows users to track machine maintenance status, schedule preventive maintenance, and manage technician assignments. It provides CRUD operations for machine data, status tracking (Outstanding/Complete), and data export capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture
- **Framework**: Flask with SQLAlchemy ORM for database operations
- **Database**: SQL-based database with SQLAlchemy models (configured via DATABASE_URL environment variable)
- **Application Structure**: Modular design with separate files for app configuration, models, and routes
- **Session Management**: Uses Flask sessions with secret key from environment variables
- **Proxy Support**: Configured with ProxyFix middleware for deployment behind reverse proxies

### Frontend Architecture
- **Template Engine**: Jinja2 templates with Bootstrap 5 for responsive UI
- **Styling**: Custom CSS with predefined color schemes for different action buttons
- **JavaScript**: Vanilla JavaScript for client-side interactions and API calls
- **UI Components**: Modal dialogs for CRUD operations, data tables for machine listings

### Data Model
- **Primary Entity**: PMData model representing machine maintenance records
- **Key Fields**: Machine ID (id_msn), address, operator (pengelola), technician assignment, PM period, completion date, status, and notes
- **Auto-increment**: Sequential numbering system for machine records
- **Timestamps**: Automatic creation and update timestamp tracking

### API Design
- **RESTful Endpoints**: 
  - GET /api/machines - Retrieve all machines
  - GET /api/machine/<id_msn> - Retrieve specific machine
  - POST /api/machine/new - Create new machine record
- **Data Format**: JSON for API responses with to_dict() serialization method

### File Organization
- **app.py**: Main application configuration and database initialization
- **models.py**: Database models and schema definitions
- **routes.py**: HTTP route handlers and business logic
- **templates/**: HTML templates for web interface
- **static/**: CSS and JavaScript assets

## External Dependencies

### Core Framework Dependencies
- **Flask**: Web application framework
- **SQLAlchemy**: Database ORM and connection management
- **Werkzeug**: WSGI utilities including ProxyFix middleware

### Frontend Dependencies
- **Bootstrap 5**: CSS framework for responsive design (CDN)
- **Font Awesome 6**: Icon library for UI elements (CDN)

### Data Processing Libraries
- **Pandas**: Data manipulation for export functionality
- **ReportLab**: PDF generation for data export features

### Environment Configuration
- **DATABASE_URL**: Database connection string
- **SESSION_SECRET**: Flask session encryption key

### Development Tools
- **Python Logging**: Debug logging configuration for development
- **Auto-reload**: Flask debug mode for development workflow
