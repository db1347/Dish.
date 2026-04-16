export interface User {
  id: string
  username: string
  display_name: string
  bio: string | null
  avatar_url: string | null
  dietary_prefs: DietaryPref[]
  cuisine_prefs: string[]
  skill_level: SkillLevel
  follower_count: number
  following_count: number
  recipe_count: number
  avg_rating: number
  created_at: string
}

export type DietaryPref = 'vegan' | 'vegetarian' | 'gluten-free' | 'dairy-free' | 'halal' | 'kosher' | 'keto' | 'paleo'
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced'

export interface Recipe {
  id: string
  author_id: string
  author?: User
  title: string
  description: string
  cover_image_url: string | null
  cuisine: string
  dietary_tags: DietaryPref[]
  skill_level: SkillLevel
  prep_time_mins: number
  cook_time_mins: number
  servings: number
  ingredients: Ingredient[]
  steps: Step[]
  avg_rating: number
  rating_count: number
  save_count: number
  is_ai_generated: boolean
  ai_prompt?: string | null
  created_at: string
}

export interface Ingredient {
  id: string
  name: string
  quantity: number
  unit: string
  notes?: string
}

export interface Step {
  order: number
  instruction: string
  timer_mins?: number
}

export interface Comment {
  id: string
  recipe_id: string
  author_id: string
  author?: User
  body: string
  created_at: string
}

export interface Rating {
  id: string
  recipe_id: string
  user_id: string
  stars: number
  created_at: string
}

export interface Collection {
  id: string
  user_id: string
  name: string
  recipe_ids: string[]
  is_public: boolean
  created_at: string
}

export interface Follow {
  follower_id: string
  following_id: string
  created_at: string
}

export interface GenerateRecipeInput {
  ingredients: string[]
  dietary_prefs: DietaryPref[]
  cuisine?: string
  skill_level?: SkillLevel
  max_time_mins?: number
}

export interface GeneratedRecipe {
  title: string
  description: string
  cuisine: string
  dietary_tags: DietaryPref[]
  skill_level: SkillLevel
  prep_time_mins: number
  cook_time_mins: number
  servings: number
  ingredients: Ingredient[]
  steps: Step[]
  estimated_calories: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  page_size: number
  has_more: boolean
}

export interface UsageLimits {
  ai_generations_used: number
  ai_generations_limit: number
  is_premium: boolean
}
