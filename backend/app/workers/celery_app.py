try:
    from celery import Celery
    from app.core.config import get_settings

    settings = get_settings()

    celery_app = Celery(
        "govassist",
        broker=settings.CELERY_BROKER_URL,
        backend=settings.CELERY_RESULT_BACKEND,
        include=["app.workers.ocr_task"],
    )

    celery_app.conf.update(
        task_serializer="json",
        result_serializer="json",
        accept_content=["json"],
        timezone="UTC",
        enable_utc=True,
        task_track_started=True,
        task_acks_late=True,
        worker_prefetch_multiplier=1,
    )
except Exception:
    # Fallback for Serverless environments (Vercel) where Celery is not installed
    class DummyTaskWrapper:
        def __init__(self, fn):
            self.fn = fn
        def delay(self, *args, **kwargs):
            class DummyTaskResult:
                id = "serverless-sync"
            return DummyTaskResult()
        def __call__(self, *args, **kwargs):
            return self.fn(*args, **kwargs)

    class DummyCeleryApp:
        def task(self, *args, **kwargs):
            def decorator(fn):
                return DummyTaskWrapper(fn)
            return decorator

    celery_app = DummyCeleryApp()