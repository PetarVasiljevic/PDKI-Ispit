import Swal from "sweetalert2"
import type { OrderModel } from "./models/order.model"

export function formatDate(iso: string) {
    if (!iso) return 'N/A'
    return new Date(iso).toLocaleDateString('sr-RS', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    })
}

export function formatDateTime(iso: string) {
    if (!iso) return 'N/A'
    return new Date(iso).toLocaleString('sr-RS', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

export function getPotExtraPrice(potType: 'standard' | 'ceramic' | 'self-watering'): number {
    if (potType === 'ceramic') return 450
    if (potType === 'self-watering') return 750
    return 0
}

export function getPriceForOrder(order: OrderModel): number {
    const potExtra = getPotExtraPrice(order.potType)
    const fertilizerExtra = order.includeFertilizer ? 250 : 0
    return (order.pricePerUnit + potExtra + fertilizerExtra) * order.quantity
}

const bootstrapClasses = {
    popup: 'card border-success',
    cancelButton: 'btn btn-danger ms-2',
    denyButton: 'btn btn-secondary ms-2',
    confirmButton: 'btn btn-success'
}

export function showLoading(title = 'Učitavanje podataka...') {
    Swal.fire({
        title,
        text: 'Molimo sačekajte dok učitavamo podatke o biljkama.',
        customClass: bootstrapClasses,
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading()
        }
    })
}

export function showConfirm(message: string, callback: Function) {
    Swal.fire({
        title: message,
        showCancelButton: true,
        showConfirmButton: true,
        confirmButtonText: 'Da, potvrdi!',
        cancelButtonText: 'Otkaži',
        icon: 'question',
        customClass: bootstrapClasses
    }).then(result => {
        if (result.isConfirmed) {
            callback()
        }
    })
}

export function showSuccess(message = 'Uspešno izvršeno!') {
    Swal.fire({
        icon: 'success',
        confirmButtonText: 'U redu',
        title: 'Obaveštenje',
        text: message,
        customClass: bootstrapClasses
    })
}

export function showError(message: string) {
    Swal.fire({
        icon: 'error',
        title: 'Greška',
        text: message,
        confirmButtonText: 'U redu',
        customClass: bootstrapClasses
    })
}
