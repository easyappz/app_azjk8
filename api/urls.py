from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token

from .views import AdViewSet, MeView, RegisterView

router = DefaultRouter()
router.register(r"ads", AdViewSet, basename="ad")

urlpatterns = [
    path("", include(router.urls)),
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/login/", obtain_auth_token, name="login"),
    path("auth/me/", MeView.as_view(), name="me"),
]
