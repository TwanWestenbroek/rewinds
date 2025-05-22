/**
 * The event type
 */
export interface Event {
  title: string;
  url: string;
  date: Date;
  description: string;
  location: {
    city: string;
    address: string | null;
    country: string;
  };
  image: string | null;
  lineup:
    | { name: string; stage: string | null; datetime: string | null }[]
    | null;
}
