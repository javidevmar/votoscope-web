import { pgTable, pgSchema, text, integer, uuid, timestamp, uniqueIndex, primaryKey, unique, foreignKey, char, decimal, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ------------------------------------------------------------------
// ESQUEMAS
// ------------------------------------------------------------------
export const silverSchema = pgSchema('silver');
export const goldSchema = pgSchema('gold');

// ------------------------------------------------------------------
// SILVER: Tablas Normalizadas (Fuente de Verdad de Datos)
// ------------------------------------------------------------------

export const autonomia = silverSchema.table('autonomia', {
	ineCode: text('ine_code').primaryKey(),
	nombre: text('nombre'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const provincia = silverSchema.table('provincia', {
	ineCode: text('ine_code').primaryKey(),
	autoCode: text('auto_code').references(() => autonomia.ineCode),
	nombre: text('nombre'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const municipio = silverSchema.table('municipio', {
	provCode: text('prov_code').references(() => provincia.ineCode),
	muniCode: text('muni_code'),
	nombre: text('nombre'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
	return {
		pk: primaryKey({ columns: [table.provCode, table.muniCode] }),
	};
});

export const eleccion = silverSchema.table('eleccion', {
	id: uuid('id').primaryKey().defaultRandom(),
	ano: integer('ano').notNull(),
	mes: integer('mes').notNull(),
	tipo: text('tipo').notNull(),
	autoId: text('auto_id').references(() => autonomia.ineCode),
	provId: text('prov_id'),
	muniId: text('muni_id'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
	return {
		municipioFk: foreignKey({
			columns: [table.provId, table.muniId],
			foreignColumns: [municipio.provCode, municipio.muniCode],
		}),
		uniqueEleccion: uniqueIndex('eleccion_unique_idx').on(
			table.ano,
			table.mes,
			table.tipo,
			table.autoId,
			table.provId,
			table.muniId
		),
	};
});

export const partido = silverSchema.table('partido', {
	id: uuid('id').primaryKey().defaultRandom(),
	nombre: text('nombre').notNull(),
	siglas: text('siglas'),
	color: text('color'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const partidoEleccion = silverSchema.table('partido_eleccion', {
	partidoId: uuid('partido_id').references(() => partido.id).notNull(),
	eleccionId: uuid('eleccion_id').references(() => eleccion.id).notNull(),
	siglasEleccion: text('siglas_eleccion'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
	return {
		pk: primaryKey({ columns: [table.partidoId, table.eleccionId] }),
		uniqueSiglas: unique('partido_eleccion_siglas_unique').on(table.eleccionId, table.siglasEleccion),
	};
});

export const mesa = silverSchema.table('mesa', {
	id: uuid('id').primaryKey().defaultRandom(),
	codProv: text('cod_prov').notNull(),
	codMuni: text('cod_muni').notNull(),
	codDistrito: text('cod_distrito').notNull(),
	codSeccion: text('cod_seccion').notNull(),
	codMesa: text('cod_mesa').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
	return {
		municipioFk: foreignKey({
			columns: [table.codProv, table.codMuni],
			foreignColumns: [municipio.provCode, municipio.muniCode],
		}),
		uniqueMesa: unique('mesa_unique_idx').on(
			table.codProv,
			table.codMuni,
			table.codDistrito,
			table.codSeccion,
			table.codMesa
		),
	};
});

export const voto = silverSchema.table('voto', {
	id: uuid('id').primaryKey().defaultRandom(),
	mesaId: uuid('mesa_id').references(() => mesa.id).notNull(),
	eleccionId: uuid('eleccion_id').references(() => eleccion.id).notNull(),
	candidatura: uuid('candidatura').references(() => partido.id).notNull(),
	votos: integer('votos').notNull().default(0),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
	return {
		uniqueVoto: unique('voto_unique_idx').on(table.mesaId, table.eleccionId, table.candidatura),
	};
});

// ------------------------------------------------------------------
// GOLD: Tablas Agregadas (Vistas Materializadas / Tablas finales)
// ------------------------------------------------------------------

export const goldCongresoHemiciclo = goldSchema.table('congreso_hemiciclo', {
    id: uuid('id').primaryKey().defaultRandom(),
    eleccionId: uuid('eleccion_id').references(() => eleccion.id, { onDelete: 'cascade' }).notNull(),
    partidoId: uuid('partido_id').references(() => partido.id, { onDelete: 'cascade' }).notNull(),
    nivelAmbito: text('nivel_ambito').notNull(), // 'nacional' | 'provincia'
    codProvincia: char('cod_provincia', { length: 2 }).references(() => provincia.ineCode),
    nombreAmbito: text('nombre_ambito').notNull(),
    escanos: integer('escanos'),
    votos: integer('votos'),
    porcentajeVoto: decimal('porcentaje_voto', { precision: 8, scale: 4 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
    return {
        // FK compuesta opcional para integridad extra
        partidoEleccionFk: foreignKey({
            columns: [table.partidoId, table.eleccionId],
            foreignColumns: [partidoEleccion.partidoId, partidoEleccion.eleccionId],
        }).onDelete('cascade'),
        
        uniqueHemiciclo: unique('gold_congreso_hemiciclo_unique').on(
            table.eleccionId, 
            table.nivelAmbito, 
            table.codProvincia, 
            table.partidoId
        ),
        
        checkAmbito: check('check_nivel_ambito', sql`${table.nivelAmbito} IN ('nacional', 'provincia')`),
        checkProvincia: check('check_provincia_req', sql`(${table.nivelAmbito} = 'nacional' AND ${table.codProvincia} IS NULL) OR (${table.nivelAmbito} = 'provincia' AND ${table.codProvincia} IS NOT NULL)`),
    };
});