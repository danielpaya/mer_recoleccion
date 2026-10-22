/* Modelo entidad-relación de la encuesta "¿Por qué capamos clase?"
   Entidades del dominio: el estudiante, lo que estudia y su comportamiento de inasistencia. */
window.MODELO = {
  grupos: {
    academico: { nombre: "Estudiante y programa", desc: "Quién responde y qué estudia" },
    centro:    { nombre: "Inasistencia", desc: "El comportamiento de faltar a clase de cada estudiante" },
    multiple:  { nombre: "Catálogo", desc: "Conceptos que se relacionan con la inasistencia o con el estudiante" },
    puente:    { nombre: "Relación N:M", desc: "Asociaciones de muchos a muchos" }
  },

  preguntas: [
    { id: "P1",  texto: "Aceptación del aviso de privacidad (consentimiento informado).", tipo: "Atributo del estudiante", destino: [["estudiante", "acepta_consentimiento"]] },
    { id: "P2",  texto: "¿En qué semestre se encuentra la mayoría de su carga académica?", tipo: "Atributo del estudiante", destino: [["estudiante", "semestre"]] },
    { id: "P3",  texto: "¿A qué facultad pertenece?", tipo: "Entidad facultad (vía programa)", destino: [["facultad", "id"], ["programa", "facultad_id"]] },
    { id: "P4",  texto: "¿Cuál es su programa base?", tipo: "Matrícula tipo «base»", destino: [["matricula", "programa_id"], ["matricula", "tipo"]] },
    { id: "P5",  texto: "Si hace doble programa, seleccione la otra carrera.", tipo: "Matrícula tipo «doble» (opcional)", destino: [["matricula", "programa_id"], ["matricula", "tipo"]] },
    { id: "P6",  texto: "¿Cuál es su promedio acumulado?", tipo: "Atributo del estudiante (opcional)", destino: [["estudiante", "promedio"]] },
    { id: "P7",  texto: "¿Con qué frecuencia falta a clase voluntariamente?", tipo: "Atributo de la inasistencia", destino: [["inasistencia", "frecuencia"]] },
    { id: "P8",  texto: "¿Cuál es el motivo principal por el cual decide no asistir a una clase?", tipo: "Inasistencia N:M motivo", destino: [["motivo", "id"], ["inasistencia_motivo", "motivo_id"]] },
    { id: "P9",  texto: "¿En qué tipo de horario o día tiende a faltar con mayor frecuencia?", tipo: "Atributo de la inasistencia", destino: [["inasistencia", "horario"]] },
    { id: "P10", texto: "¿En qué tipo de asignatura es más probable que decida no asistir?", tipo: "Inasistencia N:M tipo de asignatura", destino: [["tipo_asignatura", "id"], ["inasistencia_asignatura", "tipo_asignatura_id"]] },
    { id: "P11", texto: "Cuando decide faltar, ¿a qué actividad dedica principalmente ese tiempo?", tipo: "Inasistencia N:M actividad", destino: [["actividad", "id"], ["inasistencia_actividad", "actividad_id"]] },
    { id: "P12", texto: "¿Cómo impacta la inasistencia voluntaria su rendimiento académico?", tipo: "Atributo de la inasistencia", destino: [["inasistencia", "impacto_rendimiento"]] },
    { id: "P13", texto: "¿Qué impacto psicológico se manifiesta con mayor frecuencia después de faltar?", tipo: "Atributo de la inasistencia", destino: [["inasistencia", "impacto_psicologico"]] },
    { id: "P14", texto: "¿Cuál de los siguientes factores disminuye su deseo de faltar a clase?", tipo: "Estudiante N:M factor de asistencia", destino: [["factor_asistencia", "id"], ["estudiante_factor", "factor_id"]] },
    { id: "P15", texto: "La disponibilidad de material en la plataforma virtual hace que su probabilidad de faltar…", tipo: "Atributo de la inasistencia (Likert 1–5)", destino: [["inasistencia", "efecto_material_virtual"]] }
  ],

  tablas: [
    {
      nombre: "facultad", grupo: "academico", x: 0, y: 0,
      desc: "Facultades de la universidad. Una facultad ofrece varios programas.",
      fields: [
        { n: "id", t: "INT", pk: true, ai: true },
        { n: "nombre", t: "VARCHAR(120)", nn: true, uq: true }
      ],
      semillas: ["Ingeniería", "Comunicación", "EICEA", "Ciencias del Comportamiento", "Medicina", "Estudios Jurídicos, Políticos e Internacionales", "Filosofía y Ciencias Humanas", "Ciencias de la Vida y el Bienestar", "Educación", "Escuela de Gobierno", "Instituto Forum", "ILFARUS"]
    },
    {
      nombre: "programa", grupo: "academico", x: 330, y: 0,
      desc: "Carrera o programa académico, adscrito a una facultad.",
      fields: [
        { n: "id", t: "INT", pk: true, ai: true },
        { n: "facultad_id", t: "INT", fk: "facultad", nn: true },
        { n: "nombre", t: "VARCHAR(150)", nn: true },
        { n: "nivel", t: "ENUM('Pregrado','Especializacion')", nn: true, def: "'Pregrado'" }
      ]
    },
    {
      nombre: "matricula", grupo: "puente", x: 330, y: 230,
      desc: "Programas que cursa el estudiante. Uno es el programa base y, si hace doble programa, hay una segunda fila de tipo «doble».",
      fields: [
        { n: "estudiante_id", t: "INT", pk: true, fk: "estudiante" },
        { n: "programa_id", t: "INT", pk: true, fk: "programa" },
        { n: "tipo", t: "ENUM('base','doble')", nn: true, c: "Un solo programa base por estudiante" }
      ]
    },
    {
      nombre: "estudiante", grupo: "academico", x: 690, y: 190,
      desc: "Estudiante que respondió la encuesta, de forma anónima.",
      fields: [
        { n: "id", t: "INT", pk: true, ai: true },
        { n: "fecha_encuesta", t: "DATETIME", nn: true, c: "Marca temporal de Google Forms" },
        { n: "acepta_consentimiento", t: "BOOLEAN", nn: true, chk: "= TRUE", q: "P1" },
        { n: "semestre", t: "TINYINT", nn: true, chk: "BETWEEN 1 AND 10", q: "P2" },
        { n: "promedio", t: "DECIMAL(3,2)", chk: "BETWEEN 0 AND 5", c: "Opcional", q: "P6" }
      ]
    },
    {
      nombre: "estudiante_factor", grupo: "puente", x: 330, y: 470,
      desc: "Factores que motivan al estudiante a asistir. Cada estudiante marca al menos uno.",
      fields: [
        { n: "estudiante_id", t: "INT", pk: true, fk: "estudiante" },
        { n: "factor_id", t: "INT", pk: true, fk: "factor_asistencia" },
        { n: "detalle", t: "VARCHAR(255)", c: "Texto si eligió «Otros»" }
      ]
    },
    {
      nombre: "factor_asistencia", grupo: "multiple", x: 0, y: 470,
      desc: "Condiciones que reducen las ganas de faltar a clase.",
      fields: [
        { n: "id", t: "INT", pk: true },
        { n: "descripcion", t: "VARCHAR(200)", nn: true, uq: true },
        { n: "es_otro", t: "BOOLEAN", nn: true, def: "FALSE" }
      ],
      semillas: ["Asistencia obligatoria que afecta la nota", "Clases dinámicas que aportan valor", "Quices o talleres no anunciados", "Costo de la matrícula", "Compromiso ético y responsabilidad", "Profesor/a atractivo/a", "Profesor/a amable", "Otros"]
    },
    {
      nombre: "inasistencia", grupo: "centro", x: 690, y: 470,
      desc: "Comportamiento de inasistencia voluntaria del estudiante: con qué frecuencia falta, cuándo y qué efecto le produce. Los campos de horario e impactos quedan en NULL si el estudiante no falta.",
      fields: [
        { n: "id", t: "INT", pk: true, ai: true },
        { n: "estudiante_id", t: "INT", fk: "estudiante", nn: true, uq: true },
        { n: "frecuencia", t: "ENUM('Nunca','Ocasional','Frecuente','Muy frecuente')", nn: true, q: "P7" },
        { n: "horario", t: "ENUM('Mañana temprano','Mediodía','Tarde/noche','Viernes o puentes','Depende de la materia')", c: "NULL si no aplica", q: "P9" },
        { n: "impacto_rendimiento", t: "ENUM('No afecta','Leve, compensa','Negativo','Depende de la materia')", c: "NULL si no aplica", q: "P12" },
        { n: "impacto_psicologico", t: "ENUM('Alivio','Culpa','Indiferencia','Satisfacción','Estrés','Desconexión','Temor a la familia','Incomodidad con el docente')", c: "NULL si no aplica", q: "P13" },
        { n: "efecto_material_virtual", t: "TINYINT", nn: true, chk: "BETWEEN 1 AND 5", c: "1 disminuye mucho · 5 aumenta mucho", q: "P15" }
      ]
    },
    {
      nombre: "inasistencia_motivo", grupo: "puente", x: 1080, y: 290,
      desc: "Motivos por los que el estudiante falta.",
      fields: [
        { n: "inasistencia_id", t: "INT", pk: true, fk: "inasistencia" },
        { n: "motivo_id", t: "INT", pk: true, fk: "motivo" },
        { n: "detalle", t: "VARCHAR(255)", c: "Texto si eligió «Otros»" }
      ]
    },
    {
      nombre: "motivo", grupo: "multiple", x: 1400, y: 290,
      desc: "Razones para no asistir a clase.",
      fields: [
        { n: "id", t: "INT", pk: true },
        { n: "descripcion", t: "VARCHAR(200)", nn: true, uq: true },
        { n: "es_otro", t: "BOOLEAN", nn: true, def: "FALSE" }
      ],
      semillas: ["Carga académica / trabajos de otra materia", "Desinterés por la asignatura o el docente", "Cansancio, descanso o salud mental", "Compromisos personales, laborales o de movilidad", "Ocio o actividades sociales", "Otros"]
    },
    {
      nombre: "inasistencia_asignatura", grupo: "puente", x: 1080, y: 490,
      desc: "Tipos de asignatura en los que el estudiante suele faltar.",
      fields: [
        { n: "inasistencia_id", t: "INT", pk: true, fk: "inasistencia" },
        { n: "tipo_asignatura_id", t: "INT", pk: true, fk: "tipo_asignatura" },
        { n: "detalle", t: "VARCHAR(255)", c: "Texto si eligió «Otros»" }
      ]
    },
    {
      nombre: "tipo_asignatura", grupo: "multiple", x: 1400, y: 490,
      desc: "Clases de asignatura según su modalidad o control.",
      fields: [
        { n: "id", t: "INT", pk: true },
        { n: "descripcion", t: "VARCHAR(200)", nn: true, uq: true },
        { n: "es_otro", t: "BOOLEAN", nn: true, def: "FALSE" }
      ],
      semillas: ["Magistrales con muchos estudiantes", "Electivas o fuera de la especialidad", "Sin control de asistencia", "Se pueden aprender solo con lecturas/diapositivas", "Indiferente", "Otros"]
    },
    {
      nombre: "inasistencia_actividad", grupo: "puente", x: 1080, y: 690,
      desc: "Actividades que realiza el estudiante en lugar de ir a clase.",
      fields: [
        { n: "inasistencia_id", t: "INT", pk: true, fk: "inasistencia" },
        { n: "actividad_id", t: "INT", pk: true, fk: "actividad" },
        { n: "detalle", t: "VARCHAR(255)", c: "Texto si eligió «Otros»" }
      ]
    },
    {
      nombre: "actividad", grupo: "multiple", x: 1400, y: 690,
      desc: "Usos del tiempo cuando se falta a clase.",
      fields: [
        { n: "id", t: "INT", pk: true },
        { n: "descripcion", t: "VARCHAR(200)", nn: true, uq: true },
        { n: "es_otro", t: "BOOLEAN", nn: true, def: "FALSE" }
      ],
      semillas: ["Adelantar tareas o estudiar", "Dormir o descansar", "Compartir con amigos", "Entretenimiento (redes, series, videojuegos)", "Trámites personales o trabajo", "Otros"]
    }
  ],

  /* de = tabla con la FK, a = tabla referenciada.
     zmany = cero o muchos, many = uno o muchos, one = exactamente uno, zone = cero o uno */
  relaciones: [
    { de: ["programa", "facultad_id"], a: ["facultad", "id"], cardDe: "zmany", cardA: "one", texto: "Una facultad ofrece muchos programas; cada programa pertenece a una facultad." },
    { de: ["matricula", "programa_id"], a: ["programa", "id"], cardDe: "zmany", cardA: "one", texto: "Un programa tiene muchos estudiantes matriculados." },
    { de: ["matricula", "estudiante_id"], a: ["estudiante", "id"], cardDe: "many", cardA: "one", texto: "Un estudiante cursa uno o dos programas (base y, opcionalmente, doble)." },
    { de: ["estudiante_factor", "estudiante_id"], a: ["estudiante", "id"], cardDe: "many", cardA: "one", texto: "Un estudiante identifica uno o varios factores que lo motivan a asistir." },
    { de: ["estudiante_factor", "factor_id"], a: ["factor_asistencia", "id"], cardDe: "zmany", cardA: "one", texto: "Un factor es señalado por muchos estudiantes." },
    { de: ["inasistencia", "estudiante_id"], a: ["estudiante", "id"], cardDe: "one", cardA: "one", texto: "Cada estudiante tiene un único registro de inasistencia (1:1)." },
    { de: ["inasistencia_motivo", "inasistencia_id"], a: ["inasistencia", "id"], cardDe: "zmany", cardA: "one", texto: "Una inasistencia se explica por cero o varios motivos." },
    { de: ["inasistencia_motivo", "motivo_id"], a: ["motivo", "id"], cardDe: "zmany", cardA: "one", texto: "Un motivo aparece en muchas inasistencias." },
    { de: ["inasistencia_asignatura", "inasistencia_id"], a: ["inasistencia", "id"], cardDe: "zmany", cardA: "one", texto: "Una inasistencia se da en cero o varios tipos de asignatura." },
    { de: ["inasistencia_asignatura", "tipo_asignatura_id"], a: ["tipo_asignatura", "id"], cardDe: "zmany", cardA: "one", texto: "Un tipo de asignatura aparece en muchas inasistencias." },
    { de: ["inasistencia_actividad", "inasistencia_id"], a: ["inasistencia", "id"], cardDe: "zmany", cardA: "one", texto: "En una inasistencia se realizan cero o varias actividades." },
    { de: ["inasistencia_actividad", "actividad_id"], a: ["actividad", "id"], cardDe: "zmany", cardA: "one", texto: "Una actividad aparece en muchas inasistencias." }
  ],

  reglas: [
    "Cada estudiante tiene exactamente una matrícula de tipo «base» y como máximo una de tipo «doble».",
    "Si la frecuencia es «Nunca», la inasistencia no tiene motivos, asignaturas ni actividades, y sus campos de horario e impactos quedan en NULL.",
    "El campo detalle solo se llena cuando la opción elegida es «Otros».",
    "Cada estudiante tiene al menos una fila en estudiante_factor."
  ]
};
