# Generated by Django 4.2.6 on 2024-11-16 15:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gis_map', '0007_gisviewpointcamera_bev_image_metadata'),
    ]

    operations = [
        migrations.AddField(
            model_name='gisviewpoint',
            name='warning_threshold',
            field=models.IntegerField(default=0),
        ),
    ]
