import { Skeleton } from '../../ui/skeleton'

export function DetailRecipeSkeleton() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left side - Image skeleton */}
      <div className="sticky top-0 flex h-screen items-center justify-center bg-neutral-100 p-16">
        <div className="relative top-6 mx-auto flex items-center justify-center overflow-hidden rounded-full border border-neutral-200">
          <Skeleton className="size-[35vw] rounded-full bg-white" />
        </div>
      </div>

      {/* Right side - Content skeleton */}
      <div className="relative mt-6 flex min-h-screen flex-col space-y-4 bg-white px-12 py-16">
        {/* Title skeleton */}
        <Skeleton className="h-12 w-3/4" />

        {/* Author and source links skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-1" />
          <Skeleton className="h-4 w-28" />
        </div>

        {/* Description skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-4/5" />
        </div>

        {/* Details section */}
        <div className="mt-10 space-y-3">
          <Skeleton className="h-8 w-20" />

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-0 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="-mr-px -mb-px space-y-2 border border-neutral-200 p-4">
                <Skeleton className="h-4 w-16" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </div>
            ))}
          </div>

          {/* Disclaimer skeleton */}
          <div className="flex items-center gap-1 ps-1">
            <Skeleton className="h-3 w-80" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </div>
        </div>

        {/* Ingredients section */}
        <div className="mt-10 space-y-3">
          <Skeleton className="h-8 w-24" />

          {/* Ingredients grid */}
          <div className="xs:grid-cols-2 grid grid-cols-3 gap-x-2 gap-y-4 lg:grid-cols-5 xl:grid-cols-7">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="size-20 rounded-xl" />
                <div className="space-y-1 px-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cooking Steps section */}
        <div className="mt-10 space-y-3">
          <Skeleton className="h-8 w-32" />

          {/* Cooking steps */}
          <div className="mt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border-t border-neutral-200 pb-8">
                <div className="grid grid-cols-[60px_1fr] gap-10 pt-8 lg:grid-cols-[80px_1fr]">
                  <Skeleton className="h-16 w-12 lg:h-20 lg:w-16" />
                  <div className="flex flex-col space-y-6">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-3/4" />
                    </div>

                    {/* Ingredients used in step */}
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: 3 }).map((_, j) => (
                        <div key={j} className="rounded-lg bg-neutral-100 px-4 py-3.5">
                          <Skeleton className="mb-1 h-4 w-16" />
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
