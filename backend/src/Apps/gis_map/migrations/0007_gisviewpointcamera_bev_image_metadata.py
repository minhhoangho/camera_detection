# Generated by Django 4.2.6 on 2024-11-02 04:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gis_map', '0006_gisviewpoint_thumbnail'),
    ]

    operations = [
        migrations.AddField(
            model_name='gisviewpointcamera',
            name='bev_image_metadata',
            field=models.TextField(default='', null=True),
        ),
    ]
