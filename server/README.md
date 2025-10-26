# MongoDB CRUD – Biblioteca

## Requisitos

- **Node.js** v25.0.0 o superior  
- **MongoDB** 6.2+ corriendo localmente o accesible por red  
- Archivo `.env` (ver `.env.template`) con al menos las variables:

MONGO_URI=mongodb://localhost:27017
DB_NAME=biblioteca
PORT=3000

---

## Ejecución

Instalar dependencias:
```npm install```

Ejecutar en modo desarrollo (reinicio automático):
```npm run watch```


La aplicación escuchará en http://localhost:<PORT>.

---

## Estructura del proyecto

src/
├── db/
│ ├── setup.db.js # Conexión y configuración inicial de la base de datos
│ └── ... # Acceso a colecciones y operaciones CRUD
├── routes/ # Endpoints de REST API
│ ├── app.router.js
│ ├── libro.router.js 
│ └── ...
├── middleware/
│ └── errorHandler.js 
├── dto/
│ └── ... # Validación de entrada con Joi
├── utils/
│ └── ... 
└── app.js 

---

## Dependencias principales

| Paquete | Uso |
|----------|-----|
| **express** | Framework HTTP para definir rutas y controladores. |
| **mongodb** | Driver oficial para conectar y realizar operaciones con MongoDB. |
| **dotenv** | Carga de variables de entorno desde `.env`. |
| **joi** | Validación de datos en las peticiones antes de llegar a la base de datos. |
| **http-errors** | Creación y manejo uniforme de errores HTTP. |
| **nodemon** | Reinicio automático del servidor (desarrollo) |

