from datetime import datetime, timedelta

import requests
from fastapi import HTTPException
from starlette import status


class ExchangeRateServices:
    CACHE_TTL = timedelta(minutes=5)
    _cache: dict[str, dict] = {}

    @classmethod
    def _fetch_from_host(cls, base: str, target: str) -> float | None:
        try:
            resp = requests.get(
                "https://api.exchangerate.host/latest",
                params={"base": base.upper(), "symbols": target.upper()},
                timeout=5,
            )
        except requests.RequestException:
            return None
        if resp.status_code != 200:
            return None
        data = resp.json()
        rate = data.get("rates", {}).get(target.upper())
        return float(rate) if rate else None

    @classmethod
    def _fetch_from_erapi(cls, base: str, target: str) -> float | None:
        try:
            resp = requests.get(
                f"https://open.er-api.com/v6/latest/{base.upper()}",
                timeout=5,
            )
        except requests.RequestException:
            return None
        if resp.status_code != 200:
            return None
        data = resp.json()
        rate = data.get("rates", {}).get(target.upper())
        return float(rate) if rate else None

    @classmethod
    def get_rate(cls, base: str = "USD", target: str = "VND") -> dict[str, object]:
        key = f"{base.upper()}:{target.upper()}"
        now = datetime.utcnow()
        cached = cls._cache.get(key)
        if cached and now - cached["updated"] < cls.CACHE_TTL:
            return cached["payload"]

        rate = cls._fetch_from_host(base, target)
        if rate is None:
            rate = cls._fetch_from_erapi(base, target)
        if rate is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Không thể lấy dữ liệu tỷ giá tại thời điểm này",
            )

        payload = {
            "base": base.upper(),
            "target": target.upper(),
            "rate": float(rate),
            "timestamp": now.isoformat(),
        }
        cls._cache[key] = {"payload": payload, "updated": now}
        return payload
