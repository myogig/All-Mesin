// Global variables
let machines = [];
let currentIdMsn = '';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadMachines();
    initializeEventListeners();
});

// Initialize event listeners
function initializeEventListeners() {
    // Button click events
    document.getElementById('btnNew').addEventListener('click', showNewMachineModal);
    document.getElementById('btnEdit').addEventListener('click', showEditMachineModal);
    document.getElementById('btnUpdate').addEventListener('click', showUpdatePMModal);
    document.getElementById('btnComplete').addEventListener('click', showCompletePMModal);
    document.getElementById('btnDelete').addEventListener('click', showDeleteConfirmation);
    document.getElementById('btnDeleteAll').addEventListener('click', showDeleteAllConfirmation);
    document.getElementById('btnExport').addEventListener('click', exportToPDF);
    document.getElementById('btnImport').addEventListener('click', showImportModal);
    document.getElementById('btnSearch').addEventListener('click', searchMachines);
    
    // Search on Enter key
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchMachines();
        }
    });
    
    // Save button events
    document.getElementById('saveNewMachine').addEventListener('click', saveNewMachine);
    document.getElementById('saveEditMachine').addEventListener('click', saveEditMachine);
    document.getElementById('saveUpdatePM').addEventListener('click', saveUpdatePM);
    document.getElementById('saveCompletePM').addEventListener('click', saveCompletePM);
    document.getElementById('saveNotes').addEventListener('click', saveNotes);
    document.getElementById('saveImport').addEventListener('click', importData);
    
    // Auto-fill events
    document.getElementById('editIdMsn').addEventListener('blur', autoFillEditForm);
    document.getElementById('updateIdMsn').addEventListener('change', autoFillUpdateForm);
    document.getElementById('completeIdMsn').addEventListener('change', autoFillCompleteForm);
}

// Load all machines from server
async function loadMachines() {
    try {
        const response = await fetch('/api/machines');
        machines = await response.json();
        renderMachineTable();
        populateIdMsnDropdowns();
    } catch (error) {
        console.error('Error loading machines:', error);
        showAlert('Error loading machine data', 'danger');
    }
}

