// Supabase設計書 v1.0 に基づくクライアント初期化
// 環境変数が設定されていない場合はSupabase機能を無効化し、ゲスト(LocalStorageのみ)で動作する。
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured ? createClient(url!, anonKey!) : null
