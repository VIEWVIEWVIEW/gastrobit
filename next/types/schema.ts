import { z } from 'zod'

export const extra = z.object({
  name: z.string(),
  preis: z.number(),
})

export const extras = z.array(
  z.object({
    name: z.string({
      description: "Der Name des der Extrakategorie, z.B. 'Ihr Salatdressing'",
    }),
    typ: z.enum(['oneOf', 'manyOf'], {
      description:
        "Der Typ der Extrakategorie, z.B. 'oneOf', wenn nur eine Option ausgewählt werden kann",
    }),
    items: z.array(extra, {
      description: 'Die verfügbaren Extras für ein Gericht',
    }),
  }),
)

const preis = z.object({
  name: z.string({
    description:
    "Der Name des Preises, z.B. 'klein (18cm)', 'mittel', 'groß (30cm)'",
  }),
  preis: z.number({
    description:
    'Der Preis in Euro des Gerichts für die angegebene Größe, z.B. 5.5',
  }),
})

export const gericht = z.object({
  id: z.string().or(z.number()),
  ueberschrift: z.string(),
  unterschrift: z.string(),
  preise: z.array(preis, {
    description: 'Die verfügbaren Größen und Preise für das Gericht',
  }).min(1),
  extras: extras.optional(),
})

export const category = z.object({
  headerUrl: z.string().optional(),
  id: z.string().or(z.number()),
  name: z.string(),
  gerichte: z.array(gericht),
})

export const categories = z.array(category)
export const karte = z.array(category)

export type Categories = z.infer<typeof categories>
export type Gericht = z.infer<typeof gericht>
export type Category = z.infer<typeof category>
export type Karte = z.infer<typeof karte>

export type Extra = z.infer<typeof extra>
export type Extras = z.infer<typeof extras>
