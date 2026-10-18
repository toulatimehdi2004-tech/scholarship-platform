"""
LLM Client - Multi-Provider Resilient AI Engine (OpenAI-compatible API).

Supports automatic detection and resilient failover across:
  - Google Gemini (via OpenAI-compatible endpoint with GEMINI_API_KEY)
  - Groq (ultra-fast Llama-3.3-70B with GROQ_API_KEY)
  - OpenAI (GPT-4o / GPT-4o-mini with OPENAI_API_KEY)
  - OpenRouter (with OPENROUTER_API_KEY)
  - BazaarLink AI (with BAZAARLINK_API_KEY, utilizing DeepSeek V4 Flash / Auto Free)

Includes automatic waterfall failover: if a provider or model rate-limits
or errors, it seamlessly attempts the next candidate model so the user
never experiences a failed response.
"""

import os
import re
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple, Generator

from dotenv import load_dotenv
from openai import OpenAI

# Load .env from project root
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')

logger = logging.getLogger(__name__)

# Environment variables
AI_PROVIDER = os.getenv('AI_PROVIDER', 'auto').strip().lower()

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '').strip()
GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-2.0-flash').strip()
GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/'

GROQ_API_KEY = os.getenv('GROQ_API_KEY', '').strip()
GROQ_MODEL = os.getenv('GROQ_MODEL', 'llama-3.3-70b-versatile').strip()
GROQ_BASE_URL = 'https://api.groq.com/openai/v1'

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '').strip()
OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-4o-mini').strip()
OPENAI_BASE_URL = os.getenv('OPENAI_BASE_URL', 'https://api.openai.com/v1')

OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY', '').strip()
OPENROUTER_MODEL = os.getenv('OPENROUTER_MODEL', 'meta-llama/llama-3.3-70b-instruct:free').strip()
OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1'

BAZAARLINK_API_KEY = os.getenv('BAZAARLINK_API_KEY', '').strip()
BAZAARLINK_BASE_URL = os.getenv('BAZAARLINK_BASE_URL', 'https://api.bazaarlink.ai/v1').strip()
BAZAARLINK_MODEL = os.getenv('BAZAARLINK_MODEL', 'deepseek-v4-flash-0731free').strip()


def _build_client_pipeline() -> List[Tuple[str, OpenAI, str]]:
    """
    Build prioritized list of (provider_name, client, model_id) candidates
    based on configured API keys and preferences.
    """
    candidates = []

    # 1. Google Gemini (if key provided)
    if GEMINI_API_KEY:
        try:
            gem_client = OpenAI(api_key=GEMINI_API_KEY, base_url=GEMINI_BASE_URL)
            candidates.append(('gemini', gem_client, GEMINI_MODEL))
            candidates.append(('gemini-fallback', gem_client, 'gemini-1.5-flash'))
        except Exception as e:
            logger.warning(f"Failed to initialize Gemini client: {e}")

    # 2. Groq (if key provided)
    if GROQ_API_KEY:
        try:
            groq_client = OpenAI(api_key=GROQ_API_KEY, base_url=GROQ_BASE_URL)
            candidates.append(('groq', groq_client, GROQ_MODEL))
        except Exception as e:
            logger.warning(f"Failed to initialize Groq client: {e}")

    # 3. OpenAI (if key provided)
    if OPENAI_API_KEY:
        try:
            oa_client = OpenAI(api_key=OPENAI_API_KEY, base_url=OPENAI_BASE_URL)
            candidates.append(('openai', oa_client, OPENAI_MODEL))
        except Exception as e:
            logger.warning(f"Failed to initialize OpenAI client: {e}")

    # 4. OpenRouter (if key provided)
    if OPENROUTER_API_KEY:
        try:
            or_client = OpenAI(api_key=OPENROUTER_API_KEY, base_url=OPENROUTER_BASE_URL)
            candidates.append(('openrouter', or_client, OPENROUTER_MODEL))
        except Exception as e:
            logger.warning(f"Failed to initialize OpenRouter client: {e}")

    # 5. BazaarLink AI (reliable free tier with DeepSeek V4 & Qwen)
    if BAZAARLINK_API_KEY:
        try:
            bl_client = OpenAI(api_key=BAZAARLINK_API_KEY, base_url=BAZAARLINK_BASE_URL)
            # Add primary configured model
            primary_bl = BAZAARLINK_MODEL or 'deepseek-v4-flash-0731free'
            candidates.append(('bazaarlink', bl_client, primary_bl))

            # Add resilient fallback models on BazaarLink
            fallbacks = ['deepseek-v4-flash-0731free', 'auto:free', 'qwen/qwen3.7-flash:free']
            for fb in fallbacks:
                if fb != primary_bl:
                    candidates.append((f'bazaarlink-{fb}', bl_client, fb))
        except Exception as e:
            logger.warning(f"Failed to initialize BazaarLink client: {e}")

    return candidates


