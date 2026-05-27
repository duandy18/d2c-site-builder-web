import type { ReactNode } from "react";

export function PageFrame({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="sb-page">
      <section className="sb-card">
        <span className="sb-kicker">D2C Site Builder</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </section>
      {children}
    </main>
  );
}
