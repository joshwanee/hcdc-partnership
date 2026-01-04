from rest_framework import serializers
from .models import College, Department, Partnerships, User
from django.contrib.auth.password_validation import validate_password
from cloudinary.utils import cloudinary_url


class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']

class GuestUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

    def create(self, validate_data):
        user = User.objects.create(
            username = validate_data['username'],
            email = validate_data['email'],
            role = 'GUEST',
        )
        user.set_password(validate_data['password'])
        user.save()
        return user

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=False,   # IMPORTANT: Not required on update
        validators=[validate_password]
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role', 'college', 'department']

    def create(self, validated_data):
        password = validated_data.pop("password", None)

        if not password:
            raise serializers.ValidationError({"password": "Password is required."})

        user = User(
            username=validated_data.get("username"),
            email=validated_data.get("email"),
            role=validated_data.get("role"),
            college=validated_data.get("college"),
            department=validated_data.get("department"),
        )

        user.set_password(password)
        user.is_staff = user.role in ['SUPERADMIN', 'COLLEGE_ADMIN']
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)

        # Allow username/email updates
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        # Correct hashing of password if provided
        if password:
            instance.set_password(password)

        instance.save()
        return instance


class CollegeSerializer(serializers.ModelSerializer):
    class Meta:
        model = College
        fields = '__all__'

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

class PartnershipsSerializer(serializers.ModelSerializer):
    logo = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Partnerships
        fields = '__all__'
