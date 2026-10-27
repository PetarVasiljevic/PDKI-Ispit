import type { OrderModel } from "./order.model"

export interface UserModel {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    favoritePlantType: string
    password: string
    orders: OrderModel[]
}
