import MainLayout from '@/Layouts/MainLayout'
import React, { DragEventHandler, useCallback, useState } from 'react'
import { z } from 'zod'
type Props = {}

/**
 * Erstelle ein Zod Schema für eine Restaurantkarte.
 * Die Karte soll ein Array von Objekten sein, der wie folgt aussieht:
 * **/

const extra = z.object({
  name: z.string(),
  preis: z.number(),
})

const extras = z.array(
  z.object({
    name: z.string({
      description: "Der Name des der Extrakategorie, z.B. 'Ihr Salatdressing'",
    }),
    typ: z.enum(['oneOf', 'manyOf'], {
      description:
        "Der Typ der Extrakategorie, z.B. 'oneOf', wenn nur eine Option ausgewählt werden kann",
    }),
    items: z.array(extra, {
      description: 'Die verfügbarer Extras für ein Gericht',
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

const gericht = z.object({
  id: z.string().or(z.number()),
  ueberschrift: z.string(),
  unterschrift: z.string(),
  preise: z.array(preis, {
    description: 'Die verfügbaren Größen und Preise für das Gericht',
  }),
  extras: extras.optional(),
})

const category = z.object({
  id: z.string().or(z.number()),
  name: z.string(),
  gerichte: z.array(gericht),
})

type Category = z.infer<typeof category>

const karte = z.array(category)

type Gericht = z.infer<typeof gericht>
const testpidser: Gericht = {
  id: 'lol',
  ueberschrift: 'Pizza Prosciutto ',
  unterschrift: 'mit Mozzarella, Schinken und Rucola',
  preise: [
    {
      name: 'klein (18cm)',
      preis: 7.5,
    },
    {
      name: 'mittel',
      preis: 8.5,
    },
  ],
}

type Karte = z.infer<typeof karte>
const testkarte: Karte = [
  {
    id: 'pizza',
    name: 'Pizza',
    gerichte: [
      { ...testpidser, id: 'testpidser2', ueberschrift: 'Pizza Fungi' },
      testpidser,
      {
        id: 2,
        preise: [{ name: 'klein (18cm)', preis: 7.5 }],
        ueberschrift: 'Pizza Tuna ',
        unterschrift: 'mit Mozzarella, Thunfisch und Rucola',
        extras: [
          {
            name: 'Ihre Sauce',
            typ: 'oneOf',
            items: [
              { name: 'Tomatensoße', preis: 0.0 },
              { name: 'Bolognesesauce', preis: 1.5 },
              { name: 'Ohne Sauce', preis: 0.0 },
            ],
          },
          {
            name: 'Ihr Belag',
            typ: 'manyOf',
            items: [
              { name: 'Schinken', preis: 0.0 },
              { name: 'Thunfisch', preis: 0.0 },
              { name: 'Pilze', preis: 0.0 },
              { name: 'Zwiebeln', preis: 0.0 },
              { name: 'Oliven', preis: 0.0 },
              { name: 'Ananas', preis: 0.0 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 1,
    name: 'Salate',
    gerichte: [
      {
        id: 3,
        ueberschrift: 'Gemischter Salat',
        unterschrift: 'mit Eisbergsalat, Tomaten, Gurken und Mais',
        preise: [{ name: 'klein (18cm)', preis: 7.5 }],
        extras: [
          {
            name: 'Ihr Dressing',
            typ: 'oneOf',
            items: [
              { name: 'Balsamico', preis: 0.0 },
              { name: 'French Dressing', preis: 0.0 },
              { name: 'Joghurt Dressing', preis: 0.0 },
            ],
          },
        ],
      },
    ],
  },
]


import { DndContext } from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

const SortableItem = (props: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.id })

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {props.children}
    </div>
  )
}

import type { DragEndEvent } from '@dnd-kit/core'
const SortableCategory = ({
  category,
  categories,
  setCategories,
}: {
  category: Category
  categories: Category[]
  setCategories: any
}) => {

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    // Find index of active and over item
    if (over === null) return
    if (active.id !== over.id) {
      const activeIndex = category.gerichte.findIndex(c => c.id === active.id)
      const overIndex = category.gerichte.findIndex(c => c.id === over.id)

      // Swap items in gerichte
      const newGerichte = arrayMove(category.gerichte, activeIndex, overIndex)

      // find index of current category
      const currentCategory = categories.findIndex(c => c.id === category.id)

      // clone categories and replace gerichte
      const newCategories = [...categories]
      newCategories[currentCategory].gerichte = newGerichte

      setCategories(newCategories)
    }
  }
  return (
    <>
      <div className='flex flex-col items-center'>
        <h2 className='text-2xl'>{category.name}</h2>
        <div className='flex flex-col items-center'>
          <DndContext onDragEnd={handleDragEnd} >
            <SortableContext items={category.gerichte} strategy={verticalListSortingStrategy}>
              {category.gerichte.map((item, index) => (
                <SortableItem key={item.id} id={item.id}>
                  <div key={item.id} className='flex flex-col items-center'>
                    <h3 className='text-xl'>{item.ueberschrift}</h3>
                    <p>{item.unterschrift}</p>
                  </div>
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </>
  )
}

const Menu = (props: Props) => {
  const [categories, setCategories] = useState(testkarte)

  const addPizza = () => {
    const newPizza: Gericht = {
      id: Math.random().toString(36).substr(2, 9),
      ueberschrift: 'Pizza Test',
      unterschrift: 'mit Mozzarella, Thunfisch und Rucola',
      preise: [{ name: 'klein (18cm)', preis: 7.5 }],
    }

    const newCategories = [...categories]
    // find pizza category
    const pizzaCategory = newCategories.find(c => c.id === 'pizza')
    if (pizzaCategory) {
      pizzaCategory.gerichte.push(newPizza)
    }
    setCategories(newCategories)
    console.log(newCategories)
  }


  return (
    <MainLayout>
      <div className='container max-w-lg mx-auto border'>
        <div className='flex flex-col items-center '>
          <h1 className='text-4xl'>Menu</h1>
          {categories.map((category, index) => (
            <SortableCategory
              key={category.id}
              category={category}
              categories={categories}
              setCategories={setCategories}
            />
          ))}
        </div>

        <button onClick={addPizza}>Add Pizza</button>
      </div>
    </MainLayout>
  )
}

export default Menu
