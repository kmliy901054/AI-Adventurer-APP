import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold">Page not found</h2>
      <Link
        to="/"
        className="text-sm text-primary underline-offset-4 hover:underline"
      >
        Back to home
      </Link>
    </section>
  );
}
