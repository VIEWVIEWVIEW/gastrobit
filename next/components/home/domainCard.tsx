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
    onSuccess: () => {
      console.log(domainInfo)
    },
    onError: error => {
      console.log(error)
    },
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
        <div className='mt-1 sm:mt-0 sm:col-span-2'>
          <div className='flex max-w-lg row'>
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
                  } btn-secondary transition-all ease-in-out duration-150`}>
                {isValidating ? <Loader /> : 'Refresh'}
              </button>
              <button
                onClick={async () => {
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
                  }btn-red transition-all ease-in-out duration-150`}>
                {removing ? <Loader margin={'0'} /> : 'Remove'}
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
    <div className='flex flex-row'>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
      Korrekt konfiguriert
    </div>
  </>
)

const Unconfigured = ({ domainInfo }: { domainInfo?: CheckDomainAnswer }) => {
  const [recordType, setRecordType] = useState<'CNAME' | 'A'>('CNAME')

  if (!domainInfo) {
    console.error('No domain info')
    return <></>
  }

  return <>
  {JSON.stringify(domainInfo)}</>

  // if the domain needs to be verified
  if (!domainInfo.verified) {
    const txtVerification = domainInfo.verification.find(
      (x: any) => x.type === 'TXT'
    )

    return <>
      Unconfigured</>

  }
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
