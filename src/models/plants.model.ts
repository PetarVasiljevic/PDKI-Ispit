export interface ReviewModel {
    id: number
    userEmail: string
    userName: string
    rating: number
    comment: string
    createdAt: string
}

export interface PlantModel {
    id: number
    name: string
    latin_name: string
    description: string
    planting_instructions: string
    care_instructions: string
    plant_type: string
    target_audience: string
    light_requirement: string
    watering: string
    intended_use: string
    production_date: string
    price: number
    originalPrice?: number
    isOnSale?: boolean
    imageUrl: string
    is_available: boolean
    stock_quantity: number
    category_id: number
    category: string
    climate_id: number
    climate: string
    season_id: number
    season: string
    reviews: ReviewModel[]
    averageRating: number
}
