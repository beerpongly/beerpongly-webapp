import Link from 'next/link'
import NavBar from '@/components/navbar';
import { Hero } from '@/components/Hero';
import { AppDetails } from '@/components/AppDetails';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <>
      <NavBar></NavBar>
      {/* <section className="w-full h-full bg-white dark:bg-gray-900">
        <div className="grid max-w-screen-xl px-4 py-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12">
            <div className="mr-auto place-self-center lg:col-span-7">
                <h1 className="max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl dark:text-white">Beerpong Tournament</h1>
                <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl dark:text-gray-400">Simple App to track all your beerpong games.</p>
                <Link href="/freeCreateTournament" className="inline-flex items-center justify-center px-5 py-3 mr-3 text-base font-medium text-center dark:text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900">
                    Try Now
                    <svg className="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                </Link> 
                <Link href="/signin" className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800">
                    Download App
                </Link>  
            </div>
            <div className="hidden lg:mt-0 lg:col-span-5 lg:flex h-192">
                <img src="/app-combined-images.PNG" alt="imbed image of app" className='rounded-2xl p-2'></img>
            </div>
        </div>
      </section> */}
      <Hero></Hero>
      <Footer></Footer>
    </>
  )
}
