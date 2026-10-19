// Catálogo inicial de categorías. Fuente para generar supabase/seed/01_required.sql.
// Textos: { es, ca, en }. Iconos: nombres de Lucide.

const t = (es, ca, en) => ({ es, ca, en });

const W = {
  credentials: t(
    'Por tu seguridad: nunca compartas contraseñas, PIN, códigos recibidos por SMS, certificados digitales ni claves Cl@ve. Nadie puede hacerse pasar por ti ante un organismo. Si alguien debe actuar en tu nombre, usad una representación o apoderamiento oficial.',
    'Per la teva seguretat: no comparteixis mai contrasenyes, PIN, codis rebuts per SMS, certificats digitals ni claus Cl@ve. Ningú no pot fer-se passar per tu davant d’un organisme. Si algú ha d’actuar en nom teu, feu servir una representació o un apoderament oficial.',
    'For your safety: never share passwords, PINs, SMS codes, digital certificates or Cl@ve keys. Nobody may impersonate you before a public body. If someone must act on your behalf, use an official power of representation.'
  ),
  tech: t(
    'No compartas contraseñas ni códigos de verificación. Si hace falta iniciar sesión en una cuenta, hazlo tú delante de la persona que te ayuda y cambia la contraseña después si la has tenido que mostrar.',
    'No comparteixis contrasenyes ni codis de verificació. Si cal iniciar sessió en un compte, fes-ho tu davant de la persona que t’ajuda i canvia la contrasenya després si l’has hagut de mostrar.',
    'Do not share passwords or verification codes. If an account login is needed, do it yourself in front of the helper and change the password afterwards if you had to reveal it.'
  ),
  children: t(
    'No publiques nombres, fotos, colegio ni otros datos de los menores. Conoced a la persona antes en un lugar público o por videollamada, pide referencias y comprueba sus verificaciones. Para trabajos habituales con menores puede ser obligatorio el certificado negativo de delitos sexuales.',
    'No publiquis noms, fotos, escola ni altres dades dels menors. Conegueu la persona abans en un lloc públic o per videotrucada, demana referències i comprova’n les verificacions. Per a feines habituals amb menors pot ser obligatori el certificat negatiu de delictes sexuals.',
    'Do not publish names, photos, school or other details of children. Meet the person first in a public place or by video call, ask for references and check their verifications. Regular work with minors may legally require a sex-offence clearance certificate.'
  ),
  seniors: t(
    'Si la persona acompañada es mayor o vulnerable, que un familiar o persona de confianza esté al tanto del servicio. No entregues tarjetas, PIN ni documentos originales.',
    'Si la persona acompanyada és gran o vulnerable, que un familiar o una persona de confiança estigui al corrent del servei. No lliuris targetes, PIN ni documents originals.',
    'If the person being accompanied is elderly or vulnerable, make sure a relative or trusted person knows about the service. Never hand over cards, PINs or original documents.'
  ),
  regulated: t(
    'Las instalaciones de gas, electricidad o climatización deben hacerlas profesionales habilitados. Este tipo de trabajos no se pueden ofrecer sin acreditación.',
    'Les instal·lacions de gas, electricitat o climatització les han de fer professionals habilitats. Aquest tipus de feines no es poden oferir sense acreditació.',
    'Gas, electrical or HVAC installations must be carried out by licensed professionals. This kind of work cannot be offered without accreditation.'
  ),
  works: t(
    'Algunas obras necesitan licencia o comunicación al ayuntamiento. Pide presupuesto por escrito y acordad qué incluye antes de empezar.',
    'Algunes obres necessiten llicència o comunicació a l’ajuntament. Demana pressupost per escrit i acordeu què inclou abans de començar.',
    'Some works require a permit or notice to the town hall. Ask for a written quote and agree on what it includes before starting.'
  ),
  food: t(
    'Informa siempre de alergias e intolerancias. Quien cocina debe seguir buenas prácticas de higiene alimentaria.',
    'Informa sempre d’al·lèrgies i intoleràncies. Qui cuina ha de seguir bones pràctiques d’higiene alimentària.',
    'Always mention allergies and intolerances. The person cooking must follow good food-hygiene practices.'
  ),
  beauty: t(
    'Avisa de alergias o problemas de piel. Los tratamientos sanitarios o estéticos invasivos no están permitidos.',
    'Avisa d’al·lèrgies o problemes de pell. Els tractaments sanitaris o estètics invasius no estan permesos.',
    'Mention any allergies or skin conditions. Medical or invasive cosmetic treatments are not allowed.'
  ),
};

