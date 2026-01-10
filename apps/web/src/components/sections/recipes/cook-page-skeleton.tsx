import { Skeleton } from '@/components/ui/skeleton'

export function CookPageSkeleton({ isDesktop }: { isDesktop: boolean }) {
  if (!isDesktop) {
    return (
      <div className="relative top-18 lg:hidden">
        {/* Background Image Skeleton */}
        <div className="absolute -top-22 -right-5 -z-10 flex size-[40vh] items-center justify-center overflow-hidden rounded-full bg-white">
          <Skeleton className="size-full rounded-full" />
        </div>

        {/* White overlay */}
        <div className="absolute inset-0 -top-18 -z-5 bg-white/70" />

        {/* Content */}
        <div className="relative px-4 pt-6 pb-24">
          {/* Step Header Skeleton */}
          <div className="mb-8 space-y-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-4/5" />
          </div>

          {/* What You'll Need Skeleton */}
          <div className="mb-8 space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="border-t border-neutral-200">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border-b border-neutral-200 py-3 ps-2">
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>

          {/* Ingredients Skeleton */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-4 w-16" />
            </div>

            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-neutral-200 bg-white/80 px-4 py-3 backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                    <Skeleton className="size-14 rounded-xl" />
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fixed Bottom Navigation Skeleton */}
        <div className="fixed right-0 bottom-0 left-0 z-50 border-t border-neutral-200 bg-white/95 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="h-9 flex-1" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative grid min-h-screen sm:grid-cols-[1fr_42%]">
      {/* Left Side - Step Description */}
      <div className="sticky top-0 flex h-screen overflow-hidden">
        <div className="relative flex h-full w-full flex-col justify-between bg-white/85 p-8 xl:p-16">
          <div className="flex max-w-4xl flex-1 flex-col justify-center">
            <div className="mb-8 space-y-4">
              <Skeleton className="h-8 w-32 lg:h-10 xl:h-12" />
              <Skeleton className="h-10 w-full lg:h-12 xl:h-16" />
              <Skeleton className="h-10 w-4/5 lg:h-12 xl:h-16" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-28" />
          </div>

          {/* Background Image Skeleton */}
          <div className="absolute right-0 -bottom-[10%] -left-[8%] -z-1 overflow-hidden rounded-full">
            <div className="pointer-events-none flex size-[45vw] items-center justify-center overflow-hidden rounded-full border border-neutral-200">
              <Skeleton className="size-full rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Tools and Ingredients */}
      <div className="relative mt-10 lg:top-10 lg:p-8 xl:top-0 xl:p-16">
        <div className="sticky top-8 space-y-20">
          {/* What You'll Need Skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-7 w-44 lg:h-8 xl:h-9" />
            <div className="border-t border-neutral-200">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border-b border-neutral-200 py-4 ps-2">
                  <Skeleton className="h-5 w-36 lg:h-6 xl:h-7" />
                </div>
              ))}
            </div>
          </div>

          {/* Ingredients Skeleton */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-7 w-32 lg:h-8 xl:h-9" />
              <Skeleton className="h-5 w-16 lg:h-6" />
            </div>

            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-neutral-200 bg-white/80 px-4 py-3 backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                    <Skeleton className="size-16 rounded-xl" />
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-5 w-28 lg:h-6 xl:h-7" />
                      <Skeleton className="h-4 w-20 lg:h-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
