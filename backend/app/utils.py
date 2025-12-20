import re
from typing import Optional


def validate_phone_number(phone_number: Optional[str]) -> bool:
    """Validate phone numbers in a simple numeric format (optionally prefixed with +)."""
    if not phone_number:
        return False
    pattern = r'^\+?\d{10,15}$'
    return bool(re.fullmatch(pattern, phone_number))
