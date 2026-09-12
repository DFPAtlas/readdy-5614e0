'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface HelpCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
}

export interface HelpArticle {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  category_slug: string | null;
  audience: string;
  roles: string[] | null;
  content: string;
  status: string;
  is_featured: boolean;
  published_at: string | null;
  view_count: number;
  helpful_count: number;
  not_helpful_count: number;
}

function visibleTo(article: HelpArticle, role: string | null, authed: boolean): boolean {
  if (article.status !== 'published') return false;
  if (article.audience === 'public') return true;
  if (!authed) return false;
  if (article.audience === 'authenticated' || article.audience === 'tenant') return true;
  if (article.audience === 'role') {
    if (!role) return false;
    return Array.isArray(article.roles) && article.roles.includes(role);
  }
  return false;
}

export function useHelpCentre() {
  const { profile } = useAuth();
  const role = profile?.role ?? null;
  const authed = Boolean(profile?.id);
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [catRes, artRes] = await Promise.all([
      supabase.from('help_categories').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
      supabase.from('help_articles').select('id,slug,title,summary,category_slug,audience,roles,content,status,is_featured,published_at,view_count,helpful_count,not_helpful_count').eq('status', 'published').order('published_at', { ascending: false }),
    ]);
    if (catRes.data) setCategories(catRes.data);
    if (artRes.data) setArticles((artRes.data as HelpArticle[]).filter((a) => visibleTo(a, role, authed)));
    setLoading(false);
  }, [role, authed]);

  useEffect(() => { load(); }, [load]);

  return { categories, articles, loading, refresh: load, role, authed };
}

export function useHelpArticle(slug: string | null) {
  const { profile } = useAuth();
  const role = profile?.role ?? null;
  const authed = Boolean(profile?.id);
  const [article, setArticle] = useState<HelpArticle | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!slug) { setLoading(false); return; }
    setLoading(true);
    const { data } = await supabase.from('help_articles').select('*').eq('slug', slug).maybeSingle();
    if (data && visibleTo(data as HelpArticle, role, authed)) {
      setArticle(data as HelpArticle);
      supabase.from('help_articles').update({ view_count: (data.view_count || 0) + 1 }).eq('id', data.id).then(() => {});
    } else {
      setArticle(null);
    }
    setLoading(false);
  }, [slug, role, authed]);

  useEffect(() => { load(); }, [load]);

  const submitFeedback = useCallback(async (helpful: boolean, comment?: string) => {
    if (!article) return;
    await supabase.from('help_article_feedback').insert({ article_id: article.id, user_id: profile?.id || null, helpful, comment: comment || null });
    await supabase.from('help_articles').update(helpful ? { helpful_count: (article.helpful_count || 0) + 1 } : { not_helpful_count: (article.not_helpful_count || 0) + 1 }).eq('id', article.id);
    await load();
  }, [article, profile?.id, load]);

  return { article, loading, submitFeedback };
}

export function useHelpAdmin() {
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [catRes, artRes] = await Promise.all([
      supabase.from('help_categories').select('*').order('sort_order', { ascending: true }),
      supabase.from('help_articles').select('*').order('updated_at', { ascending: false }),
    ]);
    if (catRes.data) setCategories(catRes.data);
    if (artRes.data) setArticles(artRes.data as HelpArticle[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return { articles, categories, loading, refresh: load };
}