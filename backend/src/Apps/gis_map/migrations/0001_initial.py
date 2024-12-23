# Generated by Django 4.2.6 on 2024-06-20 07:33

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='GisMapLayer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.PositiveIntegerField(default=0)),
                ('updated_by', models.PositiveIntegerField(default=0)),
                ('name', models.CharField(max_length=1024)),
                ('description', models.TextField()),
                ('url', models.CharField(max_length=1024)),
            ],
            options={
                'db_table': 'gis_map_layers',
            },
        ),
        migrations.CreateModel(
            name='GisViewPoint',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.PositiveIntegerField(default=0)),
                ('updated_by', models.PositiveIntegerField(default=0)),
                ('name', models.CharField(max_length=1024, null=True)),
                ('description', models.TextField(default='')),
                ('lat', models.FloatField()),
                ('long', models.FloatField()),
            ],
            options={
                'db_table': 'gis_view_points',
            },
        ),
        migrations.CreateModel(
            name='GisViewPointCamera',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('created_by', models.PositiveIntegerField(default=0)),
                ('updated_by', models.PositiveIntegerField(default=0)),
                ('camera_source', models.IntegerField()),
                ('camera_uri', models.CharField(max_length=1024)),
                ('description', models.TextField(default='', null=True)),
                ('view_point_id', models.PositiveIntegerField(db_index=True)),
            ],
            options={
                'db_table': 'gis_view_point_cameras',
            },
        ),
    ]
