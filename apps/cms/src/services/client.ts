import { createPortfolioClient, PortfolioRepository } from '@portfolio/supabase';
export const repository = (() => {
  try {
    const client = createPortfolioClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      true,
    );
    return client ? new PortfolioRepository(client) : null;
  } catch {
    return null;
  }
})();
