# ADR 0004 — Ubicación aproximada

- Estado: aceptada
- Fecha: 2026-10-19

## Decisión

- Cada anuncio guarda `location_public geography(Point)` **ya redondeada** a una cuadrícula de unos 1,1 km (3 decimales de latitud y longitud ≈ 111 m → usamos 2 decimales ≈ 1,1 km). El punto exacto (si existe) vive solo en tablas privadas.
- Para la demo y el MVP, la ubicación se deriva del **municipio** (tabla `municipalities` con su centroide), no de la dirección del usuario. No se pide la dirección hasta que hay una reserva presencial confirmada.
- Las búsquedas por distancia usan PostGIS (`ST_DWithin`) sobre el punto público; las distancias se muestran redondeadas («a unos 5 km»).
- En la app, la ubicación del dispositivo solo se usa con permiso y solo para elegir el municipio más cercano; no se guarda.