// Render machine table
function renderMachineTable() {
    const tbody = document.getElementById('machineTableBody');
    tbody.innerHTML = '';
    
    machines.forEach(machine => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${machine.no}</td>
            <td class="id-msn-cell clickable" data-id-msn="${machine.id_msn}">
                ${machine.id_msn}
            </td>
            <td>${machine.alamat}</td>
            <td>${machine.pengelola}</td>
            <td>${machine.periode_pm}</td>
            <td>${machine.tgl_selesai_pm}</td>
            <td>
                <span class="status-badge status-${machine.status.toLowerCase()}">
                    ${machine.status}
                </span>
            </td>
            <td>${machine.teknisi}</td>
        `;
        tbody.appendChild(row);
    });
    
    // Add click events to Id Msn cells
    document.querySelectorAll('.id-msn-cell').forEach(cell => {
        cell.addEventListener('click', function() {
            const idMsn = this.getAttribute('data-id-msn');
            showNotesModal(idMsn);
        });
    });
}

// Populate Id Msn dropdowns
function populateIdMsnDropdowns() {
    const updateSelect = document.getElementById('updateIdMsn');
    const completeSelect = document.getElementById('completeIdMsn');
    
    // Clear existing options
    updateSelect.innerHTML = '<option value="">Pilih Id Msn</option>';
    completeSelect.innerHTML = '<option value="">Pilih Id Msn</option>';
    
    machines.forEach(machine => {
        const updateOption = document.createElement('option');
        updateOption.value = machine.id_msn;
        updateOption.textContent = machine.id_msn;
        updateSelect.appendChild(updateOption);
        
        // Only show machines with periode_pm for complete dropdown
        if (machine.periode_pm) {
            const completeOption = document.createElement('option');
            completeOption.value = machine.id_msn;
            completeOption.textContent = machine.id_msn;
            completeSelect.appendChild(completeOption);
        }
    });
}

// Show New Machine Modal
function showNewMachineModal() {
    document.getElementById('newMachineForm').reset();
    new bootstrap.Modal(document.getElementById('newMachineModal')).show();
}

// Show Edit Machine Modal
function showEditMachineModal() {
    document.getElementById('editMachineForm').reset();
    new bootstrap.Modal(document.getElementById('editMachineModal')).show();
}

// Show Update PM Modal
function showUpdatePMModal() {
    document.getElementById('updatePMForm').reset();
    populateIdMsnDropdowns();
    new bootstrap.Modal(document.getElementById('updatePMModal')).show();
}

// Show Complete PM Modal
function showCompletePMModal() {
    document.getElementById('completePMForm').reset();
    populateIdMsnDropdowns();
    new bootstrap.Modal(document.getElementById('completePMModal')).show();
}

// Show Notes Modal
function showNotesModal(idMsn) {
    currentIdMsn = idMsn;
    const machine = machines.find(m => m.id_msn === idMsn);
    
    document.getElementById('notesIdMsn').textContent = idMsn;
    document.getElementById('notesText').value = machine.notes || '';
    
    new bootstrap.Modal(document.getElementById('notesModal')).show();
}

// Show Import Modal
function showImportModal() {
    document.getElementById('importFile').value = '';
    new bootstrap.Modal(document.getElementById('importModal')).show();
}

// Auto-fill edit form
async function autoFillEditForm() {
    const idMsn = document.getElementById('editIdMsn').value;
    if (!idMsn) return;
    
    try {
        const response = await fetch(`/api/machine/${idMsn}`);
        if (response.ok) {
            const machine = await response.json();
            document.getElementById('editAlamat').value = machine.alamat;
            document.getElementById('editPengelola').value = machine.pengelola;
            document.getElementById('editTeknisi').value = machine.teknisi;
        } else {
            // Clear fields if machine not found
            document.getElementById('editAlamat').value = '';
            document.getElementById('editPengelola').value = '';
            document.getElementById('editTeknisi').value = '';
        }
    } catch (error) {
        console.error('Error fetching machine data:', error);
    }
}

// Auto-fill update form
function autoFillUpdateForm() {
    const idMsn = document.getElementById('updateIdMsn').value;
    if (!idMsn) {
        document.getElementById('updateAlamat').value = '';
        document.getElementById('updatePengelola').value = '';
        document.getElementById('updateTeknisi').value = '';
        return;
    }
    
    const machine = machines.find(m => m.id_msn === idMsn);
    if (machine) {
        document.getElementById('updateAlamat').value = machine.alamat;
        document.getElementById('updatePengelola').value = machine.pengelola;
        document.getElementById('updateTeknisi').value = machine.teknisi;
    }
}

// Auto-fill complete form
function autoFillCompleteForm() {
    const idMsn = document.getElementById('completeIdMsn').value;
    if (!idMsn) {
        document.getElementById('completePeriodePM').value = '';
        document.getElementById('completeTeknisi').value = '';
        return;
    }
    
    const machine = machines.find(m => m.id_msn === idMsn);
    if (machine) {
        document.getElementById('completePeriodePM').value = machine.periode_pm || '';
        document.getElementById('completeTeknisi').value = machine.teknisi;
    }
}

// Save new machine
async function saveNewMachine() {
    const formData = {
        id_msn: document.getElementById('newIdMsn').value,
        alamat: document.getElementById('newAlamat').value,
        pengelola: document.getElementById('newPengelola').value,
        teknisi: document.getElementById('newTeknisi').value
    };
    
    if (!formData.id_msn || !formData.alamat || !formData.pengelola || !formData.teknisi) {
        showAlert('Semua field harus diisi', 'danger');
        return;
    }
    
    try {
        const response = await fetch('/api/machine/new', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('Mesin berhasil ditambahkan', 'success');
            bootstrap.Modal.getInstance(document.getElementById('newMachineModal')).hide();
            loadMachines();
        } else {
            showAlert('Error: ' + result.error, 'danger');
        }
    } catch (error) {
        console.error('Error saving machine:', error);
        showAlert('Error saving machine', 'danger');
    }
}

// Save edit machine
async function saveEditMachine() {
    const formData = {
        id_msn: document.getElementById('editIdMsn').value,
        alamat: document.getElementById('editAlamat').value,
        pengelola: document.getElementById('editPengelola').value,
        teknisi: document.getElementById('editTeknisi').value
    };
    
    if (!formData.id_msn || !formData.alamat || !formData.pengelola || !formData.teknisi) {
        showAlert('Semua field harus diisi', 'danger');
        return;
    }
    
    try {
        const response = await fetch('/api/machine/edit', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('Mesin berhasil diupdate', 'success');
            bootstrap.Modal.getInstance(document.getElementById('editMachineModal')).hide();
            loadMachines();
        } else {
            showAlert('Error: ' + result.error, 'danger');
        }
    } catch (error) {
        console.error('Error updating machine:', error);
        showAlert('Error updating machine', 'danger');
    }
}

// Save update PM
async function saveUpdatePM() {
    const formData = {
        id_msn: document.getElementById('updateIdMsn').value,
        periode_pm: document.getElementById('updatePeriodePM').value
    };
    
    if (!formData.id_msn || !formData.periode_pm) {
        showAlert('Id Msn dan Periode PM harus diisi', 'danger');
        return;
    }
    
    try {
        const response = await fetch('/api/machine/update-pm', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('PM berhasil diupdate', 'success');
            bootstrap.Modal.getInstance(document.getElementById('updatePMModal')).hide();
            loadMachines();
        } else {
            showAlert('Error: ' + result.error, 'danger');
        }
    } catch (error) {
        console.error('Error updating PM:', error);
        showAlert('Error updating PM', 'danger');
    }
}

// Save complete PM
async function saveCompletePM() {
    const formData = {
        id_msn: document.getElementById('completeIdMsn').value,
        tgl_selesai_pm: document.getElementById('completeTglSelesai').value
    };
    
    if (!formData.id_msn || !formData.tgl_selesai_pm) {
        showAlert('Id Msn dan Tanggal Selesai PM harus diisi', 'danger');
        return;
    }
    
    try {
        const response = await fetch('/api/machine/complete-pm', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('PM berhasil diselesaikan', 'success');
            bootstrap.Modal.getInstance(document.getElementById('completePMModal')).hide();
            loadMachines();
        } else {
            showAlert('Error: ' + result.error, 'danger');
        }
    } catch (error) {
        console.error('Error completing PM:', error);
        showAlert('Error completing PM', 'danger');
    }
}

// Save notes
async function saveNotes() {
    const formData = {
        id_msn: currentIdMsn,
        notes: document.getElementById('notesText').value
    };
    
    try {
        const response = await fetch('/api/machine/notes', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('Notes berhasil disimpan', 'success');
            bootstrap.Modal.getInstance(document.getElementById('notesModal')).hide();
            loadMachines();
        } else {
            showAlert('Error: ' + result.error, 'danger');
        }
    } catch (error) {
        console.error('Error saving notes:', error);
        showAlert('Error saving notes', 'danger');
    }
}

// Show delete confirmation
function showDeleteConfirmation() {
    const idMsn = prompt('Masukkan Id Msn yang akan dihapus PM-nya:');
    if (!idMsn) return;
    
    if (confirm('Apakah Anda yakin ingin menghapus data PM untuk mesin ' + idMsn + '?')) {
        deletePM(idMsn);
    }
}

// Show delete all confirmation
function showDeleteAllConfirmation() {
    const idMsn = prompt('Masukkan Id Msn yang akan dihapus seluruhnya:');
    if (!idMsn) return;
    
    if (confirm('Apakah Anda yakin ingin menghapus SEMUA data untuk mesin ' + idMsn + '? Data tidak dapat dikembalikan!')) {
        deleteAllMachine(idMsn);
    }
}

// Delete PM data
async function deletePM(idMsn) {
    try {
        const response = await fetch('/api/machine/delete-pm', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id_msn: idMsn })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('Data PM berhasil dihapus', 'success');
            loadMachines();
        } else {
            showAlert('Error: ' + result.error, 'danger');
        }
    } catch (error) {
        console.error('Error deleting PM:', error);
        showAlert('Error deleting PM', 'danger');
    }
}

// Delete all machine data
async function deleteAllMachine(idMsn) {
    try {
        const response = await fetch('/api/machine/delete-all', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id_msn: idMsn })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert('Semua data mesin berhasil dihapus', 'success');
            loadMachines();
        } else {
            showAlert('Error: ' + result.error, 'danger');
        }
    } catch (error) {
        console.error('Error deleting machine:', error);
        showAlert('Error deleting machine', 'danger');
    }
}

// Search machines
async function searchMachines() {
    const query = document.getElementById('searchInput').value;
    
    try {
        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
        machines = await response.json();
        renderMachineTable();
    } catch (error) {
        console.error('Error searching machines:', error);
        showAlert('Error searching machines', 'danger');
    }
}

// Export to PDF
function exportToPDF() {
    if (confirm('Apakah Anda yakin ingin mengexport data ke PDF?')) {
        window.open('/export/pdf', '_blank');
    }
}

// Import data
async function importData() {
    const fileInput = document.getElementById('importFile');
    const file = fileInput.files[0];
    
    if (!file) {
        showAlert('Pilih file untuk diimport', 'danger');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch('/import/excel', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert(result.message, 'success');
            bootstrap.Modal.getInstance(document.getElementById('importModal')).hide();
            loadMachines();
        } else {
            showAlert('Error: ' + result.error, 'danger');
        }
    } catch (error) {
        console.error('Error importing data:', error);
        showAlert('Error importing data', 'danger');
    }
}

// Show alert
function showAlert(message, type) {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create new alert
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Insert at the top of the container
    const container = document.querySelector('.container-fluid');
    container.insertBefore(alert, container.firstChild);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}
