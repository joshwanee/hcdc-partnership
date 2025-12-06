import os
from django.core.management.base import BaseCommand
from api.models import User
from django.utils.crypto import get_random_string

class Command(BaseCommand):
    help = "Creates a default Super Admin if not existing."

    def handle(self, *args, **options):
        username = "superadmin"
        email = "superadmin@example.com"

        # Use an environment variable for the password, or generate a random one for production
        password = os.getenv("SUPERADMIN_PASSWORD", get_random_string(12))  # Random password if not provided

        if not User.objects.filter(username=username).exists():
            user = User.objects.create_superuser(
                username=username,
                email=email,
                password=password,
                role="SUPERADMIN",
                is_staff=True,
                is_superuser=True
            )
            self.stdout.write(self.style.SUCCESS(f"✅ Super Admin created!"))
            self.stdout.write(self.style.SUCCESS(f"   Username: {username}"))
            self.stdout.write(self.style.SUCCESS(f"   Password: {password}"))
        else:
            self.stdout.write(self.style.WARNING("⚠️ Super Admin already exists."))
