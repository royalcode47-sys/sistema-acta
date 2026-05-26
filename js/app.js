// ── BASE DE DATOS REAL (cargada desde empleados.js) ──
// Los datos reales están en js/empleados.js — 1.460 colaboradores AIR-E

let selectedEmployee = null;
let folioCounter = 1; // Siguiente folio correlativo
let pendingOperationType = null;
let selectedEquipmentType = null;
let selectedPeripheralsOption = null;
let selectedPeripheralItems = [];

function initials(name) {
  return name.split(' ').filter((_, i) => i < 2).map(w => w[0]).join('').toUpperCase();
}

function formatActaDate(date = new Date()) {
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date).replace('.', '');
}

// Toast Notification System (Polished SVG Icons)
function showToast(title, desc, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'saas-toast';
  if (type === 'danger') toast.style.borderLeftColor = 'var(--danger)';
  
  const iconSVG = type === 'success'
    ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
    : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

  toast.innerHTML = `
    <div class="toast-icon" style="${type === 'danger' ? 'background:var(--danger-light); color:var(--danger);' : ''}">
      ${iconSVG}
    </div>
    <div class="toast-message-wrap">
      <div class="toast-title">${title}</div>
      <div class="toast-desc">${desc}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    </button>
  `;
  
  container.appendChild(toast);
  
  // Auto remove after 4.5 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards';
    setTimeout(() => toast.remove(), 250);
  }, 4500);
}

// Search function — optimizada para 1.460 registros reales
let _searchTimeout = null;
function handleSearch(query) {
  clearTimeout(_searchTimeout);
  const box = document.getElementById('searchResults');
  if (!query || query.length < 2) { box.classList.remove('visible'); return; }

  _searchTimeout = setTimeout(() => {
    const q = query.toLowerCase().trim();
    const hits = [];
    for (let i = 0; i < empleados.length && hits.length < 8; i++) {
      const e = empleados[i];
      if (
        e.nombre.toLowerCase().includes(q) ||
        e.cargo.toLowerCase().includes(q) ||
        e.id.includes(q) ||
        (e.cod_epl && e.cod_epl.includes(q)) ||
        e.correo.toLowerCase().includes(q)
      ) hits.push(e);
    }

    if (!hits.length) {
      box.innerHTML = `<div class="search-result-item" style="color:var(--text-muted);font-size:12px;justify-content:center;">Sin resultados para "${query}"</div>`;
      box.classList.add('visible');
      return;
    }

    box.innerHTML = hits.map(e => `
      <div class="search-result-item" onclick="selectEmployee('${e.id}')">
        <div class="avatar-circle">${initials(e.nombre)}</div>
        <div class="result-details">
          <div class="result-title">${e.nombre}</div>
          <div class="result-subtitle">CC ${e.id} · ${e.cargo.length > 38 ? e.cargo.slice(0,38)+'…' : e.cargo}</div>
        </div>
      </div>
    `).join('');
    box.classList.add('visible');
  }, 220);
}

// Selecting Employee
function selectEmployee(id) {
  selectedEmployee = empleados.find(e => e.id === id);
  if (!selectedEmployee) return;

  // Cerrar y resetear buscador
  document.getElementById('searchInput').value = selectedEmployee.nombre;
  document.getElementById('searchResults').classList.remove('visible');

  // Populate Employee Display Card Header
  document.getElementById('employeeAvatar').textContent = initials(selectedEmployee.nombre);
  document.getElementById('employeeName').textContent = selectedEmployee.nombre;
  document.getElementById('employeeCargo').textContent = selectedEmployee.cargo;
  
  // Populate Tab Content: Laboral
  document.getElementById('detailCargoBase').textContent = selectedEmployee.cargo;
  document.getElementById('detailArea').textContent = selectedEmployee.area;
  document.getElementById('detailUnidad').textContent = selectedEmployee.unidad;
  document.getElementById('detailSubunidad').textContent = selectedEmployee.subunidad;
  document.getElementById('detailEmpresa').textContent = selectedEmployee.empresa;
  
  // Populate Tab Content: Ubicación
  document.getElementById('detailTerritorio').textContent = selectedEmployee.territorio;
  document.getElementById('detailLocalidad').textContent = selectedEmployee.localidad;
  document.getElementById('detailCentroTrabajo').textContent = selectedEmployee.centro_trabajo;
  document.getElementById('detailPiso').textContent = selectedEmployee.piso;
  
  // Populate Tab Content: Supervisión
  document.getElementById('detailJefeInmediato').textContent = selectedEmployee.jefe;
  document.getElementById('detailCedulaJefeInmediato').textContent = selectedEmployee.cedula_jefe;
  
  // Populate Tab Content: Contrato
  document.getElementById('detailDoc').textContent = selectedEmployee.doc;
  document.getElementById('detailModalidadContrato').textContent = selectedEmployee.contrato;
  document.getElementById('detailContacto').textContent = selectedEmployee.contacto;
  document.getElementById('detailCorreo').textContent = selectedEmployee.correo;

  // Toggle display states
  document.getElementById('selectedEmployee').classList.add('visible');
  document.getElementById('actionsHelper').style.display = 'none';
  document.getElementById('actionsGrid').classList.add('active');

  // Force first tab on selection
  switchEmpTab('Laboral');

  showToast("Colaborador Seleccionado", `${selectedEmployee.nombre} está listo para registrar actas.`);
}

