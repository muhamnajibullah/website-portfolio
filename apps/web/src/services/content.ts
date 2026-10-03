import { createPortfolioClient, PortfolioRepository } from '@portfolio/supabase';
import { contentSchema } from '@portfolio/validation';
import snapshot from '../../public/content.json';
export const initialContent = contentSchema.parse(snapshot);
let configurationError = false;
export const repository = (() => {
  try {
    const client = createPortfolioClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    );
    return client ? new PortfolioRepository(client) : null;
  } catch {
    configurationError = true;
    return null;
  }
})();
export async function loadContent() {
  if (configurationError) throw new Error('Content configuration is unavailable.');
  if (repository) return repository.load();
  const response = await fetch('/content.json');
  if (!response.ok) throw new Error('Published snapshot is unavailable.');
  return contentSchema.parse(await response.json());
}
