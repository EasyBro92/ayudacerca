-- GENERADO por scripts/generate-seeds.mjs — no editar a mano
-- Datos imprescindibles en todos los entornos (catálogo, municipios, ajustes, borradores legales).
begin;

-- Municipios
insert into public.municipalities (slug, name, province, region, center) values ('barcelona', 'Barcelona', 'Barcelona', 'Cataluña', public.approximate_point(41.3874, 2.1686)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('hospitalet-de-llobregat', 'L''Hospitalet de Llobregat', 'Barcelona', 'Cataluña', public.approximate_point(41.3596, 2.0997)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('badalona', 'Badalona', 'Barcelona', 'Cataluña', public.approximate_point(41.45, 2.2474)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('sabadell', 'Sabadell', 'Barcelona', 'Cataluña', public.approximate_point(41.5463, 2.1086)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('terrassa', 'Terrassa', 'Barcelona', 'Cataluña', public.approximate_point(41.5632, 2.0089)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('mataro', 'Mataró', 'Barcelona', 'Cataluña', public.approximate_point(41.5381, 2.4447)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('sant-cugat-del-valles', 'Sant Cugat del Vallès', 'Barcelona', 'Cataluña', public.approximate_point(41.4722, 2.0864)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('granollers', 'Granollers', 'Barcelona', 'Cataluña', public.approximate_point(41.6083, 2.2875)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('cornella-de-llobregat', 'Cornellà de Llobregat', 'Barcelona', 'Cataluña', public.approximate_point(41.355, 2.07)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('manresa', 'Manresa', 'Barcelona', 'Cataluña', public.approximate_point(41.7251, 1.8266)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('vic', 'Vic', 'Barcelona', 'Cataluña', public.approximate_point(41.9301, 2.2549)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('girona', 'Girona', 'Girona', 'Cataluña', public.approximate_point(41.9794, 2.8214)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('figueres', 'Figueres', 'Girona', 'Cataluña', public.approximate_point(42.2666, 2.9617)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('lleida', 'Lleida', 'Lleida', 'Cataluña', public.approximate_point(41.6176, 0.62)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('tarragona', 'Tarragona', 'Tarragona', 'Cataluña', public.approximate_point(41.1189, 1.2445)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('reus', 'Reus', 'Tarragona', 'Cataluña', public.approximate_point(41.1561, 1.1069)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('madrid', 'Madrid', 'Madrid', 'Comunidad de Madrid', public.approximate_point(40.4168, -3.7038)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('alcala-de-henares', 'Alcalá de Henares', 'Madrid', 'Comunidad de Madrid', public.approximate_point(40.4818, -3.3643)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('getafe', 'Getafe', 'Madrid', 'Comunidad de Madrid', public.approximate_point(40.3083, -3.7327)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('mostoles', 'Móstoles', 'Madrid', 'Comunidad de Madrid', public.approximate_point(40.3223, -3.865)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('valencia', 'València', 'Valencia', 'Comunitat Valenciana', public.approximate_point(39.4699, -0.3763)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('alicante', 'Alicante', 'Alicante', 'Comunitat Valenciana', public.approximate_point(38.3452, -0.481)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('castello-de-la-plana', 'Castelló de la Plana', 'Castellón', 'Comunitat Valenciana', public.approximate_point(39.9864, -0.0513)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('sevilla', 'Sevilla', 'Sevilla', 'Andalucía', public.approximate_point(37.3891, -5.9845)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('malaga', 'Málaga', 'Málaga', 'Andalucía', public.approximate_point(36.7213, -4.4214)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('cordoba', 'Córdoba', 'Córdoba', 'Andalucía', public.approximate_point(37.8882, -4.7794)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('granada', 'Granada', 'Granada', 'Andalucía', public.approximate_point(37.1773, -3.5986)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('zaragoza', 'Zaragoza', 'Zaragoza', 'Aragón', public.approximate_point(41.6488, -0.8891)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('bilbao', 'Bilbao', 'Bizkaia', 'País Vasco', public.approximate_point(43.263, -2.935)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('donostia-san-sebastian', 'Donostia / San Sebastián', 'Gipuzkoa', 'País Vasco', public.approximate_point(43.3183, -1.9812)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('vitoria-gasteiz', 'Vitoria-Gasteiz', 'Araba', 'País Vasco', public.approximate_point(42.8467, -2.6716)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('pamplona', 'Pamplona', 'Navarra', 'Navarra', public.approximate_point(42.8125, -1.6458)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('valladolid', 'Valladolid', 'Valladolid', 'Castilla y León', public.approximate_point(41.6523, -4.7245)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('salamanca', 'Salamanca', 'Salamanca', 'Castilla y León', public.approximate_point(40.9701, -5.6635)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('a-coruna', 'A Coruña', 'A Coruña', 'Galicia', public.approximate_point(43.3623, -8.4115)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('vigo', 'Vigo', 'Pontevedra', 'Galicia', public.approximate_point(42.2406, -8.7207)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('oviedo', 'Oviedo', 'Asturias', 'Asturias', public.approximate_point(43.3614, -5.8494)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('gijon', 'Gijón', 'Asturias', 'Asturias', public.approximate_point(43.5322, -5.6611)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('santander', 'Santander', 'Cantabria', 'Cantabria', public.approximate_point(43.4623, -3.8099)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('logrono', 'Logroño', 'La Rioja', 'La Rioja', public.approximate_point(42.4627, -2.445)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('murcia', 'Murcia', 'Murcia', 'Región de Murcia', public.approximate_point(37.9922, -1.1307)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('palma', 'Palma', 'Illes Balears', 'Illes Balears', public.approximate_point(39.5696, 2.6502)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('las-palmas-de-gran-canaria', 'Las Palmas de Gran Canaria', 'Las Palmas', 'Canarias', public.approximate_point(28.1235, -15.4363)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('santa-cruz-de-tenerife', 'Santa Cruz de Tenerife', 'Santa Cruz de Tenerife', 'Canarias', public.approximate_point(28.4636, -16.2518)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('toledo', 'Toledo', 'Toledo', 'Castilla-La Mancha', public.approximate_point(39.8628, -4.0273)) on conflict (slug) do nothing;
insert into public.municipalities (slug, name, province, region, center) values ('badajoz', 'Badajoz', 'Badajoz', 'Extremadura', public.approximate_point(38.8794, -6.9707)) on conflict (slug) do nothing;

-- Categorías
insert into public.categories (slug, name, description, icon, color, sort_order, requires_review, is_sensitive, allow_photos, required_verifications, warnings, restrictions)
values ('hogar-limpieza', '{"es":"Hogar y limpieza","ca":"Llar i neteja","en":"Home & cleaning"}'::jsonb, '{"es":"Limpieza, plancha, orden y tareas del hogar.","ca":"Neteja, planxa, ordre i feines de la llar.","en":"Cleaning, ironing, tidying and household tasks."}'::jsonb, 'spray-can', '#2B736B', 1, false, false, true, array[]::public.verification_kind[], null, null)
on conflict (slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'limpieza-general', '{"es":"Limpieza general","ca":"Neteja general","en":"General cleaning"}'::jsonb, 1 from public.categories where slug = 'hogar-limpieza' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'limpieza-a-fondo', '{"es":"Limpieza a fondo","ca":"Neteja a fons","en":"Deep cleaning"}'::jsonb, 2 from public.categories where slug = 'hogar-limpieza' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'plancha', '{"es":"Plancha","ca":"Planxa","en":"Ironing"}'::jsonb, 3 from public.categories where slug = 'hogar-limpieza' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'cristales', '{"es":"Cristales y ventanas","ca":"Vidres i finestres","en":"Windows"}'::jsonb, 4 from public.categories where slug = 'hogar-limpieza' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'orden-organizacion', '{"es":"Orden y organización","ca":"Ordre i organització","en":"Tidying & organising"}'::jsonb, 5 from public.categories where slug = 'hogar-limpieza' on conflict (category_id, slug) do nothing;
insert into public.categories (slug, name, description, icon, color, sort_order, requires_review, is_sensitive, allow_photos, required_verifications, warnings, restrictions)
values ('mudanzas-transporte', '{"es":"Mudanzas y transporte","ca":"Mudances i transport","en":"Moving & transport"}'::jsonb, '{"es":"Pequeñas mudanzas, transporte de muebles y entregas.","ca":"Mudances petites, transport de mobles i lliuraments.","en":"Small moves, furniture transport and deliveries."}'::jsonb, 'truck', '#A15623', 2, false, false, true, array[]::public.verification_kind[], null, null)
on conflict (slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'mudanza-pequena', '{"es":"Mudanza pequeña","ca":"Mudança petita","en":"Small move"}'::jsonb, 1 from public.categories where slug = 'mudanzas-transporte' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'transporte-muebles', '{"es":"Transporte de muebles","ca":"Transport de mobles","en":"Furniture transport"}'::jsonb, 2 from public.categories where slug = 'mudanzas-transporte' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'recogida-entrega', '{"es":"Recogida y entrega","ca":"Recollida i lliurament","en":"Pick-up & delivery"}'::jsonb, 3 from public.categories where slug = 'mudanzas-transporte' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'ayuda-carga', '{"es":"Ayuda para cargar","ca":"Ajuda per carregar","en":"Loading help"}'::jsonb, 4 from public.categories where slug = 'mudanzas-transporte' on conflict (category_id, slug) do nothing;
insert into public.category_fields (category_id, key, label, field_type, options, is_required, validation, sort_order) select id, 'piso', '{"es":"Piso","ca":"Pis","en":"Floor"}'::jsonb, 'number', null, false, '{"min":-2,"max":40}'::jsonb, 1 from public.categories where slug = 'mudanzas-transporte' on conflict (category_id, key) do nothing;
insert into public.category_fields (category_id, key, label, field_type, options, is_required, validation, sort_order) select id, 'ascensor', '{"es":"¿Hay ascensor?","ca":"Hi ha ascensor?","en":"Is there a lift?"}'::jsonb, 'boolean', null, false, null, 2 from public.categories where slug = 'mudanzas-transporte' on conflict (category_id, key) do nothing;
insert into public.category_fields (category_id, key, label, field_type, options, is_required, validation, sort_order) select id, 'vehiculo_necesario', '{"es":"Vehículo necesario","ca":"Vehicle necessari","en":"Vehicle needed"}'::jsonb, 'select', '[{"value":"ninguno","label":{"es":"Ninguno","ca":"Cap","en":"None"}},{"value":"coche","label":{"es":"Coche","ca":"Cotxe","en":"Car"}},{"value":"furgoneta","label":{"es":"Furgoneta","ca":"Furgoneta","en":"Van"}}]'::jsonb, false, null, 3 from public.categories where slug = 'mudanzas-transporte' on conflict (category_id, key) do nothing;
insert into public.categories (slug, name, description, icon, color, sort_order, requires_review, is_sensitive, allow_photos, required_verifications, warnings, restrictions)
values ('montaje-reparaciones', '{"es":"Montaje y reparaciones","ca":"Muntatge i reparacions","en":"Assembly & repairs"}'::jsonb, '{"es":"Montaje de muebles, pequeñas reparaciones y bricolaje.","ca":"Muntatge de mobles, petites reparacions i bricolatge.","en":"Furniture assembly, small repairs and DIY."}'::jsonb, 'wrench', '#4F5F80', 3, false, false, true, array[]::public.verification_kind[], '{"es":"Las instalaciones de gas, electricidad o climatización deben hacerlas profesionales habilitados. Este tipo de trabajos no se pueden ofrecer sin acreditación.","ca":"Les instal·lacions de gas, electricitat o climatització les han de fer professionals habilitats. Aquest tipus de feines no es poden oferir sense acreditació.","en":"Gas, electrical or HVAC installations must be carried out by licensed professionals. This kind of work cannot be offered without accreditation."}'::jsonb, null)
on conflict (slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'montaje-muebles', '{"es":"Montaje de muebles","ca":"Muntatge de mobles","en":"Furniture assembly"}'::jsonb, 1 from public.categories where slug = 'montaje-reparaciones' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'pequenas-reparaciones', '{"es":"Pequeñas reparaciones","ca":"Petites reparacions","en":"Small repairs"}'::jsonb, 2 from public.categories where slug = 'montaje-reparaciones' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'colgar-instalar', '{"es":"Colgar cuadros y estantes","ca":"Penjar quadres i prestatges","en":"Hanging & mounting"}'::jsonb, 3 from public.categories where slug = 'montaje-reparaciones' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'electrodomesticos', '{"es":"Conectar electrodomésticos","ca":"Connectar electrodomèstics","en":"Connecting appliances"}'::jsonb, 4 from public.categories where slug = 'montaje-reparaciones' on conflict (category_id, slug) do nothing;
insert into public.categories (slug, name, description, icon, color, sort_order, requires_review, is_sensitive, allow_photos, required_verifications, warnings, restrictions)
values ('recados-gestiones', '{"es":"Recados y gestiones","ca":"Encàrrecs i gestions","en":"Errands & paperwork"}'::jsonb, '{"es":"Recados, compras, colas, citas y trámites.","ca":"Encàrrecs, compres, cues, cites i tràmits.","en":"Errands, shopping, queues, appointments and paperwork."}'::jsonb, 'clipboard-list', '#6E4F9C', 4, false, false, true, array[]::public.verification_kind[], '{"es":"Por tu seguridad: nunca compartas contraseñas, PIN, códigos recibidos por SMS, certificados digitales ni claves Cl@ve. Nadie puede hacerse pasar por ti ante un organismo. Si alguien debe actuar en tu nombre, usad una representación o apoderamiento oficial.","ca":"Per la teva seguretat: no comparteixis mai contrasenyes, PIN, codis rebuts per SMS, certificats digitals ni claus Cl@ve. Ningú no pot fer-se passar per tu davant d’un organisme. Si algú ha d’actuar en nom teu, feu servir una representació o un apoderament oficial.","en":"For your safety: never share passwords, PINs, SMS codes, digital certificates or Cl@ve keys. Nobody may impersonate you before a public body. If someone must act on your behalf, use an official power of representation."}'::jsonb, '{"es":"Prohibido pedir u ofrecer el uso de credenciales, certificados digitales o firmas de otra persona.","ca":"Prohibit demanar o oferir l’ús de credencials, certificats digitals o signatures d’una altra persona.","en":"Requesting or offering the use of another person’s credentials, digital certificates or signature is forbidden."}'::jsonb)
on conflict (slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'recados', '{"es":"Recados","ca":"Encàrrecs","en":"Errands"}'::jsonb, 1 from public.categories where slug = 'recados-gestiones' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'compras', '{"es":"Compras","ca":"Compres","en":"Shopping"}'::jsonb, 2 from public.categories where slug = 'recados-gestiones' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'gestiones-presenciales', '{"es":"Gestiones presenciales","ca":"Gestions presencials","en":"In-person paperwork"}'::jsonb, 3 from public.categories where slug = 'recados-gestiones' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'gestiones-telematicas', '{"es":"Gestiones telemáticas","ca":"Gestions telemàtiques","en":"Online paperwork"}'::jsonb, 4 from public.categories where slug = 'recados-gestiones' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'colas-citas', '{"es":"Colas y citas","ca":"Cues i cites","en":"Queues & appointments"}'::jsonb, 5 from public.categories where slug = 'recados-gestiones' on conflict (category_id, slug) do nothing;
insert into public.category_fields (category_id, key, label, field_type, options, is_required, validation, sort_order) select id, 'tipo_gestion', '{"es":"Tipo de gestión","ca":"Tipus de gestió","en":"Type of task"}'::jsonb, 'text', null, true, '{"maxLength":120}'::jsonb, 1 from public.categories where slug = 'recados-gestiones' on conflict (category_id, key) do nothing;
insert into public.category_fields (category_id, key, label, field_type, options, is_required, validation, sort_order) select id, 'organismo', '{"es":"Organismo o entidad","ca":"Organisme o entitat","en":"Public body or organisation"}'::jsonb, 'text', null, false, '{"maxLength":120}'::jsonb, 2 from public.categories where slug = 'recados-gestiones' on conflict (category_id, key) do nothing;
insert into public.category_fields (category_id, key, label, field_type, options, is_required, validation, sort_order) select id, 'formato', '{"es":"¿Telemática o presencial?","ca":"Telemàtica o presencial?","en":"Online or in person?"}'::jsonb, 'select', '[{"value":"telematica","label":{"es":"Telemática","ca":"Telemàtica","en":"Online"}},{"value":"presencial","label":{"es":"Presencial","ca":"Presencial","en":"In person"}},{"value":"ambas","label":{"es":"Ambas","ca":"Totes dues","en":"Both"}}]'::jsonb, true, null, 3 from public.categories where slug = 'recados-gestiones' on conflict (category_id, key) do nothing;
insert into public.category_fields (category_id, key, label, field_type, options, is_required, validation, sort_order) select id, 'desplazamiento', '{"es":"Necesita desplazamiento","ca":"Cal desplaçament","en":"Travel needed"}'::jsonb, 'boolean', null, false, null, 4 from public.categories where slug = 'recados-gestiones' on conflict (category_id, key) do nothing;
insert into public.category_fields (category_id, key, label, field_type, options, is_required, validation, sort_order) select id, 'fecha_limite', '{"es":"Fecha límite","ca":"Data límit","en":"Deadline"}'::jsonb, 'date', null, false, null, 5 from public.categories where slug = 'recados-gestiones' on conflict (category_id, key) do nothing;
insert into public.category_fields (category_id, key, label, field_type, options, is_required, validation, sort_order) select id, 'documentos', '{"es":"Documentos que hacen falta (solo descríbelos, no los subas)","ca":"Documents necessaris (només descriu-los, no els pugis)","en":"Documents needed (describe them only, do not upload)"}'::jsonb, 'textarea', null, false, '{"maxLength":500}'::jsonb, 6 from public.categories where slug = 'recados-gestiones' on conflict (category_id, key) do nothing;
insert into public.category_fields (category_id, key, label, field_type, options, is_required, validation, sort_order) select id, 'representacion', '{"es":"Requiere representación","ca":"Requereix representació","en":"Requires representation"}'::jsonb, 'boolean', null, false, null, 7 from public.categories where slug = 'recados-gestiones' on conflict (category_id, key) do nothing;
insert into public.category_fields (category_id, key, label, field_type, options, is_required, validation, sort_order) select id, 'firma_titular', '{"es":"Requiere firma del titular","ca":"Requereix la signatura del titular","en":"Requires the holder’s signature"}'::jsonb, 'boolean', null, false, null, 8 from public.categories where slug = 'recados-gestiones' on conflict (category_id, key) do nothing;
insert into public.categories (slug, name, description, icon, color, sort_order, requires_review, is_sensitive, allow_photos, required_verifications, warnings, restrictions)
values ('acompanamiento-mayores', '{"es":"Acompañamiento de mayores","ca":"Acompanyament de gent gran","en":"Senior companionship"}'::jsonb, '{"es":"Compañía, paseos y acompañamiento a citas.","ca":"Companyia, passejades i acompanyament a visites.","en":"Company, walks and accompaniment to appointments."}'::jsonb, 'hand-heart', '#A9486B', 5, true, true, true, array[]::public.verification_kind[], '{"es":"Si la persona acompañada es mayor o vulnerable, que un familiar o persona de confianza esté al tanto del servicio. No entregues tarjetas, PIN ni documentos originales.","ca":"Si la persona acompanyada és gran o vulnerable, que un familiar o una persona de confiança estigui al corrent del servei. No lliuris targetes, PIN ni documents originals.","en":"If the person being accompanied is elderly or vulnerable, make sure a relative or trusted person knows about the service. Never hand over cards, PINs or original documents."}'::jsonb, null)
on conflict (slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'citas-medicas', '{"es":"Acompañamiento a citas médicas","ca":"Acompanyament a visites mèdiques","en":"Medical appointments"}'::jsonb, 1 from public.categories where slug = 'acompanamiento-mayores' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'paseos-compania', '{"es":"Paseos y compañía","ca":"Passejades i companyia","en":"Walks & company"}'::jsonb, 2 from public.categories where slug = 'acompanamiento-mayores' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'ayuda-en-casa', '{"es":"Ayuda en casa","ca":"Ajuda a casa","en":"Help at home"}'::jsonb, 3 from public.categories where slug = 'acompanamiento-mayores' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'tecnologia-mayores', '{"es":"Tecnología para mayores","ca":"Tecnologia per a gent gran","en":"Tech help for seniors"}'::jsonb, 4 from public.categories where slug = 'acompanamiento-mayores' on conflict (category_id, slug) do nothing;
insert into public.categories (slug, name, description, icon, color, sort_order, requires_review, is_sensitive, allow_photos, required_verifications, warnings, restrictions)
values ('mascotas', '{"es":"Mascotas","ca":"Mascotes","en":"Pets"}'::jsonb, '{"es":"Paseos, cuidado en casa y visitas a mascotas.","ca":"Passejades, cura a casa i visites a mascotes.","en":"Walks, pet sitting and visits."}'::jsonb, 'paw-print', '#86641D', 6, false, false, true, array[]::public.verification_kind[], null, null)
on conflict (slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'paseo-perros', '{"es":"Paseo de perros","ca":"Passeig de gossos","en":"Dog walking"}'::jsonb, 1 from public.categories where slug = 'mascotas' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'cuidado-domicilio', '{"es":"Cuidado a domicilio","ca":"Cura a domicili","en":"Pet sitting"}'::jsonb, 2 from public.categories where slug = 'mascotas' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'visitas-gatos', '{"es":"Visitas a gatos","ca":"Visites a gats","en":"Cat visits"}'::jsonb, 3 from public.categories where slug = 'mascotas' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'traslado-veterinario', '{"es":"Traslado al veterinario","ca":"Trasllat al veterinari","en":"Vet trips"}'::jsonb, 4 from public.categories where slug = 'mascotas' on conflict (category_id, slug) do nothing;
insert into public.category_fields (category_id, key, label, field_type, options, is_required, validation, sort_order) select id, 'animal', '{"es":"Animal","ca":"Animal","en":"Animal"}'::jsonb, 'select', '[{"value":"perro","label":{"es":"Perro","ca":"Gos","en":"Dog"}},{"value":"gato","label":{"es":"Gato","ca":"Gat","en":"Cat"}},{"value":"otro","label":{"es":"Otro","ca":"Altre","en":"Other"}}]'::jsonb, false, null, 1 from public.categories where slug = 'mascotas' on conflict (category_id, key) do nothing;
insert into public.category_fields (category_id, key, label, field_type, options, is_required, validation, sort_order) select id, 'tamano', '{"es":"Tamaño","ca":"Mida","en":"Size"}'::jsonb, 'select', '[{"value":"pequeno","label":{"es":"Pequeño","ca":"Petit","en":"Small"}},{"value":"mediano","label":{"es":"Mediano","ca":"Mitjà","en":"Medium"}},{"value":"grande","label":{"es":"Grande","ca":"Gran","en":"Large"}}]'::jsonb, false, null, 2 from public.categories where slug = 'mascotas' on conflict (category_id, key) do nothing;
insert into public.categories (slug, name, description, icon, color, sort_order, requires_review, is_sensitive, allow_photos, required_verifications, warnings, restrictions)
values ('clases-formacion', '{"es":"Clases y formación","ca":"Classes i formació","en":"Lessons & tutoring"}'::jsonb, '{"es":"Refuerzo escolar, idiomas, música e informática.","ca":"Reforç escolar, idiomes, música i informàtica.","en":"Tutoring, languages, music and computer skills."}'::jsonb, 'graduation-cap', '#2F6AA3', 7, false, false, true, array[]::public.verification_kind[], null, null)
on conflict (slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'refuerzo-escolar', '{"es":"Refuerzo escolar","ca":"Reforç escolar","en":"School tutoring"}'::jsonb, 1 from public.categories where slug = 'clases-formacion' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'idiomas', '{"es":"Idiomas","ca":"Idiomes","en":"Languages"}'::jsonb, 2 from public.categories where slug = 'clases-formacion' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'musica', '{"es":"Música","ca":"Música","en":"Music"}'::jsonb, 3 from public.categories where slug = 'clases-formacion' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'informatica', '{"es":"Informática","ca":"Informàtica","en":"Computer skills"}'::jsonb, 4 from public.categories where slug = 'clases-formacion' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'deporte', '{"es":"Deporte","ca":"Esport","en":"Sports"}'::jsonb, 5 from public.categories where slug = 'clases-formacion' on conflict (category_id, slug) do nothing;
insert into public.categories (slug, name, description, icon, color, sort_order, requires_review, is_sensitive, allow_photos, required_verifications, warnings, restrictions)
values ('jardineria-exterior', '{"es":"Jardinería y exterior","ca":"Jardineria i exterior","en":"Gardening & outdoors"}'::jsonb, '{"es":"Césped, poda, riego y terrazas.","ca":"Gespa, poda, reg i terrasses.","en":"Lawns, pruning, watering and terraces."}'::jsonb, 'sprout', '#427531', 8, false, false, true, array[]::public.verification_kind[], null, null)
on conflict (slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'cortar-cesped', '{"es":"Cortar el césped","ca":"Tallar la gespa","en":"Lawn mowing"}'::jsonb, 1 from public.categories where slug = 'jardineria-exterior' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'poda', '{"es":"Poda","ca":"Poda","en":"Pruning"}'::jsonb, 2 from public.categories where slug = 'jardineria-exterior' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'riego-vacaciones', '{"es":"Riego en vacaciones","ca":"Reg en vacances","en":"Holiday watering"}'::jsonb, 3 from public.categories where slug = 'jardineria-exterior' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'terrazas-balcones', '{"es":"Terrazas y balcones","ca":"Terrasses i balcons","en":"Terraces & balconies"}'::jsonb, 4 from public.categories where slug = 'jardineria-exterior' on conflict (category_id, slug) do nothing;
insert into public.categories (slug, name, description, icon, color, sort_order, requires_review, is_sensitive, allow_photos, required_verifications, warnings, restrictions)
values ('tecnologia-soporte', '{"es":"Tecnología y soporte","ca":"Tecnologia i suport","en":"Tech support"}'::jsonb, '{"es":"Móviles, ordenadores, wifi y dispositivos.","ca":"Mòbils, ordinadors, wifi i dispositius.","en":"Phones, computers, Wi-Fi and devices."}'::jsonb, 'smartphone', '#25628F', 9, false, false, true, array[]::public.verification_kind[], '{"es":"No compartas contraseñas ni códigos de verificación. Si hace falta iniciar sesión en una cuenta, hazlo tú delante de la persona que te ayuda y cambia la contraseña después si la has tenido que mostrar.","ca":"No comparteixis contrasenyes ni codis de verificació. Si cal iniciar sessió en un compte, fes-ho tu davant de la persona que t’ajuda i canvia la contrasenya després si l’has hagut de mostrar.","en":"Do not share passwords or verification codes. If an account login is needed, do it yourself in front of the helper and change the password afterwards if you had to reveal it."}'::jsonb, null)
on conflict (slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'moviles-tablets', '{"es":"Móviles y tablets","ca":"Mòbils i tauletes","en":"Phones & tablets"}'::jsonb, 1 from public.categories where slug = 'tecnologia-soporte' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'ordenadores', '{"es":"Ordenadores","ca":"Ordinadors","en":"Computers"}'::jsonb, 2 from public.categories where slug = 'tecnologia-soporte' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'wifi-redes', '{"es":"Wifi y redes","ca":"Wifi i xarxes","en":"Wi-Fi & networks"}'::jsonb, 3 from public.categories where slug = 'tecnologia-soporte' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'tv-dispositivos', '{"es":"Televisión y dispositivos","ca":"Televisió i dispositius","en":"TV & devices"}'::jsonb, 4 from public.categories where slug = 'tecnologia-soporte' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'copias-fotos', '{"es":"Copias de seguridad y fotos","ca":"Còpies de seguretat i fotos","en":"Backups & photos"}'::jsonb, 5 from public.categories where slug = 'tecnologia-soporte' on conflict (category_id, slug) do nothing;
insert into public.categories (slug, name, description, icon, color, sort_order, requires_review, is_sensitive, allow_photos, required_verifications, warnings, restrictions)
values ('eventos-servicios-personales', '{"es":"Eventos y servicios personales","ca":"Esdeveniments i serveis personals","en":"Events & personal services"}'::jsonb, '{"es":"Fotografía, música, ayuda en celebraciones.","ca":"Fotografia, música, ajuda en celebracions.","en":"Photography, music, help at celebrations."}'::jsonb, 'party-popper', '#A3404F', 10, false, false, true, array[]::public.verification_kind[], null, null)
on conflict (slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'fotografia', '{"es":"Fotografía","ca":"Fotografia","en":"Photography"}'::jsonb, 1 from public.categories where slug = 'eventos-servicios-personales' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'musica-eventos', '{"es":"Música para eventos","ca":"Música per a esdeveniments","en":"Event music"}'::jsonb, 2 from public.categories where slug = 'eventos-servicios-personales' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'ayuda-eventos', '{"es":"Ayuda en eventos","ca":"Ajuda en esdeveniments","en":"Event staff"}'::jsonb, 3 from public.categories where slug = 'eventos-servicios-personales' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'organizacion-fiestas', '{"es":"Organización de fiestas","ca":"Organització de festes","en":"Party planning"}'::jsonb, 4 from public.categories where slug = 'eventos-servicios-personales' on conflict (category_id, slug) do nothing;
insert into public.categories (slug, name, description, icon, color, sort_order, requires_review, is_sensitive, allow_photos, required_verifications, warnings, restrictions)
values ('cuidado-ninos', '{"es":"Cuidado de niños","ca":"Cura d’infants","en":"Childcare"}'::jsonb, '{"es":"Canguro, recogida del colegio y ayuda con deberes.","ca":"Cangur, recollida de l’escola i ajuda amb els deures.","en":"Babysitting, school pick-up and homework help."}'::jsonb, 'baby', '#A2521C', 11, true, true, false, array['identity']::public.verification_kind[], '{"es":"No publiques nombres, fotos, colegio ni otros datos de los menores. Conoced a la persona antes en un lugar público o por videollamada, pide referencias y comprueba sus verificaciones. Para trabajos habituales con menores puede ser obligatorio el certificado negativo de delitos sexuales.","ca":"No publiquis noms, fotos, escola ni altres dades dels menors. Conegueu la persona abans en un lloc públic o per videotrucada, demana referències i comprova’n les verificacions. Per a feines habituals amb menors pot ser obligatori el certificat negatiu de delictes sexuals.","en":"Do not publish names, photos, school or other details of children. Meet the person first in a public place or by video call, ask for references and check their verifications. Regular work with minors may legally require a sex-offence clearance certificate."}'::jsonb, '{"es":"No se permiten fotos ni datos identificativos de menores.","ca":"No es permeten fotos ni dades identificatives de menors.","en":"Photos or identifying details of minors are not allowed."}'::jsonb)
on conflict (slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'canguro', '{"es":"Canguro","ca":"Cangur","en":"Babysitting"}'::jsonb, 1 from public.categories where slug = 'cuidado-ninos' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'recogida-colegio', '{"es":"Recogida del colegio","ca":"Recollida de l’escola","en":"School pick-up"}'::jsonb, 2 from public.categories where slug = 'cuidado-ninos' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'ayuda-deberes', '{"es":"Ayuda con los deberes","ca":"Ajuda amb els deures","en":"Homework help"}'::jsonb, 3 from public.categories where slug = 'cuidado-ninos' on conflict (category_id, slug) do nothing;
insert into public.category_fields (category_id, key, label, field_type, options, is_required, validation, sort_order) select id, 'numero_ninos', '{"es":"Número de niños","ca":"Nombre d’infants","en":"Number of children"}'::jsonb, 'number', null, false, '{"min":1,"max":6}'::jsonb, 1 from public.categories where slug = 'cuidado-ninos' on conflict (category_id, key) do nothing;
insert into public.category_fields (category_id, key, label, field_type, options, is_required, validation, sort_order) select id, 'franja_edad', '{"es":"Franja de edad","ca":"Franja d’edat","en":"Age range"}'::jsonb, 'select', '[{"value":"0-2","label":{"es":"0–2 años","ca":"0–2 anys","en":"0–2 years"}},{"value":"3-5","label":{"es":"3–5 años","ca":"3–5 anys","en":"3–5 years"}},{"value":"6-11","label":{"es":"6–11 años","ca":"6–11 anys","en":"6–11 years"}},{"value":"12-17","label":{"es":"12–17 años","ca":"12–17 anys","en":"12–17 years"}}]'::jsonb, false, null, 2 from public.categories where slug = 'cuidado-ninos' on conflict (category_id, key) do nothing;
insert into public.categories (slug, name, description, icon, color, sort_order, requires_review, is_sensitive, allow_photos, required_verifications, warnings, restrictions)
values ('belleza-domicilio', '{"es":"Belleza a domicilio","ca":"Bellesa a domicili","en":"Beauty at home"}'::jsonb, '{"es":"Peluquería, manicura y maquillaje en casa.","ca":"Perruqueria, manicura i maquillatge a casa.","en":"Hairdressing, nails and make-up at home."}'::jsonb, 'scissors', '#954C83', 12, false, false, true, array[]::public.verification_kind[], '{"es":"Avisa de alergias o problemas de piel. Los tratamientos sanitarios o estéticos invasivos no están permitidos.","ca":"Avisa d’al·lèrgies o problemes de pell. Els tractaments sanitaris o estètics invasius no estan permesos.","en":"Mention any allergies or skin conditions. Medical or invasive cosmetic treatments are not allowed."}'::jsonb, null)
on conflict (slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'peluqueria', '{"es":"Peluquería","ca":"Perruqueria","en":"Hairdressing"}'::jsonb, 1 from public.categories where slug = 'belleza-domicilio' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'manicura-pedicura', '{"es":"Manicura y pedicura","ca":"Manicura i pedicura","en":"Manicure & pedicure"}'::jsonb, 2 from public.categories where slug = 'belleza-domicilio' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'maquillaje', '{"es":"Maquillaje","ca":"Maquillatge","en":"Make-up"}'::jsonb, 3 from public.categories where slug = 'belleza-domicilio' on conflict (category_id, slug) do nothing;
insert into public.categories (slug, name, description, icon, color, sort_order, requires_review, is_sensitive, allow_photos, required_verifications, warnings, restrictions)
values ('obras-pintura', '{"es":"Obras y pintura","ca":"Obres i pintura","en":"Building & painting"}'::jsonb, '{"es":"Pintura, alicatado, pladur y humedades.","ca":"Pintura, enrajolat, pladur i humitats.","en":"Painting, tiling, drywall and damp."}'::jsonb, 'paint-roller', '#6E5D49', 13, false, false, true, array[]::public.verification_kind[], '{"es":"Algunas obras necesitan licencia o comunicación al ayuntamiento. Pide presupuesto por escrito y acordad qué incluye antes de empezar.","ca":"Algunes obres necessiten llicència o comunicació a l’ajuntament. Demana pressupost per escrit i acordeu què inclou abans de començar.","en":"Some works require a permit or notice to the town hall. Ask for a written quote and agree on what it includes before starting."}'::jsonb, null)
on conflict (slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'pintura', '{"es":"Pintura","ca":"Pintura","en":"Painting"}'::jsonb, 1 from public.categories where slug = 'obras-pintura' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'alicatado-suelos', '{"es":"Alicatado y suelos","ca":"Enrajolat i terres","en":"Tiling & floors"}'::jsonb, 2 from public.categories where slug = 'obras-pintura' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'pladur', '{"es":"Pladur y tabiques","ca":"Pladur i envans","en":"Drywall"}'::jsonb, 3 from public.categories where slug = 'obras-pintura' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'humedades', '{"es":"Humedades","ca":"Humitats","en":"Damp"}'::jsonb, 4 from public.categories where slug = 'obras-pintura' on conflict (category_id, slug) do nothing;
insert into public.categories (slug, name, description, icon, color, sort_order, requires_review, is_sensitive, allow_photos, required_verifications, warnings, restrictions)
values ('cocina-domicilio', '{"es":"Cocina a domicilio","ca":"Cuina a domicili","en":"Home cooking"}'::jsonb, '{"es":"Chef en casa, cocina para la semana y repostería.","ca":"Xef a casa, cuina per a la setmana i rebosteria.","en":"Private chef, batch cooking and baking."}'::jsonb, 'chef-hat', '#A84B26', 14, false, false, true, array[]::public.verification_kind[], '{"es":"Informa siempre de alergias e intolerancias. Quien cocina debe seguir buenas prácticas de higiene alimentaria.","ca":"Informa sempre d’al·lèrgies i intoleràncies. Qui cuina ha de seguir bones pràctiques d’higiene alimentària.","en":"Always mention allergies and intolerances. The person cooking must follow good food-hygiene practices."}'::jsonb, null)
on conflict (slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'chef-domicilio', '{"es":"Chef a domicilio","ca":"Xef a domicili","en":"Private chef"}'::jsonb, 1 from public.categories where slug = 'cocina-domicilio' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'cocina-semana', '{"es":"Cocina para la semana","ca":"Cuina per a la setmana","en":"Batch cooking"}'::jsonb, 2 from public.categories where slug = 'cocina-domicilio' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'reposteria', '{"es":"Repostería","ca":"Rebosteria","en":"Baking"}'::jsonb, 3 from public.categories where slug = 'cocina-domicilio' on conflict (category_id, slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'clases-cocina', '{"es":"Clases de cocina","ca":"Classes de cuina","en":"Cooking lessons"}'::jsonb, 4 from public.categories where slug = 'cocina-domicilio' on conflict (category_id, slug) do nothing;
insert into public.categories (slug, name, description, icon, color, sort_order, requires_review, is_sensitive, allow_photos, required_verifications, warnings, restrictions)
values ('otros', '{"es":"Otros servicios","ca":"Altres serveis","en":"Other services"}'::jsonb, '{"es":"Lo que no encaja en otra categoría (siempre que esté permitido).","ca":"El que no encaixa en cap altra categoria (sempre que estigui permès).","en":"Anything that doesn’t fit elsewhere (as long as it is allowed)."}'::jsonb, 'shapes', '#5F646B', 15, true, false, true, array[]::public.verification_kind[], null, null)
on conflict (slug) do nothing;
insert into public.subcategories (category_id, slug, name, sort_order) select id, 'varios', '{"es":"Varios","ca":"Diversos","en":"Miscellaneous"}'::jsonb, 1 from public.categories where slug = 'otros' on conflict (category_id, slug) do nothing;

-- Feature flags (todas las opcionales empiezan apagadas)
insert into public.feature_flags (key, enabled, description) values ('map_view', false, 'Vista de mapa en Explorar') on conflict (key) do nothing;
insert into public.feature_flags (key, enabled, description) values ('exchange_pricing', false, 'Permitir el tipo de precio «intercambio»') on conflict (key) do nothing;
insert into public.feature_flags (key, enabled, description) values ('sms_notifications', false, 'Avisos por SMS para eventos críticos') on conflict (key) do nothing;
insert into public.feature_flags (key, enabled, description) values ('pro_subscription', false, 'Suscripción PRO') on conflict (key) do nothing;
insert into public.feature_flags (key, enabled, description) values ('promoted_listings', false, 'Anuncios destacados de pago') on conflict (key) do nothing;
insert into public.feature_flags (key, enabled, description) values ('ai_help_assistant', false, 'Asistente del centro de ayuda') on conflict (key) do nothing;
insert into public.feature_flags (key, enabled, description) values ('google_login', false, 'Iniciar sesión con Google') on conflict (key) do nothing;
insert into public.feature_flags (key, enabled, description) values ('apple_login', false, 'Iniciar sesión con Apple (obligatorio en iOS si hay login social)') on conflict (key) do nothing;
insert into public.feature_flags (key, enabled, description) values ('payments', true, 'Pagos de reservas (simulador si no hay claves de Stripe)') on conflict (key) do nothing;

-- Ajustes de plataforma
insert into public.platform_settings (key, value, description, is_public) values ('listings.expiry_days', '30'::jsonb, 'Días que dura publicado un anuncio', true) on conflict (key) do nothing;
insert into public.platform_settings (key, value, description, is_public) values ('listings.max_images', '6'::jsonb, 'Máximo de fotos por anuncio', true) on conflict (key) do nothing;
insert into public.platform_settings (key, value, description, is_public) values ('bookings.auto_confirm_hours', '72'::jsonb, 'Horas tras «terminado» para confirmar automáticamente si no hay incidencia', true) on conflict (key) do nothing;
insert into public.platform_settings (key, value, description, is_public) values ('proposals.expiry_hours', '72'::jsonb, 'Caducidad por defecto de las propuestas', true) on conflict (key) do nothing;
insert into public.platform_settings (key, value, description, is_public) values ('reviews.window_days', '14'::jsonb, 'Días para valorar tras completar', true) on conflict (key) do nothing;
insert into public.platform_settings (key, value, description, is_public) values ('home.stats_thresholds', '{"users":200,"verified":50,"completed":100,"ratings":30}'::jsonb, 'Por debajo de estos valores no se muestran los indicadores de la portada', true) on conflict (key) do nothing;
insert into public.platform_settings (key, value, description, is_public) values ('app.min_version', '{"ios":"1.0.0","android":"1.0.0"}'::jsonb, 'Versión mínima de la app; por debajo se pide actualizar', true) on conflict (key) do nothing;
insert into public.platform_settings (key, value, description, is_public) values ('legal.current_versions', '{"terms":"2026-10-borrador","privacy":"2026-10-borrador","cookies":"2026-10-borrador"}'::jsonb, 'Versiones vigentes que se aceptan al registrarse', true) on conflict (key) do nothing;

-- Términos que envían un anuncio a revisión manual (lista inicial, ampliable desde administración)
insert into public.blocked_terms (term, action) values ('contraseña', 'review') on conflict (term) do nothing;
insert into public.blocked_terms (term, action) values ('contrasena', 'review') on conflict (term) do nothing;
insert into public.blocked_terms (term, action) values ('certificado digital', 'review') on conflict (term) do nothing;
insert into public.blocked_terms (term, action) values ('clave pin', 'review') on conflict (term) do nothing;
insert into public.blocked_terms (term, action) values ('cl@ve', 'review') on conflict (term) do nothing;
insert into public.blocked_terms (term, action) values ('código sms', 'review') on conflict (term) do nothing;
insert into public.blocked_terms (term, action) values ('suplantar', 'reject') on conflict (term) do nothing;
insert into public.blocked_terms (term, action) values ('hacerme pasar', 'reject') on conflict (term) do nothing;
insert into public.blocked_terms (term, action) values ('arma', 'review') on conflict (term) do nothing;
insert into public.blocked_terms (term, action) values ('droga', 'review') on conflict (term) do nothing;
insert into public.blocked_terms (term, action) values ('marihuana', 'reject') on conflict (term) do nothing;
insert into public.blocked_terms (term, action) values ('cocaína', 'reject') on conflict (term) do nothing;
insert into public.blocked_terms (term, action) values ('robado', 'reject') on conflict (term) do nothing;
insert into public.blocked_terms (term, action) values ('préstamo rápido', 'review') on conflict (term) do nothing;
insert into public.blocked_terms (term, action) values ('criptomoneda', 'review') on conflict (term) do nothing;
insert into public.blocked_terms (term, action) values ('masaje erótico', 'reject') on conflict (term) do nothing;
insert into public.blocked_terms (term, action) values ('escort', 'reject') on conflict (term) do nothing;
insert into public.blocked_terms (term, action) values ('receta médica', 'review') on conflict (term) do nothing;
insert into public.blocked_terms (term, action) values ('instalación de gas', 'review') on conflict (term) do nothing;
insert into public.blocked_terms (term, action) values ('boletín eléctrico', 'review') on conflict (term) do nothing;

-- Documentos legales (BORRADORES pendientes de revisión jurídica)
insert into public.legal_documents (kind, version, locale, title, body_md, is_draft, published_at) values ('cancellations', '2026-10-borrador', 'es', 'Política de cancelación (ejemplo inicial)', '# Política de cancelación (ejemplo inicial)

> **BORRADOR — PENDIENTE DE REVISIÓN JURÍDICA.** Este texto es orientativo, no es definitivo y no debe publicarse en producción sin la revisión de un profesional. Los datos entre corchetes se completarán con la información real de la empresa.

| Caso | Reembolso a quien contrata |
|---|---|
| Cancelas con más de 24 h de antelación | 100 % del precio del servicio (la comisión de gestión no se reembolsa) |
| Cancelas entre 24 h y 2 h antes | 50 % del precio del servicio |
| Cancelas con menos de 2 h o no te presentas | Sin reembolso del precio del servicio |
| Cancela quien presta el servicio o no se presenta | 100 % del total, incluidas comisiones |
| Fuerza mayor acreditada | Lo decide el equipo de soporte (por defecto, 100 %) |

Antes de confirmar una cancelación siempre verás el cálculo exacto.
', true, now()) on conflict (kind, version, locale) do nothing;
insert into public.legal_documents (kind, version, locale, title, body_md, is_draft, published_at) values ('community_rules', '2026-10-borrador', 'es', 'Normas de la comunidad', '# Normas de la comunidad

> **BORRADOR — PENDIENTE DE REVISIÓN JURÍDICA.** Este texto es orientativo, no es definitivo y no debe publicarse en producción sin la revisión de un profesional. Los datos entre corchetes se completarán con la información real de la empresa.

## Lo que esperamos
- Trato respetuoso y honesto.
- Anuncios claros, con precio y condiciones reales.
- Usar el chat y los pagos de la plataforma.

## Lo que no está permitido
- Actividades ilegales, fraude o suplantación de identidad.
- Pedir, ofrecer o compartir contraseñas, PIN, códigos SMS, certificados digitales o claves de otra persona.
- Armas, drogas, material robado o servicios sexuales.
- Servicios sanitarios, instalaciones de gas, electricidad u otros servicios regulados sin la habilitación necesaria.
- Contenido discriminatorio, acoso o explotación.
- Publicar datos, fotos o información identificativa de menores.
- Proponer pagos fuera de la plataforma para evitar la protección o las comisiones.

## Qué pasa si se incumplen
Según la gravedad: aviso, retirada del contenido, limitación de funciones, suspensión temporal o cierre de la cuenta. Siempre te explicaremos el motivo y cómo reclamar.
', true, now()) on conflict (kind, version, locale) do nothing;
insert into public.legal_documents (kind, version, locale, title, body_md, is_draft, published_at) values ('cookies', '2026-10-borrador', 'es', 'Política de cookies', '# Política de cookies

> **BORRADOR — PENDIENTE DE REVISIÓN JURÍDICA.** Este texto es orientativo, no es definitivo y no debe publicarse en producción sin la revisión de un profesional. Los datos entre corchetes se completarán con la información real de la empresa.

Usamos cookies técnicas imprescindibles para mantener tu sesión y tus preferencias. Las cookies de análisis o de terceros solo se activan si las aceptas, y puedes cambiar tu elección en cualquier momento desde el enlace «Preferencias de cookies» del pie de página.

| Cookie | Tipo | Finalidad | Duración |
|---|---|---|---|
| sb-*-auth-token | Técnica | Mantener la sesión iniciada | Sesión / hasta cerrar sesión |
| NEXT_LOCALE | Técnica | Recordar el idioma | 1 año |
| consent | Técnica | Recordar tu elección de cookies | 6 meses |
', true, now()) on conflict (kind, version, locale) do nothing;
insert into public.legal_documents (kind, version, locale, title, body_md, is_draft, published_at) values ('legal_notice', '2026-10-borrador', 'es', 'Aviso legal', '# Aviso legal

> **BORRADOR — PENDIENTE DE REVISIÓN JURÍDICA.** Este texto es orientativo, no es definitivo y no debe publicarse en producción sin la revisión de un profesional. Los datos entre corchetes se completarán con la información real de la empresa.

- Titular: [Razón social]
- NIF: [NIF]
- Domicilio: [dirección]
- Registro mercantil: [datos registrales]
- Contacto: [correo]
', true, now()) on conflict (kind, version, locale) do nothing;
insert into public.legal_documents (kind, version, locale, title, body_md, is_draft, published_at) values ('privacy', '2026-10-borrador', 'es', 'Política de privacidad', '# Política de privacidad

> **BORRADOR — PENDIENTE DE REVISIÓN JURÍDICA.** Este texto es orientativo, no es definitivo y no debe publicarse en producción sin la revisión de un profesional. Los datos entre corchetes se completarán con la información real de la empresa.

## Responsable
[Razón social], [NIF], [dirección]. Contacto de privacidad: [correo].

## Qué datos tratamos y para qué
| Datos | Finalidad | Base jurídica |
|---|---|---|
| Nombre, correo, contraseña (cifrada) | Crear y gestionar tu cuenta | Ejecución del contrato |
| Perfil público (nombre público, foto, municipio, biografía) | Mostrarte a otras personas usuarias | Ejecución del contrato |
| Municipio y ubicación aproximada | Mostrar anuncios cercanos sin revelar tu dirección | Ejecución del contrato |
| Mensajes y adjuntos | Permitir la comunicación y resolver incidencias | Ejecución del contrato / interés legítimo (seguridad) |
| Datos de pago | Procesar pagos a través de [proveedor] | Ejecución del contrato / obligación legal |
| Datos fiscales de prestadores | Cumplir obligaciones de información fiscal (DAC7) | Obligación legal |
| Registros técnicos | Seguridad y prevención del fraude | Interés legítimo |

## Cuánto tiempo los guardamos
[Tabla de plazos pendiente de revisión.]

## Con quién los compartimos
Proveedores que nos prestan servicios (alojamiento, base de datos, pagos, correo, notificaciones, monitorización de errores), con contrato de encargo de tratamiento. [Lista y ubicación de datos.]

## Tus derechos
Acceso, rectificación, supresión, portabilidad, oposición y limitación desde *Cuenta → Privacidad* o escribiendo a [correo]. Puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).
', true, now()) on conflict (kind, version, locale) do nothing;
insert into public.legal_documents (kind, version, locale, title, body_md, is_draft, published_at) values ('ranking', '2026-10-borrador', 'es', 'Cómo ordenamos los resultados', '# Cómo ordenamos los resultados

> **BORRADOR — PENDIENTE DE REVISIÓN JURÍDICA.** Este texto es orientativo, no es definitivo y no debe publicarse en producción sin la revisión de un profesional. Los datos entre corchetes se completarán con la información real de la empresa.

Por defecto («Relevancia») los resultados se ordenan por:
1. Coincidencia con lo que has buscado (título, etiquetas y descripción, por ese orden de peso).
2. Fecha de publicación (más recientes primero).

También puedes ordenar por: más recientes, más cercanos (distancia aproximada al municipio elegido), menor precio, mejor valoración y mejor tiempo de respuesta.

Los anuncios **promocionados**, cuando existan, aparecerán siempre con la etiqueta «Promocionado» y en posiciones limitadas. Pagar no cambia las valoraciones ni el resto del orden.
', true, now()) on conflict (kind, version, locale) do nothing;
insert into public.legal_documents (kind, version, locale, title, body_md, is_draft, published_at) values ('reviews', '2026-10-borrador', 'es', 'Cómo funcionan las valoraciones', '# Cómo funcionan las valoraciones

> **BORRADOR — PENDIENTE DE REVISIÓN JURÍDICA.** Este texto es orientativo, no es definitivo y no debe publicarse en producción sin la revisión de un profesional. Los datos entre corchetes se completarán con la información real de la empresa.

- Solo pueden valorar las personas que han participado en una reserva completada a través de la plataforma.
- Cada participante puede dejar una valoración por reserva, durante los 14 días siguientes.
- Las valoraciones se publican cuando ambas partes han valorado o cuando termina ese plazo, para evitar represalias.
- No se admiten valoraciones anónimas ni sin reserva.
- Se pueden denunciar las valoraciones que incumplan las normas. Moderación puede ocultarlas explicando el motivo, pero nunca modifica su texto.
', true, now()) on conflict (kind, version, locale) do nothing;
insert into public.legal_documents (kind, version, locale, title, body_md, is_draft, published_at) values ('terms', '2026-10-borrador', 'es', 'Condiciones de uso', '# Condiciones de uso

> **BORRADOR — PENDIENTE DE REVISIÓN JURÍDICA.** Este texto es orientativo, no es definitivo y no debe publicarse en producción sin la revisión de un profesional. Los datos entre corchetes se completarán con la información real de la empresa.

## 1. Quiénes somos
[Razón social], con NIF [NIF] y domicilio en [dirección], gestiona la plataforma [Nombre de la plataforma] (la «plataforma»).

## 2. Qué es la plataforma
Un punto de encuentro entre personas que necesitan ayuda y personas que la ofrecen. La plataforma **no presta** los servicios publicados: los acuerdan y realizan las personas usuarias entre sí.

## 3. Cuenta
- Debes ser mayor de 18 años.
- La información de tu perfil debe ser veraz.
- Eres responsable de mantener segura tu contraseña.

## 4. Publicaciones
- Deben describir un servicio real y permitido según las Normas de la comunidad.
- No pueden contener datos de contacto, enlaces externos ni datos de terceros.
- Podemos revisar, pedir cambios o retirar publicaciones, explicando siempre el motivo y la forma de reclamar.

## 5. Pagos protegidos
- El pago de una reserva se realiza a través de la plataforma y de su proveedor de pagos.
- El importe se transfiere a quien presta el servicio cuando se confirma la finalización o, si no hay incidencias, al terminar el plazo de confirmación.
- Los importes, comisiones e impuestos se muestran siempre antes de pagar.
- Pagar fuera de la plataforma supone perder la protección.

## 6. Cancelaciones e incidencias
Se aplica la política de cancelación indicada en cada propuesta. Las incidencias se resuelven según el procedimiento descrito en el centro de ayuda.

## 7. Particulares y profesionales
Cada perfil indica si actúa como particular o como profesional. Los derechos de las personas consumidoras frente a profesionales no se ven limitados por estas condiciones.

## 8. Responsabilidad
[Pendiente de redacción jurídica.]

## 9. Ley aplicable y reclamaciones
[Pendiente de redacción jurídica. Incluir plataforma europea de resolución de litigios si procede.]
', true, now()) on conflict (kind, version, locale) do nothing;
commit;
