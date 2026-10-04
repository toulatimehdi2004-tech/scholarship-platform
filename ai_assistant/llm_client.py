"""
LLM Client - switchable AI provider (OpenAI-compatible API).

Providers (chosen via AI_PROVIDER, default "auto"):
  - gemini     → Google Gemini via its OpenAI-compatible endpoint
                 (needs GEMINI_API_KEY; model via GEMINI_MODEL, default gemini-2.0-flash)
  - bazaarlink → BazaarLink AI (needs BAZAARLINK_API_KEY)
  - auto       → gemini when GEMINI_API_KEY is set, else bazaarlink
"""

import os
import logging
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI

# Load .env from project root
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')

logger = logging.getLogger(__name__)

# Configuration
AI_PROVIDER = os.getenv('AI_PROVIDER', 'auto').strip().lower()
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-2.0-flash')
GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/'

BAZAARLINK_API_KEY = os.getenv('BAZAARLINK_API_KEY', '')
BAZAARLINK_BASE_URL = os.getenv('BAZAARLINK_BASE_URL', 'https://api.bazaarlink.ai/v1')
BAZAARLINK_MODEL = os.getenv('BAZAARLINK_MODEL', 'qwen/qwen3.7-flash:free')

# Pick provider
PROVIDER = AI_PROVIDER
if PROVIDER == 'auto':
    PROVIDER = 'gemini' if GEMINI_API_KEY else 'bazaarlink'

if PROVIDER == 'gemini':
    API_KEY = GEMINI_API_KEY
    BASE_URL = GEMINI_BASE_URL
    MODEL = GEMINI_MODEL
else:
    PROVIDER = 'bazaarlink'
    API_KEY = BAZAARLINK_API_KEY
    BASE_URL = BAZAARLINK_BASE_URL
    MODEL = BAZAARLINK_MODEL

# Initialize client
client = None
if API_KEY:
    client = OpenAI(
        api_key=API_KEY,
        base_url=BASE_URL,
    )

logger.info(f"LLM provider: {PROVIDER} (model: {MODEL})")


def current_provider():
    """Return (provider_name, model) currently in use."""
    return PROVIDER, MODEL


def is_available():
    """Check if the LLM client is configured and ready."""
    return client is not None


def chat_completion(messages, model=None, temperature=0.7, max_tokens=2048):
    """
    Send a chat completion request to the LLM.
    Handles reasoning models that put answers in 'reasoning' field.

    Args:
        messages: List of dicts with 'role' and 'content'
        model: Model ID override (defaults to configured model)
        temperature: Creativity (0.0-1.0)
        max_tokens: Max response length

    Returns:
        str: The assistant's response text, or None on error
    """
    if not is_available():
        logger.warning("LLM client not configured - no API key set")
        return None

    try:
        response = client.chat.completions.create(
            model=model or MODEL,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            timeout=30,
        )
        choice = response.choices[0]
        content = choice.message.content

        # Reasoning models may put the answer in 'reasoning' when content is empty
        if not content and getattr(choice.message, 'reasoning', None):
            content = choice.message.reasoning

        return content if content else None

    except Exception as e:
        logger.error(f"LLM API error ({PROVIDER}): {e}")
        return None


def chat_completion_stream(messages, model=None, temperature=0.7, max_tokens=1024):
    """
    Streaming version of chat_completion.
    Yields response chunks as they arrive.
    """
    if not is_available():
        logger.warning("LLM client not configured - no API key set")
        return

    try:
        stream = client.chat.completions.create(
            model=model or MODEL,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            stream=True,
        )
        for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    except Exception as e:
        logger.error(f"LLM API stream error ({PROVIDER}): {e}")
        return
