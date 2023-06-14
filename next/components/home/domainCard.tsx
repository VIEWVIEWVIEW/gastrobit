import ConfiguredSection from './configuredSection'
import useSWR, { Fetcher, KeyedMutator, mutate } from 'swr'
import { useState } from 'react'
import { BeatLoader as Loader } from 'react-spinners'
import { GetDomainsAnswer } from '@/pages/home/restaurant/[id]/settings'

export interface Verification {
  type: string;
  domain: string;
  value: string;
  reason: string;
}

export interface VerificationResponse {
  error: Error;
}

export interface Error {
  code: string;
  message: string;
}

export interface CheckDomainAnswer {
  configured: boolean;
  name: string;
  apexName: string;
  projectId: string;
  redirect: null;
  redirectStatusCode: null;
  gitBranch: null;
  updatedAt: number;
  createdAt: number;
  verified: boolean;
  verification?: Verification[];
  verificationResponse?: VerificationResponse;
}

const fetcher: Fetcher<CheckDomainAnswer> = (url: string) => fetch(url).then(res => res.json())

const DomainCard = ({ domain, revalidateDomains, index }: { domain: string, revalidateDomains: KeyedMutator<GetDomainsAnswer[]>, index: number }) => {
  const {
    data: domainInfo,
    isValidating,
    isLoading,
    error,
  } = useSWR(`/api/check-domain?domain=${domain}`, fetcher, {
    revalidateOnMount: true,
    refreshInterval: 15000,
    keepPreviousData: true,
  })

  const [removing, setRemoving] = useState(false)


  return (
    <>
      <div className='p-4 my-4 bg-sepia-200'>

        <label
          htmlFor='subdomain'
          className='block text-sm font-medium text-gray-700 '>
          Custom Domain #{index + 1}
        </label>
        <div className='mt-1 sm:mt-0'>
          <div className='flex row'>
            <a
              href={`http://${domain}`}
              target='_blank'
              rel='noreferrer'
              className='flex items-center text-xl font-semibold text-left'>
              {domain}
              <span className='inline-block ml-2'>
                <svg
                  viewBox='0 0 24 24'
                  width='20'
                  height='20'
                  stroke='currentColor'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  fill='none'
                  shapeRendering='geometricPrecision'>
                  <path d='M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6' />
                  <path d='M15 3h6v6' />
                  <path d='M10 14L21 3' />
                </svg>
              </span>
            </a>
            <div className='flex flex-row justify-end w-full gap-x-3'>

              <button
                onClick={(e) => {
                  e.preventDefault()
                  mutate(`/api/check-domain?domain=${domain}`)
                }}
                disabled={isValidating}
                className={`${isValidating
                  ? 'cursor-not-allowed bg-gray-100'
                  : 'bg-white hover:text-black hover:border-black'
                  } gastrobit-btn-secondary hover:bg-sentrysilver-100 w-32`}>
                {isValidating ? <Loader /> : 'Aktualisieren'}
              </button>
              <button
                onClick={async (e) => {
                  e.preventDefault()
                  setRemoving(true)
                  try {
                    await fetch(`/api/remove-domain?domain=${domain}`)
                    await revalidateDomains()
                  } catch (error) {
                    alert(`Error removing domain`)
                  } finally {
                    setRemoving(false)
                  }
                }}
                disabled={removing}
                className={`${removing ? 'cursor-not-allowed bg-gray-100' : ''
                  } btn-red w-24`}>
                {removing ? <Loader margin={'0'} /> : 'Entfernen'}
              </button>
            </div>
          </div>

          <div>{!isLoading && domainInfo?.configured ? <Configured /> : <Unconfigured domainInfo={domainInfo} />}</div>
        </div>
      </div >



    </>
  )
}



const Configured = () => (
  <>
    <div className='flex flex-row gap-x-2'>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white bg-green-600">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
      Korrekt konfiguriert
    </div>
  </>
)

