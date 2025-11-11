from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AdViewSet, HelloView, MeView, RegisterView

router = DefaultRouter()
router.register(r"ads", AdViewSet, basename="ad")

urlpatterns = [
    path("hello/", HelloView.as_view(), name="hello"),
    path("register/", RegisterView.as_view(), name="register"),
    path("me/", MeView.as_view(), name="me"),
    path("", include(router.urls)),
]
