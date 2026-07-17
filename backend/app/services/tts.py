import logging
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

# ElevenLabs Configuration
ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1"
# Default voice: "Rachel" (professional female interviewer)
# Other options: "Josh" (male), "Bella" (young female), "Antoni" (young male)
DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"  # Rachel


# In-memory cache for synthesized audio bytes (saves ElevenLabs characters limit)
_tts_cache = {}


async def synthesize_speech(text: str, voice_id: str = None) -> bytes | None:
    """Converts text to speech audio using ElevenLabs API.
    
    Args:
        text: The text to convert to speech
        voice_id: Optional ElevenLabs voice ID (defaults to Rachel)
    
    Returns:
        MP3 audio bytes, or None if TTS is unavailable
    """
    cache_key = (text, voice_id)
    if cache_key in _tts_cache:
        logger.info("Serving synthesized speech from cache.")
        return _tts_cache[cache_key]

    if not settings.ELEVENLABS_API_KEY:
        logger.warning("ElevenLabs API key not configured. Skipping TTS.")
        return None

    voice = voice_id or settings.ELEVENLABS_VOICE_ID or DEFAULT_VOICE_ID
    url = f"{ELEVENLABS_API_URL}/text-to-speech/{voice}"
    
    headers = {
        "xi-api-key": settings.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
    }
    
    payload = {
        "text": text,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {
            "stability": 0.6,
            "similarity_boost": 0.75,
            "style": 0.0,
            "use_speaker_boost": True
        }
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=payload, timeout=30.0)
            
            if response.status_code == 200:
                logger.info(f"TTS synthesis successful ({len(response.content)} bytes)")
                _tts_cache[cache_key] = response.content
                return response.content
            elif response.status_code == 401:
                logger.error("ElevenLabs API key is invalid.")
                return None
            elif response.status_code == 429:
                logger.warning("ElevenLabs rate limit / quota exceeded.")
                return None
            else:
                logger.error(f"ElevenLabs API error: {response.status_code} - {response.text}")
                return None
    except Exception as e:
        logger.error(f"TTS synthesis failed: {e}")
        return None


async def list_available_voices() -> list:
    """Lists available ElevenLabs voices (useful for debugging/selection)."""
    if not settings.ELEVENLABS_API_KEY:
        return []
    
    url = f"{ELEVENLABS_API_URL}/voices"
    headers = {"xi-api-key": settings.ELEVENLABS_API_KEY}
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, timeout=15.0)
            if response.status_code == 200:
                data = response.json()
                voices = [{"voice_id": v["voice_id"], "name": v["name"]} for v in data.get("voices", [])]
                return voices
            return []
    except Exception:
        return []
