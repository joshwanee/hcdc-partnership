from rest_framework import permissions
from rest_framework.permissions import BasePermission, SAFE_METHODS
from api.models import Department

class IsGuestOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role != 'GUEST'

class IsDepartmentAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return request.user.role == 'DEPARTMENT_ADMIN' and obj.department == request.user.department

class IsCollegeAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role != 'COLLEGE_ADMIN':
            return False
        if hasattr(obj, 'college'):
            return obj.college == request.user.college
        if hasattr(obj, 'department'):
            return obj.department.college == request.user.college
        return False  

class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'SUPERADMIN' 

class CanManageUsers(BasePermission):
    """
    SUPERADMIN → Full access
    COLLEGE_ADMIN → Can create/update department admins within their own college
    DEPARTMENT_ADMIN → Can update only their own profile
    """

    def has_permission(self, request, view):
        user = request.user

        if not user.is_authenticated:
            return False

        # SUPERADMIN always allowed
        if user.role == "SUPERADMIN":
            return True

        # COLLEGE ADMIN RULES
        if user.role == "COLLEGE_ADMIN":

            # ---- DELETE NOT ALLOWED ----
            if request.method == "DELETE":
                return False

            # ---- CREATE ----
            if request.method == "POST":
                return request.data.get("role") == "DEPARTMENT_ADMIN"

            # ---- UPDATE ----
            if request.method in ["PATCH", "PUT"]:
                role = request.data.get("role")
                if role and role != "DEPARTMENT_ADMIN":
                    return False
                return True

            # ---- GET ----
            if request.method == "GET":
                return True

            return False

        # DEPARTMENT ADMIN RULES
        if user.role == "DEPARTMENT_ADMIN":
            if request.method in ["GET", "PATCH", "PUT"]:
                return True
            return False

        return False

    def has_object_permission(self, request, view, obj):
        print("\n===== PERMISSION DEBUG =====")
        print("REQUEST USER:", request.user.id, request.user.username, request.user.role, "college:", request.user.college_id)
        print("TARGET USER:", obj.id, obj.username, obj.role, "college:", obj.college_id, "dept:", obj.department_id)
        print("REQUEST DATA:", request.data)
        print("============================\n")
        
        user = request.user

        # ✅ Allow ALL roles to view/update their own profile
        if obj.id == user.id:
            return True

        # SUPERADMIN → always allowed
        if user.role == "SUPERADMIN":
            return True

        # COLLEGE ADMIN rules
        if user.role == "COLLEGE_ADMIN":

            # Only department admins can be managed
            if obj.role != "DEPARTMENT_ADMIN":
                return False

            # Allow viewing unassigned department admins so they can be updated
            if request.method == "GET" and not obj.department_id and not obj.college_id:
                return True

            # If assigning department (PATCH with department field)
            if "department" in request.data:
                from api.models import Department
                try:
                    dept = Department.objects.get(id=request.data["department"])
                except Department.DoesNotExist:
                    return False

                return dept.college_id == user.college_id

            # For GET/PATCH without department field
            if obj.department and obj.department.college_id:
                return obj.department.college_id == user.college_id

            if obj.college_id:
                return obj.college_id == user.college_id

            return False

        # DEPARTMENT ADMIN → can only access self
        if user.role == "DEPARTMENT_ADMIN":
            return obj.id == user.id

        return False



