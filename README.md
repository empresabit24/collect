<p style="text-align: center">
  <a href="https://bit24.pe/" target="blank">
    <img
      src="https://bit24.pe/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo.36dbb0f3.png&w=3840&q=75"
      width="200"
      alt="Bit24 Logo"
    />
  </a>
</p>

# API del Módulo de Cobranza

Esta API contiene todos los endpoints referentes al Módulo de Cobranza.

## Requisitos:

- Node v20.11.0
- TypeORM v0.3.19
- Nestjs v10.2.1
- Git (cualquier versión)
- Postman (cualquier versión)

## Levantar proyecto:

1. Clonar el repositorio desde GitHub

```bash
git clone <URL_PROJECT>
```

2. Para instalar todas las dependencias, posiciónate en la raíz del proyecto y ejecuta:
   ```npm install```

3. Agregar el archivo ```.env``` en la raíz el proyecto.

4. Poner en marcha el servidor del proyecto con el comando:
   ```npm run start:dev```

## Visualizar documentación en SWAGGER.

En el navegador colocar la dirección sobre la que está levantando el proyecto, en este caso localhost:3000 y añadir “/api”, quedando así: **localhost:3500/api**. Con ello se podrá visualizar todos los endpoints realizados con su respectiva documentación.

## Visualizar en POSTMAN.

En el cliente postman, podrás ejecutar las pruebas respectivas a la API, bajo sus diferentes endpoints que contiene. En este caso procurar usar localhost:3500 y lo que sigue del resto de la ruta, ya no se debería adicionar “/api”. Ejemplo: **localhost:3500/collect**. 
