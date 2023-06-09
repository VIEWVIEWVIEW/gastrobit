import React from 'react'
import { Fragment, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

type Props = {
  show: boolean
  setShow: (show: boolean) => void
}

function PresetModal({ show: open, setShow: setOpen }: Props) {

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
          <div className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}

            >
              <Dialog.Panel className="relative overflow-hidden text-left bg-white shadow-lg sm:my-8 sm:w-full sm:max-w-3xl">

                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                    Neues Preset
                  </Dialog.Title>
                  <div className="flex flex-col w-full mt-2 border">
                    <label className="text-sm text-gray-400">Name des Presets</label>
                    <input type='text' className='w-full input' />
                  </div>
                </div>

                <button
                  type="button"
                  className="inline-flex justify-center w-full px-3 py-2 mt-3 text-sm font-semibold text-gray-900 bg-white rounded-md shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  onClick={() => setOpen(false)}
                  ref={cancelButtonRef}
                >
                  Cancel
                </button>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default PresetModal