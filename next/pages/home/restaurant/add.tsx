import MainLayout from '@/components/layouts/MainLayout'
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react'

import { SubmitHandler, useForm } from 'react-hook-form'

type Props = {}

type Inputs = {
  restaurantName: string;
  businessType: 'individual' | 'company' | 'non_profit'
};

const AddRestaurant = (props: Props) => {
  const router = useRouter()
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async data => {
    const regData = {
      business_type: data.businessType,
      business_name: data.restaurantName,
    }

    const res = await fetch('/api/stripe/create-express-account', {
      method: 'POST',
      body: JSON.stringify(regData),
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin'
    })

    const json = await res.json()

    router.push(json.url)
  };

  return (
    <MainLayout>
      <main className='container max-w-3xl mx-auto'>
        <div className='flex flex-col items-center my-5 '>
          <h1 className='text-4xl'>Neues Restaurant hinzufügen</h1>


          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">

              <div className="pt-8 space-y-6 sm:pt-10 sm:space-y-5">
                <div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Gewerbeinformationen</h3>
                  <p className="max-w-2xl mt-1 text-sm text-gray-500">Wir brauchen nur die folgenden, minimalen Informationen.</p>
                </div>
                <div className="space-y-6 sm:space-y-5">
                  <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                    <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                      Name des Gewerbes
                    </label>
                    <div className="mt-1 sm:mt-0 sm:col-span-2">
                      <input
                        {...register("restaurantName", { required: true })} // watch for changes;
                        type="text"
                        placeholder='Pizzapalast Hagen UG'
                        className="block w-full max-w-lg input sm:max-w-xs sm:text-sm"
                      />
                      {errors.restaurantName && <span className='text-sm'>Dieses Feld muss ausgefüllt werden</span>}
                    </div>
                  </div>


                  <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                    <label className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                      Geschäftstyp
                    </label>
                    <div className="mt-1 sm:mt-0 sm:col-span-2">
                      <select
                        autoComplete="business_type"
                        className="block w-full max-w-lg input sm:max-w-xs sm:text-sm"
                        {...register("businessType", { required: true })}

                      >
                        <option value="company">Unternehmen</option>
                        <option value="individual">Individuum</option>
                        <option value="non_profit">Non-Profit</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            <div className="flex justify-end pt-5">
              <Link href={'/'}
                className="mr-2 btn-secondary"
              >
                Abbrechen
              </Link>

              <input type="submit" className="inline-flex justify-center cursor-pointer btn-primary" value={"Weiter"} />

            </div>

          </form>
        </div >
      </main >
    </MainLayout >

  )
}




export default AddRestaurant