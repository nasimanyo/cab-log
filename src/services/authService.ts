// API設計書 v1.0: login / logout / getCurrentUser に対応
import type { AppUser } from '@/types'
import { AppError } from '@/types'
import { supabase, isSupabaseConfigured } from './supabase'
import { useAppStore } from '@/store/useAppStore'

export const authService = {
  isAvailable(): boolean {
    return isSupabaseConfigured
  },

  /** 4. login: Googleログインを実行する */
  async login(): Promise<void> {
    if (!supabase) {
      throw new AppError('AUTH001', 'Supabase未設定のため、Googleログインは利用できません。')
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
    if (error) {
      throw new AppError('AUTH001', error.message)
    }
  },

  /** 5. logout: ログアウトする */
  async logout(): Promise<void> {
    if (supabase) {
      await supabase.auth.signOut()
    }
    useAppStore.getState().setUser(null)
  },

  /** 6. getCurrentUser: 現在ログイン中のユーザーを取得する */
  async getCurrentUser(): Promise<AppUser | null> {
    if (!supabase) return null
    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) return null
    const u = data.user
    const appUser: AppUser = {
      id: u.id,
      displayName: (u.user_metadata?.full_name as string) ?? (u.user_metadata?.name as string) ?? null,
      email: u.email ?? null,
      avatarUrl: (u.user_metadata?.avatar_url as string) ?? null
    }
    useAppStore.getState().setUser(appUser)
    return appUser
  },

  /** セッション変化を監視する */
  onAuthStateChange(callback: (user: AppUser | null) => void): () => void {
    if (!supabase) return () => {}
    const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const u = session.user
        callback({
          id: u.id,
          displayName: (u.user_metadata?.full_name as string) ?? null,
          email: u.email ?? null,
          avatarUrl: (u.user_metadata?.avatar_url as string) ?? null
        })
      } else {
        callback(null)
      }
    })
    return () => data.subscription.unsubscribe()
  }
}
