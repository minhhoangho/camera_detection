# Generated by Django 4.2.6 on 2024-10-05 15:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gis_map', '0003_remove_gismapview_max_zoom'),
    ]

    operations = [
        migrations.AddField(
            model_name='gisviewpointcamera',
            name='captured_image',
            field=models.CharField(default='', max_length=1024, null=True),
        ),
    ]
