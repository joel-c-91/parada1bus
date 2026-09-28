"""Crea los espacios de foto de las secciones de la portada.

Se crea con ``get_or_create`` y no con un SimpleTestCase: es idempotente, asi
que volver a aplicarla no duplica filas ni pisa las fotos que el admin ya subio.
"""
from django.db import migrations

ESPACIOS = [
    {
        'clave': 'home_hero',
        'titulo': 'Portada (hero)',
        'orden': 0,
        'alt_imagen': 'Unidad de Parada 1 Bus en ruta por la ciudad',
    },
    {
        'clave': 'home_rutas',
        'titulo': 'Rutas fijas',
        'orden': 1,
        'alt_imagen': 'Colectivo de Parada 1 Bus en una ruta fija',
    },
    {
        'clave': 'home_cta',
        'titulo': 'Llamada a la accion (CTA)',
        'orden': 2,
        'alt_imagen': 'Interior de una unidad de Parada 1 Bus',
    },
]


def crear_espacios(apps, schema_editor):
    ContenidoSitio = apps.get_model('configuracion', 'ContenidoSitio')
    for espacio in ESPACIOS:
        ContenidoSitio.objects.get_or_create(
            clave=espacio['clave'],
            defaults={
                'titulo': espacio['titulo'],
                'orden': espacio['orden'],
                'alt_imagen': espacio['alt_imagen'],
            },
        )


def borrar_espacios_vacios(apps, schema_editor):
    """Solo se va lo que el admin nunca toco (sin foto y con el alt original)."""
    ContenidoSitio = apps.get_model('configuracion', 'ContenidoSitio')
    originales = {e['clave']: e['alt_imagen'] for e in ESPACIOS}
    for clave, alt in originales.items():
        ContenidoSitio.objects.filter(clave=clave, imagen='', alt_imagen=alt).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('configuracion', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(crear_espacios, borrar_espacios_vacios),
    ]
