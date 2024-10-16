import os
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Run the ASGI server'

    def add_arguments(self, parser):
        parser.add_argument(
            '--port',
            type=int,
            default=8085,
            help='Port number to run the ASGI server on',
        )

    def handle(self, *args, **kwargs):
        port = str(kwargs['port'])
        os.system(f'daphne -b 0.0.0.0 -p {port} src.asgi:application')