const Unconfigured = ({ domainInfo }: { domainInfo?: CheckDomainAnswer }) => {
  // We have two tabs: "CANEM" and "A" tab
  const [tab, setTab] = useState<'CNAME' | 'A'>('CNAME')

  if (!domainInfo) {
    return <></>
  }


  // if the domain needs to be verified
  if (!domainInfo.verified && domainInfo.verification) {
    const txtVerification = domainInfo.verification.find(
      (x: any) => x.type === 'TXT'
    )

    if (!txtVerification) {
      console.error('No TXT verification')
      return <>No TXT verification</>
    }

    // unverified
    return <>
      <div className='flex flex-row gap-x-2'>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-black bg-yellow-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>

        Domain muss verifiziert werden
      </div>
      <div className='flex flex-col mt-2'>
        <div className="flex items-start justify-start p-2 space-x-10 bg-sepia-100">
          <div>
            <p className="text-sm font-bold">Type</p>
            <p className="mt-2 font-mono text-sm">{txtVerification.type}</p>
          </div>
          <div>
            <p className="text-sm font-bold">Name</p>
            <p className="mt-2 font-mono text-sm">
              {txtVerification.domain.slice(
                0,
                txtVerification.domain.length -
                domainInfo.apexName.length -
                1
              )}
            </p>
          </div>
          <div>
            <p className="text-sm font-bold">Wert</p>
            <p className="mt-2 font-mono text-sm">
              <span className="text-ellipsis">{txtVerification.value}</span>
            </p>
          </div>
        </div>
      </div>
    </>
  }

  // unconfigured
  // we have two tabs here: CNAME and A (for apex domain)
  return <>
    <div className='flex flex-row gap-x-2'>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white bg-red-500">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>


      Invalide Konfiguration
    </div>



    <div className="mt-4">
      <div className="flex justify-start space-x-4">
        <button
          onClick={(e) => {
            e.preventDefault()
            setTab('CNAME')
          }}
          className={`${tab == 'CNAME'
            ? 'text-black border-black'
            : 'text-gray-600 border-white'
            } text-sm border-b-2 pb-1 `}
        >
          CNAME Record (subdomains)
        </button>
        <button
          onClick={(e) => {
            e.preventDefault()
            setTab('A')
          }}
          className={`${tab == 'A'
            ? 'text-black border-black'
            : 'text-gray-600 border-white'
            } text-sm border-b-2 pb-1 `}
        >
          A Record (apex domain)
        </button>
      </div>
      <div className="my-3 text-left">
        <p className="mt-5 mb-2">
          Setze den folgenden DNS-Record bei deinem DNS-Provider:
        </p>
        <div className="flex items-center justify-start p-2 space-x-10 bg-sepia-100">
          <div>
            <p className="text-sm font-bold">Typ</p>
            <p className="mt-2 font-mono text-sm">{tab}</p>
          </div>
          <div>
            <p className="text-sm font-bold">Name</p>
            <p className="mt-2 font-mono text-sm">
              {tab == 'CNAME' ? 'www' : '@'}
            </p>
          </div>
          <div>
            <p className="text-sm font-bold">Wert</p>
            <p className="mt-2 font-mono text-sm">
              {tab == 'CNAME'
                ? `gastrobit.de`
                : `76.76.21.21`}
            </p>
          </div>
        </div>
      </div>
    </div>
  </>

}


// const Test = () => {

//   return (
//     <div className='w-full py-10 mt-10 border-black sm:shadow-md border-y sm:border sm:border-gray-50 sm:rounded-lg'>
//       <div className='flex justify-between px-2 space-x-4 sm:px-10'>
//         <a
//           href={`http://${domain}`}
//           target='_blank'
//           rel='noreferrer'
//           className='flex items-center text-xl font-semibold text-left'>
//           {domain}
//           <span className='inline-block ml-2'>
//             <svg
//               viewBox='0 0 24 24'
//               width='20'
//               height='20'
//               stroke='currentColor'
//               strokeWidth='1.5'
//               strokeLinecap='round'
//               strokeLinejoin='round'
//               fill='none'
//               shapeRendering='geometricPrecision'>
//               <path d='M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6' />
//               <path d='M15 3h6v6' />
//               <path d='M10 14L21 3' />
//             </svg>
//           </span>
//         </a>
//         <div className='flex space-x-3'>
//           <button
//             onClick={() => {
//               mutate(`/api/check-domain?domain=${domain}`)
//             }}
//             disabled={isValidating}
//             className={`${isValidating
//               ? 'cursor-not-allowed bg-gray-100'
//               : 'bg-white hover:text-black hover:border-black'
//               } text-gray-500 border-gray-200 py-1.5 w-24 text-sm border-solid border rounded-md focus:outline-none transition-all ease-in-out duration-150`}>
//             {isValidating ? <Loader /> : 'Refresh'}
//           </button>
//           <button
//             onClick={async () => {
//               setRemoving(true)
//               try {
//                 await fetch(`/api/remove-domain?domain=${domain}`)
//                 await revalidateDomains()
//               } catch (error) {
//                 alert(`Error removing domain`)
//               } finally {
//                 setRemoving(false)
//               }
//             }}
//             disabled={removing}
//             className={`${removing ? 'cursor-not-allowed bg-gray-100' : ''
//               }bg-red-500 text-white border-red-500 hover:text-red-500 hover:bg-white py-1.5 w-24 text-sm border-solid border rounded-md focus:outline-none transition-all ease-in-out duration-150`}>
//             {removing ? <Loader margin={'0'} /> : 'Remove'}
//           </button>
//         </div>
//       </div>
//       {/* 
// <ConfiguredSection domainInfo={domainInfo} />
// */}

//       <div className='text-white bg-slate-400'>
//         <Loader />
//         :D
//       </div>
//     </div >)
// }

export default DomainCard
