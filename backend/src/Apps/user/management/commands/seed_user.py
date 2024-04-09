from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand
from faker import Faker


class Command(BaseCommand):
    help = "Seed user"

    def handle(self, *args, **options):
        num_user = int(input("Enter num user: "))
        fake = Faker()
        list_user = []
        UserModel = get_user_model()
        for i in range(num_user):
            email = fake.ascii_email()
            list_user.append(UserModel(
                username=email,
                email=email,
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                password=make_password("123456")
            ))

        bulk_user = UserModel.objects.bulk_create(list_user)
        print("Seed completed for ", len(bulk_user))
