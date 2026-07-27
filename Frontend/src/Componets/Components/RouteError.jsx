import { Link, useRouteError } from 'react-router-dom'

const RouteError = () => {
  const error = useRouteError()

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-16 text-gray-800">
      <div className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border border-orange-200 bg-white p-8 shadow-lg">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-primary">Unexpected Error</p>
        <h1 className="mb-3 text-3xl font-bold">Something went wrong</h1>
        <p className="mb-6 text-center text-sm leading-6 text-gray-600">
          The page could not be loaded. Please refresh the page or return home and try again.
        </p>
        <div className="mb-6 rounded-lg bg-orange-50 px-4 py-3 text-sm text-orange-700">
          {error?.message || 'A rendering problem occurred while loading this route.'}
        </div>
        <Link
          to="/"
          className="rounded-full bg-primary px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
        >
          Go back home
        </Link>
      </div>
    </div>
  )
}

export default RouteError
