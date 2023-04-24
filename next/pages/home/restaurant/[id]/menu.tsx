import MainLayout from '@/Layouts/MainLayout'
import React, { DragEventHandler, useCallback, useState } from 'react'
import { z } from 'zod'
type Props = {
  restaurant: Restaurant
  params: {
    id: string
  }
}
type Restaurant = Database['public']['Tables']['restaurants']['Row']

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
  headerUrl: z.string().optional(),
  id: z.string().or(z.number()),
  name: z.string(),
  gerichte: z.array(gericht),
})

export type Category = z.infer<typeof category>

const karte = z.array(category)

export type Gericht = z.infer<typeof gericht>
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

export type Karte = z.infer<typeof karte>
const testkarte: Karte = [
  {
    id: 'pizza',
    name: 'Pizza',
    headerUrl:
      'https://res.cloudinary.com/tkwy-prod-eu/image/upload/c_thumb,w_2160/f_auto/q_auto/dpr_2.0/v1681122019/static-takeaway-com/images/generic/categories/1_salads/salat_salat',
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
    headerUrl:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2940&q=80',
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

import {
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  UniqueIdentifier,
} from '@dnd-kit/core'
import { DndContext } from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { GetServerSideProps } from 'next'
import { Database } from '@/types/supabase'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

const DragIcon = (props: any) => (
  <svg
    {...props}
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.5}
    stroke='currentColor'
    className='w-6 h-6 cursor-move'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M15.75 5.25v13.5m-7.5-13.5v13.5'
    />
  </svg>
)

const PencilIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.5}
    stroke='currentColor'
    className='w-6 h-6'>
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10'
    />
  </svg>
)

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
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className='w-full  py-0.5 bg-slate-50'>
      <div className='flex flex-row justify-between w-full'>
        <div className='px-4'>{props.children}</div>
        <div className='flex flex-row'>
          <PencilIcon />
          <DragIcon {...listeners} />
        </div>
      </div>
    </div>
  )
}

const Item = ({ item }: { item: Gericht }) => {
  return (
    <div key={item.id} className='flex flex-col my-5'>
      <h3 className='text-xl'>{item.ueberschrift}</h3>
      <p>{item.unterschrift}</p>
    </div>
  )
}

const SortableCategory = ({
  category,
  categories,
  setCategories,
}: {
  category: Category
  categories: Category[]
  setCategories: any
}) => {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id)
  }

  // swap items
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
    setActiveId(null)
  }

  // used for dragoverlay
  const currentItem = activeId
    ? category.gerichte.find(c => c.id === activeId)
    : null

  return (
    <>
      <div className='flex flex-col items-center w-full'>
        {category.headerUrl ? (
          <>
            <div
              className='w-full h-40 bg-center bg-cover'
              style={{ backgroundImage: `url(${category.headerUrl})` }}></div>
          </>
        ) : null}

        <h2 className='m-5 text-4xl'>{category.name}</h2>

        <div className='w-full'>
          <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
            <SortableContext
              items={category.gerichte}
              strategy={verticalListSortingStrategy}>
              <div className='w-full space-y-2'>
                {category.gerichte.map((item, index) => (
                  <SortableItem key={item.id} id={item.id}>
                    <Item item={item} />
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
            {/**
             * 
            <DragOverlay>{activeId ? <Item item={currentItem} /> : null}</DragOverlay>
          */}
          </DndContext>
        </div>
      </div>
    </>
  )
}

const Menu = (props: Props) => {
  const [categories, setCategories] = useState<Karte>(
    // @ts-expect-error Fuck typescript
    props.restaurant.karte ?? testkarte,
  )

  const addPizza = () => {
    const newPizza: Gericht = {
      id: 'AAAAAAAAAAAA',
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

  const supabase = useSupabaseClient<Database>()

  const saveToSupabase = async () => {
    const {data, error} = await supabase.from('restaurants').update({
      karte: categories,
    }).eq('id', props.params.id)

    console.log(data)
  }

  return (
    <MainLayout>
      <div className='container max-w-6xl mx-auto mb-32 '>
        <div className='grid grid-cols-3 space-x-5'>
          <div className='flex flex-col items-center col-span-2'>
            <h1 className='mt-12 mb-8 text-5xl'>Speisekarte</h1>
            <div className='w-full p-2 space-y-36 bg-sepia-400'>
              {categories.map((category, index) => (
                <SortableCategory
                  key={category.id}
                  category={category}
                  categories={categories}
                  setCategories={setCategories}
                />
              ))}
            </div>
          </div>

          <div>
            <button onClick={saveToSupabase} className='h-12 btn-secondary'>
              Speichern
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default Menu

export const getServerSideProps: GetServerSideProps = async function (ctx) {
  const supabase = createServerSupabaseClient(ctx)
  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session)
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }

  // else we fetch restaurant data
  const { data: restaurant, error } = await supabase
    .from('restaurants')
    .select()
    .limit(1)
    .eq('id', ctx.params!.id)
    .single()

  console.debug(restaurant)

  return {
    props: {
      params: ctx.params,
      restaurant,
    },
  }
}
