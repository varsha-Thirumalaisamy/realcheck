from celery import Celery
from .config import settings

celery_app = Celery(
    "worker",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_always_eager=settings.CELERY_TASK_ALWAYS_EAGER
)

celery_app.conf.task_routes = {
    "app.core.batch_worker.process_batch_task": "main-queue"
}

celery_app.autodiscover_tasks(["app.core"])
