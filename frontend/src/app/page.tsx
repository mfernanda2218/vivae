import { Categories } from "@/components/Categories";
import { EventsGrid } from "@/components/EventsGrid";
import { Hero } from "@/components/Hero";
import { getEvents } from "@/lib/api";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function Home({ searchParams }: PageProps) {
  const params = (await searchParams) || {};
  const category = readParam(params, "category");
  const search = readParam(params, "search");
  const response = await getEvents({ category, search, limit: 12 });
  const events = response.data;

  return (
    <div className="flex flex-col gap-10">
      <Hero events={events.slice(0, 3)} />
      <section className="flex flex-col gap-5">
        <Categories activeCategory={category} />
        <EventsGrid events={events} />
      </section>
    </div>
  );
}
