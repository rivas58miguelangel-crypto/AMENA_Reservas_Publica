AMENA Reservas 260512f - versión fuente completa modificada

Base usada:
Amena_Reservas_06_260429d-20260512T041225Z-3-001(1).zip

Cambios aplicados dentro de src/App.tsx:
1. Se conserva el flujo previo a la reserva.
2. Se conserva la pantalla Tu siguiente paso con AMENA.
3. Se conservan Instrucciones Próximos Pasos.
4. Se conserva Comentarios del Interesado con email, bloques, adjuntos y Procesar análisis IA.
5. Se conserva Conversa con agente digital / Marta.
6. Se conserva Agenda cita presencial para proyecto u oficinas de ventas.
7. Se elimina del menú principal la opción de agendar llamada telefónica, por ser redundante con la nueva estrategia de Acompañamiento AMENA.
8. Se agrega una nueva pantalla Acompañamiento AMENA con:
   - explicación del acceso privado,
   - Hablar ahora con Marta,
   - Agendar conversación con Marta si no desea conversar en ese momento,
   - Acceso flexible a Marta cuando el usuario quiera,
   - aclaración de acceso por correo electrónico usando ID de reserva y clave privada.

Nota técnica:
El paquete incluye node_modules tal como fue solicitado. No se eliminaron carpetas del proyecto.
No pude ejecutar build en el entorno Linux de ChatGPT porque node_modules viene de un entorno Windows y falta la dependencia opcional nativa de Rollup para Linux. En Windows debería correr con los node_modules incluidos; si npm avisa problemas, ejecutar npm install desde la carpeta del proyecto.
