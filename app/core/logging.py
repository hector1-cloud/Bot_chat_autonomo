"""Logging configuration for the HECTRON API.

A minimal, idempotent logging setup that works both locally and on serverless
platforms (Vercel), where logs are captured from stdout/stderr.
"""

import logging

_CONFIGURED = False


def configure_logging(level: int = logging.INFO) -> None:
    """Configure root logging once.

    Safe to call multiple times (e.g. on every serverless cold start); the
    underlying handlers are only attached on the first invocation.
    """
    global _CONFIGURED
    if _CONFIGURED:
        return

    logging.basicConfig(
        level=level,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    )
    _CONFIGURED = True