// Clear Selection
function clearEmployee() {
  selectedEmployee = null;
  document.getElementById('searchInput').value = '';
  document.getElementById('selectedEmployee').classList.remove('visible');
  document.getElementById('actionsHelper').style.display = 'flex';
  document.getElementById('actionsGrid').classList.remove('active');
  switchEmpTab('Laboral');
}

// Switch selected employee tabs
function switchEmpTab(tabName) {
  // Remove active from all tabs
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

  // Add active to current
  if (tabName === 'Laboral') {
    document.getElementById('tabBtnLaboral').classList.add('active');
    document.getElementById('tabLaboral').classList.add('active');
  } else if (tabName === 'Ubicacion') {
    document.getElementById('tabBtnUbicacion').classList.add('active');
    document.getElementById('tabUbicacion').classList.add('active');
  } else if (tabName === 'Reporte') {
    document.getElementById('tabBtnReporte').classList.add('active');
    document.getElementById('tabReporte').classList.add('active');
  } else if (tabName === 'Contacto') {
    document.getElementById('tabBtnContacto').classList.add('active');
    document.getElementById('tabContacto').classList.add('active');
  }
}

// Click outside dropdown hides it
document.addEventListener('click', e => {
  if (!e.target.closest('.search-input-wrap'))
    document.getElementById('searchResults').classList.remove('visible');
});

