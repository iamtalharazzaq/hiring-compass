import logging

from app.shared.http.request_id import request_id_context

_configured = False


def configure_logging(level: str) -> None:
    global _configured
    if _configured:
        return

    previous_factory = logging.getLogRecordFactory()

    def record_factory(*args: object, **kwargs: object) -> logging.LogRecord:
        record = previous_factory(*args, **kwargs)
        record.request_id = request_id_context.get() or "-"
        return record

    logging.setLogRecordFactory(record_factory)
    logging.basicConfig(
        level=level.upper(),
        format=(
            "%(asctime)s level=%(levelname)s logger=%(name)s request_id=%(request_id)s %(message)s"
        ),
    )
    _configured = True
