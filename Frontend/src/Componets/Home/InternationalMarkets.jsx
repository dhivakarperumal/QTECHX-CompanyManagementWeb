const markets = [
  {
    region: "United States",
    alias: "USA",
    description: "Custom software, cloud modernization and product engineering for US startups, SMEs and enterprise teams.",
  },
  {
    region: "United Kingdom",
    alias: "UK",
    description: "Scalable web applications, secure integrations and digital transformation support for UK organizations.",
  },
  {
    region: "United Arab Emirates",
    alias: "UAE",
    description: "Reliable business platforms, mobile applications and enterprise solutions for companies across the UAE.",
  },
];

export default function InternationalMarkets() {
  return (
    <section className="bg-slate-950 px-4 py-16 text-white sm:px-6 lg:px-8" aria-labelledby="international-markets-heading">
      <div className="mx-auto max-w-7xl">
        <p className="mb-3 text-sm font-semibold uppercase text-cyan-400">International delivery</p>
        <h2 id="international-markets-heading" className="max-w-3xl text-3xl font-bold sm:text-4xl">
          Software solutions for businesses in the USA, UK and UAE
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
          Our distributed team works across time zones with clear milestones, regular communication and transparent project delivery.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {markets.map((market) => (
            <article key={market.region} className="border border-white/10 bg-white/[0.03] p-6">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-xl font-bold">{market.region}</h3>
                <span className="text-sm font-semibold text-cyan-300">{market.alias}</span>
              </div>
              <p className="mt-3 leading-7 text-slate-300">{market.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
