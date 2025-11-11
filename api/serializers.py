from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework.authtoken.models import Token

from .models import Ad


class MessageSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=200)
    timestamp = serializers.DateTimeField(read_only=True)


class UserPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ["id", "username"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = get_user_model()
        fields = ["id", "username", "email", "password"]

    def create(self, validated_data):
        User = get_user_model()
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )
        Token.objects.create(user=user)
        return user


class AdSerializer(serializers.ModelSerializer):
    owner = UserPublicSerializer(read_only=True)
    is_owner = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()
    favorites_count = serializers.SerializerMethodField()

    class Meta:
        model = Ad
        fields = [
            "id",
            "owner",
            "title",
            "description",
            "price",
            "is_approved",
            "created_at",
            "updated_at",
            "is_owner",
            "is_favorited",
            "favorites_count",
        ]
        read_only_fields = [
            "owner",
            "is_approved",
            "created_at",
            "updated_at",
            "favorites_count",
            "is_owner",
            "is_favorited",
        ]

    def get_is_owner(self, obj):
        user = self.context.get("request").user
        return user.is_authenticated and obj.owner_id == user.id

    def get_is_favorited(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if not user or not user.is_authenticated:
            return False
        return obj.favorites.filter(user=user).exists()

    def get_favorites_count(self, obj):
        return obj.favorites.count()
