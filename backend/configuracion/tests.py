from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

# Se referencia el modulo, no el nombre directo. Referenciar `modelos.ContenidoSitio`
# en vez de un global suelto evita depender de la resolucion de nombres del
# modulo en la carga que hace el runner de tests de Django.
from configuracion import models as modelos
from configuracion.models import ContenidoSitio as _ContenidoSitio  # noqa: F401

# PNG de 1x1 valido.
PNG_PIXEL = bytes.fromhex(
    '89504e470d0a1a0a0000000d4948445200000001000000010806000000'
    '1f15c4890000000a49444154789c6300010000050001'
    '0d0a2db40000000049454e44ae426082'
)

# Las claves de estos tests llevan prefijo `t_` a proposito: la migracion 0002
# ya creo home_hero/home_rutas/home_cta tambien en la base de pruebas, y
# `clave` es unica. Los tests no deben depender de ese seed.


def imagen(nombre='foto.png', contenido=PNG_PIXEL, tipo='image/png'):
    return SimpleUploadedFile(nombre, contenido, content_type=tipo)


class ContenidoSitioModelTests(TestCase):
    def test_tiene_imagen_refleja_el_campo(self):
        self.assertFalse(modelos.ContenidoSitio(clave='t_vacio').tiene_imagen)
        self.assertTrue(modelos.ContenidoSitio(clave='t_lleno', imagen='sitio/x.png').tiene_imagen)

    def test_borrar_el_registro_borra_el_archivo(self):
        import os

        contenido = modelos.ContenidoSitio.objects.create(clave='t_borrar', imagen=imagen())
        ruta = contenido.imagen.path
        self.assertTrue(os.path.exists(ruta))

        contenido.delete()

        self.assertFalse(os.path.exists(ruta), 'quedo el archivo huerfano en disco')


class ContenidoSitioValidacionTests(TestCase):
    """`objects.create()` NO corre los validadores del campo: hay que pedir
    `full_clean()`, que es lo que hacen el admin y los serializers. Ademas
    `full_clean()` valida TODOS los campos, incluido `titulo`, que es
    obligatorio: por eso cada objeto de prueba lo completa.
    """

    def test_rechaza_extension_no_permitida(self):
        contenido = modelos.ContenidoSitio(
            clave='t_ext',
            titulo='Hero',
            imagen=imagen('mal.txt', b'hola', 'text/plain'),
        )

        with self.assertRaises(Exception) as ctx:
            contenido.full_clean()

        self.assertIn('txt', str(ctx.exception).lower())

    def test_rechaza_imagen_demasiado_pesada(self):
        grande = PNG_PIXEL + b'\x00' * (9 * 1024 * 1024)
        contenido = modelos.ContenidoSitio(clave='t_peso', titulo='Hero', imagen=imagen('grande.png', grande))

        with self.assertRaises(Exception) as ctx:
            contenido.full_clean()

        self.assertIn('mb', str(ctx.exception).lower())

    def test_acepta_png_valido(self):
        contenido = modelos.ContenidoSitio(clave='t_ok', titulo='Hero', imagen=imagen())

        contenido.full_clean()  # no debe explotar

    def test_titulo_es_obligatorio(self):
        contenido = modelos.ContenidoSitio(clave='t_sin_titulo', imagen=imagen())

        with self.assertRaises(Exception) as ctx:
            contenido.full_clean()

        self.assertIn('titulo', str(ctx.exception).lower())


class ContenidoSitioApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        # El DefaultRouter deriva el nombre del modelo, no de la URL.
        self.url = reverse('contenidositio-list')

    def test_lista_publica_solo_devuelve_lo_publicable(self):
        modelos.ContenidoSitio.objects.create(clave='t_hero', titulo='Hero', imagen=imagen('hero.png'))
        modelos.ContenidoSitio.objects.create(
            clave='t_oculta', titulo='Oculta', imagen=imagen('x.png'), visible=False
        )
        modelos.ContenidoSitio.objects.create(clave='t_sin_foto', titulo='Sin foto')  # no se publica

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual([item['clave'] for item in response.data], ['t_hero'])

    def test_sin_imagenes_devuelve_lista_vacia(self):
        self.assertEqual(self.client.get(self.url).data, [])

    def test_la_url_de_la_imagen_es_relativa(self):
        """Regresion: la URL debe ser RELATIVA.

        El ImageField de DRF devuelve la URL absoluta segun el Host del request.
        A traves del proxy de Vite ese Host es `backend:8000`, el nombre interno
        de Docker, y el navegador no lo resuelve: la foto que sube el admin deja
        de verse. Una URL relativa se resuelve contra el origen del sitio y no
        depende de como este deployado.
        """
        modelos.ContenidoSitio.objects.create(
            clave='t_url', titulo='Hero', imagen=imagen('hero.png'), alt_imagen='Un bus'
        )

        data = self.client.get(self.url).data[0]

        self.assertTrue(data['imagen'].startswith('/media/sitio/'), data['imagen'])
        self.assertNotIn('testserver', data['imagen'])
        self.assertNotIn('backend:8000', data['imagen'])

    def test_expone_el_texto_alternativo(self):
        modelos.ContenidoSitio.objects.create(
            clave='t_alt', titulo='Hero', imagen=imagen('hero.png'), alt_imagen='Un bus'
        )

        data = self.client.get(self.url).data[0]

        self.assertEqual(data['alt_imagen'], 'Un bus')
        self.assertTrue(data['tiene_imagen'])

    def test_no_expone_campos_de_administracion(self):
        modelos.ContenidoSitio.objects.create(clave='t_priv', titulo='Hero', imagen=imagen('hero.png'))

        data = self.client.get(self.url).data[0]

        for campo in ('orden', 'visible', 'creado', 'actualizado'):
            self.assertNotIn(campo, data)

    def test_lectura_publica_no_requiere_token(self):
        modelos.ContenidoSitio.objects.create(clave='t_anon', titulo='Hero', imagen=imagen('hero.png'))

        self.assertEqual(self.client.get(self.url).status_code, 200)

    def test_escritura_anonima_esta_bloqueada(self):
        modelos.ContenidoSitio.objects.create(clave='t_bloqueo', titulo='Bloqueo')

        for metodo in ('post', 'put', 'patch', 'delete'):
            with self.subTest(metodo=metodo):
                respuesta = getattr(self.client, metodo)(self.url, {}, format='json')
                self.assertIn(respuesta.status_code, (401, 403))

    def test_escritura_esta_bloqueada_incluso_autenticado(self):
        """El admin de Django es el UNICO camino de escritura, a proposito.

        Abrir la API en escritura significaria que cualquier usuario con token
        (no necesariamente staff) podria cambiar que se muestra en la portada.
        Un solo camino de escritura, con su propia autenticacion, es mas
        seguro que dos.
        """
        from django.contrib.auth import get_user_model

        usuario = get_user_model().objects.create_user(username='t_admin', password='x')
        self.client.force_authenticate(usuario)
        modelos.ContenidoSitio.objects.create(clave='t_auth', titulo='Hero', imagen=imagen('hero.png'))

        detalle = reverse('contenidositio-detail', args=['t_auth'])
        for metodo in ('post', 'put', 'patch', 'delete'):
            with self.subTest(metodo=metodo):
                respuesta = getattr(self.client, metodo)(detalle, {}, format='json')
                self.assertEqual(respuesta.status_code, 405, 'la API deberia ser solo lectura')
