import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact | NeoCart",
  description: "Contact NeoCart or save a message draft in your browser.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
      <header className="lg:sticky lg:top-32 lg:self-start">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6d806e] dark:text-[#a7c4ad]">
          Contact
        </p>
        <h1 className="mt-4 text-5xl font-semibold leading-[1.05] tracking-[-0.055em] text-slate-900 dark:text-white sm:text-6xl">
          We&apos;re here to help.
        </h1>
        <p className="mt-5 max-w-md text-base leading-7 text-slate-600 dark:text-slate-300">
          Leave a message draft below. It is saved only in this browser; this
          demo does not send messages to a support team.
        </p>
      </header>
      <div className="lg:pt-1">
        <ContactForm />
      </div>
    </div>
  );
}
