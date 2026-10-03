import type { z } from 'zod';
import type { contentSchema, tableSchemas } from '@portfolio/validation';
export type Content = z.infer<typeof contentSchema>;
export type TableName = keyof typeof tableSchemas;
export type ContentRecord = Content[TableName][number];
export type Project = Content['projects'][number];
export type Experience = Content['work_experiences'][number];
export type InteractivePoint = Content['interactive_points'][number];
export type PublicationStatus = ContentRecord['status'];
export type Database = {
  public: {
    Tables: {
      [K in TableName]: {
        Row: Content[K][number];
        Insert: Content[K][number];
        Update: Partial<Content[K][number]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: { is_admin: { Args: Record<string, never>; Returns: boolean } };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
