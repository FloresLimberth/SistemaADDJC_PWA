// js/login.js
document.addEventListener('DOMContentLoaded', () => {
  // ==================== ELEMENTOS DEL DOM ====================
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const togglePassword = document.getElementById('togglePassword');
  const btnLogin = document.getElementById('btnLogin');
  const messageContainer = document.getElementById('messageContainer');
  
  // Modal recuperar contraseña
  const forgotPasswordLink = document.getElementById('forgotPassword');
  const forgotPasswordModal = document.getElementById('forgotPasswordModal');
  const closeModal = document.getElementById('closeModal');
  const cancelRecovery = document.getElementById('cancelRecovery');
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  const recoveryEmail = document.getElementById('recoveryEmail');

  // ==================== TOGGLE MOSTRAR/OCULTAR CONTRASEÑA ====================
  if (togglePassword) {
    togglePassword.addEventListener('click', () => {
      const type = passwordInput.type === 'password' ? 'text' : 'password';
      passwordInput.type = type;
      
      // Cambiar iconos
      const eyeIcon = togglePassword.querySelector('.eye-icon');
      const eyeOffIcon = togglePassword.querySelector('.eye-off-icon');
      
      if (type === 'text') {
        eyeIcon.style.display = 'none';
        eyeOffIcon.style.display = 'block';
      } else {
        eyeIcon.style.display = 'block';
        eyeOffIcon.style.display = 'none';
      }
    });
  }

  // ==================== FUNCIÓN: MOSTRAR MENSAJE ====================
  function showMessage(message, type = 'error') {
    // Limpiar mensajes anteriores
    messageContainer.innerHTML = '';

    // Crear mensaje
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;

    messageContainer.appendChild(messageDiv);

    // Auto ocultar después de 5 segundos
    setTimeout(() => {
      messageDiv.style.opacity = '0';
      setTimeout(() => {
        messageDiv.remove();
      }, 300);
    }, 5000);
  }

  // ==================== FUNCIÓN: LIMPIAR MENSAJES ====================
  function clearMessages() {
    messageContainer.innerHTML = '';
  }

  // ==================== EVENTO: SUBMIT LOGIN ====================
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      clearMessages();

      const email = emailInput.value.trim();
      const password = passwordInput.value; // NO CIFRAMOS AQUÍ, se valida en el backend

      // Validaciones básicas
      if (!email || !password) {
        showMessage('Por favor, completa todos los campos', 'warning');
        return;
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showMessage('Por favor, ingresa un correo electrónico válido', 'warning');
        emailInput.focus();
        return;
      }

      // Deshabilitar botón y mostrar loading
      btnLogin.disabled = true;
      btnLogin.classList.add('loading');
      btnLogin.textContent = 'Iniciando sesión...';

      try {
        // Hacer petición al backend
        // IMPORTANTE: El backend compara la contraseña en texto plano 
        // con la contraseña cifrada usando bcrypt.compare()
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email,
            password: password // Se envía en texto plano, el backend la valida con bcrypt
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Login exitoso
          showMessage('¡Bienvenido! Redirigiendo...', 'success');
          
          // Guardar datos del usuario en localStorage (opcional)
          if (data.user) {
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('isAuthenticated', 'true');
          }

          // Redirigir según el rol después de 1 segundo
          setTimeout(() => {
            const rol = data.user?.rol;
            
            if (rol === 'administrador' || rol === 'comite_tecnico') {
              window.location.href = '/admin/dashboard.html';
            } else if (rol === 'entrenador') {
              window.location.href = '/entrenador/dashboard.html';
            } else if (rol === 'atleta') {
              window.location.href = '/atleta/dashboard.html';
            } else {
              window.location.href = '/dashboard.html';
            }
          }, 1000);

        } else {
          // Error de credenciales
          if (response.status === 401) {
            showMessage('❌ Correo o contraseña incorrectos. Por favor, verifica tus datos.', 'error');
            passwordInput.value = '';
            passwordInput.focus();
          } else if (response.status === 403) {
            showMessage('⚠️ Tu cuenta está inactiva. Contacta al administrador.', 'warning');
          } else {
            showMessage(data.error || 'Error al iniciar sesión. Intenta nuevamente.', 'error');
          }
        }

      } catch (error) {
        console.error('Error al conectar con el servidor:', error);
        showMessage('❌ No se pudo conectar con el servidor. Verifica tu conexión a internet.', 'error');
      } finally {
        // Restaurar botón
        btnLogin.disabled = false;
        btnLogin.classList.remove('loading');
        btnLogin.textContent = 'Iniciar Sesión';
      }
    });
  }

  // ==================== MODAL RECUPERAR CONTRASEÑA ====================
  
  // Abrir modal
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(forgotPasswordModal);
    });
  }

  // Cerrar modal
  if (closeModal) {
    closeModal.addEventListener('click', () => {
      closeModalFunc(forgotPasswordModal);
    });
  }

  if (cancelRecovery) {
    cancelRecovery.addEventListener('click', () => {
      closeModalFunc(forgotPasswordModal);
    });
  }

  // Cerrar modal con overlay
  if (forgotPasswordModal) {
    const overlay = forgotPasswordModal.querySelector('.modal-overlay');
    if (overlay) {
      overlay.addEventListener('click', () => {
        closeModalFunc(forgotPasswordModal);
      });
    }
  }

  // Cerrar con ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && forgotPasswordModal && forgotPasswordModal.classList.contains('active')) {
      closeModalFunc(forgotPasswordModal);
    }
  });

  // Submit recuperar contraseña
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = recoveryEmail.value.trim();

      if (!email) {
        showMessage('Por favor, ingresa tu correo electrónico', 'warning');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showMessage('Por favor, ingresa un correo electrónico válido', 'warning');
        return;
      }

      try {
        // Hacer petición al backend
        const response = await fetch('/api/auth/recuperar-contrasena', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: email })
        });

        const data = await response.json();

        if (response.ok) {
          closeModalFunc(forgotPasswordModal);
          showMessage('✅ Te hemos enviado un correo con instrucciones para restablecer tu contraseña', 'success');
          recoveryEmail.value = '';
        } else {
          showMessage(data.error || 'Error al procesar la solicitud', 'error');
        }

      } catch (error) {
        console.error('Error:', error);
        showMessage('No se pudo conectar con el servidor', 'error');
      }
    });
  }

  // ==================== FUNCIONES MODAL ====================
  function openModal(modal) {
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModalFunc(modal) {
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      if (recoveryEmail) recoveryEmail.value = '';
    }
  }

/*  // ==================== VERIFICAR SI YA ESTÁ AUTENTICADO ====================
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  const user = localStorage.getItem('user');

  if (isAuthenticated === 'true' && user) {
    // Si ya está autenticado, redirigir según rol
    try {
      const userData = JSON.parse(user);
      const rol = userData.rol;
      
      if (rol === 'administrador' || rol === 'comite_tecnico') {
        window.location.href = '/admin/dashboard.html';
      } else if (rol === 'entrenador') {
        window.location.href = '/entrenador/dashboard.html';
      } else if (rol === 'atleta') {
        window.location.href = '/atleta/dashboard.html';
      }
    } catch (e) {
      // Si hay error al parsear, limpiar localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
    }
  }
*/
  console.log('✅ Login script inicializado correctamente');
  console.log('📝 Nota: Las contraseñas se envían en texto plano y se validan con bcrypt en el backend');
});