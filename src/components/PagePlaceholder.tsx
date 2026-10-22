type PagePlaceholderProps = {
  description: string;
  title: string;
};

export default function PagePlaceholder({
  description,
  title,
}: PagePlaceholderProps) {
  return (
    <section className="flex flex-1 flex-col items-center justify-center py-16 text-center">
      <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-600">
        NeoCart
      </p>
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        {title}
      </h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
        {description}
      </p>
    </section>
  );
}
