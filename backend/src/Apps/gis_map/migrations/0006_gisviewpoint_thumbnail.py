# Generated by Django 4.2.6 on 2024-10-07 12:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gis_map', '0005_gisviewpointcamera_bev_image_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='gisviewpoint',
            name='thumbnail',
            field=models.CharField(default='', max_length=1024, null=True),
        ),
    ]