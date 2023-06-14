import React, { Dispatch } from 'react'
import { Fragment, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Extra, Extras } from '@/types/schema'
import { toast } from 'react-hot-toast'

type Props = {
  show: boolean
  setShow: (show: boolean) => void
  presets: Extras
  setPresets: (presets: Extras) => void
  preset?: { name: string, typ: 'oneOf' | 'manyOf', items: Extra[] }
  index?: number
}

function PresetModal({ show: open, setShow: setOpen, presets, setPresets, preset, index }: Props) {
  const [name, setName] = useState(preset?.name ?? '')
  const [typ, setTyp] = useState<'oneOf' | 'manyOf'>(preset?.typ ?? 'oneOf')

  // @ts-ignore We use null so we show the placeholder text
  const [items, setItems] = useState<Extra[]>(preset?.items ?? [{ name: '', preis: '' }])



  const addNewItem = () => {
    // @ts-ignore We use null so we show the placeholder text
    setItems([...items, { name: '', preis: '' }])
  }


  const addPresetToPresets = () => {
    if (!name) {
      toast.error('Bitte füllen Sie den Namen aus')
      return
    }

    if (!items.length) {
      toast.error('Bitte fügen Sie mindestens ein Extra hinzu')
      return
    }
    for (const item of items) {
      if (!item.name || !item.preis) {
        toast.error('Bitte füllen Sie alle Felder der Extras aus, oder löschen Sie leere Extras')
        return
      }
    }

    // check for duplicate names
    for (const preset of presets) {
      if (preset.name === name && presets.indexOf(preset) !== index) {
        toast.error('Es gibt bereits ein Preset mit diesem Namen')
        return
      }
    }

    const newPreset: Extras[number] = {
      name,
      typ,
      // @ts-ignore parse
      items: items.map(item => ({ name: item.name, preis: parseFloat(item.preis) }))
    }


    if (index !== undefined) {
      const newPresets = [...presets]
      newPresets[index] = newPreset
      setPresets(newPresets)
      

    } else {
      setPresets([...presets, newPreset])
    }


    toast.success('Preset erfolgreich bearbeitet')
    setOpen(false)
  }


  const cancelButtonRef = useRef(null)
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setOpen}>
        <Transition.Child
          as={Fragment}
        >
          {/* gray background */}
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-full p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
            >
              <Dialog.Panel className="relative p-4 overflow-hidden text-left bg-white shadow-lg sm:my-8 sm:w-full sm:max-w-3xl">

                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                    Neues Preset
                  </Dialog.Title>
                  <div className="flex flex-col w-full mt-2 gap-y-3">
                    {/* Name of preset */}
                    <div>
                      <label className="text-sm text-gray-400">Name des Presets</label>
                      <input type='text' className='w-full input' placeholder='Ihre Salatsauce' value={name} onChange={(e) => setName(e.target.value)} />
                    </div>

                    {/* any of / one of */}
                    <div>
                      <label className="text-sm text-gray-400">Auswahlmöglichkeit für den Kunden (z.B. "Einzelauswahl" bei Salatsoße, und "Mehrfachauswahl" bei Pizzabelägen)</label>
                      <select className='w-full cursor-pointer input' value={typ} onChange={e => setTyp(e.target.value as "oneOf" | "manyOf")}>
                        <option value='oneOf'>Einzelauswahl</option>
                        <option value='manyOf'>Mehrfachauswahl</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className='my-4 space-y-2'>
                  {items.map((item, i) => (
                    <div key={i} className='flex items-center justify-between w-full gap-x-4'>
                      <input type='text' className='w-full input' placeholder='Name des Extras' value={item.name} onChange={(e) => {
                        const newItems = [...items]
                        newItems[i].name = e.target.value
                        setItems(newItems)
                      }} />

                      <input type='number' className='w-full input' placeholder='Preis' value={item.preis} onChange={(e) => {
                        const newItems = [...items]
                        // @ts-ignore We need a string here. We can parse it later
                        newItems[i].preis = e.target.value
                        setItems(newItems)
                      }} />

                      <XMarkIcon className='w-12 h-full text-black cursor-pointer hover:text-gray-600' onClick={() => {
                        const newItems = [...items]
                        newItems.splice(i, 1)
                        setItems(newItems)
                      }} />
                    </div>
                  ))}
                </div>

                {/* Buttons */}
                <div className='flex flex-row justify-between'>

                  <button
                    type="button"
                    className="gastrobit-btn-primary"
                    onClick={addNewItem}
                  >
                    Extra hinzufügen
                  </button>

                  <div className='flex flex-row space-x-2'>
                    <button className='gastrobit-btn-secondary'
                      onClick={() => setOpen(false)}
                    >
                      Abbrechen
                    </button>
                    <button className='gastrobit-btn-primary'
                      onClick={addPresetToPresets}>
                      {index ? 'Ändern' : 'Hinzufügen'}
                    </button>
                  </div>
                </div>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}


export default PresetModal