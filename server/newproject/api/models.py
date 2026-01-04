from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.conf import settings
from cloudinary_storage.storage import MediaCloudinaryStorage

class User(AbstractUser):
    SUPERADMIN = 'SUPERADMIN'
    COLLEGE_ADMIN = 'COLLEGE_ADMIN'
    DEPARTMENT_ADMIN = 'DEPARTMENT_ADMIN'
    GUEST = 'GUEST'
    ROLE_CHOICES = [
        (SUPERADMIN, 'Super Admin'),
        (COLLEGE_ADMIN, 'College Admin'),
        (DEPARTMENT_ADMIN, 'Department Admin'),
        (GUEST, 'Guest'),
    ]

    role = models.CharField(max_length=20, choices = ROLE_CHOICES, default = GUEST)
    college = models.ForeignKey('College', on_delete= models.SET_NULL, null = True, blank = True)
    department = models.ForeignKey('Department', on_delete= models.SET_NULL, null = True, blank = True)

    def __str__(self):
        return f"{self.username} ({self.role})"


class College(models.Model):
    id = models.BigAutoField(primary_key= True)
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=255)
    logo = models.ImageField(
        upload_to ='college_logos/', 
        null = True, 
        blank=True)
    admin = models.ForeignKey(   # 👈 Add this line
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, 
        blank=True,
        related_name='managed_colleges'
    )
    created_at = models.DateTimeField(default= timezone.now)
    updated_at = models.DateTimeField(auto_now= True)

    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return f'{self.code} - {self.name}'


class Department(models.Model):
    id = models.BigAutoField(primary_key = True )
    college = models.ForeignKey(
        College, 
        on_delete=models.CASCADE, 
        null=True, blank=True, 
        related_name='departments')
    code = models.CharField(max_length=50)
    name = models.CharField(max_length=255)
    logo = models.ImageField(
        upload_to='department_logos/',
        null=True,
        blank=True
    )
    admin = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='managed_departments'
    )
    created_at = models.DateTimeField(default= timezone.now)
    updated_at = models.DateTimeField(auto_now= True)

    class Meta:
        ordering = ['college__name', 'name']
        unique_together = ('college', 'code')

    def __str__(self):
        return f'{self.name} ({self.college.code})'


class Partnerships(models.Model):
    STATUS_ACTIVE = 'active'
    STATUS_INACTIVE = 'inactive'
    STATUS_CHOICES = [
        (STATUS_ACTIVE, 'Active'),
        (STATUS_INACTIVE, 'Inactive'),
    ]

    id = models.BigAutoField(primary_key=True)

    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name='partnerships'
    )

    title = models.CharField(max_length=255)
    description = models.TextField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_ACTIVE
    )

    logo = models.ImageField(
        upload_to='partnership_logos/',
        null=True,
        blank=True
    )

    # 🔹 NEW FIELDS
    contact_person = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text="Name of the contact person for this partnership."
    )

    contact_email = models.EmailField(
        null=True,
        blank=True,
        help_text="Email of contact person."
    )

    contact_phone = models.CharField(
        max_length=20,
        null=True,
        blank=True,
        help_text="Phone number for the contact person."
    )

    date_started = models.DateField(
        null=True,
        blank=True,
        help_text="When the partnership began."
    )

    date_ended = models.DateField(
        null=True,
        blank=True,
        help_text="End date (leave blank if ongoing)."
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_partnerships'
    )

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title