def is_available() -> bool:
    """Check if at least one LLM provider is configured and ready."""
    return bool(GEMINI_API_KEY or GROQ_API_KEY or OPENAI_API_KEY or OPENROUTER_API_KEY or BAZAARLINK_API_KEY)


def current_provider() -> Tuple[str, str]:
    """Return primary (provider_name, model_id) currently active."""
    pipeline = _build_client_pipeline()
    if pipeline:
        return pipeline[0][0], pipeline[0][2]
    return 'none', 'none'


def _clean_response(content: Optional[str]) -> Optional[str]:
    """Strip reasoning/thought tokens or markdown artifacts if present."""
    if not content:
        return None
    # Remove <think>...</think> blocks from reasoning models
    cleaned = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL).strip()
    return cleaned if cleaned else content.strip()


def chat_completion(
    messages: List[Dict[str, str]],
    model: Optional[str] = None,
    temperature: float = 0.7,
    max_tokens: int = 3500,
    timeout: int = 35
) -> Optional[str]:
    """
    Send chat completion request to the LLM with automatic multi-model failover.

    Args:
        messages: List of dicts with 'role' and 'content'
        model: Model ID override (if specified, attempts with primary client)
        temperature: Creativity (0.0 - 1.0)
        max_tokens: Maximum tokens in response
        timeout: Per-request timeout in seconds

    Returns:
        Clean response string, or None if all providers in the waterfall failed.
    """
    pipeline = _build_client_pipeline()
    if not pipeline:
        logger.warning("No LLM provider configured with valid API keys.")
        return None

    for provider_name, client_inst, default_model in pipeline:
        use_model = model or default_model
        try:
            logger.info(f"Attempting completion with {provider_name} ({use_model})...")
            response = client_inst.chat.completions.create(
                model=use_model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                timeout=timeout,
            )
            choice = response.choices[0]
            content = choice.message.content

            # Handle models where response is stored in reasoning
            if not content and getattr(choice.message, 'reasoning', None):
                content = choice.message.reasoning

            cleaned = _clean_response(content)
            if cleaned:
                return cleaned

        except Exception as e:
            logger.warning(f"Provider {provider_name} ({use_model}) failed: {e}. Trying next fallback...")
            continue

    logger.error("All LLM providers in pipeline failed to respond.")
    return None


def chat_completion_stream(
    messages: List[Dict[str, str]],
    model: Optional[str] = None,
    temperature: float = 0.7,
    max_tokens: int = 3500
) -> Generator[str, None, None]:
    """
    Streaming version of chat_completion with waterfall failover.
    Yields chunks as they arrive.
    """
    pipeline = _build_client_pipeline()
    if not pipeline:
        logger.warning("No LLM provider configured with valid API keys.")
        return

    for provider_name, client_inst, default_model in pipeline:
        use_model = model or default_model
        try:
            logger.info(f"Attempting stream with {provider_name} ({use_model})...")
            stream = client_inst.chat.completions.create(
                model=use_model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True,
                timeout=30,
            )

            in_think_block = False
            yielded_any = False

            for chunk in stream:
                if not chunk.choices:
                    continue
                delta = chunk.choices[0].delta
                token = getattr(delta, 'content', None) or ''

                if not token and getattr(delta, 'reasoning', None):
                    # Skip internal thought tokens from streaming to user
                    continue

                if '<think>' in token:
                    in_think_block = True
                    token = token.replace('<think>', '')

                if '</think>' in token:
                    in_think_block = False
                    parts = token.split('</think>', 1)
                    token = parts[1] if len(parts) > 1 else ''

                if not in_think_block and token:
                    yielded_any = True
                    yield token

            if yielded_any:
                return  # Stream completed successfully

        except Exception as e:
            logger.warning(f"Stream on {provider_name} ({use_model}) failed: {e}. Trying fallback...")
            continue
