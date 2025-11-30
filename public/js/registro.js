// Mostrar/ocultar campos según el rol
document.getElementById('rol').addEventListener('change', function () {
  const rol = this.value;
  const municipioField = document.getElementById('municipioField');
  const clubField = document.getElementById('clubField');
  const categoriaField = document.getElementById('categoriaField');

  // Ocultar todos
  municipioField.style.display = 'none';
  clubField.style.display = 'none';
  categoriaField.style.display = 'none';

  // Mostrar según rol
  if (rol === 'comite_tecnico' || rol === 'entrenador') {
    municipioField.style.display = 'block';
    document.getElementById('municipio').required = true;
  } else {
    document.getElementById('municipio').required = false;
  }

  if (rol === 'entrenador' || rol === 'atleta') {
    clubField.style.display = 'block';
    document.getElementById('club').required = true;
  } else {
    document.getElementById('club').required = false;
  }

  if (rol === 'atleta') {
    categoriaField.style.display = 'block';
  }
});