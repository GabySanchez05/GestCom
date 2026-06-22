# Diagramas del Sistema GestCom

Aquí encontrarás los diagramas técnicos del proyecto renderizables gracias al soporte nativo de Markdown (o usando visualizadores como Mermaid Live).

## 1. Modelo Entidad-Relación (Base de Datos)

```mermaid
erDiagram
    %% Relaciones (Cardinalidad)
    units ||--o{ profiles : "tiene residentes"
    units ||--o{ payments : "registra"
    profiles ||--o{ payments : "realiza"
    
    common_expenses ||--|{ expense_distributions : "se desglosa en"
    units ||--o{ expense_distributions : "debe pagar"
    
    profiles ||--o{ announcements : "publica"
    
    amenities ||--o{ reservations : "tiene disponibilidad para"
    units ||--o{ reservations : "reserva"
    profiles ||--o{ reservations : "solicita"
    
    units ||--o{ incidents : "reporta"
    profiles ||--o{ incidents : "genera"

    %% Entidades y Atributos
    units {
        uuid id PK
        string unit_number
        string unit_type
        numeric aliquot_percentage
        int floor_number
        string status
        datetime created_at
    }

    profiles {
        uuid id PK "También FK de auth.users"
        string full_name
        string avatar_url
        string role
        uuid unit_id FK
        datetime created_at
        datetime updated_at
    }

    payments {
        uuid id PK
        uuid unit_id FK
        uuid profile_id FK
        numeric amount
        string currency
        string status
        date payment_date
        string reference_number
        string receipt_url
        string period
        string notes
        datetime created_at
        datetime updated_at
    }

    common_expenses {
        uuid id PK
        string title
        string description
        numeric total_amount
        string currency
        string category
        date expense_date
        string period
        string receipt_url
        boolean is_distributed
        datetime created_at
    }

    expense_distributions {
        uuid id PK
        uuid expense_id FK
        uuid unit_id FK
        numeric assigned_amount
        numeric aliquot_percentage
        datetime created_at
    }

    announcements {
        uuid id PK
        uuid author_id FK
        string title
        string content
        string priority
        boolean is_pinned
        datetime published_at
        datetime expires_at
        datetime created_at
    }

    amenities {
        uuid id PK
        string name
        string description
        int capacity
        string rules
        string image_url
        string status
        datetime created_at
    }

    reservations {
        uuid id PK
        uuid amenity_id FK
        uuid unit_id FK
        uuid profile_id FK
        date reservation_date
        time start_time
        time end_time
        string status
        string notes
        datetime created_at
    }

    incidents {
        uuid id PK
        string title
        string description
        string area
        string priority
        string status
        string evidence_url
        string admin_notes
        uuid unit_id FK
        uuid profile_id FK
        datetime created_at
        datetime updated_at
    }

    condo_settings {
        int id PK
        string property_name
        string address
        string base_currency
        string payment_instructions
        string contact_email
        string contact_phone
        datetime updated_at
    }
```

---

## 2. Mapa de Navegación de la Interfaz Gráfica

Como Mermaid no renderiza mockups visuales exactos, la mejor forma de representar la Interfaz Gráfica a nivel de arquitectura de software es mediante un Mapa de Navegación (Flowchart) que muestra cómo se conectan las diferentes vistas y pantallas del sistema.

```mermaid
graph TD
    %% Nivel 1: Autenticación
    Login(Login / Registro) --> Auth{¿Autenticado?}
    Auth -->|No| Login
    Auth -->|Sí| Dash(Dashboard Principal)

    %% Nivel 2: Módulos desde el Dashboard
    Dash --> Res[Módulo de Residentes]
    Dash --> Fin[Módulo de Finanzas]
    Dash --> Are[Módulo de Áreas Comunes]
    Dash --> Inc[Módulo de Incidencias]
    Dash --> Conf[Ajustes de Condominio]
    Dash --> Logout(Cerrar Sesión)

    %% Nivel 3: Detalle de Residentes
    Res --> R1[Ver Lista]
    Res --> R2[Agregar Nuevo]

    %% Nivel 3: Detalle de Finanzas
    Fin --> F1[Ver Gastos Comunes]
    Fin --> F2[Ver Pagos]
    Fin --> F3[Reportar Pago]

    %% Nivel 3: Detalle de Áreas
    Are --> A1[Ver Catálogo]
    Are --> A2[Calendario]
    Are --> A3[Mis Reservas]

    %% Nivel 3: Detalle de Incidencias
    Inc --> I1[Lista de Tickets]
    Inc --> I2[Crear Reporte]
```

