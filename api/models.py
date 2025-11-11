from django.db import models
from django.conf import settings


class Ad(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="ads",
        on_delete=models.CASCADE,
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.title


class Favorite(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="favorites",
        on_delete=models.CASCADE,
    )
    ad = models.ForeignKey(
        "Ad",
        related_name="favorites",
        on_delete=models.CASCADE,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "ad")
