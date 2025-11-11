from django.contrib import admin

from .models import Ad, Favorite


@admin.register(Ad)
class AdAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "owner", "price", "is_approved", "created_at")
    list_filter = ("is_approved",)
    search_fields = ("title", "description", "owner__username")


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "ad", "created_at")
    search_fields = ("user__username", "ad__title")
