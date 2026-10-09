import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import '../styles/alerts.css';

// Alertas do site (SweetAlert2) com o visual do tema escuro.
// Uso:
//   if (!(await confirmDialog({ title: 'Excluir sala?' }))) return;
//   notify('Sala salva.');
//   notify('Erro ao salvar.', 'error');

const baseAlert = Swal.mixin({
    buttonsStyling: false,
    reverseButtons: true,
    heightAuto: false,
    customClass: {
        popup: 'swal-popup',
        title: 'swal-title',
        htmlContainer: 'swal-text',
        actions: 'swal-actions',
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-secondary',
    },
});

const toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    customClass: {
        popup: 'swal-toast',
        title: 'swal-toast-title',
    },
    didOpen: (popup) => {
        // Pausa o tempo enquanto o mouse está em cima
        popup.addEventListener('mouseenter', Swal.stopTimer);
        popup.addEventListener('mouseleave', Swal.resumeTimer);
    },
});

// Janela de confirmação. Retorna true se o usuário confirmou.
// danger: true deixa o botão de confirmar vermelho (exclusões, sair).
export async function confirmDialog({
    title,
    text,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    icon = 'warning',
    danger = false,
}) {
    const result = await baseAlert.fire({
        title,
        text,
        icon,
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        focusCancel: danger,
        // customClass do mixin é substituído (não mesclado), então repetimos tudo aqui
        customClass: {
            popup: 'swal-popup',
            title: 'swal-title',
            htmlContainer: 'swal-text',
            actions: 'swal-actions',
            confirmButton: danger ? 'btn btn-danger' : 'btn btn-primary',
            cancelButton: 'btn btn-secondary',
        },
    });
    return result.isConfirmed;
}

// Janela de aviso com um botão só (ex.: conta criada com sucesso)
export function alertDialog({ title, text, icon = 'success', confirmText = 'OK', timer }) {
    return baseAlert.fire({
        title,
        text,
        icon,
        confirmButtonText: confirmText,
        timer,
        timerProgressBar: Boolean(timer),
    });
}

// Notificação pequena no canto da tela, some sozinha
export function notify(title, icon = 'success') {
    return toast.fire({ title, icon });
}
