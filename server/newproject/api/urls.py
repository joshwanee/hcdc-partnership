from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CollegeViewSet, DepartmentViewSet, PartnershipsViewSet, UserViewSet, GuestRegisterViewSet, ViewingCollegeViewSet, ViewingDepartmentViewSet, ViewingPartnershipViewSet
from rest_framework_simplejwt.views import TokenRefreshView
from .views import MyTokenObtainPairView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

router = DefaultRouter()
router.register(r'colleges', CollegeViewSet)
router.register(r'departments', DepartmentViewSet)  
router.register(r'partnerships', PartnershipsViewSet)
router.register(r'users', UserViewSet)
router.register(r'viewing/colleges', ViewingCollegeViewSet, basename='viewing-colleges')
router.register(r'viewing/departments', ViewingDepartmentViewSet, basename='viewing-departments')
router.register(r'viewing/partnerships', ViewingPartnershipViewSet, basename='viewing-partnerships')

urlpatterns = [
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/guest/', GuestRegisterViewSet.as_view({'post': 'create'}), name='guest-register'),
    path('', include(router.urls)),
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
    path('docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
]