CREATE SCHEMA "gold";
--> statement-breakpoint
CREATE SCHEMA "silver";
--> statement-breakpoint
CREATE TABLE "silver"."autonomia" (
	"ine_code" text PRIMARY KEY NOT NULL,
	"nombre" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "silver"."eleccion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ano" integer NOT NULL,
	"mes" integer NOT NULL,
	"tipo" text NOT NULL,
	"auto_id" text,
	"prov_id" text,
	"muni_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gold"."congreso_hemiciclo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"eleccion_id" uuid NOT NULL,
	"partido_id" uuid NOT NULL,
	"nivel_ambito" text NOT NULL,
	"cod_provincia" char(2),
	"nombre_ambito" text NOT NULL,
	"escanos" integer,
	"votos" integer,
	"porcentaje_voto" numeric(8, 4),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "gold_congreso_hemiciclo_unique" UNIQUE("eleccion_id","nivel_ambito","cod_provincia","partido_id"),
	CONSTRAINT "check_nivel_ambito" CHECK ("gold"."congreso_hemiciclo"."nivel_ambito" IN ('nacional', 'provincia')),
	CONSTRAINT "check_provincia_req" CHECK (("gold"."congreso_hemiciclo"."nivel_ambito" = 'nacional' AND "gold"."congreso_hemiciclo"."cod_provincia" IS NULL) OR ("gold"."congreso_hemiciclo"."nivel_ambito" = 'provincia' AND "gold"."congreso_hemiciclo"."cod_provincia" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "silver"."mesa" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cod_prov" text NOT NULL,
	"cod_muni" text NOT NULL,
	"cod_distrito" text NOT NULL,
	"cod_seccion" text NOT NULL,
	"cod_mesa" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mesa_unique_idx" UNIQUE("cod_prov","cod_muni","cod_distrito","cod_seccion","cod_mesa")
);
--> statement-breakpoint
CREATE TABLE "silver"."municipio" (
	"prov_code" text,
	"muni_code" text,
	"nombre" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "municipio_prov_code_muni_code_pk" PRIMARY KEY("prov_code","muni_code")
);
--> statement-breakpoint
CREATE TABLE "silver"."partido" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"siglas" text,
	"color" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "silver"."partido_eleccion" (
	"partido_id" uuid NOT NULL,
	"eleccion_id" uuid NOT NULL,
	"siglas_eleccion" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "partido_eleccion_partido_id_eleccion_id_pk" PRIMARY KEY("partido_id","eleccion_id"),
	CONSTRAINT "partido_eleccion_siglas_unique" UNIQUE("eleccion_id","siglas_eleccion")
);
--> statement-breakpoint
CREATE TABLE "silver"."provincia" (
	"ine_code" text PRIMARY KEY NOT NULL,
	"auto_code" text,
	"nombre" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "silver"."voto" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mesa_id" uuid NOT NULL,
	"eleccion_id" uuid NOT NULL,
	"candidatura" uuid NOT NULL,
	"votos" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "voto_unique_idx" UNIQUE("mesa_id","eleccion_id","candidatura")
);
--> statement-breakpoint
ALTER TABLE "silver"."eleccion" ADD CONSTRAINT "eleccion_auto_id_autonomia_ine_code_fk" FOREIGN KEY ("auto_id") REFERENCES "silver"."autonomia"("ine_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "silver"."eleccion" ADD CONSTRAINT "eleccion_prov_id_muni_id_municipio_prov_code_muni_code_fk" FOREIGN KEY ("prov_id","muni_id") REFERENCES "silver"."municipio"("prov_code","muni_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gold"."congreso_hemiciclo" ADD CONSTRAINT "congreso_hemiciclo_eleccion_id_eleccion_id_fk" FOREIGN KEY ("eleccion_id") REFERENCES "silver"."eleccion"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gold"."congreso_hemiciclo" ADD CONSTRAINT "congreso_hemiciclo_partido_id_partido_id_fk" FOREIGN KEY ("partido_id") REFERENCES "silver"."partido"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gold"."congreso_hemiciclo" ADD CONSTRAINT "congreso_hemiciclo_cod_provincia_provincia_ine_code_fk" FOREIGN KEY ("cod_provincia") REFERENCES "silver"."provincia"("ine_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gold"."congreso_hemiciclo" ADD CONSTRAINT "congreso_hemiciclo_partido_id_eleccion_id_partido_eleccion_partido_id_eleccion_id_fk" FOREIGN KEY ("partido_id","eleccion_id") REFERENCES "silver"."partido_eleccion"("partido_id","eleccion_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "silver"."mesa" ADD CONSTRAINT "mesa_cod_prov_cod_muni_municipio_prov_code_muni_code_fk" FOREIGN KEY ("cod_prov","cod_muni") REFERENCES "silver"."municipio"("prov_code","muni_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "silver"."municipio" ADD CONSTRAINT "municipio_prov_code_provincia_ine_code_fk" FOREIGN KEY ("prov_code") REFERENCES "silver"."provincia"("ine_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "silver"."partido_eleccion" ADD CONSTRAINT "partido_eleccion_partido_id_partido_id_fk" FOREIGN KEY ("partido_id") REFERENCES "silver"."partido"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "silver"."partido_eleccion" ADD CONSTRAINT "partido_eleccion_eleccion_id_eleccion_id_fk" FOREIGN KEY ("eleccion_id") REFERENCES "silver"."eleccion"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "silver"."provincia" ADD CONSTRAINT "provincia_auto_code_autonomia_ine_code_fk" FOREIGN KEY ("auto_code") REFERENCES "silver"."autonomia"("ine_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "silver"."voto" ADD CONSTRAINT "voto_mesa_id_mesa_id_fk" FOREIGN KEY ("mesa_id") REFERENCES "silver"."mesa"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "silver"."voto" ADD CONSTRAINT "voto_eleccion_id_eleccion_id_fk" FOREIGN KEY ("eleccion_id") REFERENCES "silver"."eleccion"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "silver"."voto" ADD CONSTRAINT "voto_candidatura_partido_id_fk" FOREIGN KEY ("candidatura") REFERENCES "silver"."partido"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "eleccion_unique_idx" ON "silver"."eleccion" USING btree ("ano","mes","tipo","auto_id","prov_id","muni_id");