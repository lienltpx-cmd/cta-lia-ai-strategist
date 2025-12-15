import { AiFullStrategyResponse, Settings } from '../types';

export const generateStrategy = async (
  settings: Settings,
  blogContent: string
): Promise<AiFullStrategyResponse> => {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ settings, blogContent }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to generate strategy:", error);
    throw error;
  }
};
