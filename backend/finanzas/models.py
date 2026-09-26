from django.db import models
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError


class CategoriaGasto(models.Model):
    nombre = models.CharField('Nombre', max_length=100, unique=True)
    descripcion = models.TextField('Descripción', blank=True)

    class Meta:
        verbose_name = 'Categoría de gasto'
        verbose_name_plural = 'Categorías de gasto'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre


class Pago(models.Model):
    METODOS_PAGO = [
        ('efectivo', 'Efectivo'),
        ('transferencia', 'Transferencia'),
        ('debito', 'Débito'),
        ('credito', 'Crédito'),
        ('otros', 'Otros'),
    ]

    cliente = models.ForeignKey(
        'usuarios.Cliente', on_delete=models.SET_NULL, null=True, blank=True,
        verbose_name='Cliente'
    )
    monto = models.DecimalField(
        'Monto', max_digits=10, decimal_places=2,
        validators=[MinValueValidator(0.01)]
    )
    fecha = models.DateField('Fecha')
    descripcion = models.TextField('Descripción', blank=True)
    metodo_pago = models.CharField(
        'Método de pago', max_length=20, choices=METODOS_PAGO, default='efectivo'
    )
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Pago'
        verbose_name_plural = 'Pagos'
        ordering = ['-fecha', '-creado']

    def __str__(self):
        return f'${self.monto} - {self.get_metodo_pago_display()} ({self.fecha})'


class Gasto(models.Model):
    categoria = models.ForeignKey(
        CategoriaGasto, on_delete=models.PROTECT, verbose_name='Categoría'
    )
    monto = models.DecimalField(
        'Monto', max_digits=10, decimal_places=2,
        validators=[MinValueValidator(0.01)]
    )
    fecha = models.DateField('Fecha')
    descripcion = models.TextField('Descripción', blank=True)
    proveedor = models.CharField('Proveedor', max_length=100, blank=True)
    comprobante = models.ImageField(
        'Comprobante', upload_to='gastos/', null=True, blank=True
    )
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Gasto'
        verbose_name_plural = 'Gastos'
        ordering = ['-fecha', '-creado']

    def __str__(self):
        return f'{self.categoria.nombre} - ${self.monto} ({self.fecha})'


class Cheque(models.Model):
    ESTADOS = [
        ('en_cartera', 'En cartera'),
        ('depositado', 'Depositado'),
        ('rechazado', 'Rechazado'),
        ('entregado', 'Entregado'),
    ]

    TRANSICIONES_VALIDAS = {
        'en_cartera': ['depositado', 'rechazado', 'entregado'],
        'depositado': ['rechazado'],
        'rechazado': ['depositado'],
        'entregado': [],
    }

    cliente = models.ForeignKey(
        'usuarios.Cliente', on_delete=models.PROTECT,
        verbose_name='Cliente'
    )
    numero = models.CharField('Número', max_length=50, unique=True)
    banco = models.CharField('Banco', max_length=100)
    monto = models.DecimalField(
        'Monto', max_digits=10, decimal_places=2,
        validators=[MinValueValidator(0.01)]
    )
    fecha_emision = models.DateField('Fecha de emisión')
    fecha_vto = models.DateField('Fecha de vencimiento', null=True, blank=True)
    estado = models.CharField(
        'Estado', max_length=20, choices=ESTADOS, default='en_cartera'
    )
    pago = models.ForeignKey(
        'Pago', on_delete=models.SET_NULL, null=True, blank=True,
        verbose_name='Pago asociado'
    )
    notas = models.TextField('Notas', blank=True)
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Cheque'
        verbose_name_plural = 'Cheques'
        ordering = ['-fecha_emision', '-creado']

    def __str__(self):
        return f'{self.numero} - {self.cliente.nombre} - ${self.monto}'

    def clean(self):
        super().clean()
        if not self.pk:
            return  # New cheque, no state transition to validate

        try:
            old = Cheque.objects.get(pk=self.pk)
        except Cheque.DoesNotExist:
            return

        if old.estado != self.estado:
            permitidas = self.TRANSICIONES_VALIDAS.get(old.estado, [])
            if self.estado not in permitidas:
                raise ValidationError({
                    'estado': f'No se puede cambiar de "{old.get_estado_display()}" a "{self.get_estado_display()}". '
                              f'Transiciones permitidas desde "{old.get_estado_display()}": '
                              f'{", ".join(dict(self.ESTADOS)[e] for e in permitidas) or "ninguna"}.'
                })
