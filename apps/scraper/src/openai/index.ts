import OpenAI from "openai";
import z from "zod/v4";

/**
 * Get the OpenAI API key from the environment variables.
 * @returns The OpenAI API key.
 */
const getOpenAiApiKey = () => {
  const openaiApiKeySchema = z.string();
  const result = openaiApiKeySchema.safeParse(process.env.OPENAI_API_KEY);

  if (!result.success) {
    throw new Error("Invalid OPENAI_API_KEY in environment variables");
  }

  return result.data;
};

/**
 * The OpenAI client.
 */
const openai = new OpenAI({
  apiKey: getOpenAiApiKey(),
});

export { openai };
