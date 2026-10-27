import type { OrderModel, OrderStatus } from "@/models/order.model"
import type { UserModel } from "@/models/user.model"
import { PlantsService } from "./plants.service"

const USERS_KEY = 'pki_2026_plant_users'
const ACTIVE_USER_KEY = 'pki_2026_plant_active_user'

export class UserService {

    static getUsers(): UserModel[] {
        if (localStorage.getItem(USERS_KEY) == null) {
            const defaultOrders: OrderModel[] = [
                {
                    orderId: 'ORD-DEFAULT-1',
                    plantId: 1,
                    plantName: 'Monstera',
                    latinName: 'Monstera deliciosa',
                    plantType: 'Sobna biljka',
                    intendedUse: 'Dekoracija enterijera',
                    targetAudience: 'Početnici',
                    productionDate: '2025-10-15',
                    imageUrl: 'https://plants.pequla.com/images/biljka-001.svg',
                    quantity: 2,
                    potType: 'ceramic',
                    includeFertilizer: true,
                    deliveryNote: 'Ostaviti ispred vrata ako nisam tu.',
                    pricePerUnit: 1500,
                    status: 'rezervisano',
                    rating: null,
                    reviewComment: null,
                    createdAt: '2026-03-10T10:00:00.000Z',
                    paidAt: null,
                    deletedAt: null
                },
                {
                    orderId: 'ORD-DEFAULT-2',
                    plantId: 2,
                    plantName: 'Fikus Lirata',
                    latinName: 'Ficus lyrata',
                    plantType: 'Sobna biljka',
                    intendedUse: 'Dnevni boravak',
                    targetAudience: 'Iskusni',
                    productionDate: '2025-09-01',
                    imageUrl: 'https://plants.pequla.com/images/biljka-002.svg',
                    quantity: 1,
                    potType: 'standard',
                    includeFertilizer: false,
                    deliveryNote: '',
                    pricePerUnit: 1800,
                    status: 'pristiglo',
                    rating: 5,
                    reviewComment: 'Biljka je stigla u perfektnom stanju!',
                    createdAt: '2026-02-15T14:20:00.000Z',
                    paidAt: '2026-02-16T09:00:00.000Z',
                    deletedAt: null
                }
            ]

            localStorage.setItem(USERS_KEY, JSON.stringify([
                {
                    firstName: 'Petar',
                    lastName: 'Vasiljević',
                    email: 'user@example.com',
                    phone: '+381 64 123 4567',
                    address: 'Danijelova 32, Beograd',
                    favoritePlantType: 'Sobno cveće',
                    password: 'user1234',
                    orders: defaultOrders
                }
            ]))
        }

        return JSON.parse(localStorage.getItem(USERS_KEY)!)
    }

