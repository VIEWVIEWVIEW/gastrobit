export default function Index() {
  return <div className='container mx-auto' suppressHydrationWarning>
    <div className='flex flex-col items-center justify-center'>
      <h1 className='text-4xl'>Privacy Policy</h1>

      Bei der Bestellung über Gastrobit wird ihre physische Adresse von OpenStreetMaps.org übermittelt, um festzustellen, ob sich ihre Adresse im Liefergebiet befindet.
      <br />
      Desweiteren speichern wir ihre E-Mail Adresse und ihre Telefonnummer, um sie über den Status ihrer Bestellung zu informieren.

      <br />

      Wir verwenden supabase.com mit einem Server bei Amazon Web Services in Frankfurt, Deutschland, um ihre Daten zu speichern.

      <h1 className='text-4xl'>Betreiber Gastrobit:</h1>
      <div className='flex flex-col items-center justify-center'>
        <p>Marc Richts, Ernststraße 25, 58644 Iserlohn, Deutschland</p>
        <p>gastrobit@wertfrei.org</p>
      </div>

    </div>
  </div>
}

