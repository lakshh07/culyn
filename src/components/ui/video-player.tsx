import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import { PlayIcon, PauseIcon } from '@/components/icons'

interface VideoPlayerProps {
  videoUrl: string
  thumbnailUrl: string
  title?: string
  className?: string
  onStateChange?: (isPlaying: boolean, isExpanded: boolean) => void
}

export interface VideoPlayerRef {
  togglePlay: () => void
  play: () => void
  pause: () => void
  isPlaying: boolean
  isExpanded: boolean
}

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(
  ({ title, videoUrl, thumbnailUrl, className, onStateChange }, ref) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isHovering, setIsHovering] = useState(false)

    const videoRef = useRef<HTMLVideoElement>(null)

    // Notify parent of state changes
    useEffect(() => {
      onStateChange?.(isPlaying, isExpanded)
    }, [isPlaying, isExpanded, onStateChange])

    const handleCollapsedClick = () => {
      setIsExpanded(true)
      setIsPlaying(true)
    }

    const handleVideoPlay = () => {
      setIsPlaying(true)
    }

    const handleVideoPause = () => {
      setIsPlaying(false)
      setIsExpanded(false)
    }

    const togglePlay = () => {
      if (isPlaying) {
        if (videoRef.current) {
          videoRef.current.pause()
        }
      } else {
        if (!isExpanded) {
          setIsExpanded(true)
          setIsPlaying(true)
        } else if (videoRef.current) {
          videoRef.current.play()
        }
      }
    }

    const play = () => {
      if (!isExpanded) {
        setIsExpanded(true)
        setIsPlaying(true)
      } else if (videoRef.current) {
        videoRef.current.play()
      }
    }

    const pause = () => {
      if (videoRef.current) {
        videoRef.current.pause()
      }
    }

    useImperativeHandle(ref, () => ({
      togglePlay,
      play,
      pause,
      isPlaying,
      isExpanded,
    }))

    useEffect(() => {
      if (isExpanded && isPlaying && videoRef.current) {
        videoRef.current.play()
      }
    }, [isExpanded, isPlaying])

    return (
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="expanded-container"
            className={cn('fixed bottom-5 left-5 z-99999 flex items-center justify-center p-4')}
            transition={{ duration: 0.2 }}>
            <motion.div
              layoutId="video-player-panel"
              layout
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={cn(
                'relative z-99999 h-[85vh] w-[22vw] rounded-xl bg-neutral-50 p-1 shadow-md select-none',
                className
              )}>
              <div
                className="group relative h-full w-full overflow-hidden rounded-lg bg-black"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}>
                <video
                  ref={videoRef}
                  src={videoUrl}
                  poster={thumbnailUrl}
                  autoPlay={isPlaying}
                  loop
                  onPlay={handleVideoPlay}
                  onPause={handleVideoPause}
                  className="h-full w-full object-cover"
                />

                {/* Play/Pause button on hover */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: isHovering ? 1 : 0,
                      scale: isHovering ? 1 : 0.8,
                    }}
                    transition={{ duration: 0.2 }}
                    onClick={togglePlay}
                    className="flex cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/20 p-4 backdrop-blur-sm hover:bg-white/30">
                    {isPlaying ? (
                      <PauseIcon className="size-6 fill-white text-white" />
                    ) : (
                      <PlayIcon className="size-6 fill-white text-white" />
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <div className={cn('pointer-events-none fixed inset-0 z-99999')}>
            <motion.div
              key="collapsed-container"
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className={cn('pointer-events-auto absolute bottom-5 left-5')}>
              <motion.div
                layoutId="video-player-panel"
                layout
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                whileHover={{ scale: 1.05 }}
                onClick={handleCollapsedClick}
                className={cn(
                  'group h-[200px] w-[120px] cursor-pointer rounded-xl bg-neutral-50 p-1 shadow-lg select-none'
                )}>
                <div className="relative h-full w-full">
                  <div
                    className="h-full w-full rounded-lg bg-black/20 bg-cover bg-center p-2 bg-blend-overlay"
                    style={{
                      backgroundImage: `url(${thumbnailUrl})`,
                    }}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-white">{title}</h3>
                    </div>

                    <div className="flex h-[90%] items-center justify-center">
                      <motion.div
                        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="pointer-events-none flex items-center justify-center rounded-full border border-white/20 bg-white/20 p-2 opacity-0 backdrop-blur-sm group-hover:opacity-100">
                        <PlayIcon className="size-4 fill-white text-white" />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    )
  }
)

VideoPlayer.displayName = 'VideoPlayer'

export default VideoPlayer
