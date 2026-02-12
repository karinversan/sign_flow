"""add model artifact metadata fields

Revision ID: 0003_model_artifact_metadata
Revises: 0002_model_versions
Create Date: 2026-02-12
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0003_model_artifact_metadata"
down_revision: Union[str, None] = "0002_model_versions"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("model_versions", sa.Column("artifact_path", sa.String(length=512), nullable=True))
    op.add_column("model_versions", sa.Column("downloaded_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("model_versions", sa.Column("last_sync_error", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("model_versions", "last_sync_error")
    op.drop_column("model_versions", "downloaded_at")
    op.drop_column("model_versions", "artifact_path")
