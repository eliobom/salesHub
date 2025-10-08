import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Tables = Database['public']['Tables'];
type Insert<T extends keyof Tables> = Tables[T]['Insert'];
type Update<T extends keyof Tables> = Tables[T]['Update'];

export class ApiService {
  // Generic CRUD operations
  static async getAll<T extends keyof Tables>(
    table: T,
    options?: {
      select?: string;
      filter?: Record<string, any>;
      orderBy?: { column: string; ascending?: boolean };
      limit?: number;
    }
  ): Promise<Tables[T]['Row'][]> {
    let query = supabase.from(table).select(options?.select || '*');

    if (options?.filter) {
      Object.entries(options.filter).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    if (options?.orderBy) {
      query = query.order(options.orderBy.column, {
        ascending: options.orderBy.ascending ?? true,
      });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data as unknown) as Tables[T]['Row'][];
  }

  static async getById<T extends keyof Tables>(
    table: T,
    id: string,
    select?: string
  ): Promise<Tables[T]['Row'] | null> {
    const { data, error } = await supabase
      .from(table)
      .select(select || '*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return (data as unknown) as Tables[T]['Row'];
  }

  static async create<T extends keyof Tables>(
    table: T,
    data: Insert<T>
  ): Promise<Tables[T]['Row']> {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result as Tables[T]['Row'];
  }

  static async update<T extends keyof Tables>(
    table: T,
    id: string,
    data: Update<T>
  ): Promise<Tables[T]['Row']> {
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result as Tables[T]['Row'];
  }

  static async delete<T extends keyof Tables>(
    table: T,
    id: string
  ): Promise<void> {
    const { error } = await supabase.from(table).delete().eq('id', id);

    if (error) throw error;
  }

  // Batch operations
  static async createMany<T extends keyof Tables>(
    table: T,
    data: Insert<T>[]
  ): Promise<Tables[T]['Row'][]> {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select();

    if (error) throw error;
    return result as Tables[T]['Row'][];
  }

  static async updateMany<T extends keyof Tables>(
    table: T,
    updates: Array<{ id: string; data: Update<T> }>
  ): Promise<Tables[T]['Row'][]> {
    const results: Tables[T]['Row'][] = [];

    for (const update of updates) {
      const result = await this.update(table, update.id, update.data);
      results.push(result);
    }

    return results;
  }

  // Real-time subscriptions
  static subscribeToTable<T extends keyof Tables>(
    table: T,
    callback: (payload: any) => void,
    filter?: string
  ) {
    let channel = supabase.channel(`${table}_changes`);

    if (filter) {
      channel = channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table, filter },
        callback
      );
    } else {
      channel = channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        callback
      );
    }

    channel.subscribe();
    return channel;
  }
}