// Modals handlers
function openModal(tipo) {
  if (!selectedEmployee) return;
  pendingOperationType = tipo;
  resetEquipmentTypeSelection();

  const subtitle = document.getElementById('tipoEquipoSubtitle');
  if (subtitle) {
    subtitle.textContent = `Seleccione el tipo antes de continuar con ${getOperationLabel(tipo).toLowerCase()}`;
  }

  document.getElementById('modalTipoEquipo').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function getOperationLabel(tipo) {
  if (tipo === 'asignacion') return 'Asignación de Equipo';
  if (tipo === 'cambio') return 'Cambio de Equipo';
  return 'Devolución de Equipo';
}

function selectEquipmentType(button) {
  selectedEquipmentType = button.dataset.equipmentType;
  document.querySelectorAll('.equipment-type-option').forEach(option => {
    option.classList.toggle('active', option === button);
  });

  const peripheralsQuestion = document.getElementById('peripheralsQuestion');
  const continueBtn = document.getElementById('continueEquipmentTypeBtn');

  if (selectedEquipmentType === 'Torres') {
    selectedPeripheralsOption = null;
    selectedPeripheralItems = [];
    document.querySelectorAll('.peripherals-option').forEach(option => option.classList.remove('active'));
    if (peripheralsQuestion) peripheralsQuestion.classList.add('visible');
    hidePeripheralPicker();
    if (continueBtn) continueBtn.disabled = true;
    return;
  }

  selectedPeripheralsOption = null;
  selectedPeripheralItems = [];
  if (peripheralsQuestion) peripheralsQuestion.classList.remove('visible');
  document.querySelectorAll('.peripherals-option').forEach(option => option.classList.remove('active'));
  hidePeripheralPicker();
  if (continueBtn) continueBtn.disabled = false;
}

function selectPeripherals(value, button) {
  selectedPeripheralsOption = value;
  document.querySelectorAll('.peripherals-option').forEach(option => {
    option.classList.toggle('active', option === button);
  });

  if (value) {
    showPeripheralPicker();
  } else {
    selectedPeripheralItems = [];
    hidePeripheralPicker();
  }

  updateContinueEquipmentButton();
}

function showPeripheralPicker() {
  const picker = document.getElementById('peripheralsPicker');
  if (picker) picker.classList.add('visible');
}

function hidePeripheralPicker() {
  const picker = document.getElementById('peripheralsPicker');
  const list = document.getElementById('peripheralsList');
  if (picker) picker.classList.remove('visible');
  if (list) list.innerHTML = '';
}

function addPeripheralSelector(value = '') {
  const list = document.getElementById('peripheralsList');
  if (!list) return;

  const row = document.createElement('div');
  row.className = 'peripheral-row';
  row.innerHTML = `
    <select class="peripheral-select" onchange="updateSelectedPeripheralItems()">
      <option value="">Seleccionar periférico…</option>
      <option value="Mouse" ${value === 'Mouse' ? 'selected' : ''}>Mouse</option>
      <option value="Teclado" ${value === 'Teclado' ? 'selected' : ''}>Teclado</option>
    </select>
    <button class="remove-peripheral-btn" type="button" onclick="removePeripheralSelector(this)" title="Quitar periférico">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
  `;
  list.appendChild(row);
  updateSelectedPeripheralItems();
}

function removePeripheralSelector(button) {
  button.closest('.peripheral-row')?.remove();
  updateSelectedPeripheralItems();
}

function updateSelectedPeripheralItems() {
  selectedPeripheralItems = Array.from(document.querySelectorAll('.peripheral-select'))
    .map(select => select.value)
    .filter(Boolean);
  updateContinueEquipmentButton();
}

function updateContinueEquipmentButton() {
  const continueBtn = document.getElementById('continueEquipmentTypeBtn');
  if (!continueBtn) return;

  const needsPeripherals = selectedEquipmentType === 'Torres' && selectedPeripheralsOption === true;
  continueBtn.disabled = !selectedEquipmentType ||
    (selectedEquipmentType === 'Torres' && selectedPeripheralsOption === null) ||
    (needsPeripherals && selectedPeripheralItems.length === 0);
}

function confirmEquipmentType() {
  if (!pendingOperationType || !selectedEquipmentType) {
    showToast("Tipo de equipo requerido", "Seleccione un tipo de equipo para continuar.", "danger");
    return;
  }

  if (selectedEquipmentType === 'Torres' && selectedPeripheralsOption === null) {
    showToast("Periféricos requeridos", "Indique si la torre incluye periféricos.", "danger");
    return;
  }

  if (selectedEquipmentType === 'Torres' && selectedPeripheralsOption && !selectedPeripheralItems.length) {
    showToast("Agregue periféricos", "Use el botón + para agregar al menos un periférico.", "danger");
    return;
  }

  document.getElementById('modalTipoEquipo').classList.remove('open');
  openOperationModal(pendingOperationType);
}

function getOperationModalId(tipo) {
  if (tipo === 'asignacion') return 'modalAsignacion';
  if (tipo === 'cambio') return 'modalCambio';
  return 'modalDevolucion';
}

function getOperationSuffix(tipo) {
  if (tipo === 'asignacion') return 'Asignacion';
  if (tipo === 'cambio') return 'Cambio';
  return 'Devolucion';
}

function resetEquipmentTypeSelection(clearOperation = false) {
  selectedEquipmentType = null;
  selectedPeripheralsOption = null;
  selectedPeripheralItems = [];
  document.querySelectorAll('.equipment-type-option').forEach(option => option.classList.remove('active'));
  document.querySelectorAll('.peripherals-option').forEach(option => option.classList.remove('active'));
  hidePeripheralPicker();

  const peripheralsQuestion = document.getElementById('peripheralsQuestion');
  if (peripheralsQuestion) peripheralsQuestion.classList.remove('visible');

  const continueBtn = document.getElementById('continueEquipmentTypeBtn');
  if (continueBtn) continueBtn.disabled = true;

  if (clearOperation) pendingOperationType = null;
}

function clearTechnicalAddons() {
  ['technicalAddonsAsignacion', 'technicalAddonsCambio', 'technicalAddonsDevolucion'].forEach(id => {
    const container = document.getElementById(id);
    if (container) container.innerHTML = '';
  });
}

function syncEquipmentTypeDisplays() {
  const displayValue = selectedEquipmentType || 'Sin seleccionar';
  const peripheralsValue = selectedEquipmentType === 'Torres'
    ? `Periféricos: ${selectedPeripheralsOption ? selectedPeripheralItems.join(', ') : 'No'}`
    : '';

  ['tipoEquipoAsignacion', 'tipoEquipoCambio', 'tipoEquipoDevolucion'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = displayValue;
  });

  ['perifericosAsignacion', 'perifericosCambio', 'perifericosDevolucion'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = peripheralsValue;
    el.style.display = peripheralsValue ? 'inline-flex' : 'none';
  });
}

