import { HeroSection } from '@/components/sections/hero';
import { RecipesSection } from '@/components/sections/recipes';
import { Navbar } from '@/components/layout/navbar';

export default function Home() {
  return (
    <>
      <main className='h-full w-full p-4 relative'>
        <div className='bg-neutral-50/50 rounded-lg'>
          <Navbar />
          <HeroSection />
          <RecipesSection className='-mt-10' />
        </div>
      </main>
    </>
  );
}
