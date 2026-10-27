export type OrderStatus = 'rezervisano' | 'pristiglo' | 'otkazano'

export interface OrderModel {
    orderId: string
    plantId: number
    plantName: string
    latinName: string
    plantType: string
    intendedUse: string
    targetAudience: string
    productionDate: string
    imageUrl: string
    quantity: number
    potType: 'standard' | 'ceramic' | 'self-watering'
    includeFertilizer: boolean
    deliveryNote: string
    pricePerUnit: number
    status: OrderStatus
    rating: number | null
    reviewComment: string | null
    createdAt: string
    paidAt: string | null
    deletedAt: string | null
}
