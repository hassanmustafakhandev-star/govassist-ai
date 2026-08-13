"""
api/index.py — Vercel Python Serverless Entry Point
====================================================
Vercel looks for `app` (ASGI/WSGI) in this exact file.
"""

from app.main import app  # noqa: F401 — Vercel reads `app` from this module
