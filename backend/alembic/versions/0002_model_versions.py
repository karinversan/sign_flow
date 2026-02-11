"""add model versions registry

Revision ID: 0002_model_versions
Revises: 0001_initial
Create Date: 2026-02-11
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0002_model_versions"
down_revision: Union[str, None] = "0001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    model_version_status = sa.Enum("staging", "active", "rollback", name="modelversionstatus")
    model_version_status.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "model_versions",
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=128), nullable=False),
        sa.Column("hf_repo", sa.String(length=255), nullable=False),
        sa.Column("hf_revision", sa.String(length=128), nullable=False),
        sa.Column("framework", sa.String(length=64), nullable=False),
        sa.Column("status", model_version_status, nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_model_versions_name", "model_versions", ["name"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_model_versions_name", table_name="model_versions")
    op.drop_table("model_versions")
    sa.Enum(name="modelversionstatus").drop(op.get_bind(), checkfirst=True)
