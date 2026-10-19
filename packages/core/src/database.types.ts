// GENERADO con: pnpm db:types — no editar a mano

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "audit_logs": {
                  Row: {
                    "action": string,"actor_id": string | null,"after": Json | null,"before": Json | null,"correlation_id": string | null,"created_at": string,"entity_id": string | null,"entity_type": string,"id": number,"ip_truncated": string | null,"reason": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "action": string,"actor_id"?: string | null,"after"?: Json | null,"before"?: Json | null,"correlation_id"?: string | null,"created_at"?: string,"entity_id"?: string | null,"entity_type": string,"id"?: never,"ip_truncated"?: string | null,"reason"?: string | null
                  }
                  Update: {
                    "action"?: string,"actor_id"?: string | null,"after"?: Json | null,"before"?: Json | null,"correlation_id"?: string | null,"created_at"?: string,"entity_id"?: string | null,"entity_type"?: string,"id"?: never,"ip_truncated"?: string | null,"reason"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "audit_logs_actor_id_fkey"
      columns: ["actor_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"blocked_terms": {
                  Row: {
                    "action": string,"created_at": string,"id": number,"term": string
                  }
                  ComputedFields: never
                  Insert: {
                    "action"?: string,"created_at"?: string,"id"?: never,"term": string
                  }
                  Update: {
                    "action"?: string,"created_at"?: string,"id"?: never,"term"?: string
                  }
                  Relationships: [
                    
                  ]
                },"categories": {
                  Row: {
                    "allow_photos": boolean,"color": string,"created_at": string,"description": NonNullable<Json>,"icon": string,"id": number,"image_path": string | null,"is_active": boolean,"is_sensitive": boolean,"name": NonNullable<Json>,"required_verifications": (Database["public"]['Enums']["verification_kind"])[],"requires_review": boolean,"restrictions": Json | null,"slug": string,"sort_order": number,"updated_at": string,"warnings": Json | null
                  }
                  ComputedFields: never
                  Insert: {
                    "allow_photos"?: boolean,"color": string,"created_at"?: string,"description": NonNullable<Json>,"icon": string,"id"?: never,"image_path"?: string | null,"is_active"?: boolean,"is_sensitive"?: boolean,"name": NonNullable<Json>,"required_verifications"?: (Database["public"]['Enums']["verification_kind"])[],"requires_review"?: boolean,"restrictions"?: Json | null,"slug": string,"sort_order"?: number,"updated_at"?: string,"warnings"?: Json | null
                  }
                  Update: {
                    "allow_photos"?: boolean,"color"?: string,"created_at"?: string,"description"?: NonNullable<Json>,"icon"?: string,"id"?: never,"image_path"?: string | null,"is_active"?: boolean,"is_sensitive"?: boolean,"name"?: NonNullable<Json>,"required_verifications"?: (Database["public"]['Enums']["verification_kind"])[],"requires_review"?: boolean,"restrictions"?: Json | null,"slug"?: string,"sort_order"?: number,"updated_at"?: string,"warnings"?: Json | null
                  }
                  Relationships: [
                    
                  ]
                },"category_fields": {
                  Row: {
                    "category_id": number,"created_at": string,"field_type": string,"help": Json | null,"id": number,"is_public": boolean,"is_required": boolean,"key": string,"label": NonNullable<Json>,"options": Json | null,"sort_order": number,"updated_at": string,"validation": Json | null
                  }
                  ComputedFields: never
                  Insert: {
                    "category_id": number,"created_at"?: string,"field_type": string,"help"?: Json | null,"id"?: never,"is_public"?: boolean,"is_required"?: boolean,"key": string,"label": NonNullable<Json>,"options"?: Json | null,"sort_order"?: number,"updated_at"?: string,"validation"?: Json | null
                  }
                  Update: {
                    "category_id"?: number,"created_at"?: string,"field_type"?: string,"help"?: Json | null,"id"?: never,"is_public"?: boolean,"is_required"?: boolean,"key"?: string,"label"?: NonNullable<Json>,"options"?: Json | null,"sort_order"?: number,"updated_at"?: string,"validation"?: Json | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "category_fields_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id"]
    }
                  ]
                },"feature_flags": {
                  Row: {
                    "description": string,"enabled": boolean,"key": string,"platforms": (string)[],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "description": string,"enabled"?: boolean,"key": string,"platforms"?: (string)[],"updated_at"?: string
                  }
                  Update: {
                    "description"?: string,"enabled"?: boolean,"key"?: string,"platforms"?: (string)[],"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"legal_acceptances": {
                  Row: {
                    "accepted_at": string,"id": number,"ip_truncated": string | null,"kind": string,"user_agent": string | null,"user_id": string,"version": string
                  }
                  ComputedFields: never
                  Insert: {
                    "accepted_at"?: string,"id"?: never,"ip_truncated"?: string | null,"kind": string,"user_agent"?: string | null,"user_id": string,"version": string
                  }
                  Update: {
                    "accepted_at"?: string,"id"?: never,"ip_truncated"?: string | null,"kind"?: string,"user_agent"?: string | null,"user_id"?: string,"version"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "legal_acceptances_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"legal_documents": {
                  Row: {
                    "body_md": string,"created_at": string,"id": string,"is_draft": boolean,"kind": string,"locale": string,"published_at": string | null,"title": string,"version": string
                  }
                  ComputedFields: never
                  Insert: {
                    "body_md": string,"created_at"?: string,"id"?: string,"is_draft"?: boolean,"kind": string,"locale": string,"published_at"?: string | null,"title": string,"version": string
                  }
                  Update: {
                    "body_md"?: string,"created_at"?: string,"id"?: string,"is_draft"?: boolean,"kind"?: string,"locale"?: string,"published_at"?: string | null,"title"?: string,"version"?: string
                  }
                  Relationships: [
                    
                  ]
                },"listing_custom_values": {
                  Row: {
                    "field_id": number,"listing_id": string,"value": NonNullable<Json>
                  }
                  ComputedFields: never
                  Insert: {
                    "field_id": number,"listing_id": string,"value": NonNullable<Json>
                  }
                  Update: {
                    "field_id"?: number,"listing_id"?: string,"value"?: NonNullable<Json>
                  }
                  Relationships: [
                    {
      foreignKeyName: "listing_custom_values_field_id_fkey"
      columns: ["field_id"]
isOneToOne: false
      referencedRelation: "category_fields"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "listing_custom_values_listing_id_fkey"
      columns: ["listing_id"]
isOneToOne: false
      referencedRelation: "listings"
      referencedColumns: ["id"]
    }
                  ]
                },"listing_drafts": {
                  Row: {
                    "author_id": string,"created_at": string,"data": NonNullable<Json>,"id": string,"step": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "author_id": string,"created_at"?: string,"data"?: NonNullable<Json>,"id"?: string,"step"?: number,"updated_at"?: string
                  }
                  Update: {
                    "author_id"?: string,"created_at"?: string,"data"?: NonNullable<Json>,"id"?: string,"step"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "listing_drafts_author_id_fkey"
      columns: ["author_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"listing_favorites": {
                  Row: {
                    "created_at": string,"listing_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"listing_id": string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"listing_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "listing_favorites_listing_id_fkey"
      columns: ["listing_id"]
isOneToOne: false
      referencedRelation: "listings"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "listing_favorites_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"listing_images": {
                  Row: {
                    "alt": string | null,"created_at": string,"height": number,"id": string,"listing_id": string,"path": string,"position": number,"width": number
                  }
                  ComputedFields: never
                  Insert: {
                    "alt"?: string | null,"created_at"?: string,"height": number,"id"?: string,"listing_id": string,"path": string,"position"?: number,"width": number
                  }
                  Update: {
                    "alt"?: string | null,"created_at"?: string,"height"?: number,"id"?: string,"listing_id"?: string,"path"?: string,"position"?: number,"width"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "listing_images_listing_id_fkey"
      columns: ["listing_id"]
isOneToOne: false
      referencedRelation: "listings"
      referencedColumns: ["id"]
    }
                  ]
                },"listing_reports": {
                  Row: {
                    "created_at": string,"details": string | null,"handled_at": string | null,"handled_by": string | null,"id": string,"listing_id": string,"reason": string,"reporter_id": string | null,"status": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"details"?: string | null,"handled_at"?: string | null,"handled_by"?: string | null,"id"?: string,"listing_id": string,"reason": string,"reporter_id"?: string | null,"status"?: string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"details"?: string | null,"handled_at"?: string | null,"handled_by"?: string | null,"id"?: string,"listing_id"?: string,"reason"?: string,"reporter_id"?: string | null,"status"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "listing_reports_handled_by_fkey"
      columns: ["handled_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "listing_reports_listing_id_fkey"
      columns: ["listing_id"]
isOneToOne: false
      referencedRelation: "listings"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "listing_reports_reporter_id_fkey"
      columns: ["reporter_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"listing_views_daily": {
                  Row: {
                    "day": string,"listing_id": string,"views": number
                  }
                  ComputedFields: never
                  Insert: {
                    "day"?: string,"listing_id": string,"views"?: number
                  }
                  Update: {
                    "day"?: string,"listing_id"?: string,"views"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "listing_views_daily_listing_id_fkey"
      columns: ["listing_id"]
isOneToOne: false
      referencedRelation: "listings"
      referencedColumns: ["id"]
    }
                  ]
                },"listings": {
                  Row: {
                    "author_id": string,"availability": Json | null,"category_id": number,"contacts_count": number,"created_at": string,"currency": string,"deleted_at": string | null,"description": string,"desired_date": string | null,"expires_at": string | null,"favorites_count": number,"id": string,"is_urgent": boolean,"kind": Database["public"]['Enums']["listing_kind"],"location_public": unknown,"modality": Database["public"]['Enums']["listing_modality"],"moderation_reason": string | null,"moderation_status": Database["public"]['Enums']["moderation_status"],"municipality_id": number,"price_cents": number | null,"price_type": Database["public"]['Enums']["price_type"],"published_at": string | null,"radius_km": number | null,"requirements": string | null,"safety_notes": string | null,"search_vector": unknown,"slug": string,"status": Database["public"]['Enums']["listing_status"],"subcategory_id": number | null,"tags": (string)[],"title": string,"updated_at": string,"views_count": number,"visibility": Database["public"]['Enums']["listing_visibility"]
                  }
                  ComputedFields: never
                  Insert: {
                    "author_id": string,"availability"?: Json | null,"category_id": number,"contacts_count"?: number,"created_at"?: string,"currency"?: string,"deleted_at"?: string | null,"description": string,"desired_date"?: string | null,"expires_at"?: string | null,"favorites_count"?: number,"id"?: string,"is_urgent"?: boolean,"kind": Database["public"]['Enums']["listing_kind"],"location_public"?: unknown,"modality": Database["public"]['Enums']["listing_modality"],"moderation_reason"?: string | null,"moderation_status"?: Database["public"]['Enums']["moderation_status"],"municipality_id": number,"price_cents"?: number | null,"price_type": Database["public"]['Enums']["price_type"],"published_at"?: string | null,"radius_km"?: number | null,"requirements"?: string | null,"safety_notes"?: string | null,"search_vector"?: never,"slug"?: string,"status"?: Database["public"]['Enums']["listing_status"],"subcategory_id"?: number | null,"tags"?: (string)[],"title": string,"updated_at"?: string,"views_count"?: number,"visibility"?: Database["public"]['Enums']["listing_visibility"]
                  }
                  Update: {
                    "author_id"?: string,"availability"?: Json | null,"category_id"?: number,"contacts_count"?: number,"created_at"?: string,"currency"?: string,"deleted_at"?: string | null,"description"?: string,"desired_date"?: string | null,"expires_at"?: string | null,"favorites_count"?: number,"id"?: string,"is_urgent"?: boolean,"kind"?: Database["public"]['Enums']["listing_kind"],"location_public"?: unknown,"modality"?: Database["public"]['Enums']["listing_modality"],"moderation_reason"?: string | null,"moderation_status"?: Database["public"]['Enums']["moderation_status"],"municipality_id"?: number,"price_cents"?: number | null,"price_type"?: Database["public"]['Enums']["price_type"],"published_at"?: string | null,"radius_km"?: number | null,"requirements"?: string | null,"safety_notes"?: string | null,"search_vector"?: never,"slug"?: string,"status"?: Database["public"]['Enums']["listing_status"],"subcategory_id"?: number | null,"tags"?: (string)[],"title"?: string,"updated_at"?: string,"views_count"?: number,"visibility"?: Database["public"]['Enums']["listing_visibility"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "listings_author_id_fkey"
      columns: ["author_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "listings_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "listings_municipality_id_fkey"
      columns: ["municipality_id"]
isOneToOne: false
      referencedRelation: "municipalities"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "listings_subcategory_id_fkey"
      columns: ["subcategory_id"]
isOneToOne: false
      referencedRelation: "subcategories"
      referencedColumns: ["id"]
    }
                  ]
                },"municipalities": {
                  Row: {
                    "center": unknown,"created_at": string,"id": number,"ine_code": string | null,"name": string,"province": string,"region": string,"slug": string
                  }
                  ComputedFields: never
                  Insert: {
                    "center": unknown,"created_at"?: string,"id"?: never,"ine_code"?: string | null,"name": string,"province": string,"region": string,"slug": string
                  }
                  Update: {
                    "center"?: unknown,"created_at"?: string,"id"?: never,"ine_code"?: string | null,"name"?: string,"province"?: string,"region"?: string,"slug"?: string
                  }
                  Relationships: [
                    
                  ]
                },"platform_settings": {
                  Row: {
                    "description": string,"is_public": boolean,"key": string,"updated_at": string,"value": NonNullable<Json>
                  }
                  ComputedFields: never
                  Insert: {
                    "description": string,"is_public"?: boolean,"key": string,"updated_at"?: string,"value": NonNullable<Json>
                  }
                  Update: {
                    "description"?: string,"is_public"?: boolean,"key"?: string,"updated_at"?: string,"value"?: NonNullable<Json>
                  }
                  Relationships: [
                    
                  ]
                },"profiles": {
                  Row: {
                    "account_type": Database["public"]['Enums']["account_type"],"avatar_path": string | null,"bio": string | null,"completed_services": number,"created_at": string,"display_name": string,"email_verified": boolean,"id": string,"identity_verified": boolean,"is_pro": boolean,"languages": (string)[],"last_active_at": string | null,"municipality_id": number | null,"phone_verified": boolean,"professional_verified": boolean,"rating_avg": number,"rating_count": number,"response_time_minutes": number | null,"status": Database["public"]['Enums']["account_status"],"updated_at": string,"username": string
                  }
                  ComputedFields: never
                  Insert: {
                    "account_type"?: Database["public"]['Enums']["account_type"],"avatar_path"?: string | null,"bio"?: string | null,"completed_services"?: number,"created_at"?: string,"display_name": string,"email_verified"?: boolean,"id": string,"identity_verified"?: boolean,"is_pro"?: boolean,"languages"?: (string)[],"last_active_at"?: string | null,"municipality_id"?: number | null,"phone_verified"?: boolean,"professional_verified"?: boolean,"rating_avg"?: number,"rating_count"?: number,"response_time_minutes"?: number | null,"status"?: Database["public"]['Enums']["account_status"],"updated_at"?: string,"username": string
                  }
                  Update: {
                    "account_type"?: Database["public"]['Enums']["account_type"],"avatar_path"?: string | null,"bio"?: string | null,"completed_services"?: number,"created_at"?: string,"display_name"?: string,"email_verified"?: boolean,"id"?: string,"identity_verified"?: boolean,"is_pro"?: boolean,"languages"?: (string)[],"last_active_at"?: string | null,"municipality_id"?: number | null,"phone_verified"?: boolean,"professional_verified"?: boolean,"rating_avg"?: number,"rating_count"?: number,"response_time_minutes"?: number | null,"status"?: Database["public"]['Enums']["account_status"],"updated_at"?: string,"username"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "profiles_municipality_id_fkey"
      columns: ["municipality_id"]
isOneToOne: false
      referencedRelation: "municipalities"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles_private": {
                  Row: {
                    "created_at": string,"first_name": string | null,"id": string,"last_name": string | null,"locale": string,"phone": string | null,"postal_code": string | null,"privacy": NonNullable<Json>,"travel_radius_km": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"first_name"?: string | null,"id": string,"last_name"?: string | null,"locale"?: string,"phone"?: string | null,"postal_code"?: string | null,"privacy"?: NonNullable<Json>,"travel_radius_km"?: number,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"first_name"?: string | null,"id"?: string,"last_name"?: string | null,"locale"?: string,"phone"?: string | null,"postal_code"?: string | null,"privacy"?: NonNullable<Json>,"travel_radius_km"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "profiles_private_id_fkey"
      columns: ["id"]
isOneToOne: true
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"subcategories": {
                  Row: {
                    "category_id": number,"created_at": string,"id": number,"is_active": boolean,"name": NonNullable<Json>,"slug": string,"sort_order": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "category_id": number,"created_at"?: string,"id"?: never,"is_active"?: boolean,"name": NonNullable<Json>,"slug": string,"sort_order"?: number,"updated_at"?: string
                  }
                  Update: {
                    "category_id"?: number,"created_at"?: string,"id"?: never,"is_active"?: boolean,"name"?: NonNullable<Json>,"slug"?: string,"sort_order"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "subcategories_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id"]
    }
                  ]
                },"user_blocks": {
                  Row: {
                    "blocked_id": string,"blocker_id": string,"created_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "blocked_id": string,"blocker_id": string,"created_at"?: string
                  }
                  Update: {
                    "blocked_id"?: string,"blocker_id"?: string,"created_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "user_blocks_blocked_id_fkey"
      columns: ["blocked_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "user_blocks_blocker_id_fkey"
      columns: ["blocker_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"user_roles": {
                  Row: {
                    "created_at": string,"granted_by": string | null,"role": Database["public"]['Enums']["staff_role"],"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"granted_by"?: string | null,"role": Database["public"]['Enums']["staff_role"],"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"granted_by"?: string | null,"role"?: Database["public"]['Enums']["staff_role"],"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "user_roles_granted_by_fkey"
      columns: ["granted_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "user_roles_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"user_verifications": {
                  Row: {
                    "created_at": string,"expires_at": string | null,"id": string,"kind": Database["public"]['Enums']["verification_kind"],"method": string,"notes": string | null,"reviewed_by": string | null,"status": Database["public"]['Enums']["verification_status"],"updated_at": string,"user_id": string,"verified_at": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"expires_at"?: string | null,"id"?: string,"kind": Database["public"]['Enums']["verification_kind"],"method": string,"notes"?: string | null,"reviewed_by"?: string | null,"status"?: Database["public"]['Enums']["verification_status"],"updated_at"?: string,"user_id": string,"verified_at"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"expires_at"?: string | null,"id"?: string,"kind"?: Database["public"]['Enums']["verification_kind"],"method"?: string,"notes"?: string | null,"reviewed_by"?: string | null,"status"?: Database["public"]['Enums']["verification_status"],"updated_at"?: string,"user_id"?: string,"verified_at"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "user_verifications_reviewed_by_fkey"
      columns: ["reviewed_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "user_verifications_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "approximate_point":
{ Args: { "lat": number,"lng": number }; Returns: unknown
                           },
"category_listing_counts":
{ Args: Record<PropertyKey, never>; Returns: {
              "category_id": number,"published_count": number
            }[]
                           },
"has_staff_role":
{ Args: { "required": Database["public"]['Enums']["staff_role"] }; Returns: boolean
                           },
"immutable_unaccent":
{ Args: { "": string }; Returns: string
                           },
"listing_transition_allowed":
{ Args: { "as_client": boolean,"from_s": Database["public"]['Enums']["listing_status"],"to_s": Database["public"]['Enums']["listing_status"] }; Returns: boolean
                           },
"platform_stats":
{ Args: Record<PropertyKey, never>; Returns: {
              "completed_count": number,"rating_avg": number,"users_count": number,"verified_count": number
            }[]
                           },
"record_listing_view":
{ Args: { "p_listing_id": string }; Returns: undefined
                           },
"search_listings":
{ Args: { "p_category"?: string,"p_ids"?: (string)[],"p_kind"?: Database["public"]['Enums']["listing_kind"],"p_limit"?: number,"p_min_rating"?: number,"p_modality"?: Database["public"]['Enums']["listing_modality"],"p_municipality"?: string,"p_offset"?: number,"p_price_max"?: number,"p_price_min"?: number,"p_price_type"?: Database["public"]['Enums']["price_type"],"p_query"?: string,"p_radius_km"?: number,"p_recent_days"?: number,"p_sort"?: string,"p_subcategory"?: string,"p_urgent_only"?: boolean,"p_verified_only"?: boolean,"p_with_photo"?: boolean }; Returns: {
              "author_avatar_path": string,"author_display_name": string,"author_identity_verified": boolean,"author_rating_avg": number,"author_rating_count": number,"author_response_time_minutes": number,"author_username": string,"category_color": string,"category_icon": string,"category_name": Json,"category_slug": string,"cover_path": string,"currency": string,"distance_km": number,"id": string,"is_urgent": boolean,"kind": Database["public"]['Enums']["listing_kind"],"modality": Database["public"]['Enums']["listing_modality"],"municipality_name": string,"price_cents": number,"price_type": Database["public"]['Enums']["price_type"],"province": string,"published_at": string,"slug": string,"status": Database["public"]['Enums']["listing_status"],"subcategory_name": Json,"title": string,"total_count": number
            }[]
                           }
          }
          Enums: {
            "account_status": "active"|"suspended"|"pending_deletion"|"deleted","account_type": "individual"|"professional","listing_kind": "request"|"offer","listing_modality": "online"|"in_person"|"hybrid"|"at_home"|"agreed_location","listing_status": "draft"|"pending_review"|"published"|"rejected"|"paused"|"reserved"|"completed"|"expired"|"removed","listing_visibility": "public"|"unlisted","moderation_status": "pending"|"approved"|"flagged"|"rejected","price_type": "fixed"|"hourly"|"daily"|"quote"|"free"|"exchange","staff_role": "moderator"|"admin","verification_kind": "email"|"phone"|"identity"|"professional"|"document","verification_status": "pending"|"verified"|"rejected"|"expired"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            "account_status": ["active", "suspended", "pending_deletion", "deleted"],"account_type": ["individual", "professional"],"listing_kind": ["request", "offer"],"listing_modality": ["online", "in_person", "hybrid", "at_home", "agreed_location"],"listing_status": ["draft", "pending_review", "published", "rejected", "paused", "reserved", "completed", "expired", "removed"],"listing_visibility": ["public", "unlisted"],"moderation_status": ["pending", "approved", "flagged", "rejected"],"price_type": ["fixed", "hourly", "daily", "quote", "free", "exchange"],"staff_role": ["moderator", "admin"],"verification_kind": ["email", "phone", "identity", "professional", "document"],"verification_status": ["pending", "verified", "rejected", "expired"]
          }
        }
} as const
