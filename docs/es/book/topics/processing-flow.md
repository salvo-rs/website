# Flujo de procesamiento

El "servicio" primero convierte la solicitud en la "respuesta" de salvo y luego ingresa a la etapa de coincidencia de enrutamiento.

## Etapa de coincidencia de ruta

La coincidencia de rutas se realiza en el orden en que se agregan y los filtros se ejecutan de afuera hacia adentro y de arriba a abajo. Si algún filtro no se ejecuta, se considerará una coincidencia fallida.

Durante el proceso de coincidencia, se debe proporcionar información de ruta a la solicitud a medida que avanza la coincidencia, una vez que el filtro de ruta coincida correctamente, consumirá la ruta con la que coincidió cuando se consuman todas las rutas y no haya filtrado en las coincidentes. enlace, si la coincidencia del enrutador falla y el último "enrutador" en el enlace actual tiene un "objetivo" "controlador", entonces la coincidencia es exitosa, la fase de coincidencia finaliza y se recopila e ingresa el "controlador" que coincide con todos los enlaces coincidentes. en la fase de ejecución.

Si la ruta no se consume por completo y el filtro en el enlace no informa un error, pero no hay más subrutas que puedan seguir coincidiendo, se considera que la coincidencia del enlace actual falla y se ingresa la siguiente ruta coincidente. .

Todas las rutas han coincidido. Si no hay éxito, se ingresará a la fase de captura de errores.

## Fase de ejecución del controlador

`Handler` se ejecuta en secuencia de acuerdo con la lista de `Handler` recopilada en la fase de coincidencia. Durante el proceso de ejecución, el middleware anterior puede llamar a `ctrl::call_next()` para permitir que el middleware posterior se ejecute primero y luego ejecute el suyo propio. lógica Si se ejecuta Si se produce un error de código de estado o una redirección durante el proceso, el `Handler` posterior ya no se ejecutará. En este momento, si el código de estado es un error y el `Cuerpo` de `Respuesta` no está configurado. o es `ResBody::Error`, luego ingrese a la fase de captura de errores; de lo contrario, omita la fase de captura.

## Fase de captura de errores

`Catcher` es un tipo utilizado para manejar errores. También puede agregar middleware (aros). Los errores pasarán por todos los `Handler` en `Catcher` por turno. Si un `Handler` ya ha manejado el error, no querrás hacerlo. para usar el `Handler` posterior ` Para continuar la ejecución, puede omitir el `Handler` posterior a través de `ctrl.skip_rest()` y finalizar la fase de captura directamente.

`Catcher` debe contener un `Handler` de forma predeterminada para el manejo de errores predeterminado. El valor predeterminado es `DeaultGoal`, también puede personalizar completamente su propio `Handler` como la implementación predeterminada del manejo de errores. Se basará en los requisitos del encabezado de la solicitud. `content-type` muestra información de error en el formato correspondiente y admite cuatro formatos de visualización: `json`, `xml`, `text`, `html` también proporciona algunas configuraciones de visualización, por ejemplo, muestra el formato html. De forma predeterminada, se mostrarán los enlaces relacionados con Salvo; puede llamar a `DefaultGoal::footer` o `DefaultGoal::with_footer` para configurarlo como el pie de página personalizado que desee.

El `Servicio` convertirá la `Respuesta` de salvo en el tipo `Respuesta` de Hyper y finalmente la devolverá al navegador y a otros clientes.