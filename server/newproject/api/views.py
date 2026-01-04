from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from django.db.models import Count
from django.db.models.functions import TruncMonth, TruncYear
from rest_framework.parsers import MultiPartParser, FormParser

from .models import College, Department, Partnerships, User
from .serializers import CollegeSerializer, DepartmentSerializer, PartnershipsSerializer, UserSerializer, GuestUserSerializer
from .permissions import IsGuestOrReadOnly, IsDepartmentAdmin, IsCollegeAdmin, IsSuperAdmin, CanManageUsers
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# Create your views here.
class GuestRegisterViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(role='GUEST')
    serializer_class = GuestUserSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        serializer.save(role='GUEST')   


class CollegeViewSet(viewsets.ModelViewSet):
    queryset = College.objects.all()
    serializer_class = CollegeSerializer
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsGuestOrReadOnly | IsSuperAdmin | IsCollegeAdmin]

    def get_queryset(self):
        user = self.request.user

        if not user.is_authenticated:
            return College.objects.all()

        if user.role == 'SUPERADMIN':
            return College.objects.all()

        if user.role == 'COLLEGE_ADMIN':
            return College.objects.filter(id=user.college_id)

        if user.role in ['DEPARTMENT_ADMIN', 'GUEST']:
            return College.objects.all()

        return College.objects.none()

    # 🔥 NEW ENDPOINT HERE
    @action(detail=True, methods=["get"], url_path="departments")
    def get_departments(self, request, pk=None):
        """Return all departments under a specific college."""
        college = self.get_object()
        departments = Department.objects.filter(college=college)
        serializer = DepartmentSerializer(departments, many=True)
        return Response(serializer.data)



class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsGuestOrReadOnly | IsCollegeAdmin | IsSuperAdmin | IsDepartmentAdmin]

    def get_queryset(self):
        user = self.request.user
        queryset = Department.objects.all()

        college_id = self.request.query_params.get('college')
        if college_id:
            queryset = queryset.filter(college_id=college_id)

        if not user.is_authenticated:
            return queryset

        if user.role == 'SUPERADMIN':
            return queryset

        if user.role == 'COLLEGE_ADMIN':
            return queryset.filter(college_id=user.college_id)

        if user.role == 'DEPARTMENT_ADMIN':
            return queryset.filter(id=user.department_id)
        
        if user.role == 'GUEST':
            return queryset

        return queryset.none()

    # ⭐ ADD THIS HERE (at the bottom)
    @action(detail=True, methods=["get"], url_path="partnerships")
    def get_partnerships(self, request, pk=None):
        department = self.get_object()
        partnerships = Partnerships.objects.filter(department=department)
        serializer = PartnershipsSerializer(
            partnerships,
            many=True,
            context={'request': request}  # REQUIRED FOR FULL URL
        )
        return Response(serializer.data)




class PartnershipsViewSet(viewsets.ModelViewSet):
    queryset = Partnerships.objects.all()
    serializer_class = PartnershipsSerializer
    permission_classes = [IsGuestOrReadOnly | IsDepartmentAdmin | IsCollegeAdmin | IsSuperAdmin]

    # Filter by department for frontend filtering
    def get_queryset(self):
        user = self.request.user
        queryset = Partnerships.objects.all()

        if not user.is_authenticated:
            return queryset
        
        if user.role == 'SUPERADMIN':
            return queryset

        if user.role == 'COLLEGE_ADMIN':
            return queryset.filter(department__college_id=user.college_id)

        if user.role == 'DEPARTMENT_ADMIN':
            return queryset.filter(department_id=user.department_id)

        if user.role == 'GUEST':
            return queryset

        return queryset.none()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    # -------------------------------------------
    # 📈 NEW ANALYTICS ENDPOINT
    # -------------------------------------------
    @action(detail=False, methods=['GET'], url_path='growth')
    def growth(self, request):
        year = request.GET.get("year")
        month = request.GET.get("month")
        college_id = request.GET.get("college")  # <-- FIXED

        # Start with all data (before filtering)
        qs = Partnerships.objects.all()

        # Filter by ?college=ID if provided
        if college_id:
            qs = qs.filter(department__college_id=college_id)
        else:
            # fallback to role-based filter
            qs = self.get_queryset()

        # Must have a date_started
        qs = qs.exclude(date_started__isnull=True)

        # Optional filters
        if year:
            qs = qs.filter(date_started__year=year)

        if month:
            qs = qs.filter(date_started__month=month)

        # Group by month
        data = (
            qs.annotate(month=TruncMonth('date_started'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )

        response = [
            {
                "month": item["month"].strftime("%Y-%m"),
                "count": item["count"]
            }
            for item in data if item["month"]
        ]

        return Response(response)

    # /api/partnerships/growth/<college_id>/
    # @action(detail=False, methods=["GET"], url_path="growth/(?P<college_id>[^/.]+)")
    # def college_growth(self, request, college_id=None):
    #     # Filter partnerships belonging to this specific college
    #     qs = Partnerships.objects.filter(
    #         department__college_id=college_id,
    #         date_started__isnull=False  # ignore ones with no start date
    #     )

    #     data = (
    #         qs.annotate(month=TruncMonth("date_started"))
    #           .values("month")
    #           .annotate(count=Count("id"))
    #           .order_by("month")
    #     )

    #     formatted = [
    #         {
    #             "month": item["month"].strftime("%Y-%m"),
    #             "count": item["count"],
    #         }
    #         for item in data
    #         if item["month"] is not None
    #     ]

    #     return Response(formatted)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [CanManageUsers]

    def retrieve(self, request, *args, **kwargs):
        obj = self.get_object()
        print("\n================ DEBUG ================")
        print("TARGET USER →", obj.id, obj.username, obj.role, "college:", obj.college_id, "dept:", obj.department_id)
        print("REQUEST USER →", request.user.id, request.user.username, request.user.role, "college:", request.user.college_id)
        print("======================================\n")
        return super().retrieve(request, *args, **kwargs)



# =========================================================
# Viewing Section (read-only for everyone)
# =========================================================

class ViewingCollegeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = College.objects.all()
    serializer_class = CollegeSerializer
    permission_classes = [permissions.AllowAny]


class ViewingDepartmentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.AllowAny]


class ViewingPartnershipViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PartnershipsSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Partnerships.objects.all()
        
        # NEW: filter by department
        dept_id = self.request.query_params.get("department")
        if dept_id:
            queryset = queryset.filter(department_id=dept_id)

        return queryset


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['college'] = user.college.id if user.college else None
        token['department'] = user.department.id if user.department else None
        return token

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
    
