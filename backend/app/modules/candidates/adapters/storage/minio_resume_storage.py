import asyncio
from functools import partial

import boto3  # type: ignore[import-untyped]

from app.config import get_settings


class MinioResumeStorage:
    def __init__(self) -> None:
        settings = get_settings()
        self.bucket = settings.minio_resume_bucket
        self.client = boto3.client(
            "s3",
            endpoint_url=f"{'https' if settings.minio_secure else 'http'}://{settings.minio_endpoint}",
            aws_access_key_id=settings.minio_access_key,
            aws_secret_access_key=settings.minio_secret_key,
        )

    async def _ensure_bucket(self) -> None:
        if not await asyncio.to_thread(self._bucket_exists):
            await asyncio.to_thread(self.client.create_bucket, Bucket=self.bucket)

    def _bucket_exists(self) -> bool:
        try:
            self.client.head_bucket(Bucket=self.bucket)
            return True
        except Exception:
            return False

    async def upload(self, key: str, content: bytes) -> None:
        await self._ensure_bucket()
        await asyncio.to_thread(
            self.client.put_object,
            Bucket=self.bucket,
            Key=key,
            Body=content,
            ContentType="application/pdf",
        )

    async def delete(self, key: str) -> None:
        await asyncio.to_thread(self.client.delete_object, Bucket=self.bucket, Key=key)

    async def signed_url(self, key: str, expires: int) -> str:
        return await asyncio.to_thread(
            partial(
                self.client.generate_presigned_url,
                "get_object",
                Params={"Bucket": self.bucket, "Key": key},
                ExpiresIn=expires,
            )
        )
