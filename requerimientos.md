# Requerimientos y Funcionalidades del Sistema (GestCom)

Esta es la lista centralizada de todas las funcionalidades del sistema **GestCom**. Utilizaremos este documento para hacer seguimiento del progreso.

## 1. Configuración Base y Arquitectura
- [x] Inicialización del proyecto con Next.js 16 (App Router)
- [x] Configuración de Tailwind CSS y diseño base (UI Premium)
- [x] Integración del cliente de Supabase (Server & Client components)
- [x] Definición del esquema de Base de Datos (SQL Migrations)
- [x] Configuración de Políticas de Seguridad por Fila (Row Level Security - RLS)
- [x] Dockerfile Multi-stage y docker-compose.yml (Base)

## 2. Autenticación y Usuarios
- [x] Interfaz de Login (`/login`)
- [x] Acción de servidor para Iniciar Sesión
- [x] Middleware para proteger rutas privadas (`/dashboard/*`)
- [x] Interfaz de Registro (dentro de `/login`)
- [x] Gestión de roles (Admin vs Residente) y redirección automática

## 3. Dashboard y Navegación Central
- [x] Layout principal con Sidebar lateral y Header superior
- [x] Componentes visuales interactivos (Lucide Icons, Shadcn Buttons)
- [x] Dashboard Inicio (`/dashboard`) - Gráficos de recaudación y estadísticas reales
- [x] Dashboard Residente - Vista simplificada para consultar deudas personales

## 4. Módulo de Unidades
- [x] Listado de unidades registradas (Grid)
- [x] Formulario para crear una nueva unidad
- [x] Lógica de servidor para insertar y validar unidad (manejo de alícuotas)
- [x] Vista de detalle y edición de una unidad existente
- [x] Historial de pagos por unidad

## 5. Módulo de Expensas Comunes
- [x] Listado de gastos mensuales
- [x] Formulario para registrar un gasto de mantenimiento/administración
- [x] Función SQL (`distribute_expense`) para generar deudas automáticas basadas en alícuotas
- [x] Botón para activar la distribución desde la UI
- [x] Vista de detalle de distribución (ver cuánto le tocó pagar a cada unidad)

## 6. Módulo de Pagos
- [x] Formulario para que un residente reporte una transferencia
- [x] Listado y tabla para que el administrador revise pagos
- [x] Botones de acción rápida: Aprobar o Rechazar pago
- [x] Subida de comprobante de pago (Integración real con Supabase Storage)
- [x] Deducción automática de la deuda de la unidad cuando se aprueba un pago

## 7. Módulo de Anuncios y Comunicación
- [x] Tablón tipo Feed interactivo
- [x] Formulario de creación con prioridades y opción de "Fijar"
- [x] Acción de administrador para eliminar comunicados
- [ ] Sistema de comentarios de residentes en los anuncios (Opcional)

## 8. Configuración y Perfil
- [x] Pantalla de configuración del administrador (ajustes del condominio)
- [x] Pantalla de perfil del usuario (actualizar nombre, contraseña, avatar)

## 9. Despliegue y Pruebas
- [x] Verificación de compilación estricta en TypeScript
- [ ] Entorno local de pruebas totalmente funcional
- [ ] Despliegue de Base de Datos a Supabase Cloud
- [ ] Despliegue del Frontend a Vercel o Contenedor Docker Final

## 10. Módulo de Reservas de Amenidades (Áreas Comunes)
- [x] Listado de amenidades disponibles (Piscina, Quincho, Gimnasio, Salón de eventos) con fotos y reglas
- [x] Calendario interactivo para que los residentes soliciten reservas por fecha/hora
- [x] Panel administrativo para aprobar, rechazar o cancelar solicitudes de reservas
- [x] Bloqueo automático de fechas ya reservadas o mantenimiento de áreas

## 11. Módulo de Incidencias y Mantenimiento (Ticketera)
- [ ] Formulario para que los residentes reporten desperfectos en áreas comunes (ej. ascensor dañado, bombilla quemada) con carga de foto de evidencia
- [ ] Tablero Kanban de incidencias para el Administrador (Estados: Reportado, En Proceso, Resuelto)
- [ ] Notificación visual para los residentes sobre el estado de su reporte

## 12. Módulo de Control de Acceso y Visitas
- [ ] Registro de visitas esperadas por parte de los residentes (Nombre del visitante, Fecha de ingreso, Patente/Matrícula)
- [ ] Vista simplificada tipo "Conserjería" para que el guardia de seguridad verifique los ingresos autorizados
- [ ] Generación de códigos QR de acceso rápido para visitantes (Simulados en UI Premium)

## 13. Reportes Financieros Avanzados y Descarga PDF
- [ ] Generación automática de comprobante de pago oficial en PDF al ser aprobado un pago
- [ ] Descarga en formato PDF o Excel del detalle de la distribución de gastos comunes del mes para las unidades
- [ ] Gráficos avanzados e interactivos de flujo de caja y egresos en el panel del administrador
