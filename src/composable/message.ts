import { useToast } from 'primevue/usetoast'

const toast = useToast()

export function useMessage() {
  const showSuccess = (summary: string, detail: string) => {
    toast.add({
      severity: 'success',
      summary,
      detail,
      life: 3000,
    })
  }

  const showInfo = (summary: string, detail: string) => {
    toast.add({ severity: 'info', summary, detail, life: 3000 })
  }

  const showWarn = (summary: string, detail: string) => {
    toast.add({ severity: 'warn', summary, detail, life: 3000 })
  }

  const showError = (summary: string, detail: string) => {
    toast.add({ severity: 'error', summary, detail, life: 3000 })
  }

  const showSecondary = (summary: string, detail: string) => {
    toast.add({
      severity: 'secondary',
      summary,
      detail,
      life: 3000,
    })
  }

  const showContrast = (summary: string, detail: string) => {
    toast.add({
      severity: 'contrast',
      summary,
      detail,
      life: 3000,
    })
  }
  return { showSuccess, showInfo, showWarn, showError, showSecondary, showContrast }
}
