/* Modelo entidad-relación de la encuesta "¿Por qué capamos clase?" */
window.MODELO = {
  grupos: {
    academico: { nombre: "Académico", desc: "Facultades y programas" },
    centro:    { nombre: "Respuesta", desc: "Tabla central: una fila por encuestado" },
    unica:     { nombre: "Catálogo de selección única", desc: "Opciones de preguntas con una sola respuesta" },
    multiple:  { nombre: "Catálogo de selección múltiple", desc: "Opciones de preguntas donde se marcan varias" },
    puente:    { nombre: "Tabla puente (N:M)", desc: "Une cada respuesta con las opciones que marcó" }
  },

  preguntas: [
    { id: "P1",  texto: "Aceptación del aviso de privacidad (consentimiento informado).", tipo: "Obligatoria · única", destino: [["respuesta", "acepta_consentimiento"]] },
    { id: "P2",  texto: "¿En qué semestre se encuentra la mayoría de su carga académica?", tipo: "Obligatoria · numérica 1–10", destino: [["respuesta", "semestre"]] },
    { id: "P3",  texto: "¿A qué facultad pertenece?", tipo: "Obligatoria · única (12 opciones)", destino: [["facultad", "id"], ["programa", "facultad_id"]] },
    { id: "P4",  texto: "¿Cuál es su programa base?", tipo: "Obligatoria · única, depende de la facultad", destino: [["programa", "id"], ["respuesta", "programa_base_id"]] },
    { id: "P5",  texto: "Si hace doble programa, seleccione la otra carrera de la que hace parte.", tipo: "Opcional · única", destino: [["respuesta", "programa_doble_id"]] },
    { id: "P6",  texto: "¿Cuál es su promedio acumulado?", tipo: "Opcional · decimal 0.00–5.00", destino: [["respuesta", "promedio"]] },
    { id: "P7",  texto: "Durante un semestre académico, ¿con qué frecuencia falta a clase voluntariamente (\"capa clase\")?", tipo: "Obligatoria · única ordinal", destino: [["frecuencia", "id"], ["respuesta", "frecuencia_id"]] },
    { id: "P8",  texto: "¿Cuál es el motivo principal por el cual decide no asistir a una clase?", tipo: "Selección múltiple + Otros + N/A", destino: [["motivo", "id"], ["respuesta_motivo", "motivo_id"], ["respuesta_motivo", "texto_otro"]] },
    { id: "P9",  texto: "¿En qué tipo de horario o día tiende a faltar con mayor frecuencia?", tipo: "Obligatoria · única", destino: [["horario", "id"], ["respuesta", "horario_id"]] },
    { id: "P10", texto: "¿En qué tipo de asignatura es más probable que decida no asistir?", tipo: "Selección múltiple + Otros + N/A", destino: [["tipo_asignatura", "id"], ["respuesta_tipo_asignatura", "tipo_asignatura_id"], ["respuesta_tipo_asignatura", "texto_otro"]] },
    { id: "P11", texto: "Cuando decide faltar a una clase, ¿a qué actividad dedica principalmente ese tiempo?", tipo: "Selección múltiple + Otros + N/A", destino: [["actividad", "id"], ["respuesta_actividad", "actividad_id"], ["respuesta_actividad", "texto_otro"]] },
    { id: "P12", texto: "En su experiencia, ¿cómo impacta la inasistencia voluntaria su rendimiento académico?", tipo: "Obligatoria · única", destino: [["impacto_rendimiento", "id"], ["respuesta", "impacto_rendimiento_id"]] },
    { id: "P13", texto: "¿Qué impacto psicológico o percepción del entorno se manifiesta con mayor frecuencia después de evadir una jornada lectiva?", tipo: "Obligatoria · única", destino: [["impacto_psicologico", "id"], ["respuesta", "impacto_psicologico_id"]] },
    { id: "P14", texto: "¿Cuál de los siguientes factores disminuye su deseo de faltar a clase?", tipo: "Obligatoria · selección múltiple + Otros", destino: [["factor", "id"], ["respuesta_factor", "factor_id"], ["respuesta_factor", "texto_otro"]] },
    { id: "P15", texto: "La disponibilidad del material didáctico en la plataforma virtual hace que su probabilidad de faltar a clase…", tipo: "Obligatoria · Likert 1–5", destino: [["respuesta", "material_virtual"]] }
  ],

  tablas: [
    {
      nombre: "facultad", grupo: "academico", x: -40, y: 20,
      desc: "Catálogo de las 12 facultades de la universidad.",
      fields: [
        { n: "id", t: "INT", pk: true, ai: true },
        { n: "nombre", t: "VARCHAR(120)", nn: true, uq: true, c: "Nombre oficial" },
        { n: "nombre_corto", t: "VARCHAR(40)", nn: true, uq: true, c: "Etiqueta corta usada en el análisis" }
      ],
      semillas: ["Facultad de Ingeniería", "Facultad de Comunicación", "Escuela Internacional de Ciencias Económicas y Administrativas (EICEA)", "Facultad de Ciencias del Comportamiento", "Facultad de Medicina", "Facultad de Estudios Jurídicos, Políticos e Internacionales", "Facultad de Filosofía y Ciencias Humanas", "Facultad de Ciencias de la Vida y el Bienestar", "Facultad de Educación", "Escuela de Gobierno", "Instituto Forum", "Instituto Latinoamericano de la Familia (ILFARUS)"]
    },
    {
      nombre: "programa", grupo: "academico", x: 300, y: 0,
      desc: "Programas académicos. Cada programa pertenece a una facultad, así que la facultad de quien responde se obtiene desde aquí.",
      fields: [
        { n: "id", t: "INT", pk: true, ai: true },
        { n: "facultad_id", t: "INT", fk: "facultad", nn: true },
        { n: "nombre", t: "VARCHAR(150)", nn: true, c: "Único dentro de su facultad" },
        { n: "nivel", t: "VARCHAR(20)", nn: true, def: "'Pregrado'", chk: "nivel IN ('Pregrado','Especializacion')" }
      ],
      semillas: ["Ingeniería: Ciencia de Datos · Ingeniería Industrial · Ingeniería Informática · Ingeniería Mecánica · Ingeniería Química · Ingeniería de Diseño e Innovación", "Comunicación: Comunicación Corporativa · Comunicación Audiovisual y Multimedios · Comunicación Social y Periodismo · Esp. en Diseño y Desarrollo de Videojuegos", "EICEA: Administración de Empresas · Administración de Mercadeo y Logística Internacionales · Administración de Negocios Internacionales · Economía y Finanzas Internacionales", "Ciencias del Comportamiento: Psicología", "Medicina: Medicina · Esp. en Farmacología Clínica", "Jurídicas y Políticas: Derecho · Relaciones Internacionales", "Filosofía y Ciencias Humanas: Filosofía"],
      notaSemillas: "Programas que aparecen en las 56 respuestas."
    },
    {
      nombre: "frecuencia", grupo: "unica", x: 300, y: 205,
      desc: "Frecuencia con la que el estudiante falta a clase voluntariamente. Es ordinal: el id es el código 1–4.",
      fields: [
        { n: "id", t: "INT", pk: true, chk: "id BETWEEN 1 AND 4", c: "Código ordinal" },
        { n: "descripcion", t: "VARCHAR(200)", nn: true, uq: true },
        { n: "etiqueta", t: "VARCHAR(60)", nn: true }
      ],
      semillas: ["1 · Nunca o casi nunca (menos de 1 vez por semestre)", "2 · Ocasionalmente (1 a 2 veces al mes)", "3 · Frecuentemente (1 a 2 veces por semana)", "4 · Muy frecuentemente (3 o más veces por semana)"]
    },
    {
      nombre: "horario", grupo: "unica", x: 300, y: 375,
      desc: "Horario o día en el que el estudiante tiende a faltar más.",
      fields: [
        { n: "id", t: "INT", pk: true },
        { n: "descripcion", t: "VARCHAR(200)", nn: true, uq: true },
        { n: "etiqueta", t: "VARCHAR(60)", nn: true },
        { n: "es_na", t: "BOOLEAN", nn: true, def: "FALSE", c: "TRUE en la opción N/A" }
      ],
      semillas: ["Primeras horas de la mañana (7:00 – 9:00 a. m.)", "Horarios del mediodía o bloques intermedios", "Últimas horas de la tarde / noche", "Días viernes o adyacentes a fines de semana / festivos", "No depende del horario o día, depende únicamente de la materia", "N/A: No aplica"]
    },
    {
      nombre: "impacto_rendimiento", grupo: "unica", x: 300, y: 570,
      desc: "Cómo percibe el estudiante que faltar afecta su rendimiento académico.",
      fields: [
        { n: "id", t: "INT", pk: true },
        { n: "descripcion", t: "VARCHAR(200)", nn: true, uq: true },
        { n: "etiqueta", t: "VARCHAR(60)", nn: true },
        { n: "es_na", t: "BOOLEAN", nn: true, def: "FALSE", c: "TRUE en la opción N/A" }
      ],
      semillas: ["No me afecta en absoluto; mantengo mis calificaciones esperadas", "Me afecta levemente, pero lo logro compensar estudiando por mi cuenta", "Me afecta negativamente; perjudica mis notas o comprensión de los temas", "Depende de la exigencia de la materia", "N/A: No aplica"]
    },
    {
      nombre: "impacto_psicologico", grupo: "unica", x: 300, y: 765,
      desc: "Impacto psicológico o percepción más frecuente después de faltar.",
      fields: [
        { n: "id", t: "INT", pk: true },
        { n: "descripcion", t: "VARCHAR(200)", nn: true, uq: true },
        { n: "etiqueta", t: "VARCHAR(60)", nn: true },
        { n: "es_na", t: "BOOLEAN", nn: true, def: "FALSE", c: "TRUE en la opción N/A" }
      ],
      semillas: ["Alivio o tranquilidad por haber aprovechado el tiempo en otra prioridad", "Preocupación o culpa por haberme perdido información importante", "Indiferencia", "Satisfacción por el descanso o el espacio personal obtenido", "Presión o estrés por la acumulación posterior de deberes", "Aislamiento o desconexión respecto a las dinámicas del grupo", "Temor a que las autoridades académicas notifiquen a mis tutores o familiares", "Incomodidad o tensión al regresar frente al docente", "N/A: No aplica"]
    },
    {
      nombre: "respuesta", grupo: "centro", x: 720, y: 230,
      desc: "Una fila por cada encuestado anónimo. Guarda las respuestas directas y apunta a los catálogos de selección única.",
      fields: [
        { n: "id", t: "INT", pk: true, ai: true },
        { n: "fecha_registro", t: "DATETIME", nn: true, c: "Marca temporal de Google Forms" },
        { n: "acepta_consentimiento", t: "BOOLEAN", nn: true, chk: "= TRUE", q: "P1" },
        { n: "semestre", t: "INT", nn: true, chk: "BETWEEN 1 AND 10", c: "10 = 10 o más", q: "P2" },
        { n: "programa_base_id", t: "INT", fk: "programa", nn: true, q: "P4" },
        { n: "programa_doble_id", t: "INT", fk: "programa", chk: "<> programa_base_id", c: "NULL si no hace doble programa", q: "P5" },
        { n: "promedio", t: "DECIMAL(3,2)", chk: "> 0 AND <= 5", c: "Opcional", q: "P6" },
        { n: "frecuencia_id", t: "INT", fk: "frecuencia", nn: true, q: "P7" },
        { n: "horario_id", t: "INT", fk: "horario", nn: true, q: "P9" },
        { n: "impacto_rendimiento_id", t: "INT", fk: "impacto_rendimiento", nn: true, q: "P12" },
        { n: "impacto_psicologico_id", t: "INT", fk: "impacto_psicologico", nn: true, q: "P13" },
        { n: "material_virtual", t: "INT", nn: true, chk: "BETWEEN 1 AND 5", c: "Likert: 1 disminuye mucho · 5 aumenta mucho", q: "P15" }
      ]
    },
    {
      nombre: "respuesta_motivo", grupo: "puente", x: 1140, y: 40,
      desc: "Motivos que marcó cada encuestado. Una fila por motivo marcado.",
      fields: [
        { n: "respuesta_id", t: "INT", pk: true, fk: "respuesta" },
        { n: "motivo_id", t: "INT", pk: true, fk: "motivo" },
        { n: "texto_otro", t: "VARCHAR(255)", c: "Solo si la opción es «Otros»" }
      ]
    },
    {
      nombre: "motivo", grupo: "multiple", x: 1460, y: 14,
      desc: "Opciones de la pregunta sobre el motivo principal para no asistir.",
      fields: [
        { n: "id", t: "INT", pk: true },
        { n: "descripcion", t: "VARCHAR(200)", nn: true, uq: true },
        { n: "etiqueta", t: "VARCHAR(60)", nn: true },
        { n: "es_otro", t: "BOOLEAN", nn: true, def: "FALSE", c: "Habilita texto_otro" },
        { n: "es_na", t: "BOOLEAN", nn: true, def: "FALSE", c: "N/A es excluyente" }
      ],
      semillas: ["Carga académica excesiva / necesidad de estudiar o hacer trabajos para otra materia", "Desinterés por la asignatura o la metodología del docente", "Cansancio, necesidad de descanso o salud mental", "Compromisos personales, laborales o de movilidad", "Actividades de ocio o sociales", "Otros", "N/A: No aplica"]
    },
    {
      nombre: "respuesta_tipo_asignatura", grupo: "puente", x: 1140, y: 270,
      desc: "Tipos de asignatura que marcó cada encuestado.",
      fields: [
        { n: "respuesta_id", t: "INT", pk: true, fk: "respuesta" },
        { n: "tipo_asignatura_id", t: "INT", pk: true, fk: "tipo_asignatura" },
        { n: "texto_otro", t: "VARCHAR(255)", c: "Solo si la opción es «Otros»" }
      ]
    },
    {
      nombre: "tipo_asignatura", grupo: "multiple", x: 1460, y: 244,
      desc: "Opciones de la pregunta sobre el tipo de asignatura en que es más probable faltar.",
      fields: [
        { n: "id", t: "INT", pk: true },
        { n: "descripcion", t: "VARCHAR(200)", nn: true, uq: true },
        { n: "etiqueta", t: "VARCHAR(60)", nn: true },
        { n: "es_otro", t: "BOOLEAN", nn: true, def: "FALSE", c: "Habilita texto_otro" },
        { n: "es_na", t: "BOOLEAN", nn: true, def: "FALSE", c: "N/A es excluyente" }
      ],
      semillas: ["Clases teóricas magistrales con muchos estudiantes", "Materias complementarias o electivas fuera de la especialidad", "Asignaturas donde el profesor no controla la asistencia", "Clases cuyo contenido se puede aprender solo con lecturas/diapositivas", "Me resulta indiferente el tipo de asignatura", "Otros", "N/A: No aplica"]
    },
    {
      nombre: "respuesta_actividad", grupo: "puente", x: 1140, y: 500,
      desc: "Actividades a las que cada encuestado dedica el tiempo cuando falta.",
      fields: [
        { n: "respuesta_id", t: "INT", pk: true, fk: "respuesta" },
        { n: "actividad_id", t: "INT", pk: true, fk: "actividad" },
        { n: "texto_otro", t: "VARCHAR(255)", c: "Solo si la opción es «Otros»" }
      ]
    },
    {
      nombre: "actividad", grupo: "multiple", x: 1460, y: 474,
      desc: "Opciones de la pregunta sobre el uso del tiempo cuando se falta a clase.",
      fields: [
        { n: "id", t: "INT", pk: true },
        { n: "descripcion", t: "VARCHAR(200)", nn: true, uq: true },
        { n: "etiqueta", t: "VARCHAR(60)", nn: true },
        { n: "es_otro", t: "BOOLEAN", nn: true, def: "FALSE", c: "Habilita texto_otro" },
        { n: "es_na", t: "BOOLEAN", nn: true, def: "FALSE", c: "N/A es excluyente" }
      ],
      semillas: ["Adelantar tareas, proyectos o estudiar para exámenes", "Dormir o descansar en casa/campus", "Compartir con amigos o compañeros", "Entretenimiento personal (redes sociales, series, videojuegos)", "Trámites personales o trabajo", "Otros", "N/A: No aplica"]
    },
    {
      nombre: "respuesta_factor", grupo: "puente", x: 1140, y: 730,
      desc: "Factores que disminuyen el deseo de faltar, marcados por cada encuestado. Toda respuesta tiene al menos una fila aquí.",
      fields: [
        { n: "respuesta_id", t: "INT", pk: true, fk: "respuesta" },
        { n: "factor_id", t: "INT", pk: true, fk: "factor" },
        { n: "texto_otro", t: "VARCHAR(255)", c: "Solo si la opción es «Otros»" }
      ]
    },
    {
      nombre: "factor", grupo: "multiple", x: 1460, y: 704,
      desc: "Opciones de la pregunta sobre lo que disminuye el deseo de faltar. No tiene N/A.",
      fields: [
        { n: "id", t: "INT", pk: true },
        { n: "descripcion", t: "VARCHAR(200)", nn: true, uq: true },
        { n: "etiqueta", t: "VARCHAR(60)", nn: true },
        { n: "es_otro", t: "BOOLEAN", nn: true, def: "FALSE", c: "Habilita texto_otro" }
      ],
      semillas: ["Que la asistencia sea obligatoria y afecte directamente la nota", "Que las clases sean dinámicas, interactivas y aporten valor que no está en los libros", "Evaluaciones continuas, quices o talleres no anunciados", "El valor económico de la matrícula / costo del crédito", "El sentido de compromiso ético y responsabilidad", "Profesor/a es atractivo/a", "Profesor/a es amable", "Otros"]
    }
  ],

  /* de = tabla con la FK (lado "muchos"), a = tabla referenciada (lado "uno").
     cardDe / cardA: zmany = cero o muchos, many = uno o muchos, one = exactamente uno, zone = cero o uno */
  relaciones: [
    { de: ["programa", "facultad_id"], a: ["facultad", "id"], cardDe: "zmany", cardA: "one", texto: "Una facultad ofrece cero o muchos programas; cada programa pertenece a una sola facultad." },
    { de: ["respuesta", "programa_base_id"], a: ["programa", "id"], cardDe: "zmany", cardA: "one", texto: "Cada respuesta tiene exactamente un programa base." },
    { de: ["respuesta", "programa_doble_id"], a: ["programa", "id"], cardDe: "zmany", cardA: "zone", texto: "Cada respuesta puede tener o no un segundo programa (doble programa)." },
    { de: ["respuesta", "frecuencia_id"], a: ["frecuencia", "id"], cardDe: "zmany", cardA: "one", texto: "Cada respuesta tiene exactamente una frecuencia de ausentismo." },
    { de: ["respuesta", "horario_id"], a: ["horario", "id"], cardDe: "zmany", cardA: "one", texto: "Cada respuesta indica exactamente un horario." },
    { de: ["respuesta", "impacto_rendimiento_id"], a: ["impacto_rendimiento", "id"], cardDe: "zmany", cardA: "one", texto: "Cada respuesta indica exactamente un impacto en el rendimiento." },
    { de: ["respuesta", "impacto_psicologico_id"], a: ["impacto_psicologico", "id"], cardDe: "zmany", cardA: "one", texto: "Cada respuesta indica exactamente un impacto psicológico." },
    { de: ["respuesta_motivo", "respuesta_id"], a: ["respuesta", "id"], cardDe: "zmany", cardA: "one", texto: "Una respuesta marca cero o muchos motivos (N:M con motivo)." },
    { de: ["respuesta_motivo", "motivo_id"], a: ["motivo", "id"], cardDe: "zmany", cardA: "one", texto: "Un motivo puede ser elegido en muchas respuestas." },
    { de: ["respuesta_tipo_asignatura", "respuesta_id"], a: ["respuesta", "id"], cardDe: "zmany", cardA: "one", texto: "Una respuesta marca cero o muchos tipos de asignatura." },
    { de: ["respuesta_tipo_asignatura", "tipo_asignatura_id"], a: ["tipo_asignatura", "id"], cardDe: "zmany", cardA: "one", texto: "Un tipo de asignatura puede ser elegido en muchas respuestas." },
    { de: ["respuesta_actividad", "respuesta_id"], a: ["respuesta", "id"], cardDe: "zmany", cardA: "one", texto: "Una respuesta marca cero o muchas actividades." },
    { de: ["respuesta_actividad", "actividad_id"], a: ["actividad", "id"], cardDe: "zmany", cardA: "one", texto: "Una actividad puede ser elegida en muchas respuestas." },
    { de: ["respuesta_factor", "respuesta_id"], a: ["respuesta", "id"], cardDe: "many", cardA: "one", texto: "Una respuesta marca uno o muchos factores (la pregunta es obligatoria)." },
    { de: ["respuesta_factor", "factor_id"], a: ["factor", "id"], cardDe: "zmany", cardA: "one", texto: "Un factor puede ser elegido en muchas respuestas." }
  ],

  reglas: [
    "La opción N/A no puede combinarse con otras opciones en las tablas puente.",
    "texto_otro solo se llena cuando la opción marcada es «Otros».",
    "Cada respuesta debe tener al menos una fila en respuesta_factor.",
    "La facultad de una respuesta se obtiene con programa.facultad_id."
  ]
};
