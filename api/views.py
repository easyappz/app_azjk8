from django.db.models import Q
from django.http import Http404
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from rest_framework.permissions import (
    AllowAny,
    IsAdminUser,
    IsAuthenticated,
    IsAuthenticatedOrReadOnly,
    BasePermission,
    SAFE_METHODS,
)
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Ad, Favorite
from .serializers import (
    AdSerializer,
    MessageSerializer,
    RegisterSerializer,
    UserPublicSerializer,
)


class HelloView(APIView):
    """
    A simple API endpoint that returns a greeting message.
    """

    @extend_schema(
        responses={200: MessageSerializer}, description="Get a hello world message"
    )
    def get(self, request):
        data = {"message": "Hello!", "timestamp": timezone.now()}
        serializer = MessageSerializer(data)
        return Response(serializer.data)


class IsOwnerOrReadOnly(BasePermission):
    """
    Custom permission to only allow owners of an object or staff to edit it.
    Read-only requests are always allowed.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return (obj.owner_id == getattr(request.user, "id", None)) or getattr(request.user, "is_staff", False)


class AdViewSet(viewsets.ModelViewSet):
    queryset = Ad.objects.all().select_related("owner")
    serializer_class = AdSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user, is_approved=False)

    def get_queryset(self):
        base = Ad.objects.all().select_related("owner")
        request = self.request

        # For list action, hide unapproved ads from non-staff
        if getattr(self, "action", None) == "list":
            if not getattr(request.user, "is_staff", False):
                base = base.filter(is_approved=True)

        # Search filter
        q = request.query_params.get("q") or request.query_params.get("search")
        if q:
            base = base.filter(Q(title__icontains=q) | Q(description__icontains=q))

        # Price filters
        min_p = request.query_params.get("min_price")
        max_p = request.query_params.get("max_price")
        if min_p is not None and min_p != "":
            base = base.filter(price__gte=min_p)
        if max_p is not None and max_p != "":
            base = base.filter(price__lte=max_p)

        # Ordering
        ordering = request.query_params.get("ordering")
        allow = ["price", "-price", "created_at", "-created_at"]
        if ordering in allow:
            base = base.order_by(ordering)

        return base

    def get_object(self):
        obj = super().get_object()
        request = self.request
        if not obj.is_approved and not (
            getattr(request.user, "is_staff", False) or obj.owner_id == getattr(request.user, "id", None)
        ):
            raise Http404
        return obj

    @action(detail=False, methods=["get"], url_path="mine", permission_classes=[IsAuthenticated])
    def mine(self, request):
        qs = self.get_queryset().filter(owner=request.user)
        page = self.paginate_queryset(qs)
        if page is not None:
            ser = self.get_serializer(page, many=True)
            return self.get_paginated_response(ser.data)
        ser = self.get_serializer(qs, many=True)
        return Response(ser.data)

    @action(detail=False, methods=["get"], url_path="favorites", permission_classes=[IsAuthenticated])
    def favorites(self, request):
        qs = Ad.objects.select_related("owner").filter(favorites__user=request.user)
        page = self.paginate_queryset(qs)
        if page is not None:
            ser = self.get_serializer(page, many=True)
            return self.get_paginated_response(ser.data)
        ser = self.get_serializer(qs, many=True)
        return Response(ser.data)

    @action(detail=True, methods=["post", "delete"], url_path="favorite", permission_classes=[IsAuthenticated])
    def favorite(self, request, pk=None):
        ad = self.get_object()
        if request.method.lower() == "post":
            Favorite.objects.get_or_create(user=request.user, ad=ad)
            is_favorited = True
        else:
            Favorite.objects.filter(user=request.user, ad=ad).delete()
            is_favorited = False
        return Response(
            {
                "is_favorited": is_favorited,
                "favorites_count": ad.favorites.count(),
            }
        )

    @action(detail=True, methods=["post"], url_path="approve", permission_classes=[IsAdminUser])
    def approve(self, request, pk=None):
        ad = self.get_object()
        ad.is_approved = True
        ad.save(update_fields=["is_approved"])
        ser = self.get_serializer(ad)
        return Response(ser.data)

    @action(detail=True, methods=["post"], url_path="reject", permission_classes=[IsAdminUser])
    def reject(self, request, pk=None):
        ad = self.get_object()
        ad.is_approved = False
        ad.save(update_fields=["is_approved"])
        ser = self.get_serializer(ad)
        return Response(ser.data)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        ser = RegisterSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = ser.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {"token": token.key, "user": UserPublicSerializer(user).data},
            status=status.HTTP_201_CREATED,
        )


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"user": UserPublicSerializer(request.user).data})
