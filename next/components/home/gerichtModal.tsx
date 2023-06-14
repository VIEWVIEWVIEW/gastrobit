/* eslint-disable react/no-unescaped-entities */
import { Dispatch, Fragment, MouseEventHandler, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XCircleIcon as XIcon } from '@heroicons/react/24/outline'
import {
  LinkIcon,
  PlusSmallIcon as PlusSmIcon,
  XMarkIcon as XCircleIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/solid'
import { Categories as Karte, Gericht, Extras, Extra } from '@/types/schema'
import { set } from 'zod'

const team = [
  {
    name: 'Tom Cook',
    email: 'tom.cook@example.com',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Whitney Francis',
    email: 'whitney.francis@example.com',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Leonard Krasner',
    email: 'leonard.krasner@example.com',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Floyd Miles',
    email: 'floy.dmiles@example.com',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Emily Selman',
    email: 'emily.selman@example.com',
    href: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
]

type Props = {
  show: boolean
  setShow: (open: any) => void
  gericht: Gericht
  setCategories: Dispatch<Karte>
  categories: Karte
  presets: Extras
}

export default function GerichtsModal(props: Props) {
  const [currentSelectedPreset, setCurrentSelectedPreset] = useState<string>('')

  const { show: open = false, setShow, gericht, setCategories, categories, presets } = props

  const id = gericht.id

  const [localGericht, setLocalGericht] = useState<Gericht>(gericht)

  const saveGericht: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    const newCategories = [...categories]

    // replace the gericht in the category with our local gericht
    for (const category of newCategories) {
      const index = category.gerichte.findIndex((g) => g.id === id)
      if (index !== -1) {
        console.log("replacing", category.gerichte[index], "with", localGericht)
        category.gerichte[index] = localGericht
      }
      setCategories(newCategories)
    }
    setShow(false)
  }

  const abort: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    setLocalGericht(gericht)
    setShow(false)
  }

  const [showExtraEdit, setShowExtraEdit] = useState<boolean>(false)

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as='div'
        className='fixed inset-0 overflow-hidden'
        onClose={setShow}>
        <div className='absolute inset-0 overflow-hidden'>
          <Dialog.Overlay className='absolute inset-0' />

          <div className='fixed inset-y-0 right-0 flex max-w-full pl-10 pointer-events-none sm:pl-16'>
            <Transition.Child
              as={Fragment}
              enter='transform transition ease-in-out duration-500 sm:duration-700'
              enterFrom='translate-x-full'
              enterTo='translate-x-0'
              leave='transform transition ease-in-out duration-500 sm:duration-700'
              leaveFrom='translate-x-0'
              leaveTo='translate-x-full'>
              <div className='w-screen max-w-md pointer-events-auto'>
                <form className='flex flex-col h-full bg-white divide-y divide-gray-200 shadow-xl'>
                  <div className='flex-1 h-0 overflow-y-auto'>
                    <div className='px-4 py-6 bg-taubmanspurple-700 sm:px-6'>
                      <div className='flex items-center justify-between'>
                        <Dialog.Title className='text-lg font-medium text-white'>
                          {props.gericht.ueberschrift}
                        </Dialog.Title>
                        <div className='flex items-center ml-3 h-7'>
                          <button
                            type='button'
                            className='text-white hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-white'
                            onClick={() => setShow(false)}
                          >
                            <XIcon className='w-6 h-6' aria-hidden='true' />
                          </button>
                        </div>
                      </div>
                      <div className='mt-1'>
                        <p className='text-sm text-gray-100'>
                          Hier kannst du die Daten des Gerichts ändern. Oben ist der ursprüngliche Name des Gerichtes, damit du nicht ausversehen ein falsches Gericht editierst.
                        </p>
                      </div>
                    </div>
                    <div className='flex flex-col justify-between flex-1'>
                      <div className='px-4 divide-y divide-gray-200 sm:px-6'>
                        <div className='pt-6 pb-5 space-y-6'>
                          <div>
                            <label
                              className='block text-sm font-medium text-gray-900'>
                              Überschrift (z.B. "Pizza Prosciutto")
                            </label>
                            <div className='mt-1'>
                              <input
                                type='text'
                                className='w-full input'
                                value={localGericht.ueberschrift}
                                onChange={e => setLocalGericht({ ...localGericht, ueberschrift: e.target.value })}
                              />
                            </div>
                          </div>
                          <div>
                            <label

                              className='block text-sm font-medium text-gray-900'>
                              Unterschrift
                            </label>
                            <div className='mt-1'>
                              <textarea
                                rows={2}
                                className='block w-full input'
                                value={localGericht.unterschrift}
                                onChange={e => setLocalGericht({ ...localGericht, unterschrift: e.target.value })}
                                placeholder='mit Eisbergsalat, Tomaten, Gurken und Mais'
                              />
                            </div>
                          </div>

                          <div>
                            <h3 className='text-sm font-medium text-gray-900'>
                              Preise
                            </h3>
                            <div className='mt-2'>
                              <div className='flex flex-col space-y-2'>
                                {localGericht.preise.map((preis, index) => (
                                  <div
                                    key={index}

                                    className='flex flex-row space-x-3'>
                                    {/* Input for "klein", "mittel", "groß" etc */}
                                    <input type='text' className='flex-grow input' value={preis.name} onChange={e => {
                                      const newPreise = [...localGericht.preise]
                                      newPreise[index].name = e.target.value
                                      setLocalGericht({ ...localGericht, preise: newPreise })
                                    }} />

                                    {/* Input for the price */}
                                    <input
                                      type='number'
                                      className='w-1/4 input'
                                      step="any"
                                      value={preis.preis}
                                      onChange={e => {
                                        const newPreise = [...localGericht.preise]
                                        newPreise[index].preis = parseFloat(e.target.value)
                                        setLocalGericht({ ...localGericht, preise: newPreise })
                                      }}
                                    />

                                    {/* Button to remove the price */}
                                    <XCircleIcon className="h-10 cursor-pointer"
                                      onClick={(e) => {
                                        const newPreise = [...localGericht.preise]
                                        newPreise.splice(index, 1)
                                        setLocalGericht({ ...localGericht, preise: newPreise })
                                      }}
                                    />

                                  </div>
                                ))}


                                {/* Button to add a new price */}
                                <PlusSmIcon
                                  className='w-8 h-8 cursor-pointer'
                                  aria-hidden='true'
                                  onClick={() => {
                                    const newPreise = [...localGericht.preise]
                                    newPreise.push({ name: "klein", preis: 10.00 })
                                    setLocalGericht({ ...localGericht, preise: newPreise })
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                          <fieldset>
                            <legend className='text-sm font-medium text-gray-900'>
                              Extra-Attribute
                            </legend>
                            <div className='mt-2 space-y-5'>
                              <select
                                onChange={e => {
                                  e.preventDefault()
                                  setCurrentSelectedPreset(e.target.value)
                                }}
                                value={currentSelectedPreset}
                              >
                                {presets.map((preset, index) => (<option key={index}
                                  value={preset.name}>{preset.name}</option>
                                ))}
                              </select>

                              <button className='gastrobit-btn-secondary' disabled={!currentSelectedPreset}
                                onClick={e => {
                                  e.preventDefault()
                                  const newExtras = localGericht?.extras ?? []
                                  const selectedPreset = presets.find(p => p.name === currentSelectedPreset)

                                  // if the preset is not already in the extras, add it
                                  if (selectedPreset && !newExtras.find(e => e.name === selectedPreset.name)) {
                                    newExtras.push(selectedPreset)
                                    setLocalGericht({ ...localGericht, extras: newExtras })
                                  }
                                }}
                              >Hinzufügen</button>
                            </div>

                          </fieldset>


                          {/* Extras */}
                          <div className='flex flex-col w-full gap-y-2'>
                            {localGericht.extras?.map((extra, index) => (<div key={index}>
                              <div className='flex flex-row items-center justify-between p-2 bg-sepia-50'>
                                <p className='cursor-pointer hover:text-gray-600 hover:underline'>{extra.name}</p>

                                
                                <XCircleIcon className='w-6 h-6 cursor-pointer hover:text-gray-600' onClick={() => {
                                  const newExtras = localGericht?.extras ?? []
                                  newExtras.splice(index, 1)
                                  setLocalGericht({ ...localGericht, extras: newExtras })
                                }} />
                              </div>
                            </div>))}

                          </div>

                        </div>
                        <div className='pt-4 pb-6'>
                          <div className='flex text-sm'>
                            <a
                              href='#'
                              className='inline-flex items-center font-medium text-indigo-600 group hover:text-indigo-900'>
                              <LinkIcon
                                className='w-5 h-5 text-indigo-500 group-hover:text-indigo-900'
                                aria-hidden='true'
                              />
                              <span className='ml-2'>Copy link</span>
                            </a>
                          </div>
                          <div className='flex mt-4 text-sm'>
                            <a
                              href='#'
                              className='inline-flex items-center text-gray-500 group hover:text-gray-900'>
                              <QuestionMarkCircleIcon
                                className='w-5 h-5 text-gray-400 group-hover:text-gray-500'
                                aria-hidden='true'
                              />
                              <span className='ml-2'>
                                Learn more about sharing
                              </span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='flex justify-end flex-shrink-0 px-4 py-4'>
                    <button
                      type='button'
                      className='mr-2 gastrobit-btn-secondary'
                      onClick={abort}>
                      Abbrechen
                    </button>
                    <button
                      type='submit'
                      className='gastrobit-btn-primary'
                      onClick={saveGericht}
                    >
                      Ändern
                    </button>
                  </div>
                </form>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
