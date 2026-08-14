import uuid

import httpx
from fastapi import Request
from fastapi.responses import Response

from app.core.config import get_settings
from app.core.errors import ServiceUnavailableError

# Headers that must never be blindly copied between hops (connection-scoped, or would
# desync the response body/encoding if forwarded verbatim).
HOP_BY_HOP_HEADERS = {
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "transfer-encoding",
    "upgrade",
    "host",
    "content-length",
    "content-encoding",
}


async def forward(request: Request, target_base_url: str, service_name: str) -> Response:
    """The gateway's entire integration surface: forwards one request to one backing
    service and returns its response verbatim. No business logic and no JSON files here —
    that's what keeps the two backend phases' contracts identical (see docs/architecture.md).
    """
    settings = get_settings()
    url = f"{target_base_url}{request.url.path}"
    request_id = request.headers.get("x-request-id", str(uuid.uuid4()))

    forward_headers = {k: v for k, v in request.headers.items() if k.lower() not in HOP_BY_HOP_HEADERS}
    forward_headers["x-request-id"] = request_id
    body = await request.body()

    try:
        async with httpx.AsyncClient(timeout=settings.request_timeout_seconds) as client:
            upstream = await client.request(
                request.method,
                url,
                params=request.query_params,
                content=body,
                headers=forward_headers,
            )
    except httpx.RequestError as exc:
        raise ServiceUnavailableError(service_name) from exc

    response_headers = {k: v for k, v in upstream.headers.items() if k.lower() not in HOP_BY_HOP_HEADERS}
    response_headers["x-request-id"] = request_id

    return Response(
        content=upstream.content,
        status_code=upstream.status_code,
        headers=response_headers,
        media_type=upstream.headers.get("content-type"),
    )