---

## 3. Carta Estructural (Arquitectura de Módulos)

La Carta Estructural representa la arquitectura física de carpetas y archivos del código fuente, organizada bajo el marco de trabajo de Next.js (App Router), vinculando cada directorio con su función lógica en el sistema.

```text
GestCom_App/
├── app/                      # Configuración de rutas (App Router)
│   ├── (auth)/               # Grupo de rutas de autenticación
│   │   ├── forgot-password/  # Formulario de solicitud de recuperación
│   │   ├── login/
│   │   │   └── page.tsx      # Interfaz de Inicio de Sesión y OAuth
│   │   └── update-password/  # Formulario de restablecimiento de contraseña
│   ├── actions/              # Lógica de servidor (Server Actions)
│   │   └── auth.ts           # Funciones de login, registro, envío de emails
│   ├── auth/
│   │   └── callback/         # Manejo de la redirección de Supabase / OAuth
│   ├── dashboard/            # Rutas protegidas del panel de administración
│   │   ├── residents/        # Módulo de gestión de residentes (CRUD y Tablas)
│   │   └── page.tsx          # Resumen principal (Dashboard Overview)
│   ├── globals.css           # Estilos base y directivas de Tailwind CSS
│   ├── layout.tsx            # Plantilla principal y configuración global
│   └── page.tsx              # Página inicial o redirección por defecto
│
├── components/               # Componentes de Interfaz (UI) reutilizables
│   └── ui/                   # Componentes base instalados (Shadcn UI)
│
├── lib/                      # Librerías, utilidades y conexiones
│   └── supabase/             # Cliente oficial de conexión hacia Supabase
│       ├── client.ts         # Cliente Supabase para el navegador (Frontend)
│       └── server.ts         # Cliente Supabase para el servidor (Backend)
│
├── supabase/                 # Configuración del Backend as a Service (BaaS)
│   └── migrations/           # Esquemas DDL y tablas de la base de datos PostgreSQL
│
├── public/                   # Archivos estáticos directos al cliente (Imágenes, Íconos)
│
├── package.json              # Lista de dependencias (Next.js, Tailwind, Supabase)
├── tailwind.config.ts        # Configuración del motor de estilos Tailwind CSS
└── .env.local                # Variables de entorno secretas (Claves, SMTP, URLs)
```

---

## 4. Diagramas de Casos de Uso

Los diagramas de casos de uso muestran las interacciones principales que tiene cada actor (usuario) con el sistema, definiendo qué operaciones pueden realizar según su rol.

### 4.1. Actor: Administrador

```mermaid
graph LR
    %% Actor
    Admin([Administrador])
    
    %% Casos de Uso del Administrador
    subgraph Sistema GestCom
        UC1(Autenticarse en el Sistema)
        UC2(Gestionar Residentes y Unidades)
        UC3(Registrar Gastos y Calcular Alícuotas)
        UC4(Verificar y Aprobar Pagos)
        UC5(Publicar Anuncios Generales)
        UC6(Aprobar/Rechazar Reservas de Áreas)
        UC7(Cambiar Estado de Incidencias)
        UC8(Configurar Información del Condominio)
    end
    
    %% Relaciones
    Admin --- UC1
    Admin --- UC2
    Admin --- UC3
    Admin --- UC4
    Admin --- UC5
    Admin --- UC6
    Admin --- UC7
    Admin --- UC8
```

### 4.2. Actor: Residente

```mermaid
graph LR
    %% Actor
    Residente([Residente])
    
    %% Casos de Uso del Residente
    subgraph Sistema GestCom
        UCR1(Autenticarse en el Sistema)
        UCR2(Consultar Gastos y Deudas)
        UCR3(Reportar Pago Realizado)
        UCR4(Ver Cartelera de Anuncios)
        UCR5(Reservar Áreas Comunes)
        UCR6(Reportar una Incidencia)
        UCR7(Actualizar Perfil Propio)
    end
    
    %% Relaciones
    Residente --- UCR1
    Residente --- UCR2
    Residente --- UCR3
    Residente --- UCR4
    Residente --- UCR5
    Residente --- UCR6
    Residente --- UCR7
```
