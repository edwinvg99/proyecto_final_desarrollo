export const modulosEducativos = [
  {
    id: 'transicion-energetica',
    titulo: 'Transición Energética',
    icono: '🌍',
    descripcion: 'Comprende el cambio hacia fuentes de energía más limpias y sostenibles',
    color: 'bg-linear-to-r from-blue-600 to-blue-500',
    contenido: [
      {
        titulo: '¿Qué es la Transición Energética?',
        parrafos: [
          'La transición energética es el proceso de transformación del sector energético global, pasando de un sistema basado en combustibles fósiles a uno fundamentado en energías renovables y limpias. Este cambio es fundamental para combatir el cambio climático y garantizar un futuro sostenible.',
          'En Colombia, la transición energética representa una oportunidad única para diversificar nuestra matriz energética, reducir emisiones de gases de efecto invernadero y promover el desarrollo económico sostenible en las regiones.'
        ],
        puntos: [
          'Reducción de emisiones de CO2 y otros gases contaminantes',
          'Diversificación de la matriz energética nacional',
          'Creación de empleos verdes y oportunidades económicas',
          'Mayor independencia energética y seguridad nacional',
          'Mejora en la calidad del aire y salud pública'
        ]
      },
      {
        titulo: 'Pilares de la Transición Energética',
        parrafos: [
          'La transición energética se sustenta en tres pilares fundamentales: eficiencia energética, electrificación de sectores y energías renovables. Cada uno de estos elementos juega un papel crucial en la transformación del sistema energético.',
          'La implementación exitosa requiere la participación activa de todos los actores: gobierno, sector privado, comunidades y ciudadanos individuales.'
        ],
        puntos: [
          'Eficiencia energética: Usar menos energía para realizar las mismas actividades',
          'Electrificación: Reemplazar combustibles fósiles por electricidad limpia',
          'Energías renovables: Solar, eólica, hidráulica, geotérmica',
          'Almacenamiento de energía: Baterías y otras tecnologías',
          'Redes inteligentes: Infraestructura moderna y digitalizada'
        ]
      }
    ],
    recursos: [
      {
        nombre: 'Guía de Transición Energética en Colombia',
        tipo: 'Documento PDF',
        icono: '📄',
        url: 'https://www.minenergia.gov.co'
      },
      {
        nombre: 'Video: Futuro Energético Sostenible',
        tipo: 'Video explicativo',
        icono: '🎥',
        url: 'https://www.youtube.com/watch?v=example'
      }
    ],
    examen: [
      {
        pregunta: '¿Cuál es el objetivo principal de la transición energética?',
        opciones: [
          'Aumentar el consumo de energía',
          'Cambiar de combustibles fósiles a energías renovables',
          'Reducir el costo de la electricidad solamente',
          'Eliminar todas las fuentes de energía tradicionales inmediatamente'
        ],
        correcta: 1
      },
      {
        pregunta: '¿Cuál NO es un pilar de la transición energética?',
        opciones: [
          'Eficiencia energética',
          'Electrificación de sectores',
          'Aumento del uso de carbón',
          'Energías renovables'
        ],
        correcta: 2
      },
      {
        pregunta: '¿Qué beneficio trae la transición energética para Colombia?',
        opciones: [
          'Solo beneficios ambientales',
          'Diversificación energética y creación de empleos verdes',
          'Aumento de la dependencia de combustibles fósiles',
          'Ningún beneficio económico'
        ],
        correcta: 1
      },
      {
        pregunta: '¿Qué tecnología es fundamental para el almacenamiento de energía renovable?',
        opciones: [
          'Motores de combustión',
          'Calderas de gas',
          'Baterías y sistemas de almacenamiento',
          'Generadores diésel'
        ],
        correcta: 2
      },
      {
        pregunta: '¿Cuál es el rol de las redes inteligentes en la transición energética?',
        opciones: [
          'Aumentar el consumo energético',
          'Modernizar y digitalizar la infraestructura eléctrica',
          'Eliminar la necesidad de energías renovables',
          'Mantener el sistema tradicional sin cambios'
        ],
        correcta: 1
      }
    ]
  },
  {
    id: 'autogeneracion',
    titulo: 'Autogeneración',
    icono: '⚡',
    descripcion: 'Genera tu propia energía y reduce tu dependencia de la red eléctrica',
    color: 'bg-linear-to-r from-emerald-600 to-emerald-500',
    contenido: [
      {
        titulo: '¿Qué es la Autogeneración?',
        parrafos: [
          'La autogeneración es la capacidad de producir energía eléctrica para consumo propio utilizando fuentes renovables como paneles solares, pequeñas turbinas eólicas o sistemas híbridos. Este modelo permite a hogares y empresas generar su propia electricidad.',
          'En Colombia, la Ley 1715 de 2014 regula la autogeneración a pequeña escala, permitiendo que los usuarios puedan vender los excedentes de energía a la red eléctrica nacional.'
        ],
        puntos: [
          'Reducción significativa en la factura de energía eléctrica',
          'Independencia energética y mayor autonomía',
          'Contribución a la reducción de emisiones de CO2',
          'Posibilidad de vender excedentes de energía',
          'Incentivos tributarios disponibles en Colombia'
        ]
      },
      {
        titulo: 'Componentes de un Sistema de Autogeneración',
        parrafos: [
          'Un sistema típico de autogeneración solar incluye paneles fotovoltaicos, inversor, medidor bidireccional, sistema de protección y opcionalmente baterías para almacenamiento.',
          'La instalación debe cumplir con las normas técnicas colombianas (NTC) y contar con la aprobación del operador de red local.'
        ],
        puntos: [
          'Paneles solares: Capturan la energía del sol',
          'Inversor: Convierte corriente directa en alterna',
          'Medidor bidireccional: Registra energía consumida y exportada',
          'Sistema de protección: Garantiza seguridad eléctrica',
          'Baterías (opcional): Almacenan energía para uso nocturno'
        ]
      },
      {
        titulo: 'Proceso de Implementación',
        parrafos: [
          'Para implementar un sistema de autogeneración en Colombia, debes seguir un proceso que incluye: estudio de viabilidad, diseño del sistema, trámites ante el operador de red, instalación y puesta en marcha.',
          'El retorno de inversión típico en Colombia oscila entre 5 y 8 años, dependiendo del consumo y la radiación solar de la zona.'
        ]
      }
    ],
    recursos: [
      {
        nombre: 'Calculadora Solar Residencial',
        tipo: 'Herramienta interactiva',
        icono: '🧮',
        url: 'https://www.upme.gov.co'
      },
      {
        nombre: 'Normativa Técnica RETIE',
        tipo: 'Documento legal',
        icono: '📋',
        url: 'https://www.minenergia.gov.co/retie'
      }
    ],
    examen: [
      {
        pregunta: '¿Qué permite la autogeneración a pequeña escala en Colombia?',
        opciones: [
          'Solo consumir energía de la red',
          'Generar energía propia y vender excedentes',
          'Aumentar el consumo de combustibles fósiles',
          'Eliminar completamente la conexión a la red'
        ],
        correcta: 1
      },
      {
        pregunta: '¿Cuál es el componente que convierte la energía solar en electricidad utilizable?',
        opciones: [
          'Las baterías',
          'El medidor',
          'El inversor',
          'Los cables'
        ],
        correcta: 2
      },
      {
        pregunta: '¿Qué ley regula la autogeneración en Colombia?',
        opciones: [
          'Ley 100 de 1993',
          'Ley 1715 de 2014',
          'Ley 142 de 1994',
          'Ley 2099 de 2020'
        ],
        correcta: 1
      },
      {
        pregunta: '¿Cuál es el tiempo aproximado de retorno de inversión para un sistema solar residencial en Colombia?',
        opciones: [
          '1 a 2 años',
          '3 a 4 años',
          '5 a 8 años',
          '15 a 20 años'
        ],
        correcta: 2
      },
      {
        pregunta: '¿Qué registra un medidor bidireccional?',
        opciones: [
          'Solo la energía consumida',
          'Solo la energía generada',
          'Energía consumida y energía exportada a la red',
          'El voltaje de la red'
        ],
        correcta: 2
      }
    ]
  },
  {
    id: 'generacion-distribuida',
    titulo: 'Generación Distribuida',
    icono: '🏘️',
    descripcion: 'Producción descentralizada de energía cerca de los puntos de consumo',
    color: 'bg-linear-to-r from-purple-600 to-purple-500',
    contenido: [
      {
        titulo: '¿Qué es la Generación Distribuida?',
        parrafos: [
          'La generación distribuida se refiere a la producción de energía eléctrica cerca de los puntos de consumo, utilizando fuentes renovables y tecnologías de pequeña y mediana escala. A diferencia de las grandes centrales eléctricas, estos sistemas están dispersos geográficamente.',
          'Este modelo democratiza la producción de energía, reduce pérdidas en transmisión y aumenta la resiliencia del sistema eléctrico nacional.'
        ],
        puntos: [
          'Reducción de pérdidas por transmisión de energía',
          'Mayor confiabilidad y resiliencia del sistema eléctrico',
          'Democratización del acceso a tecnologías renovables',
          'Creación de micro-economías energéticas locales',
          'Menor impacto ambiental que grandes proyectos centralizados'
        ]
      },
      {
        titulo: 'Tipos de Generación Distribuida',
        parrafos: [
          'La generación distribuida puede implementarse en diferentes escalas: residencial (1-10 kW), comercial (10-500 kW) e industrial (500 kW - 5 MW). Cada escala tiene sus características, regulaciones y beneficios específicos.',
          'En Colombia, la Resolución CREG 030 de 2018 establece el marco regulatorio para la generación distribuida a pequeña escala.'
        ],
        puntos: [
          'Residencial: Viviendas unifamiliares y multifamiliares',
          'Comercial: Tiendas, oficinas, pequeñas empresas',
          'Industrial: Fábricas y medianas empresas',
          'Comunitaria: Proyectos de múltiples usuarios',
          'Agrícola: Bombeo de agua, riego, procesamiento'
        ]
      },
      {
        titulo: 'Beneficios para la Red Eléctrica',
        parrafos: [
          'La generación distribuida aporta múltiples beneficios al sistema eléctrico nacional: reduce la congestión en líneas de transmisión, mejora la calidad del servicio, aumenta la seguridad energética y facilita la integración de renovables.',
          'Además, permite atender zonas remotas donde la extensión de redes tradicionales resulta costosa o inviable.'
        ]
      }
    ],
    recursos: [
      {
        nombre: 'Resolución CREG 030 de 2018',
        tipo: 'Marco legal',
        icono: '⚖️',
        url: 'https://www.creg.gov.co'
      },
      {
        nombre: 'Casos de Éxito en Colombia',
        tipo: 'Estudios de caso',
        icono: '📊',
        url: 'https://www.upme.gov.co'
      }
    ],
    examen: [
      {
        pregunta: '¿Cuál es la principal característica de la generación distribuida?',
        opciones: [
          'Producción centralizada en grandes plantas',
          'Producción cerca de los puntos de consumo',
          'Uso exclusivo de combustibles fósiles',
          'Eliminación total de la red eléctrica'
        ],
        correcta: 1
      },
      {
        pregunta: '¿Qué resolución regula la generación distribuida en Colombia?',
        opciones: [
          'CREG 015 de 2020',
          'CREG 030 de 2018',
          'CREG 174 de 2021',
          'CREG 001 de 2019'
        ],
        correcta: 1
      },
      {
        pregunta: '¿Cuál NO es un beneficio de la generación distribuida?',
        opciones: [
          'Reducción de pérdidas por transmisión',
          'Mayor resiliencia del sistema',
          'Aumento de la dependencia de combustibles fósiles',
          'Democratización del acceso a energía renovable'
        ],
        correcta: 2
      },
      {
        pregunta: '¿Qué capacidad tiene un sistema de generación distribuida residencial típico?',
        opciones: [
          '1-10 kW',
          '100-500 kW',
          '1-5 MW',
          '10-50 MW'
        ],
        correcta: 0
      },
      {
        pregunta: '¿Por qué la generación distribuida es útil en zonas remotas?',
        opciones: [
          'Es más costosa que las redes tradicionales',
          'Requiere menos mantenimiento que otros sistemas',
          'Permite atender zonas donde extender redes es inviable',
          'Solo funciona en ciudades grandes'
        ],
        correcta: 2
      }
    ]
  },
  {
    id: 'comunidades-energeticas',
    titulo: 'Comunidades Energéticas',
    icono: '🤝',
    descripcion: 'Asociaciones de ciudadanos que producen y comparten energía renovable',
    color: 'bg-linear-to-r from-orange-600 to-orange-500',
    contenido: [
      {
        titulo: '¿Qué son las Comunidades Energéticas?',
        parrafos: [
          'Las comunidades energéticas son asociaciones de ciudadanos, empresas o entidades públicas que se unen para producir, consumir y gestionar energía renovable de forma colectiva. Este modelo fomenta la participación ciudadana y la apropiación comunitaria de proyectos energéticos.',
          'En Colombia, este concepto está ganando relevancia como mecanismo de inclusión social, desarrollo local y democratización energética, especialmente en zonas rurales y comunidades vulnerables.'
        ],
        puntos: [
          'Empoderamiento comunitario y participación ciudadana',
          'Reducción de costos energéticos para los miembros',
          'Generación de ingresos locales y desarrollo económico',
          'Fortalecimiento del tejido social y cooperación',
          'Mayor aceptación social de proyectos renovables'
        ]
      },
      {
        titulo: 'Modelos de Comunidades Energéticas',
        parrafos: [
          'Existen diferentes modelos: cooperativas energéticas (propiedad y gestión colectiva), comunidades de energía renovable (producción local compartida) y esquemas de autogeneración compartida (varios usuarios comparten un sistema).',
          'Cada modelo tiene ventajas específicas dependiendo del contexto local, recursos disponibles y objetivos de la comunidad.'
        ],
        puntos: [
          'Cooperativas energéticas: Propiedad colectiva y democrática',
          'Comunidades de energía renovable: Producción local compartida',
          'Autogeneración compartida: Varios usuarios, un sistema',
          'Micro-redes comunitarias: Infraestructura local independiente',
          'Proyectos híbridos: Combinación de varios modelos'
        ]
      },
      {
        titulo: 'Pasos para Crear una Comunidad Energética',
        parrafos: [
          'Crear una comunidad energética requiere: identificar necesidades y objetivos comunes, formar un grupo promotor, realizar estudios de viabilidad técnica y financiera, establecer estructura legal y de gobernanza, buscar financiamiento y ejecutar el proyecto.',
          'El éxito depende del compromiso comunitario, acceso a financiamiento, acompañamiento técnico y marco regulatorio favorable.'
        ],
        puntos: [
          'Fase 1: Sensibilización y formación del grupo',
          'Fase 2: Estudios de viabilidad técnica y económica',
          'Fase 3: Definición de estructura legal y gobernanza',
          'Fase 4: Búsqueda de financiamiento y aliados',
          'Fase 5: Implementación y operación del proyecto',
          'Fase 6: Monitoreo, evaluación y mejora continua'
        ]
      }
    ],
    recursos: [
      {
        nombre: 'Guía para Comunidades Energéticas',
        tipo: 'Manual práctico',
        icono: '📘',
        url: 'https://www.minenergia.gov.co'
      },
      {
        nombre: 'Red Colombiana de Comunidades Energéticas',
        tipo: 'Red de contactos',
        icono: '🌐',
        url: 'https://www.comunidadesenergeticas.co'
      }
    ],
    examen: [
      {
        pregunta: '¿Qué es una comunidad energética?',
        opciones: [
          'Una empresa privada de generación eléctrica',
          'Una asociación de ciudadanos que producen y gestionan energía colectivamente',
          'Un programa gubernamental de subsidios',
          'Una central eléctrica tradicional'
        ],
        correcta: 1
      },
      {
        pregunta: '¿Cuál es un beneficio clave de las comunidades energéticas?',
        opciones: [
          'Eliminación total de la red eléctrica',
          'Aumento del consumo energético',
          'Empoderamiento comunitario y reducción de costos',
          'Dependencia de combustibles fósiles'
        ],
        correcta: 2
      },
      {
        pregunta: '¿Qué modelo de comunidad energética implica propiedad colectiva y democrática?',
        opciones: [
          'Empresa privada',
          'Cooperativa energética',
          'Monopolio estatal',
          'Franquicia comercial'
        ],
        correcta: 1
      },
      {
        pregunta: '¿Cuál es la primera fase para crear una comunidad energética?',
        opciones: [
          'Comprar equipos inmediatamente',
          'Sensibilización y formación del grupo',
          'Solicitar préstamos bancarios',
          'Contratar empresa externa'
        ],
        correcta: 1
      },
      {
        pregunta: '¿Por qué las comunidades energéticas son importantes en zonas rurales?',
        opciones: [
          'Solo funcionan en ciudades',
          'No tienen beneficios rurales',
          'Permiten inclusión social y desarrollo local en áreas remotas',
          'Requieren infraestructura urbana avanzada'
        ],
        correcta: 2
      }
    ]
  }
];
