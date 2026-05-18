// ── BASE DE DATOS SIMULADA DE EMPLEADOS ──
const empleados = [
  {
    id: 'EMP-1029',
    nombre: 'Carlos Andrés Martínez',
    doc: '12.345.678',
    cargo: 'Técnico de Redes y Medida',
    area: 'Operaciones de Campo',
    unidad: 'Distribución Atlántico',
    subunidad: 'Control de Pérdidas',
    territorio: 'Atlántico',
    localidad: 'Barranquilla Norte',
    centro_trabajo: 'Subestación Silencio',
    piso: 'Piso 2 - Técnico',
    cedula_jefe: '8.765.432',
    jefe: 'Ing. Rodrigo Eduardo Pertuz',
    contrato: 'Indefinido',
    empresa: 'AIR-E S.A.S. E.S.P.',
    contacto: '+57 300 456 7890',
    correo: 'c.martinez@air-e.com'
  },
  {
    id: 'EMP-2084',
    nombre: 'Laura Sofía Pérez',
    doc: '98.765.432',
    cargo: 'Inspectora de Control Pérdidas',
    area: 'Aseguramiento de Ingresos',
    unidad: 'Control de Energía',
    subunidad: 'Pérdidas Comerciales',
    territorio: 'Atlántico',
    localidad: 'Soledad Centro',
    centro_trabajo: 'Sede Soledad Plaza',
    piso: 'Piso 1 - Operaciones',
    cedula_jefe: '72.334.455',
    jefe: 'Dra. María Fernanda López',
    contrato: 'Obra o Labor',
    empresa: 'Intervinda Contratistas S.A.S.',
    contacto: '+57 315 789 1234',
    correo: 'l.perez@intervinda.co'
  },
  {
    id: 'EMP-3045',
    nombre: 'Juan Diego Ríos',
    doc: '55.667.788',
    cargo: 'Técnico Liniero de Mantenimiento',
    area: 'Mantenimiento de Redes',
    unidad: 'Subestaciones y Líneas',
    subunidad: 'Líneas de Alta Tensión',
    territorio: 'Magdalena',
    localidad: 'Santa Marta Centro',
    centro_trabajo: 'Distrito Santa Marta',
    piso: 'Piso 1 - Patio Técnico',
    cedula_jefe: '77.889.900',
    jefe: 'Ing. Andrés Felipe Torres',
    contrato: 'Indefinido',
    empresa: 'AIR-E S.A.S. E.S.P.',
    contacto: '+57 311 345 6789',
    correo: 'j.rios@air-e.com'
  },
  {
    id: 'EMP-4012',
    nombre: 'María Fernanda López',
    doc: '22.334.455',
    cargo: 'Supervisora de Operaciones',
    area: 'Distribución y Redes',
    unidad: 'Operaciones Municipales',
    subunidad: 'Medida Directa',
    territorio: 'Atlántico',
    localidad: 'Malambo',
    centro_trabajo: 'Subestación Malambo',
    piso: 'Piso 2 - Control',
    cedula_jefe: '15.992.345',
    jefe: 'Ing. Mario Alberto Cantillo',
    contrato: 'Indefinido',
    empresa: 'AIR-E S.A.S. E.S.P.',
    contacto: '+57 318 456 1122',
    correo: 'm.lopez@air-e.com'
  },
  {
    id: 'EMP-5091',
    nombre: 'Andrés Felipe Torres',
    doc: '77.889.900',
    cargo: 'Técnico de Subestaciones',
    area: 'Transmisión Regional',
    unidad: 'Subestaciones y Transformadores',
    subunidad: 'Mantenimiento Preventivo',
    territorio: 'Bolívar',
    localidad: 'Cartagena Sur',
    centro_trabajo: 'Subestación Ternera',
    piso: 'Piso 1 - Sala Celdas',
    cedula_jefe: '33.445.566',
    jefe: 'Ing. Daniel Alberto Briceño',
    contrato: 'Prestación de Servicios',
    empresa: 'Ingeniería y Servicios Intervinda',
    contacto: '+57 320 987 6543',
    correo: 'a.torres@intervinda.co'
  }
];

let selectedEmployee = null;
let folioCounter = 13; // Siguiente folio correlativo

