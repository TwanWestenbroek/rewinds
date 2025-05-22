import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCachedOrganisation,
  getEvents,
  getOrganisationSlugs,
} from "./actions";

export async function generateStaticParams() {
  const slugs = await getOrganisationSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const organisation = await getCachedOrganisation(slug);
  if (!organisation) return notFound();
  return {
    title: `Rewinds - ${organisation.name}`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const organisation = await getCachedOrganisation(slug);
  if (!organisation) return notFound();
  const events = await getEvents({ slug });

  return (
    <div>
      {organisation.name}

      {events.map(({ url, date, image, ...event }) => (
        <pre key={event.id}>
          {JSON.stringify(event, null, 2)}
          <br />
          {date.toLocaleString()}
          <br />
          <Link href={url} target="_blank">
            {url}
          </Link>
          <br />
          {image ? (
            <Link href={image} target="_blank">
              {image}
            </Link>
          ) : null}
        </pre>
      ))}
    </div>
  );
}
