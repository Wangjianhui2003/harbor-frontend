import type { ToastServiceMethods } from 'primevue/toastservice'
//不能直接useToast

const showSuccess = (toast: ToastServiceMethods, summary: string, detail: string) => {
  toast.add({
    severity: 'success',
    summary,
    detail,
    life: 3000,
  })
}

const showInfo = (toast: ToastServiceMethods, summary: string, detail: string) => {
  toast.add({ severity: 'info', summary, detail, life: 3000 })
}

const showWarn = (toast: ToastServiceMethods, summary: string, detail: string) => {
  toast.add({ severity: 'warn', summary, detail, life: 3000 })
}

const showError = (toast: ToastServiceMethods, summary: string, detail: string) => {
  toast.add({ severity: 'error', summary, detail, life: 3000 })
}

const showSecondary = (toast: ToastServiceMethods, summary: string, detail: string) => {
  toast.add({
    severity: 'secondary',
    summary,
    detail,
    life: 3000,
  })
}

const showContrast = (toast: ToastServiceMethods, summary: string, detail: string) => {
  toast.add({
    severity: 'contrast',
    summary,
    detail,
    life: 3000,
  })
}

export { showSuccess, showInfo, showWarn, showError, showSecondary, showContrast }
