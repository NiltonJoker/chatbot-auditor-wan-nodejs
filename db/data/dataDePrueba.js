const db = require("..");
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
//Datos de ejemplo para el chatbot auditor - Poblado de tablas cuestionarios y preguntas

let areas = [
  "Red Wan",
  "Hardware",
  "Software",
  "Red Física y Lógica",
  "Plan de contingencia",
];

let areaObjetivos = [
  {
    objetivo: "Evaluar la cobertura de 100 a 1000km",
    id_area: 1,
  },
  {
    objetivo:
      "Evaluar el funcionamiento de la composición, consistente en la colección de LANs de host conectados por medio de subredes",
    id_area: 1,
  },
  {
    objetivo:
      "Evaluar la forma de enviar los paquetes de un router a otro, según las características de envió de red",
    id_area: 1,
  },
  {
    objetivo:
      "Evaluar el uso adecuado y confiable de la tecnología utilizada en la transmisión de datos con fibra óptica en todas las maquinas conectadas",
    id_area: 1,
  },
  {
    objetivo:
      "Evaluar la conveniencia del tiempo promedio de transmisión de la red entre LANs y entre subredes",
    id_area: 1,
  },
  {
    objetivo:
      "Evaluar que las velocidades utilizadas normalmente en su transmisión sean conforme a los rangos de 100Mbps y 1000Mbps",
    id_area: 1,
  },
  {
    objetivo:"Identificar las áreas controladas para los equipos de comunicación, previniendo así accesos inadecuados",
    id_area: 2,
  },
  {
    objetivo:"Protección y tendido adecuado de cables y líneas de comunicación, para evitar accesos físicos",
    id_area: 2,
  },
  {
    objetivo:"Atención específica a la recuperación de los sistemas de comunicación de datos en el plan de recuperación de desastres en sistemas de información",
    id_area: 2,
  },
  {
    objetivo:"Técnicas de cifrado de datos donde haya riesgos de accesos impropios a trasmisiones sensibles",
    id_area: 2,
  },
  {
    objetivo:"Facilidades de control de errores para detectar errores de trasmisión y establecer las retransmisiones apropiadas",
    id_area: 2,
  },
  {
    objetivo:"Registro de la actividad de la red, para ayudar a reconstruir incidentes y detectar accesos no autorizados",
    id_area: 2,
  },
  {
    objetivo:"Verificar físicamente el hardware de la institución ",
    id_area: 3,
  },
  {
    objetivo:"Identificar existencia de inventario",
    id_area: 3,
  },
  {
    objetivo:"Determinar la veracidad de mantenimiento del hardware",
    id_area: 3,
  },
  {
    objetivo:"Análisis de los sistemas operativos para el funcionamiento de la red",
    id_area: 4,
  },
  {
    objetivo:"Análisis de los programas y paquetes de aplicación de la red",
    id_area: 4,
  },
  {
    objetivo:"Análisis de disponibilidad de licencias y permisos de instalación de software de la red",
    id_area: 4,
  },
  {
    objetivo:"Comprobar la existencia de políticas y planes de Contingencia",
    id_area: 5,
  },
  {
    objetivo:"Revisar con que planes cuentan caso de un desastre natural",
    id_area: 5,
  }
];


areas.forEach((area) => {
  db.query(`insert into areas (nombre) values('${area}')`, (err, res) => {
    if (err) {
      return console.log(err);
    }
    console.log("Se terminó de poblar la tabla areas", res.rows);
  });
});

areaObjetivos.forEach((areaObjetivo, index) => {
  db.query(
    `insert into objetivos_areas (objetivo,id_area) values('${areaObjetivo.objetivo}',${areaObjetivo.id_area})`,
    (err, res) => {
      if (err) {
        return console.log(err);
      }
      console.log("Se terminó de poblar la tabla objetivos_areas", res.rows);
    }
  );
});