    static saveUsers(users: UserModel[]) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users))
    }

    static login(email: string, password: string): boolean {
        const users = this.getUsers()
        for (const user of users) {
            if (user.email.toLowerCase() === email.trim().toLowerCase() && user.password === password) {
                localStorage.setItem(ACTIVE_USER_KEY, user.email)
                return true
            }
        }
        return false
    }

    static getActiveUser(): UserModel | null {
        const activeEmail = localStorage.getItem(ACTIVE_USER_KEY)
        if (!activeEmail) return null

        for (const user of this.getUsers()) {
            if (user.email === activeEmail) {
                return user
            }
        }
        return null
    }

    static logout() {
        localStorage.removeItem(ACTIVE_USER_KEY)
    }

    static addOrder(order: OrderModel) {
        const activeUser = this.getActiveUser()
        const users = this.getUsers()

        if (activeUser) {
            for (const user of users) {
                if (user.email === activeUser.email) {
                    user.orders.unshift(order)
                }
            }
            this.saveUsers(users)
        }
    }

    static updateOrder(orderId: string, updatedFields: Partial<OrderModel>) {
        const activeUser = this.getActiveUser()
        const users = this.getUsers()

        if (activeUser) {
            for (const user of users) {
                if (user.email === activeUser.email) {
                    for (const ord of user.orders) {
                        if (ord.orderId === orderId && ord.status === 'rezervisano') {
                            Object.assign(ord, updatedFields)
                        }
                    }
                }
            }
            this.saveUsers(users)
        }
    }

    static changeOrderStatus(orderId: string, newStatus: OrderStatus) {
        const activeUser = this.getActiveUser()
        const users = this.getUsers()

        if (activeUser) {
            for (const user of users) {
                if (user.email === activeUser.email) {
                    for (const ord of user.orders) {
                        if (ord.orderId === orderId) {
                            ord.status = newStatus
                            if (newStatus === 'pristiglo' && !ord.paidAt) {
                                ord.paidAt = new Date().toISOString()
                            }
                        }
                    }
                }
            }
            this.saveUsers(users)
        }
    }

    static markAllReservedAsArrived() {
        const activeUser = this.getActiveUser()
        const users = this.getUsers()
        const now = new Date().toISOString()

        if (activeUser) {
            for (const user of users) {
                if (user.email === activeUser.email) {
                    for (const order of user.orders) {
                        if (order.status === 'rezervisano' && order.deletedAt == null) {
                            order.status = 'pristiglo'
                            order.paidAt = now
                        }
                    }
                }
            }
            this.saveUsers(users)
        }
    }

    static rateOrder(orderId: string, rating: number, comment: string) {
        const activeUser = this.getActiveUser()
        const users = this.getUsers()

        if (activeUser) {
            for (const user of users) {
                if (user.email === activeUser.email) {
                    for (const ord of user.orders) {
                        if (ord.orderId === orderId && ord.status === 'pristiglo') {
                            ord.rating = rating
                            ord.reviewComment = comment
                            PlantsService.addReviewForPlant(ord.plantId, {
                                userEmail: user.email,
                                userName: `${user.firstName} ${user.lastName}`,
                                rating,
                                comment: comment || 'Odlična biljka, sve preporuke!'
                            })
                        }
                    }
                }
            }
            this.saveUsers(users)
        }
    }

    static removeOrder(orderId: string) {
        const activeUser = this.getActiveUser()
        const users = this.getUsers()

        if (activeUser) {
            for (const user of users) {
                if (user.email === activeUser.email) {
                    for (const obj of user.orders) {
                        if (obj.orderId === orderId) {
                            obj.deletedAt = new Date().toISOString()
                        }
                    }
                }
            }
            this.saveUsers(users)
        }
    }

    static updateProfile(profileData: Partial<Omit<UserModel, 'email' | 'password' | 'orders'>>) {
        const activeUser = this.getActiveUser()
        const users = this.getUsers()

        if (activeUser) {
            for (const user of users) {
                if (user.email === activeUser.email) {
                    if (profileData.firstName !== undefined) user.firstName = profileData.firstName
                    if (profileData.lastName !== undefined) user.lastName = profileData.lastName
                    if (profileData.phone !== undefined) user.phone = profileData.phone
                    if (profileData.address !== undefined) user.address = profileData.address
                    if (profileData.favoritePlantType !== undefined) user.favoritePlantType = profileData.favoritePlantType
                }
            }
            this.saveUsers(users)
        }
    }

    static changePassword(newPassword: string) {
        const activeUser = this.getActiveUser()
        const users = this.getUsers()

        if (activeUser) {
            for (const user of users) {
                if (user.email === activeUser.email) {
                    user.password = newPassword
                }
            }
            this.saveUsers(users)
        }
    }

    static createUser(payload: Omit<UserModel, 'orders'>): string | null {
        const users = this.getUsers()

        for (const user of users) {
            if (user.email.toLowerCase() === payload.email.trim().toLowerCase()) {
                return 'Email adresa je već u upotrebi!'
            }
        }

        if (payload.password.length < 6) {
            return 'Lozinka mora imati najmanje 6 karaktera!'
        }

        users.push({
            ...payload,
            email: payload.email.trim(),
            orders: []
        })

        this.saveUsers(users)
        return null
    }
}
