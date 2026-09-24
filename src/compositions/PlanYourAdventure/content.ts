// Draft copy for the "Plan Your Adventure" hero. Photos: Unsplash via picsum.photos (credits in README).

import connect320 from '../../assets/photos/connect-320.webp';
import connect900 from '../../assets/photos/connect-900.webp';
import connect1200 from '../../assets/photos/connect-1200.webp';
import experience320 from '../../assets/photos/experience-320.webp';
import experience900 from '../../assets/photos/experience-900.webp';
import experience1200 from '../../assets/photos/experience-1200.webp';
import explore320 from '../../assets/photos/explore-320.webp';
import explore900 from '../../assets/photos/explore-900.webp';
import explore1200 from '../../assets/photos/explore-1200.webp';
import inspire320 from '../../assets/photos/inspire-320.webp';
import inspire900 from '../../assets/photos/inspire-900.webp';
import inspire1200 from '../../assets/photos/inspire-1200.webp';

export type AdventureValue = 'experience' | 'inspire' | 'explore' | 'connect';

export interface AdventureTab {
  value: AdventureValue;
  /** Tab label / accordion header. */
  title: string;
  /** Panel heading; unique per tab. */
  heading: string;
  body: string;
  /** Link text must make sense out of context. */
  cta: { label: string; href: string };
  stat: { value: string; label: string };
  /** Decorative (`alt=""`). 3:2, widths 320 / 900 / 1200. */
  photo: { src: string; srcSet: string };
}

const photo = (w320: string, w900: string, w1200: string) => ({
  src: w900,
  srcSet: `${w320} 320w, ${w900} 900w, ${w1200} 1200w`,
});

export const heroTitle = 'Plan Your Adventure';

export const tabs: AdventureTab[] = [
  {
    value: 'experience',
    title: 'Experience',
    heading: 'Ride Into Golden Hour',
    body: 'Rent a cruiser or e-bike and roll along car-free loops past orchards and foothills. Guided sunset rides leave the visitor center every evening, May through October.',
    cta: { label: 'Book a sunset bike ride', href: '#experience' },
    stat: { value: '200+', label: 'Miles of Trails' },
    photo: photo(experience320, experience900, experience1200),
  },
  {
    value: 'inspire',
    title: 'Inspire',
    heading: 'Find Your Quiet Hour',
    body: 'Claim a spot on the old ferry dock as the lake turns pink. Dawn paddles and dusk sketch walks run all season, and every viewpoint is mapped for photographers.',
    cta: { label: 'See photo and art walks', href: '#inspire' },
    stat: { value: '40+', label: 'Lakeside Viewpoints' },
    photo: photo(inspire320, inspire900, inspire1200),
  },
  {
    value: 'explore',
    title: 'Explore',
    heading: 'Chase the Ridge Line',
    body: 'Drive the single-track pass, then hike ridges that drop into misty valleys. Every route is rated by distance and climb, from an easy stroll to a full-day scramble.',
    cta: { label: 'Browse hiking routes by difficulty', href: '#explore' },
    stat: { value: '100+', label: 'Marked Trailheads' },
    photo: photo(explore320, explore900, explore1200),
  },
  {
    value: 'connect',
    title: 'Connect',
    heading: 'Meet the City After Dark',
    body: 'End your trip where the trails meet the skyline. Rooftop meetups, night markets, and local hosts make it easy to swap stories with fellow travelers.',
    cta: { label: 'Join a traveler meetup', href: '#connect' },
    stat: { value: '1,000+', label: 'Travelers Each Month' },
    photo: photo(connect320, connect900, connect1200),
  },
];
