@echo off
REM Reorganiza proyecto Tenerife Rent Car para despliegue en Vercel

REM Copiar archivos clave a la raíz
copy public\index.html index.html
copy src\styles.css styles.css
copy src\script.js script.js

REM Copiar carpeta de imágenes
xcopy public\img img /E /I /Y

REM Confirmación
echo Proyecto reestructurado. Verifica que index.html tenga rutas como:
echo <link rel="stylesheet" href="styles.css" />
echo <script src="script.js"></script>
echo <img src="img/fiesta.jpg" />
pause

