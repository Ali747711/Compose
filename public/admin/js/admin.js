// Compose Coffee Admin Panel JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // ============ Sidebar Toggle ============
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', function() {
      sidebar.classList.toggle('show');
    });
  }

  if (sidebarOverlay && sidebar) {
    sidebarOverlay.addEventListener('click', function() {
      sidebar.classList.remove('show');
    });
  }

  // ============ Status Change Handler (AJAX) ============
  const statusSelects = document.querySelectorAll('.status-select');
  statusSelects.forEach(select => {
    select.addEventListener('change', async function() {
      const id = this.dataset.id;
      const type = this.dataset.type;
      const status = this.value;

      try {
        const response = await fetch(`/admin/${type}s/${id}/status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ status })
        });

        const data = await response.json();

        if (data.success) {
          showToast('Status updated successfully', 'success');
        } else {
          showToast('Failed to update status', 'error');
          location.reload();
        }
      } catch (error) {
        console.error('Error:', error);
        showToast('Failed to update status', 'error');
        location.reload();
      }
    });
  });

  // ============ Delete Handler ============
  const deleteButtons = document.querySelectorAll('.delete-btn');
  const deleteModal = document.getElementById('deleteModal');
  const deleteForm = document.getElementById('deleteForm');
  const deleteName = document.getElementById('deleteName');

  if (deleteModal && deleteForm) {
    const modal = new bootstrap.Modal(deleteModal);

    deleteButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        const id = this.dataset.id;
        const type = this.dataset.type;
        const name = this.dataset.name || 'this item';

        deleteName.textContent = name;
        deleteForm.action = `/admin/${type}s/${id}/delete`;
        modal.show();
      });
    });
  }

  // ============ Toast Notification ============
  function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Make showToast globally available
  window.showToast = showToast;

  // ============ Auto-dismiss Alerts ============
  const alerts = document.querySelectorAll('.alert-dismissible');
  alerts.forEach(alert => {
    setTimeout(() => {
      const closeBtn = alert.querySelector('.btn-close');
      if (closeBtn) {
        closeBtn.click();
      }
    }, 5000);
  });

  // ============ Form Validation ============
  const forms = document.querySelectorAll('form[data-validate]');
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      if (!form.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();
      }
      form.classList.add('was-validated');
    });
  });

  // ============ Confirm Before Leaving Unsaved Changes ============
  let formChanged = false;
  const editForms = document.querySelectorAll('form[data-warn-unsaved]');

  editForms.forEach(form => {
    form.querySelectorAll('input, select, textarea').forEach(input => {
      input.addEventListener('change', () => formChanged = true);
    });

    form.addEventListener('submit', () => formChanged = false);
  });

  window.addEventListener('beforeunload', function(e) {
    if (formChanged) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
});