function initials(name) {
  return name.split(' ').filter((_, i) => i < 2).map(w => w[0]).join('').toUpperCase();
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

// Search function
function handleSearch(query) {
  const box = document.getElementById('searchResults');
  if (!query || query.length < 2) { box.classList.remove('visible'); return; }

  const q = query.toLowerCase();
  const hits = empleados.filter(e =>
    e.nombre.toLowerCase().includes(q) ||
    e.cargo.toLowerCase().includes(q) ||
    e.doc.replace(/\./g,'').includes(q.replace(/\./g,'')) ||
    e.id.toLowerCase().includes(q)
  );

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
        <div class="result-subtitle">${e.id} · CC ${e.doc} · ${e.cargo}</div>
      </div>
    </div>
  `).join('');
  box.classList.add('visible');
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
  const ini = initials(selectedEmployee.nombre);
  const details = `${selectedEmployee.id} · Cédula ${selectedEmployee.doc} · ${selectedEmployee.cargo}`;

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
  document.body.style.overflow = '';
  resetFormInputs(id);
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

// Generate dynamic Actas and update logs/counters (With Inline SVG Badges instead of Emojis)
function generarActa(tipo) {
  if (!selectedEmployee) return;
  
  const folio = `ACTA-2026-${String(folioCounter++).padStart(4, '0')}`;
  const fechaActual = "17 May, 2026";

  // Icons used inside pills dynamically
  let typePillContent = '';
  if (tipo === 'asignacion') {
    typePillContent = `
      <span class="type-pill cambio" style="background:var(--primary-light); color:var(--primary); border-color:#93c5fd;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>Asignación
      </span>`;
  } else if (tipo === 'cambio') {
    typePillContent = `
      <span class="type-pill cambio" style="background:#e0f2fe; color:var(--accent); border-color:#bae6fd;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
        </svg>Cambio
      </span>`;
  } else {
    typePillContent = `
      <span class="type-pill devolucion">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
          <path d="M3 10h10a8 8 0 0 1 8 8v2M3 10l6 6m-6-6 6-6"/>
        </svg>Devolución
      </span>`;
  }
  
  // 1. Add row to table dynamically
  const tableBody = document.getElementById('tableBody');
  const tr = document.createElement('tr');
  tr.className = 'new-row';
  
  tr.innerHTML = `
    <td class="folio-code">${folio}</td>
    <td>
      <div class="employee-profile-column">
        <div class="employee-cell-avatar">${initials(selectedEmployee.nombre)}</div>
        <div>
          <div class="employee-cell-name">${selectedEmployee.nombre}</div>
          <div class="employee-cell-cargo">${selectedEmployee.cargo}</div>
        </div>
      </div>
    </td>
    <td>${typePillContent}</td>
    <td>${fechaActual}</td>
    <td><span class="status-pill completado"><span class="status-indicator-dot"></span>Completado</span></td>
    <td>
      <button class="action-btn-link" onclick="downloadPDF('${folio}')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>Descargar PDF
      </button>
    </td>
  `;
  
  // Insert at the top of table body
  tableBody.insertBefore(tr, tableBody.firstChild);

  // 2. Increment stats counters visually (with safety checks in case metrics grid is removed)
  const totalActasEl = document.getElementById('statsTotalActas');
  if (totalActasEl) totalActasEl.textContent = parseInt(totalActasEl.textContent) + 1;
  
  if (tipo === 'asignacion') {
    const cambiosEl = document.getElementById('statsCambios');
    if (cambiosEl) cambiosEl.textContent = parseInt(cambiosEl.textContent) + 1;
  } else if (tipo === 'cambio') {
    const cambiosEl = document.getElementById('statsCambios');
    if (cambiosEl) cambiosEl.textContent = parseInt(cambiosEl.textContent) + 1;
  } else {
    const devEl = document.getElementById('statsDevoluciones');
    if (devEl) devEl.textContent = parseInt(devEl.textContent) + 1;
  }

  // 3. Show Toast Notification
  let toastTitle = '';
  if (tipo === 'asignacion') {
    toastTitle = "Asignación de Equipo Registrada";
  } else if (tipo === 'cambio') {
    toastTitle = "Cambio de Equipo Registrado";
  } else {
    toastTitle = "Devolución Procesada";
  }

  showToast(toastTitle, `Folio ${folio} registrado con éxito para ${selectedEmployee.nombre}.`);

  // 4. Close modal & clear employee selection
  closeModal(tipo === 'asignacion' ? 'modalAsignacion' : (tipo === 'cambio' ? 'modalCambio' : 'modalDevolucion'));
  clearEmployee();
}

// Filter History Table
function filterTable() {
  const input = document.getElementById('tableSearch');
  const filter = input.value.toLowerCase();
  const tbody = document.getElementById('tableBody');
  const tr = tbody.getElementsByTagName('tr');

  for (let i = 0; i < tr.length; i++) {
    const folioTd = tr[i].getElementsByTagName('td')[0];
    const nameTd = tr[i].getElementsByTagName('td')[1];
    
    if (folioTd && nameTd) {
      const folioVal = folioTd.textContent || folioTd.innerText;
      const nameVal = nameTd.textContent || nameTd.innerText;
      
      if (folioVal.toLowerCase().indexOf(filter) > -1 || nameVal.toLowerCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }
  }
}

// Simulated PDF Download Link
function downloadPDF(folio) {
  showToast("Descarga Iniciada", `Preparando descarga del documento PDF para el folio ${folio}...`);
}

// Sidebar navigation highlighters
function setNav(el) {
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  el.classList.add('active');
}
