import type { PlantModel, ReviewModel } from "@/models/plants.model"
import axios from "axios"

const REVIEWS_KEY = 'pki_2026_plant_reviews'

const client = axios.create({
    baseURL: 'https://plants.pequla.com/api',
    headers: {
        'Accept': 'application/json',
        'X-Name': 'Digitalna_prodavnica_biljaka'
    }
})

const defaultReviewsMap: Record<number, ReviewModel[]> = {
    1: [
        { id: 101, userEmail: 'marija@example.com', userName: 'Marija Jovanović', rating: 5, comment: 'Predivna biljka! Stigla je odlično upakovana i veoma brzo napreduje.', createdAt: '2026-02-14T10:00:00.000Z' },
        { id: 102, userEmail: 'nikola@example.com', userName: 'Nikola Petrović', rating: 4, comment: 'Laka za održavanje, odlična za dnevnu sobu.', createdAt: '2026-03-01T14:30:00.000Z' }
    ],
    2: [
        { id: 103, userEmail: 'ana@example.com', userName: 'Ana Nikolić', rating: 5, comment: 'Idealna za početnike, ne traži puno vode.', createdAt: '2026-02-20T09:15:00.000Z' }
    ],
    3: [
        { id: 104, userEmail: 'stefan@example.com', userName: 'Stefan Đorđević', rating: 4, comment: 'Cvetovi su prelepi, preporučujem prihranu.', createdAt: '2026-03-05T16:45:00.000Z' }
    ]
}

export class PlantsService {
    static getStoredReviews(): Record<number, ReviewModel[]> {
        const raw = localStorage.getItem(REVIEWS_KEY)
        if (!raw) {
            localStorage.setItem(REVIEWS_KEY, JSON.stringify(defaultReviewsMap))
            return defaultReviewsMap
        }
        return JSON.parse(raw)
    }

    static getReviewsForPlant(plantId: number): ReviewModel[] {
        const all = this.getStoredReviews()
        if (all[plantId] && all[plantId]!.length > 0) {
            return all[plantId]!
        }

        return [
            {
                id: 1000 + plantId,
                userEmail: 'kupac@example.com',
                userName: 'Zadovoljni Kupac',
                rating: (plantId % 2 === 0) ? 5 : 4,
                comment: 'Odličan kvalitet sadnice, biljka izgleda zdravo i sveže kao na slici.',
                createdAt: '2026-01-25T12:00:00.000Z'
            }
        ]
    }

    static addReviewForPlant(plantId: number, review: Omit<ReviewModel, 'id' | 'createdAt'>) {
        const all = this.getStoredReviews()
        const existing = all[plantId] ?? this.getReviewsForPlant(plantId)
        const filtered = existing.filter(r => r.userEmail !== review.userEmail)
        filtered.unshift({
            ...review,
            id: Date.now(),
            createdAt: new Date().toISOString()
        })
        all[plantId] = filtered
        localStorage.setItem(REVIEWS_KEY, JSON.stringify(all))
    }

    static mapPlantObject(obj: any): PlantModel {
        const rawPrice = Number(obj.price) || 1200
        const isOnSale = obj.id % 3 === 0
        const finalPrice = isOnSale ? Math.round(rawPrice * 0.8) : rawPrice
        const reviews = this.getReviewsForPlant(obj.id)
        const avg = reviews.length > 0
            ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
            : 4.5

        return {
            id: obj.id,
            name: obj.name,
            latin_name: obj.latin_name,
            description: obj.description,
            planting_instructions: obj.planting_instructions,
            care_instructions: obj.care_instructions,
            plant_type: obj.plant_type,
            target_audience: obj.target_audience,
            light_requirement: obj.light_requirement,
            watering: obj.watering,
            intended_use: obj.intended_use,
            production_date: obj.production_date,
            price: finalPrice,
            originalPrice: isOnSale ? rawPrice : undefined,
            isOnSale,
            imageUrl: this.getImageUrl(obj),
            is_available: obj.is_available,
            stock_quantity: obj.stock_quantity,
            category_id: obj.category_id,
            category: obj.category,
            climate_id: obj.climate_id,
            climate: obj.climate,
            season_id: obj.season_id,
            season: obj.season,
            reviews,
            averageRating: avg
        }
    }

    static async getPlants(): Promise<PlantModel[]> {
        const rsp = await client.request({
            method: 'GET',
            url: '/plants',
        })

        return rsp.data.map((obj: any) => this.mapPlantObject(obj))
    }

    static async getPlantDetails(id: number): Promise<PlantModel & { other: PlantModel[] }> {
        const [detailsRsp, allPlants] = await Promise.all([
            client.get(`/plants/${id}`),
            this.getPlants()
        ])

        const mainPlant = this.mapPlantObject(detailsRsp.data)
        const other = allPlants.filter(p => p.id !== mainPlant.id && (p.category === mainPlant.category || p.season === mainPlant.season)).slice(0, 6)

        return {
            ...mainPlant,
            other
        }
    }

    static async getPlantTypes(): Promise<string[]> {
        const plants = await this.getPlants()
        const set = new Set<string>()
        plants.forEach(p => {
            if (p.plant_type) set.add(p.plant_type)
            if (p.category) set.add(p.category)
        })
        return Array.from(set)
    }

    static getImageUrl(obj: any) {
        return `https://plants.pequla.com/images/biljka-${String(obj.id).padStart(3, '0')}.svg`
    }
}