function renderTechnicalAddons(tipo) {
  clearTechnicalAddons();

  const suffix = getOperationSuffix(tipo);
  const container = document.getElementById(`technicalAddons${suffix}`);
  if (!container) return;

  const sections = [];

  if (selectedEquipmentType === 'Portátiles') {
    sections.push(`
      <div class="equip-section-title" style="margin-top:16px">Cargador</div>
      <div class="equipment-card addon-card" data-addon-group="charger">
        <div class="equipment-card-header">
          <span class="equip-label">Datos del Cargador</span>
        </div>
        <div class="equip-grid">
          <div class="equip-field">
            <label>Serial</label>
            <input type="text" data-addon-field="chargerSerial" placeholder="Ej. CHG-20249876">
          </div>
          <div class="equip-field">
            <label>Marca</label>
            <input type="text" data-addon-field="chargerMarca" placeholder="Ej. Lenovo">
          </div>
        </div>
      </div>
    `);
  }

  if (selectedEquipmentType === 'Torres' && selectedPeripheralsOption) {
    selectedPeripheralItems.forEach((item, index) => {
      const isKeyboard = item === 'Teclado';
      sections.push(`
        <div class="equip-section-title" style="margin-top:16px">${item} ${index + 1}</div>
        <div class="equipment-card addon-card" data-addon-group="peripheral" data-peripheral-type="${item}">
          <div class="equipment-card-header">
            <span class="equip-label peripheral-detail-label">${item}</span>
          </div>
          <div class="equip-grid">
            ${isKeyboard ? `
              <div class="equip-field">
                <label>Placa</label>
                <input type="text" data-addon-field="placa" placeholder="Ej. TEC-504987">
              </div>
            ` : ''}
            <div class="equip-field">
              <label>Serial</label>
              <input type="text" data-addon-field="serial" placeholder="Ej. SN-${item.toUpperCase()}-001">
            </div>
            <div class="equip-field">
              <label>Modelo</label>
              <input type="text" data-addon-field="modelo" placeholder="Ej. MK120">
            </div>
            <div class="equip-field">
              <label>Marca</label>
              <input type="text" data-addon-field="marca" placeholder="Ej. Logitech">
            </div>
          </div>
        </div>
      `);
    });
  }

  container.innerHTML = sections.join('');
}

function collectTechnicalAddonData(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return '';

  const charger = modal.querySelector('[data-addon-group="charger"]');
  const details = [];

  if (charger) {
    const serial = charger.querySelector('[data-addon-field="chargerSerial"]')?.value.trim();
    const marca = charger.querySelector('[data-addon-field="chargerMarca"]')?.value.trim();
    const chargerParts = [];
    if (serial) chargerParts.push(`Serial ${serial}`);
    if (marca) chargerParts.push(`Marca ${marca}`);
    if (chargerParts.length) details.push(`Cargador: ${chargerParts.join(', ')}`);
  }

  modal.querySelectorAll('[data-addon-group="peripheral"]').forEach((card, index) => {
    const type = card.dataset.peripheralType || `Periférico ${index + 1}`;
    const fieldOrder = type === 'Teclado'
      ? ['placa', 'serial', 'modelo', 'marca']
      : ['serial', 'modelo', 'marca'];
    const fields = fieldOrder
      .map(field => {
        const value = card.querySelector(`[data-addon-field="${field}"]`)?.value.trim();
        return value ? `${field.charAt(0).toUpperCase() + field.slice(1)} ${value}` : '';
      })
      .filter(Boolean);

    if (fields.length) details.push(`${type}: ${fields.join(', ')}`);
  });

  return details.join(' | ');
}

function getTypePillContent(tipo) {
  if (tipo === 'asignacion') {
    return `
      <span class="type-pill asignacion">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>Asignación
      </span>`;
  }

  if (tipo === 'cambio') {
    return `
      <span class="type-pill cambio">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
        </svg>Cambio
      </span>`;
  }

  return `
    <span class="type-pill devolucion">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
        <path d="M3 10h10a8 8 0 0 1 8 8v2M3 10l6 6m-6-6 6-6"/>
      </svg>Devolución
    </span>`;
}

function getStatusPillContent(estado) {
  return `<span class="status-pill ${estado.toLowerCase()}"><span class="status-indicator-dot"></span>${estado}</span>`;
}

function getRecordActionsContent(folio) {
  return `
    <div class="record-actions">
      <button class="record-action-btn edit" onclick="openEditRecord('${folio}')" title="Editar registro">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 20h9"></path>
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path>
        </svg>
      </button>
      <button class="record-action-btn delete" onclick="deleteRecord('${folio}')" title="Eliminar registro">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18"></path>
          <path d="M8 6V4h8v2"></path>
          <path d="M19 6l-1 14H6L5 6"></path>
        </svg>
      </button>
    </div>`;
}

function findRecordRow(folio) {
  return Array.from(document.querySelectorAll('#tableBody tr:not(.table-empty-row)'))
    .find(row => row.dataset.folio === folio);
}

