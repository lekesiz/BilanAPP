// Fonction pour initialiser les tooltips Bootstrap
function initTooltips() {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
}

// Fonction pour initialiser les popovers Bootstrap
function initPopovers() {
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl);
  });
}

// Fonction pour confirmer les suppressions
function confirmDelete(event, message) {
  if (!confirm(message || 'Êtes-vous sûr de vouloir supprimer cet élément ?')) {
    event.preventDefault();
    return false;
  }
  return true;
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
  // Initialiser les composants Bootstrap
  initTooltips();
  initPopovers();
  
  // Gestionnaire pour les boutons de suppression
  document.querySelectorAll('.btn-delete').forEach(button => {
    button.addEventListener('click', function(e) {
      confirmDelete(e, this.getAttribute('data-confirm-message'));
    });
  });

  // Fermeture automatique des alertes après 5 secondes
  setTimeout(function() {
    document.querySelectorAll('.alert').forEach(alert => {
      const bsAlert = new bootstrap.Alert(alert);
      bsAlert.close();
    });
  }, 5000);
});
