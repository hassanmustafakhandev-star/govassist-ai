"""
api/index.py — Vercel Serverless Entry Point
=============================================
Vercel Python runtime looks for `app` (ASGI) in this file.
sys.path is patched so that `from app.xxx import ...` resolves
to backend/app/ regardless of how Vercel sets up the working directory.
"""

import sys
import os

# Ensure backend root is in sys.path so `import app.xxx` works.
# __file__ = backend/api/index.py → parent = backend/api/ → parent.parent = backend/
_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _root not in sys.path:
    sys.path.insert(0, _root)

from app.main import app  # noqa: F401 — Vercel reads this `app` object
