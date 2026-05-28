import { chatWithAssistant } from "../services/openrouterService.js";

export async function postChatAssistant(req, res, next) {
  const { message, context } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({
      error: "A non-empty message string is required.",
    });
  }

  try {
    const assistantResponse = await chatWithAssistant({
      message: message.trim(),
      context,
    });

    return res.json(assistantResponse);
  } catch (error) {
    return next(error);
  }
}
