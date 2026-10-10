// Material Icons paths (Apache 2.0), inlined to replace the icon font. Decorative: hidden from AT.

import type { SVGProps } from 'react';

type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'>;

const Icon = ({ d, ...props }: IconProps & { d: string }) => (
  <svg
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    <path d={d} />
  </svg>
);

/** CTA button arrow (`arrow_forward`). */
export const ArrowForward = (props: IconProps) => (
  <Icon d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" {...props} />
);

/** Accordion header chevron (`keyboard_arrow_right`). */
export const ChevronRight = (props: IconProps) => (
  <Icon d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" {...props} />
);
