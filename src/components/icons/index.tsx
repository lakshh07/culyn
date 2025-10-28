import { ComponentProps, FC } from 'react';

export const ExternalLinkIcon: FC<ComponentProps<'svg'>> = (props) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      {...props}
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M9 15l6 -6' />
      <path d='M11 6l.463 -.536a5 5 0 0 1 7.071 7.072l-.534 .464' />
      <path d='M13 18l-.397 .534a5.068 5.068 0 0 1 -7.127 0a4.972 4.972 0 0 1 0 -7.071l.524 -.463' />
    </svg>
  );
};

export const GithubIcon: FC<ComponentProps<'svg'>> = (props) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      {...props}
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5' />
    </svg>
  );
};

export const ArrowIcon: FC<ComponentProps<'svg'>> = (props) => {
  return (
    <svg
      width='18'
      height='19'
      viewBox='0 0 18 19'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <path
        d='M0.695784 17.9976L17.6036 1.08925M17.6036 1.08925C17.6036 1.08925 11.1793 7.51354 17.3353 13.6696M17.6036 1.08925C17.6036 1.08925 11.1793 7.51354 5.0874 1.42164'
        stroke='currentcolor'
      ></path>
    </svg>
  );
};

export const BookmarkIcon: FC<ComponentProps<'svg'>> = (props) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      {...props}
    >
      <path stroke='none' d='M0 0h24v24H0z' fill='none' />
      <path d='M18 7v14l-6 -4l-6 4v-14a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4z' />
    </svg>
  );
};