// Las categorías con `active: false` no se muestran (se conservan para más adelante).
export const categories = [
  {
    slug: 'tecnologia-soporte', icon: 'monitor-smartphone', color: '#3A47B5',
    name: t('Informática y soporte técnico', 'Informàtica i suport tècnic', 'IT & tech support'),
    description: t('Ordenadores, móviles, wifi, virus y programas. En remoto o a domicilio.', 'Ordinadors, mòbils, wifi, virus i programes. En remot o a domicili.', 'Computers, phones, Wi-Fi, viruses and software. Remote or at home.'),
    warnings: W.tech,
    subs: [
      ['ordenadores', t('Ordenadores', 'Ordinadors', 'Computers')],
      ['moviles-tablets', t('Móviles y tablets', 'Mòbils i tauletes', 'Phones & tablets')],
      ['asistencia-remota', t('Asistencia remota', 'Assistència remota', 'Remote assistance')],
      ['instalar-programas', t('Instalar y configurar programas', 'Instal·lar i configurar programes', 'Installing & setting up software')],
      ['virus-seguridad', t('Virus y seguridad', 'Virus i seguretat', 'Viruses & security')],
      ['wifi-redes', t('Wifi y redes', 'Wifi i xarxes', 'Wi-Fi & networks')],
      ['copias-fotos', t('Copias de seguridad y fotos', 'Còpies de seguretat i fotos', 'Backups & photos')],
      ['tv-dispositivos', t('Televisión y dispositivos', 'Televisió i dispositius', 'TV & devices')],
    ],
  },
  {
    slug: 'desarrollo-web', icon: 'code', color: '#5B3FA8',
    name: t('Webs y programación', 'Webs i programació', 'Websites & coding'),
    description: t('Páginas web, tiendas online, apps, automatizaciones y bases de datos.', 'Pàgines web, botigues en línia, apps, automatitzacions i bases de dades.', 'Websites, online shops, apps, automations and databases.'),
    warnings: W.tech,
    subs: [
      ['paginas-web', t('Páginas web', 'Pàgines web', 'Websites')],
      ['tiendas-online', t('Tiendas online', 'Botigues en línia', 'Online shops')],
      ['wordpress', t('WordPress', 'WordPress', 'WordPress')],
      ['apps-moviles', t('Apps móviles', 'Apps mòbils', 'Mobile apps')],
      ['automatizaciones', t('Automatizaciones y scripts', 'Automatitzacions i scripts', 'Automations & scripts')],
      ['bases-datos', t('Bases de datos', 'Bases de dades', 'Databases')],
    ],
  },
  {
    slug: 'diseno-contenido', icon: 'palette', color: '#A13A6B',
    name: t('Diseño y contenido digital', 'Disseny i contingut digital', 'Design & digital content'),
    description: t('Logos, diseño gráfico, edición de vídeo y foto, redes sociales.', 'Logos, disseny gràfic, edició de vídeo i foto, xarxes socials.', 'Logos, graphic design, video and photo editing, social media.'),
    subs: [
      ['diseno-grafico', t('Diseño gráfico', 'Disseny gràfic', 'Graphic design')],
      ['logos-marca', t('Logos e imagen de marca', 'Logos i imatge de marca', 'Logos & branding')],
      ['edicion-video', t('Edición de vídeo', 'Edició de vídeo', 'Video editing')],
      ['edicion-fotos', t('Edición de fotos', 'Edició de fotos', 'Photo editing')],
      ['redes-sociales', t('Redes sociales', 'Xarxes socials', 'Social media')],
      ['presentaciones', t('Presentaciones', 'Presentacions', 'Presentations')],
    ],
  },
  {
    slug: 'ofimatica-datos', icon: 'file-spreadsheet', color: '#1E6B4F',
    name: t('Ofimática y datos', 'Ofimàtica i dades', 'Office & data'),
    description: t('Excel, Word, PDF, transcripciones y organización de datos.', 'Excel, Word, PDF, transcripcions i organització de dades.', 'Excel, Word, PDFs, transcriptions and data organisation.'),
    subs: [
      ['excel', t('Excel y hojas de cálculo', 'Excel i fulls de càlcul', 'Excel & spreadsheets')],
      ['documentos-word', t('Word y documentos', 'Word i documents', 'Word & documents')],
      ['pdf-escaneo', t('PDF y escaneo', 'PDF i escaneig', 'PDFs & scanning')],
      ['transcripcion', t('Transcripción', 'Transcripció', 'Transcription')],
      ['entrada-datos', t('Organización de datos', 'Organització de dades', 'Data organisation')],
    ],
  },
  {
    slug: 'clases-formacion', icon: 'graduation-cap', color: '#245F9C',
    name: t('Clases online y formación', 'Classes en línia i formació', 'Online lessons & tutoring'),
    description: t('Por videollamada: informática, programación, idiomas, refuerzo escolar y más.', 'Per videotrucada: informàtica, programació, idiomes, reforç escolar i més.', 'By video call: computer skills, coding, languages, tutoring and more.'),
    subs: [
      ['informatica', t('Informática', 'Informàtica', 'Computer skills')],
      ['programacion', t('Programación', 'Programació', 'Coding')],
      ['idiomas', t('Idiomas', 'Idiomes', 'Languages')],
      ['refuerzo-escolar', t('Refuerzo escolar', 'Reforç escolar', 'School tutoring')],
      ['musica', t('Música', 'Música', 'Music')],
      ['deporte', t('Deporte', 'Esport', 'Sports')],
    ],
  },
  {
    slug: 'tramites-online', icon: 'file-check', color: '#6E4F9C',
    name: t('Trámites online', 'Tràmits en línia', 'Online paperwork'),
    description: t('Cita previa, formularios y solicitudes por internet, con tu supervisión.', 'Cita prèvia, formularis i sol·licituds per internet, amb la teva supervisió.', 'Online appointments, forms and applications, with you supervising.'),
    warnings: W.credentials,
    restrictions: t('Prohibido pedir u ofrecer el uso de credenciales, certificados digitales o firmas de otra persona.', 'Prohibit demanar o oferir l’ús de credencials, certificats digitals o signatures d’una altra persona.', 'Requesting or offering the use of another person’s credentials, digital certificates or signature is forbidden.'),
    subs: [
      ['cita-previa', t('Cita previa', 'Cita prèvia', 'Online appointments')],
      ['formularios-online', t('Formularios online', 'Formularis en línia', 'Online forms')],
      ['solicitudes-ayudas', t('Solicitudes y ayudas', 'Sol·licituds i ajuts', 'Applications & grants')],
      ['compras-reservas', t('Compras y reservas por internet', 'Compres i reserves per internet', 'Online shopping & bookings')],
      ['reclamaciones', t('Reclamaciones', 'Reclamacions', 'Complaints')],
    ],
    fields: [
      { key: 'tipo_gestion', type: 'text', label: t('Tipo de gestión', 'Tipus de gestió', 'Type of task'), required: true, validation: { maxLength: 120 } },
      { key: 'organismo', type: 'text', label: t('Organismo o entidad', 'Organisme o entitat', 'Public body or organisation'), validation: { maxLength: 120 } },
      { key: 'fecha_limite', type: 'date', label: t('Fecha límite', 'Data límit', 'Deadline') },
      { key: 'documentos', type: 'textarea', label: t('Documentos que hacen falta (solo descríbelos, no los subas)', 'Documents necessaris (només descriu-los, no els pugis)', 'Documents needed (describe them only, do not upload)'), validation: { maxLength: 500 } },
    ],
  },
  {
    slug: 'traduccion-redaccion', icon: 'languages', color: '#2B6A8A',
    name: t('Traducción y redacción', 'Traducció i redacció', 'Translation & writing'),
    description: t('Traducciones, revisión de textos, currículums y subtítulos.', 'Traduccions, revisió de textos, currículums i subtítols.', 'Translations, proofreading, CVs and subtitles.'),
    subs: [
      ['traduccion', t('Traducción', 'Traducció', 'Translation')],
      ['revision-textos', t('Revisión de textos', 'Revisió de textos', 'Proofreading')],
      ['curriculum', t('Currículum y cartas', 'Currículum i cartes', 'CVs & cover letters')],
      ['redaccion-contenidos', t('Redacción de contenidos', 'Redacció de continguts', 'Content writing')],
      ['subtitulos', t('Subtítulos', 'Subtítols', 'Subtitles')],
    ],
  },
  {
    slug: 'otros', icon: 'shapes', color: '#5F646B',
    name: t('Otros servicios', 'Altres serveis', 'Other services'),
    description: t('Lo que no encaja en otra categoría (siempre que esté permitido).', 'El que no encaixa en cap altra categoria (sempre que estigui permès).', 'Anything that doesn’t fit elsewhere (as long as it is allowed).'),
    review: true,
    subs: [['varios', t('Varios', 'Diversos', 'Miscellaneous')]],
  },

  // ---- Ocultas por ahora (servicios presenciales). Se conservan para activarlas más adelante.
  {
    slug: 'hogar-limpieza', icon: 'spray-can', color: '#2B736B',
    active: false, // oculta por ahora: servicio presencial (más adelante)
    name: t('Hogar y limpieza', 'Llar i neteja', 'Home & cleaning'),
    description: t('Limpieza, plancha, orden y tareas del hogar.', 'Neteja, planxa, ordre i feines de la llar.', 'Cleaning, ironing, tidying and household tasks.'),
    subs: [
      ['limpieza-general', t('Limpieza general', 'Neteja general', 'General cleaning')],
      ['limpieza-a-fondo', t('Limpieza a fondo', 'Neteja a fons', 'Deep cleaning')],
      ['plancha', t('Plancha', 'Planxa', 'Ironing')],
      ['cristales', t('Cristales y ventanas', 'Vidres i finestres', 'Windows')],
      ['orden-organizacion', t('Orden y organización', 'Ordre i organització', 'Tidying & organising')],
    ],
  },
  {
    slug: 'mudanzas-transporte', icon: 'truck', color: '#A15623',
    active: false, // oculta por ahora: servicio presencial (más adelante)
    name: t('Mudanzas y transporte', 'Mudances i transport', 'Moving & transport'),
    description: t('Pequeñas mudanzas, transporte de muebles y entregas.', 'Mudances petites, transport de mobles i lliuraments.', 'Small moves, furniture transport and deliveries.'),
    subs: [
      ['mudanza-pequena', t('Mudanza pequeña', 'Mudança petita', 'Small move')],
      ['transporte-muebles', t('Transporte de muebles', 'Transport de mobles', 'Furniture transport')],
      ['recogida-entrega', t('Recogida y entrega', 'Recollida i lliurament', 'Pick-up & delivery')],
      ['ayuda-carga', t('Ayuda para cargar', 'Ajuda per carregar', 'Loading help')],
    ],
    fields: [
      { key: 'piso', type: 'number', label: t('Piso', 'Pis', 'Floor'), validation: { min: -2, max: 40 } },
      { key: 'ascensor', type: 'boolean', label: t('¿Hay ascensor?', 'Hi ha ascensor?', 'Is there a lift?') },
      { key: 'vehiculo_necesario', type: 'select', label: t('Vehículo necesario', 'Vehicle necessari', 'Vehicle needed'), options: [
        ['ninguno', t('Ninguno', 'Cap', 'None')], ['coche', t('Coche', 'Cotxe', 'Car')], ['furgoneta', t('Furgoneta', 'Furgoneta', 'Van')],
      ] },
    ],
  },
  {
    slug: 'montaje-reparaciones', icon: 'wrench', color: '#4F5F80',
    active: false, // oculta por ahora: servicio presencial (más adelante)
    name: t('Montaje y reparaciones', 'Muntatge i reparacions', 'Assembly & repairs'),
    description: t('Montaje de muebles, pequeñas reparaciones y bricolaje.', 'Muntatge de mobles, petites reparacions i bricolatge.', 'Furniture assembly, small repairs and DIY.'),
    warnings: W.regulated,
    subs: [
      ['montaje-muebles', t('Montaje de muebles', 'Muntatge de mobles', 'Furniture assembly')],
      ['pequenas-reparaciones', t('Pequeñas reparaciones', 'Petites reparacions', 'Small repairs')],
      ['colgar-instalar', t('Colgar cuadros y estantes', 'Penjar quadres i prestatges', 'Hanging & mounting')],
      ['electrodomesticos', t('Conectar electrodomésticos', 'Connectar electrodomèstics', 'Connecting appliances')],
    ],
  },
  {
    slug: 'recados-gestiones', icon: 'clipboard-list', color: '#6E4F9C',
    active: false, // oculta por ahora: servicio presencial (más adelante)
    name: t('Recados y gestiones', 'Encàrrecs i gestions', 'Errands & paperwork'),
    description: t('Recados, compras, colas, citas y trámites.', 'Encàrrecs, compres, cues, cites i tràmits.', 'Errands, shopping, queues, appointments and paperwork.'),
    warnings: W.credentials,
    restrictions: t('Prohibido pedir u ofrecer el uso de credenciales, certificados digitales o firmas de otra persona.', 'Prohibit demanar o oferir l’ús de credencials, certificats digitals o signatures d’una altra persona.', 'Requesting or offering the use of another person’s credentials, digital certificates or signature is forbidden.'),
    subs: [
      ['recados', t('Recados', 'Encàrrecs', 'Errands')],
      ['compras', t('Compras', 'Compres', 'Shopping')],
      ['gestiones-presenciales', t('Gestiones presenciales', 'Gestions presencials', 'In-person paperwork')],
      ['gestiones-telematicas', t('Gestiones telemáticas', 'Gestions telemàtiques', 'Online paperwork')],
      ['colas-citas', t('Colas y citas', 'Cues i cites', 'Queues & appointments')],
    ],
    fields: [
      { key: 'tipo_gestion', type: 'text', label: t('Tipo de gestión', 'Tipus de gestió', 'Type of task'), required: true, validation: { maxLength: 120 } },
      { key: 'organismo', type: 'text', label: t('Organismo o entidad', 'Organisme o entitat', 'Public body or organisation'), validation: { maxLength: 120 } },
      { key: 'formato', type: 'select', label: t('¿Telemática o presencial?', 'Telemàtica o presencial?', 'Online or in person?'), required: true, options: [
        ['telematica', t('Telemática', 'Telemàtica', 'Online')], ['presencial', t('Presencial', 'Presencial', 'In person')], ['ambas', t('Ambas', 'Totes dues', 'Both')],
      ] },
      { key: 'desplazamiento', type: 'boolean', label: t('Necesita desplazamiento', 'Cal desplaçament', 'Travel needed') },
      { key: 'fecha_limite', type: 'date', label: t('Fecha límite', 'Data límit', 'Deadline') },
      { key: 'documentos', type: 'textarea', label: t('Documentos que hacen falta (solo descríbelos, no los subas)', 'Documents necessaris (només descriu-los, no els pugis)', 'Documents needed (describe them only, do not upload)'), validation: { maxLength: 500 } },
      { key: 'representacion', type: 'boolean', label: t('Requiere representación', 'Requereix representació', 'Requires representation') },
      { key: 'firma_titular', type: 'boolean', label: t('Requiere firma del titular', 'Requereix la signatura del titular', 'Requires the holder’s signature') },
    ],
  },
  {
    slug: 'acompanamiento-mayores', icon: 'hand-heart', color: '#A9486B',
    active: false, // oculta por ahora: servicio presencial (más adelante)
    name: t('Acompañamiento de mayores', 'Acompanyament de gent gran', 'Senior companionship'),
    description: t('Compañía, paseos y acompañamiento a citas.', 'Companyia, passejades i acompanyament a visites.', 'Company, walks and accompaniment to appointments.'),
    warnings: W.seniors, sensitive: true, review: true,
    subs: [
      ['citas-medicas', t('Acompañamiento a citas médicas', 'Acompanyament a visites mèdiques', 'Medical appointments')],
      ['paseos-compania', t('Paseos y compañía', 'Passejades i companyia', 'Walks & company')],
      ['ayuda-en-casa', t('Ayuda en casa', 'Ajuda a casa', 'Help at home')],
      ['tecnologia-mayores', t('Tecnología para mayores', 'Tecnologia per a gent gran', 'Tech help for seniors')],
    ],
  },
  {
    slug: 'mascotas', icon: 'paw-print', color: '#86641D',
    active: false, // oculta por ahora: servicio presencial (más adelante)
    name: t('Mascotas', 'Mascotes', 'Pets'),
    description: t('Paseos, cuidado en casa y visitas a mascotas.', 'Passejades, cura a casa i visites a mascotes.', 'Walks, pet sitting and visits.'),
    subs: [
      ['paseo-perros', t('Paseo de perros', 'Passeig de gossos', 'Dog walking')],
      ['cuidado-domicilio', t('Cuidado a domicilio', 'Cura a domicili', 'Pet sitting')],
      ['visitas-gatos', t('Visitas a gatos', 'Visites a gats', 'Cat visits')],
      ['traslado-veterinario', t('Traslado al veterinario', 'Trasllat al veterinari', 'Vet trips')],
    ],
    fields: [
      { key: 'animal', type: 'select', label: t('Animal', 'Animal', 'Animal'), options: [
        ['perro', t('Perro', 'Gos', 'Dog')], ['gato', t('Gato', 'Gat', 'Cat')], ['otro', t('Otro', 'Altre', 'Other')],
      ] },
      { key: 'tamano', type: 'select', label: t('Tamaño', 'Mida', 'Size'), options: [
        ['pequeno', t('Pequeño', 'Petit', 'Small')], ['mediano', t('Mediano', 'Mitjà', 'Medium')], ['grande', t('Grande', 'Gran', 'Large')],
      ] },
    ],
  },
  {
    slug: 'jardineria-exterior', icon: 'sprout', color: '#427531',
    active: false, // oculta por ahora: servicio presencial (más adelante)
    name: t('Jardinería y exterior', 'Jardineria i exterior', 'Gardening & outdoors'),
    description: t('Césped, poda, riego y terrazas.', 'Gespa, poda, reg i terrasses.', 'Lawns, pruning, watering and terraces.'),
    subs: [
      ['cortar-cesped', t('Cortar el césped', 'Tallar la gespa', 'Lawn mowing')],
      ['poda', t('Poda', 'Poda', 'Pruning')],
      ['riego-vacaciones', t('Riego en vacaciones', 'Reg en vacances', 'Holiday watering')],
      ['terrazas-balcones', t('Terrazas y balcones', 'Terrasses i balcons', 'Terraces & balconies')],
    ],
  },
  {
    slug: 'eventos-servicios-personales', icon: 'party-popper', color: '#A3404F',
    active: false, // oculta por ahora: servicio presencial (más adelante)
    name: t('Eventos y servicios personales', 'Esdeveniments i serveis personals', 'Events & personal services'),
    description: t('Fotografía, música, ayuda en celebraciones.', 'Fotografia, música, ajuda en celebracions.', 'Photography, music, help at celebrations.'),
    subs: [
      ['fotografia', t('Fotografía', 'Fotografia', 'Photography')],
      ['musica-eventos', t('Música para eventos', 'Música per a esdeveniments', 'Event music')],
      ['ayuda-eventos', t('Ayuda en eventos', 'Ajuda en esdeveniments', 'Event staff')],
      ['organizacion-fiestas', t('Organización de fiestas', 'Organització de festes', 'Party planning')],
    ],
  },
  {
    slug: 'cuidado-ninos', icon: 'baby', color: '#A2521C',
    active: false, // oculta por ahora: servicio presencial (más adelante)
    name: t('Cuidado de niños', 'Cura d’infants', 'Childcare'),
    description: t('Canguro, recogida del colegio y ayuda con deberes.', 'Cangur, recollida de l’escola i ajuda amb els deures.', 'Babysitting, school pick-up and homework help.'),
    warnings: W.children, sensitive: true, review: true, photos: false, verifications: ['identity'],
    restrictions: t('No se permiten fotos ni datos identificativos de menores.', 'No es permeten fotos ni dades identificatives de menors.', 'Photos or identifying details of minors are not allowed.'),
    subs: [
      ['canguro', t('Canguro', 'Cangur', 'Babysitting')],
      ['recogida-colegio', t('Recogida del colegio', 'Recollida de l’escola', 'School pick-up')],
      ['ayuda-deberes', t('Ayuda con los deberes', 'Ajuda amb els deures', 'Homework help')],
    ],
    fields: [
      { key: 'numero_ninos', type: 'number', label: t('Número de niños', 'Nombre d’infants', 'Number of children'), validation: { min: 1, max: 6 } },
      { key: 'franja_edad', type: 'select', label: t('Franja de edad', 'Franja d’edat', 'Age range'), options: [
        ['0-2', t('0–2 años', '0–2 anys', '0–2 years')], ['3-5', t('3–5 años', '3–5 anys', '3–5 years')], ['6-11', t('6–11 años', '6–11 anys', '6–11 years')], ['12-17', t('12–17 años', '12–17 anys', '12–17 years')],
      ] },
    ],
  },
  {
    slug: 'belleza-domicilio', icon: 'scissors', color: '#954C83',
    active: false, // oculta por ahora: servicio presencial (más adelante)
    name: t('Belleza a domicilio', 'Bellesa a domicili', 'Beauty at home'),
    description: t('Peluquería, manicura y maquillaje en casa.', 'Perruqueria, manicura i maquillatge a casa.', 'Hairdressing, nails and make-up at home.'),
    warnings: W.beauty,
    subs: [
      ['peluqueria', t('Peluquería', 'Perruqueria', 'Hairdressing')],
      ['manicura-pedicura', t('Manicura y pedicura', 'Manicura i pedicura', 'Manicure & pedicure')],
      ['maquillaje', t('Maquillaje', 'Maquillatge', 'Make-up')],
    ],
  },
  {
    slug: 'obras-pintura', icon: 'paint-roller', color: '#6E5D49',
    active: false, // oculta por ahora: servicio presencial (más adelante)
    name: t('Obras y pintura', 'Obres i pintura', 'Building & painting'),
    description: t('Pintura, alicatado, pladur y humedades.', 'Pintura, enrajolat, pladur i humitats.', 'Painting, tiling, drywall and damp.'),
    warnings: W.works,
    subs: [
      ['pintura', t('Pintura', 'Pintura', 'Painting')],
      ['alicatado-suelos', t('Alicatado y suelos', 'Enrajolat i terres', 'Tiling & floors')],
      ['pladur', t('Pladur y tabiques', 'Pladur i envans', 'Drywall')],
      ['humedades', t('Humedades', 'Humitats', 'Damp')],
    ],
  },
  {
    slug: 'cocina-domicilio', icon: 'chef-hat', color: '#A84B26',
    active: false, // oculta por ahora: servicio presencial (más adelante)
    name: t('Cocina a domicilio', 'Cuina a domicili', 'Home cooking'),
    description: t('Chef en casa, cocina para la semana y repostería.', 'Xef a casa, cuina per a la setmana i rebosteria.', 'Private chef, batch cooking and baking.'),
    warnings: W.food,
    subs: [
      ['chef-domicilio', t('Chef a domicilio', 'Xef a domicili', 'Private chef')],
      ['cocina-semana', t('Cocina para la semana', 'Cuina per a la setmana', 'Batch cooking')],
      ['reposteria', t('Repostería', 'Rebosteria', 'Baking')],
      ['clases-cocina', t('Clases de cocina', 'Classes de cuina', 'Cooking lessons')],
    ],
  },
];
