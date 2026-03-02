// public/admin/js/admin.js
document.addEventListener('DOMContentLoaded', () => {
  // ==================== ELEMENTOS DEL DOM ====================
  const usersTable = document.getElementById('usersTable')?.querySelector('tbody');
  const userModal = document.getElementById('userModal');
  const deleteModal = document.getElementById('deleteModal');
  const modalTitle = document.getElementById('modalTitle');
  const userForm = document.getElementById('userForm');
  const userIdInput = document.getElementById('userId');
  const ciInput = document.getElementById('ci');
  const nombreCompletoInput = document.getElementById('nombre_completo');
  const emailInput = document.getElementById('email');
  const contrasenaInput = document.getElementById('contrasena');
  const rolInput = document.getElementById('rol');
  const municipioInput = document.getElementById('municipio');
  const clubInput = document.getElementById('club');
  const categoriaInput = document.getElementById('categoria');
  const estadoInput = document.getElementById('estado');
  const btnCreateUser = document.getElementById('btnCreateUser');
  const searchInput = document.querySelector('.search-input');
  const filterRole = document.querySelectorAll('.filter-select')[0];
  const filterStatus = document.querySelectorAll('.filter-select')[1];
  const deleteUserName = document.getElementById('deleteUserName');
  const confirmDeleteBtn = document.getElementById('confirmDelete');

  // Variables globales
  let allUsers = [];
  let filteredUsers = [];
  let userToDelete = null;

  // ==================== CARGAR USUARIOS AL INICIAR ====================
  loadUsers();

  // ==================== EVENTO: CREAR USUARIO ====================
  if (btnCreateUser) {
    btnCreateUser.addEventListener('click', () => {
      resetForm();
      modalTitle.textContent = 'Crear Usuario';
      contrasenaInput.required = true;
      contrasenaInput.placeholder = '';
      openModal(userModal);
    });
  }

  // ==================== EVENTOS: CERRAR MODALES ====================
  const closeButtons = document.querySelectorAll('.modal-close, .close');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal');
      closeModal(modal);
    });
  });

  // Cerrar modal al hacer click en el overlay
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal');
      closeModal(modal);
    });
  });

  // Cerrar modal con tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (userModal?.classList.contains('active')) closeModal(userModal);
      if (deleteModal?.classList.contains('active')) closeModal(deleteModal);
    }
  });

  // ==================== EVENTO: BUSCAR USUARIOS ====================
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      filterUsers();
    });
  }

  // ==================== EVENTOS: FILTROS ====================
  if (filterRole) {
    filterRole.addEventListener('change', () => {
      filterUsers();
    });
  }

  if (filterStatus) {
    filterStatus.addEventListener('change', () => {
      filterUsers();
    });
  }

  // ==================== EVENTO: SUBMIT FORMULARIO ====================
  if (userForm) {
    userForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitButton = userForm.querySelector('button[type="submit"]');
      const originalText = submitButton.innerHTML;
      submitButton.disabled = true;
      submitButton.innerHTML = '<span>Guardando...</span>';

      const isEdit = userIdInput.value !== '';
      const url = isEdit ? `/api/usuarios/${userIdInput.value}` : '/api/usuarios';
      const method = isEdit ? 'PUT' : 'POST';

      const userData = {
        ci: ciInput.value.trim(),
        nombre_completo: nombreCompletoInput.value.trim(),
        email: emailInput.value.trim(),
        rol: rolInput.value,
        municipio: municipioInput.value || null,
        club: clubInput.value || null,
        categoria: categoriaInput.value.trim() || null,
        estado: estadoInput.value === 'true'
      };

      // Solo incluir contraseña si se ingresó
      if (contrasenaInput.value.trim()) {
        userData.contrasena = contrasenaInput.value;
        // La contraseña se cifrará en el backend
      }

      try {
        const response = await fetch(url, {
          method: method,
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (response.ok) {
          showNotification(
            isEdit ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente',
            'success'
          );
          closeModal(userModal);
          loadUsers();
        } else {
          showNotification('Error: ' + (data.error || data.message || 'No se pudo guardar'), 'error');
        }
      } catch (error) {
        console.error('Error:', error);
        showNotification('No se pudo conectar con el servidor', 'error');
      } finally {
        submitButton.disabled = false;
        submitButton.innerHTML = originalText;
      }
    });
  }

  // ==================== EVENTO: CONFIRMAR ELIMINACIÓN ====================
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', async () => {
      if (!userToDelete) return;

      const btn = confirmDeleteBtn;
      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<span>Eliminando...</span>';

      try {
        const response = await fetch(`/api/usuarios/${userToDelete.id}`, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          showNotification('Usuario eliminado permanentemente de la base de datos', 'success');
          closeModal(deleteModal);
          loadUsers();
        } else {
          const data = await response.json();
          showNotification('Error: ' + (data.error || data.message || 'No se pudo eliminar'), 'error');
        }
      } catch (error) {
        console.error('Error eliminando usuario:', error);
        showNotification('No se pudo conectar con el servidor', 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
        userToDelete = null;
      }
    });
  }

  // ==================== FUNCIÓN: CARGAR USUARIOS ====================
  async function loadUsers() {
    try {
      const response = await fetch('/api/usuarios');
      
      if (!response.ok) {
        throw new Error('Error al cargar usuarios');
      }

      allUsers = await response.json();
      filteredUsers = [...allUsers];
      renderUsers(filteredUsers);
      updateStats();
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      if (usersTable) {
        usersTable.innerHTML = `
          <tr>
            <td colspan="10" style="text-align: center; padding: 2rem; color: #ef4444;">
              <strong>Error al cargar los usuarios</strong><br>
              <small>${error.message}</small>
            </td>
          </tr>
        `;
      }
    }
  }

  // ==================== FUNCIÓN: RENDERIZAR USUARIOS ====================
  function renderUsers(users) {
    if (!usersTable) return;

    if (users.length === 0) {
      usersTable.innerHTML = `
        <tr>
          <td colspan="10" style="text-align: center; padding: 2rem; color: #64748b;">
            No se encontraron usuarios
          </td>
        </tr>
      `;
      return;
    }

    usersTable.innerHTML = '';

    users.forEach(user => {
      const row = document.createElement('tr');
      
      // Determinar badge de rol
      let rolBadgeClass = 'badge-atleta';
      if (user.rol === 'administrador') rolBadgeClass = 'badge-admin';
      else if (user.rol === 'comite_tecnico') rolBadgeClass = 'badge-tecnico';
      else if (user.rol === 'entrenador') rolBadgeClass = 'badge-entrenador';

      // Toggle switch para estado
      const toggleId = `toggle-${user.id}`;
      const isChecked = user.estado ? 'checked' : '';

      row.innerHTML = `
        <td><span class="table-id">${user.id}</span></td>
        <td><strong>${escapeHtml(user.ci || '-')}</strong></td>
        <td><strong>${escapeHtml(user.nombre_completo)}</strong></td>
        <td>${escapeHtml(user.email)}</td>
        <td><span class="badge ${rolBadgeClass}">${escapeHtml(user.rol)}</span></td>
        <td>${user.municipio ? escapeHtml(user.municipio) : '-'}</td>
        <td>${user.club ? escapeHtml(user.club) : '-'}</td>
        <td>${user.categoria ? escapeHtml(user.categoria) : '-'}</td>
        <td>
          <label class="status-toggle">
            <input type="checkbox" ${isChecked} onchange="toggleUserStatus(${user.id}, this.checked)">
            <span class="toggle-slider">
              <span class="toggle-text-left">Activo</span>
              <span class="toggle-text-right">Inactivo</span>
            </span>
          </label>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon btn-edit" onclick="editUser(${user.id})" title="Editar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="btn-icon btn-delete" onclick="deleteUser(${user.id})" title="Eliminar permanentemente">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
            </button>
          </div>
        </td>
      `;
      usersTable.appendChild(row);
    });
  }

  // ==================== FUNCIÓN: TOGGLE ESTADO ====================
  window.toggleUserStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`/api/usuarios/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ estado: newStatus })
      });

      if (response.ok) {
        showNotification(
          `Usuario ${newStatus ? 'activado' : 'desactivado'} exitosamente`,
          'success'
        );
        loadUsers();
      } else {
        const data = await response.json();
        showNotification('Error: ' + (data.error || 'No se pudo actualizar el estado'), 'error');
        loadUsers(); // Recargar para revertir el toggle
      }
    } catch (error) {
      console.error('Error actualizando estado:', error);
      showNotification('No se pudo conectar con el servidor', 'error');
      loadUsers(); // Recargar para revertir el toggle
    }
  };

  // ==================== FUNCIÓN: FILTRAR USUARIOS ====================
  function filterUsers() {
    const searchTerm = searchInput?.value.toLowerCase() || '';
    const roleFilter = filterRole?.value || '';
    const statusFilter = filterStatus?.value || '';

    filteredUsers = allUsers.filter(user => {
      // Filtro de búsqueda (incluye CI)
      const matchesSearch = 
        user.nombre_completo.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.rol.toLowerCase().includes(searchTerm) ||
        (user.ci && user.ci.toLowerCase().includes(searchTerm)) ||
        (user.municipio && user.municipio.toLowerCase().includes(searchTerm)) ||
        (user.club && user.club.toLowerCase().includes(searchTerm)) ||
        (user.categoria && user.categoria.toLowerCase().includes(searchTerm));

      // Filtro de rol
      const matchesRole = !roleFilter || user.rol === roleFilter;

      // Filtro de estado
      const matchesStatus = !statusFilter || user.estado.toString() === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });

    renderUsers(filteredUsers);
  }

  // ==================== FUNCIÓN: EDITAR USUARIO ====================
  window.editUser = async (id) => {
    try {
      const response = await fetch(`/api/usuarios/${id}`);
      
      if (!response.ok) {
        throw new Error('No se pudo cargar el usuario');
      }

      const user = await response.json();

      userIdInput.value = user.id;
      ciInput.value = user.ci || '';
      nombreCompletoInput.value = user.nombre_completo;
      emailInput.value = user.email;
      contrasenaInput.value = '';
      contrasenaInput.required = false;
      contrasenaInput.placeholder = 'Dejar vacío para mantener la contraseña actual';
      rolInput.value = user.rol;
      municipioInput.value = user.municipio || '';
      clubInput.value = user.club || '';
      categoriaInput.value = user.categoria || '';
      estadoInput.value = user.estado.toString();

      modalTitle.textContent = 'Editar Usuario';
      openModal(userModal);
    } catch (error) {
      console.error('Error cargando usuario:', error);
      showNotification('No se pudo cargar el usuario', 'error');
    }
  };

  // ==================== FUNCIÓN: ELIMINAR USUARIO ====================
  window.deleteUser = async (id) => {
    // Buscar el usuario
    const user = allUsers.find(u => u.id === id);
    
    if (!user) {
      showNotification('Usuario no encontrado', 'error');
      return;
    }

    userToDelete = user;
    deleteUserName.textContent = user.nombre_completo;
    openModal(deleteModal);
  };

  // ==================== FUNCIÓN: RESETEAR FORMULARIO ====================
  function resetForm() {
    if (userForm) {
      userForm.reset();
      userIdInput.value = '';
      ciInput.value = '';
      contrasenaInput.value = '';
      contrasenaInput.placeholder = '';
      estadoInput.value = 'true';
    }
  }

  // ==================== FUNCIÓN: ABRIR MODAL ====================
  function openModal(modal) {
    if (modal) {
      modal.classList.add('active');
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  // ==================== FUNCIÓN: CERRAR MODAL ====================
  function closeModal(modal) {
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
      document.body.style.overflow = '';
      if (modal === userModal) resetForm();
      if (modal === deleteModal) userToDelete = null;
    }
  }

  // ==================== FUNCIÓN: MOSTRAR NOTIFICACIÓN ====================
  function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const iconMap = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };

    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">${iconMap[type] || 'ℹ'}</span>
        <span class="notification-message">${escapeHtml(message)}</span>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 5000);
  }

  // ==================== FUNCIÓN: ACTUALIZAR ESTADÍSTICAS ====================
  function updateStats() {
    const totalUsersEl = document.querySelector('.stat-value');
    if (totalUsersEl) {
      totalUsersEl.textContent = allUsers.length;
    }

    const activeAthletesEl = document.querySelectorAll('.stat-value')[1];
    if (activeAthletesEl) {
      const activeAthletes = allUsers.filter(u => u.rol === 'atleta' && u.estado).length;
      activeAthletesEl.textContent = activeAthletes;
    }

    const clubsEl = document.querySelectorAll('.stat-value')[3];
    if (clubsEl) {
      const uniqueClubs = new Set(allUsers.filter(u => u.club).map(u => u.club));
      clubsEl.textContent = uniqueClubs.size;
    }
  }

  // ==================== FUNCIÓN: ESCAPE HTML ====================
  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text ? text.toString().replace(/[&<>"']/g, m => map[m]) : '';
  }

  console.log('✅ Admin Panel JS inicializado correctamente');
});