import Swal from 'sweetalert2';

// Success Alert
export const showSuccess = (title = 'Success!', text = 'Operation completed successfully') => {
  return Swal.fire({
    icon: 'success',
    title,
    text,
    confirmButtonColor: '#10b981'
  });
};

// Error Alert
export const showError = (title = 'Error!', text = 'Something went wrong') => {
  return Swal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonColor: '#ef4444'
  });
};

// Warning Alert
export const showWarning = (title = 'Warning!', text = 'Please check your input') => {
  return Swal.fire({
    icon: 'warning',
    title,
    text,
    confirmButtonColor: '#f59e0b'
  });
};

// Confirmation Alert
export const showConfirm = (title = 'Are you sure?', text = 'This action cannot be undone') => {
  return Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, do it!',
    cancelButtonText: 'Cancel'
  });
};

// Loading Alert
export const showLoading = (title = 'Please wait...') => {
  return Swal.fire({
    title,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

// Close Loading
export const closeLoading = () => {
  Swal.close();
};

// Toast Notification
export const showToast = (icon = 'success', title = 'Success') => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true
  });

  return Toast.fire({
    icon,
    title
  });
};