function renderRecordRow(row) {
  const folio = row.dataset.folio;
  const nombre = row.dataset.nombre || '';
  const cargo = row.dataset.cargo || '';
  const tipo = row.dataset.tipo || 'asignacion';
  const fecha = row.dataset.fecha || '';
  const estado = row.dataset.estado || 'Pendiente';
  const equipmentType = row.dataset.equipo || '';
  const peripherals = row.dataset.perifericos || '';
  const technicalDetails = row.dataset.detallesTecnicos || '';
  const equipmentLine = equipmentType
    ? `<div class="employee-cell-equipment">Tipo: ${equipmentType}${peripherals ? ` · Periféricos: ${peripherals}` : ''}</div>`
    : '';
  const detailsLine = technicalDetails
    ? `<div class="employee-cell-equipment">Detalle: ${technicalDetails}</div>`
    : '';

  row.innerHTML = `
    <td>
      <div class="employee-profile-column">
        <div class="employee-cell-avatar">${initials(nombre)}</div>
        <div>
          <div class="employee-cell-name">${nombre}</div>
          <div class="employee-cell-cargo">${cargo}</div>
          ${equipmentLine}
          ${detailsLine}
        </div>
      </div>
    </td>
    <td>${getTypePillContent(tipo)}</td>
    <td>${fecha}</td>
    <td>${getStatusPillContent(estado)}</td>
    <td>
      <button class="action-btn-link" onclick="downloadExcel('${folio}')" title="Exportar a Excel (.xlsx)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 4px;">
          <rect x="3" y="3" width="18" height="18" rx="2" fill="#f0f9ff" stroke="currentColor" stroke-width="1.5"/>
          <path d="M6 8h3v2H6V8zm0 3h3v2H6v-2zm0 3h3v2H6v-2zm5-6h3v2h-3V8zm0 3h3v2h-3v-2zm0 3h3v2h-3v-2zm5-6h3v2h-3V8zm0 3h3v2h-3v-2zm0 3h3v2h-3v-2z" fill="currentColor"/>
        </svg>
        <span style="font-weight: 700; font-size: 11px; letter-spacing: 0.3px;">EXCEL</span>
      </button>
    </td>
    <td>${getRecordActionsContent(folio)}</td>
  `;
}

