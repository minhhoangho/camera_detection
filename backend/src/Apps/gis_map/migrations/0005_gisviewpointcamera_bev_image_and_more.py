# Generated by Django 4.2.6 on 2024-10-06 04:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gis_map', '0004_gisviewpointcamera_captured_image'),
    ]

    operations = [
        migrations.AddField(
            model_name='gisviewpointcamera',
            name='bev_image',
            field=models.CharField(default='', max_length=1024, null=True),
        ),
        migrations.AddField(
            model_name='gisviewpointcamera',
            name='homography_matrix',
            field=models.TextField(default='', null=True),
        ),
    ]
