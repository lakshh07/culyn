import { Skeleton } from '../../ui/skeleton'

export function DetailRecipeSkeleton() {
  return (
    <div className="grid min-h-screen grid-cols-1 sm:grid-cols-2">
      {/* Left side - Image skeleton */}
      <div className="relative top-0 flex h-[280px] items-center justify-center overflow-hidden p-12 shadow-inner sm:sticky sm:h-screen sm:bg-[#E8E3DA] lg:p-16">
        {/* Desktop circular image */}
        <div className="pointer-events-none relative mx-auto hidden items-center justify-center overflow-hidden rounded-full shadow-xl sm:flex">
          <Skeleton className="size-[36vw] rounded-full bg-white lg:size-[35vw]" />
        </div>

        {/* Mobile image at bottom-right */}
        <div className="absolute -right-5 bottom-0 flex size-[40vh] items-center justify-center overflow-hidden rounded-full sm:hidden">
          <Skeleton className="size-full rounded-full" />
        </div>
      </div>

      {/* Right side - Content skeleton */}
      <div className="relative flex min-h-screen flex-col space-y-4 bg-white px-4 py-12 sm:mt-6 sm:px-6 sm:py-16 lg:px-10 xl:px-12">
        {/* Title skeleton */}
        <Skeleton className="h-9 w-3/4 lg:h-10" />

        {/* Author and source links skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="size-4 rounded lg:size-4.5" />
          <Skeleton className="h-3 w-32 lg:h-3.5" />
          <Skeleton className="h-3 w-1" />
          <Skeleton className="h-3 w-28" />
        </div>

        {/* Description skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-full lg:h-6 xl:h-7" />
          <Skeleton className="h-5 w-4/5 lg:h-6 xl:h-7" />
        </div>

        {/* Details section */}
        <div className="mt-8 space-y-3 xl:mt-10">
          <Skeleton className="h-6 w-20 lg:h-7" />

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-0 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="-mr-px -mb-px space-y-0.5 border border-neutral-200 p-4">
                <Skeleton className="h-3 w-16 lg:h-3.5" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-12 lg:h-4.5" />
                  <Skeleton className="h-3 w-8 lg:h-3.5" />
                </div>
              </div>
            ))}
          </div>

          {/* Disclaimer skeleton */}
          <div className="flex items-center gap-1 ps-1">
            <Skeleton className="h-3 w-full max-w-md" />
            <Skeleton className="size-4 rounded-full" />
          </div>
        </div>

        {/* Ingredients section */}
        <div className="mt-10 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-24 lg:h-7" />
            <Skeleton className="h-9 w-32" />
          </div>

          {/* Ingredients grid */}
          <div className="xs:grid-cols-2 grid grid-cols-4 gap-x-2 gap-y-4 lg:grid-cols-5 xl:grid-cols-7">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="size-20 rounded-xl sm:size-18 lg:size-20" />
                <div className="space-y-1 px-1">
                  <Skeleton className="h-3 w-16 lg:h-3.5" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cooking Steps section */}
        <div className="mt-10 space-y-3">
          <Skeleton className="h-6 w-32 lg:h-7" />

          {/* Cooking steps */}
          <div className="mt-4 lg:mt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border-t border-neutral-200 pb-8">
                <div className="grid grid-cols-[60px_1fr] gap-4 pt-6 lg:grid-cols-[80px_1fr] lg:pt-8 xl:gap-10">
                  <Skeleton className="h-12 w-12 sm:h-14 lg:h-16 lg:w-16" />
                  <div className="flex flex-col space-y-6">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-full lg:h-6" />
                      <Skeleton className="h-5 w-3/4 lg:h-6" />
                    </div>

                    {/* Ingredients used in step */}
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: 3 }).map((_, j) => (
                        <div key={j} className="rounded-lg bg-neutral-100 px-4 py-3.5">
                          <Skeleton className="mb-1 h-3 w-16 lg:h-3.5" />
                          <Skeleton className="h-3 w-12" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