function openEditRecord(folio) {
  const row = findRecordRow(folio);
  if (!row) {
    showToast("Error", `No se encontró el folio ${folio}`, 'danger');
    return;
  }

  document.getElementById('editRecordTargetFolio').value = folio;
  document.getElementById('editRecordFolio').textContent = folio;
  document.getElementById('editRecordName').value = row.dataset.nombre || '';
  document.getElementById('editRecordCargo').value = row.dataset.cargo || '';
  document.getElementById('editRecordType').value = row.dataset.tipo || 'asignacion';
  document.getElementById('editRecordDate').value = row.dataset.fecha || '';
  document.getElementById('editRecordStatus').value = row.dataset.estado || 'Pendiente';
  document.getElementById('modalEditarRegistro').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function saveEditedRecord() {
  const folio = document.getElementById('editRecordTargetFolio').value;
  const row = findRecordRow(folio);
  if (!row) return;

  row.dataset.nombre = document.getElementById('editRecordName').value.trim() || 'Sin nombre';
  row.dataset.cargo = document.getElementById('editRecordCargo').value.trim() || 'Sin cargo';
  row.dataset.tipo = document.getElementById('editRecordType').value;
  row.dataset.fecha = document.getElementById('editRecordDate').value.trim() || formatActaDate();
  row.dataset.estado = document.getElementById('editRecordStatus').value;
  renderRecordRow(row);
  closeModal('modalEditarRegistro');
  saveRecordsToLocalStorage();
  filterTable();
  showToast("Registro Actualizado", `El registro de ${row.dataset.nombre} fue actualizado.`);
}

function deleteRecord(folio) {
  const row = findRecordRow(folio);
  if (!row) return;

  const nombre = row.dataset.nombre || 'este registro';
  if (!confirm(`¿Eliminar el registro de ${nombre}?`)) return;

  row.remove();
  saveRecordsToLocalStorage();
  filterTable();
  showToast("Registro Eliminado", `El registro de ${nombre} fue eliminado.`);
}

function openOperationModal(tipo) {
  const ini = initials(selectedEmployee.nombre);
  const details = `CC ${selectedEmployee.id} · Cód. ${selectedEmployee.cod_epl || ''} · ${selectedEmployee.cargo}`;
  syncEquipmentTypeDisplays();
  renderTechnicalAddons(tipo);

  if (tipo === 'asignacion') {
    document.getElementById('bannerAvatarAsignacion').textContent = ini;
    document.getElementById('bannerNameAsignacion').textContent = selectedEmployee.nombre;
    document.getElementById('bannerIdAsignacion').textContent = details;
    document.getElementById('modalAsignacion').classList.add('open');
  } else if (tipo === 'cambio') {
    document.getElementById('bannerAvatarCambio').textContent = ini;
    document.getElementById('bannerNameCambio').textContent = selectedEmployee.nombre;
    document.getElementById('bannerIdCambio').textContent = details;
    document.getElementById('modalCambio').classList.add('open');
  } else {
    document.getElementById('bannerAvatarDev').textContent = ini;
    document.getElementById('bannerNameDev').textContent = selectedEmployee.nombre;
    document.getElementById('bannerIdDev').textContent = details;
    document.getElementById('modalDevolucion').classList.add('open');
  }
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  resetFormInputs(id);

  if (id === 'modalTipoEquipo') {
    resetEquipmentTypeSelection(true);
  } else if (['modalAsignacion', 'modalCambio', 'modalDevolucion'].includes(id)) {
    clearTechnicalAddons();
    resetEquipmentTypeSelection(true);
    syncEquipmentTypeDisplays();
  }

  if (!document.querySelector('.modal-overlay.open')) {
    document.body.style.overflow = '';
  }
}

function resetFormInputs(id) {
  const modal = document.getElementById(id);
  const inputs = modal.querySelectorAll('input, select');
  inputs.forEach(input => input.value = '');
}

// Close on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

// ── CONFIGURACIÓN DEL SERVIDOR ──────────────────────────────────────────────
// Si la app corre servida por Flask (Render o local HTTP) usa rutas relativas.
// Si se abre como archivo local (file://) apunta a localhost:5000.
const SERVER_URL = window.location.protocol === 'file:' ? 'http://localhost:5000' : '';

// ── QUIÉN ENTREGA (datos del responsable de TI que firma) ────────────────────
// Ajusta estos datos con los de la persona que gestiona las actas
const RESPONSABLE_TI = {
  nombre:  'DANIEL JOSE BRICEÑO ARIZA',
  cedula:  '1.044.215.586',
  cargo:   'APRENDIZ',
  empresa: 'AIR-E'
};

// ── RECOLECTAR EQUIPOS DEL MODAL ─────────────────────────────────────────────
function recolectarEquipos(tipo) {
  const equipos = [];

  if (tipo === 'asignacion') {
    const placa  = document.getElementById('placaAsignacion')?.value.trim();
    const serial = document.getElementById('serialAsignacion')?.value.trim();
    const marca  = document.getElementById('marcaAsignacion')?.value.trim();
    const modelo = document.getElementById('modeloAsignacion')?.value.trim();
    const obs    = document.getElementById('obsAsignacion')?.value.trim();
    if (placa || serial)
      equipos.push({ tipo_activo: selectedEquipmentType || '', placa, serial, modelo, marca, observacion: obs || 'ASIGNACION' });

    // Periféricos (cargador, mouse, teclado)
    const modal = document.getElementById('modalAsignacion');
    modal?.querySelectorAll('[data-addon-group]').forEach(card => {
      const periType = card.dataset.peripheralType || card.dataset.addonGroup || '';
      const plc  = card.querySelector('[data-addon-field="placa"]')?.value.trim() || '';
      const ser  = card.querySelector('[data-addon-field="chargerSerial"], [data-addon-field="serial"]')?.value.trim() || '';
      const mar  = card.querySelector('[data-addon-field="chargerMarca"], [data-addon-field="marca"]')?.value.trim() || '';
      const mod  = card.querySelector('[data-addon-field="modelo"]')?.value.trim() || '';
      if (ser || mar)
        equipos.push({ tipo_activo: periType, placa: plc, serial: ser, modelo: mod, marca: mar, observacion: 'ASIGNACION' });
    });

  } else if (tipo === 'cambio') {
    // Equipo entrante
    equipos.push({
      tipo_activo: selectedEquipmentType || '',
      placa:  document.getElementById('placaEntrante')?.value.trim() || '',
      serial: document.getElementById('serialEntrante')?.value.trim() || '',
      marca:  document.getElementById('marcaEntrante')?.value.trim() || '',
      modelo: document.getElementById('modeloEntrante')?.value.trim() || '',
      observacion: 'ASIGNACION'
    });
    // Equipo saliente
    equipos.push({
      tipo_activo: selectedEquipmentType || '',
      placa:  document.getElementById('placaSaliente')?.value.trim() || '',
      serial: document.getElementById('serialSaliente')?.value.trim() || '',
      marca:  document.getElementById('marcaSaliente')?.value.trim() || '',
      modelo: document.getElementById('modeloSaliente')?.value.trim() || '',
      observacion: 'DEVOLUCION'
    });

  } else { // devolucion
    equipos.push({
      tipo_activo: selectedEquipmentType || '',
      placa:  document.getElementById('placaDevolucion')?.value.trim() || '',
      serial: document.getElementById('serialDevolucion')?.value.trim() || '',
      marca:  document.getElementById('marcaDevolucion')?.value.trim() || '',
      modelo: document.getElementById('modeloDevolucion')?.value.trim() || '',
      observacion: document.getElementById('causaDevolucion')?.value.trim() || 'DEVOLUCION'
    });
  }

  return equipos.filter(e => e.placa || e.serial);
}

// ── SPECS DE COMPUTADOR (solo si aplica) ─────────────────────────────────────
function recolectarSpecs(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return null;
  const nombrePC = modal.querySelector('[data-addon-field="nombrePC"]')?.value.trim();
  if (!nombrePC) return null;
  return {
    nombre_pc:  nombrePC,
    procesador: modal.querySelector('[data-addon-field="procesador"]')?.value.trim() || '',
    ram:        modal.querySelector('[data-addon-field="ram"]')?.value.trim() || '',
    disco:      modal.querySelector('[data-addon-field="disco"]')?.value.trim() || '',
    opticos:    modal.querySelector('[data-addon-field="opticos"]')?.value.trim() || '',
    monitor:    modal.querySelector('[data-addon-field="monitor"]')?.value.trim() || ''
  };
}

// ── GENERAR ACTA → LLAMA AL SERVIDOR PYTHON ──────────────────────────────────
async function generarActa(tipo) {
  if (!selectedEmployee) return;
  if (!selectedEquipmentType) {
    showToast('Tipo de equipo requerido', 'Seleccione el tipo de equipo antes de generar el acta.', 'danger');
    return;
  }

  const equipos = recolectarEquipos(tipo);
  if (!equipos.length) {
    showToast('Sin equipos', 'Completa al menos placa o serial del equipo.', 'danger');
    return;
  }

  const modalId = getOperationModalId(tipo);
  const specs   = recolectarSpecs(modalId);

  const payload = {
    tipo,
    ticket:          document.getElementById('ticketInput')?.value.trim() || '',
    // Responsable TI (quien entrega)
    nombre_entrega:  RESPONSABLE_TI.nombre,
    cedula_entrega:  RESPONSABLE_TI.cedula,
    cargo_entrega:   RESPONSABLE_TI.cargo,
    empresa_entrega: RESPONSABLE_TI.empresa,
    // Empleado seleccionado (quien recibe)
    nombre_recibe:   selectedEmployee.nombre,
    cedula_recibe:   selectedEmployee.id,
    cargo_recibe:    selectedEmployee.cargo,
    empresa_recibe:  selectedEmployee.empresa || 'AIR-E',
    // Ubicación del empleado
    ciudad:          selectedEmployee.localidad || 'BARRANQUILLA',
    sede:            selectedEmployee.centro_trabajo || '',
    piso:            selectedEmployee.piso || '',
    // Equipos
    equipos,
    ...(specs && { specs })
  };

  // Botón en estado de carga
  const btn = document.querySelector(`#${modalId} .btn-primary, #${modalId} .btn-success`);
  const btnOriginal = btn?.innerHTML;
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation:spin 1s linear infinite"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg> Generando...';
  }

  try {
    const response = await fetch(`${SERVER_URL}/generar-acta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: 'Error del servidor' }));
      throw new Error(err.error || `HTTP ${response.status}`);
    }

    // Descargar el archivo
    const blob = await response.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    const disposition = response.headers.get('Content-Disposition') || '';
    const match = disposition.match(/filename="?([^"]+)"?/);
    a.download = match ? match[1] : `Acta_${tipo}_${Date.now()}.xlsx`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);

    // Registrar en la tabla
    const folio = `ACTA-${new Date().getFullYear()}-${String(folioCounter++).padStart(4, '0')}`;
    const tableBody = document.getElementById('tableBody');
    const tr = document.createElement('tr');
    tr.className = 'new-row';
    tr.dataset.folio  = folio;
    tr.dataset.nombre = selectedEmployee.nombre;
    tr.dataset.cargo  = selectedEmployee.cargo;
    tr.dataset.tipo   = tipo;
    tr.dataset.fecha  = formatActaDate();
    tr.dataset.estado = 'Pendiente';
    tr.dataset.equipo = selectedEquipmentType;
    tr.dataset.perifericos = selectedPeripheralsOption ? selectedPeripheralItems.join(', ') : '';
    tr.dataset.detallesTecnicos = collectTechnicalAddonData(modalId);
    renderRecordRow(tr);
    tableBody.insertBefore(tr, tableBody.firstChild);
    saveRecordsToLocalStorage();
    filterTable();
    document.querySelector('.table-container')?.scrollTo({ top: 0, behavior: 'smooth' });

    const labels = { asignacion: 'Asignación Registrada', cambio: 'Cambio Registrado', devolucion: 'Devolución Procesada' };
    showToast(labels[tipo] || 'Acta Generada', `Folio ${folio} descargado para ${selectedEmployee.nombre}.`);

    closeModal(modalId);
    clearEmployee();

  } catch (err) {
    showToast('Error al generar', `No se pudo conectar al servidor: ${err.message}`, 'danger');
  } finally {
    if (btn && btnOriginal) {
      btn.disabled = false;
      btn.innerHTML = btnOriginal;
    }
  }
}

// Filter History Table
function filterTable() {
  const input = document.getElementById('tableSearch');
  const filter = input.value.toLowerCase();
  const tbody = document.getElementById('tableBody');
  const countText = document.getElementById('tableCountText');
  const emptyRow = tbody.querySelector('.table-empty-row');
  const rows = Array.from(tbody.querySelectorAll('tr:not(.table-empty-row)'));
  let visibleRows = 0;

  rows.forEach(row => {
    const searchableText = [
      row.dataset.nombre,
      row.dataset.fecha
    ].join(' ').toLowerCase();
    const isVisible = searchableText.includes(filter);

    row.style.display = isVisible ? '' : 'none';
    if (isVisible) visibleRows += 1;
  });

  if (!visibleRows) {
    const msg = rows.length === 0 ? 'No hay actas registradas.' : 'No se encontraron actas con ese filtro.';
    if (!emptyRow) {
      const row = document.createElement('tr');
      row.className = 'table-empty-row';
      row.innerHTML = `<td colspan="6">${msg}</td>`;
      tbody.appendChild(row);
    } else {
      const cell = emptyRow.querySelector('td');
      if (cell) cell.textContent = msg;
    }
  } else if (emptyRow) {
    emptyRow.remove();
  }

  countText.textContent = `Mostrando ${visibleRows} de ${rows.length} registros`;
}

// Excel Download Function
function downloadExcel(folio) {
  // Get the table data
  const tableBody = document.getElementById('tableBody');
  const rows = tableBody.getElementsByTagName('tr');

  // Find the row with matching data-folio attribute
  let rowData = null;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].dataset && rows[i].dataset.folio === folio) {
      rowData = rows[i];
      break;
    }
  }

  if (!rowData) {
    showToast("Error", `No se encontró el folio ${folio}`, 'danger');
    return;
  }

  // Extract data from the row (visible columns)
  const cells = rowData.getElementsByTagName('td');
  const data = {
    'Folio': rowData.dataset.folio || folio,
    'Colaborador': rowData.dataset.nombre || cells[0]?.textContent || '',
    'Cargo': rowData.dataset.cargo || '',
    'Tipo de Acta': cells[1]?.textContent || '',
    'Tipo de Equipo': rowData.dataset.equipo || '',
    'Periféricos': rowData.dataset.perifericos || '',
    'Detalles Técnicos': rowData.dataset.detallesTecnicos || '',
    'Fecha': rowData.dataset.fecha || cells[2]?.textContent || '',
    'Estado': rowData.dataset.estado || ''
  };

  // Create workbook and worksheet
  const ws = XLSX.utils.json_to_sheet([data]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Acta');

  // Set column widths
  ws['!cols'] = [
    { wch: 15 },
    { wch: 25 },
    { wch: 24 },
    { wch: 20 },
    { wch: 18 },
    { wch: 15 },
    { wch: 45 },
    { wch: 15 },
    { wch: 15 }
  ];

  // Download the file
  XLSX.writeFile(wb, `Acta_${folio}.xlsx`);

  showToast("Descarga Completada", `Documento Excel para el folio ${folio} descargado exitosamente.`);
}

function saveRecordsToLocalStorage() {
  const tbody = document.getElementById('tableBody');
  const rows = Array.from(tbody.querySelectorAll('tr:not(.table-empty-row)'));
  const records = rows.map(row => ({
    folio: row.dataset.folio,
    nombre: row.dataset.nombre,
    cargo: row.dataset.cargo,
    tipo: row.dataset.tipo,
    fecha: row.dataset.fecha,
    estado: row.dataset.estado,
    equipo: row.dataset.equipo,
    perifericos: row.dataset.perifericos,
    detallesTecnicos: row.dataset.detallesTecnicos
  }));
  localStorage.setItem('actas_records', JSON.stringify(records));
  localStorage.setItem('folioCounter', folioCounter);
}

function loadRecordsFromLocalStorage() {
  const savedFolio = localStorage.getItem('folioCounter');
  if (savedFolio) {
    folioCounter = parseInt(savedFolio, 10);
  } else {
    folioCounter = 1;
  }

  const savedRecords = localStorage.getItem('actas_records');
  if (savedRecords) {
    try {
      const records = JSON.parse(savedRecords);
      const tbody = document.getElementById('tableBody');
      tbody.innerHTML = ''; // clear table
      records.forEach(rec => {
        const tr = document.createElement('tr');
        tr.dataset.folio = rec.folio || '';
        tr.dataset.nombre = rec.nombre || '';
        tr.dataset.cargo = rec.cargo || '';
        tr.dataset.tipo = rec.tipo || 'asignacion';
        tr.dataset.fecha = rec.fecha || '';
        tr.dataset.estado = rec.estado || 'Pendiente';
        tr.dataset.equipo = rec.equipo || '';
        tr.dataset.perifericos = rec.perifericos || '';
        tr.dataset.detallesTecnicos = rec.detallesTecnicos || '';
        renderRecordRow(tr);
        tbody.appendChild(tr);
      });
    } catch (e) {
      console.error("Error loading records from localStorage", e);
    }
  }
}

window.addEventListener('load', () => {
  loadRecordsFromLocalStorage();
  filterTable();
});

// Spin animation para botón de carga
const _style = document.createElement('style');
_style.textContent = '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
document.head.appendChild(_style);

// Sidebar navigation highlighters
function setNav(el) {
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  el.classList.add('active');
}