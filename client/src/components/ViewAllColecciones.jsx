import {Link} from 'react-router-dom'

const ViewAllJobs = () => {
  return (
      <section className="m-auto max-w-lg my-10 px-6">
      <Link
        to="/jobs"
        className="block  bg-indigo-500 text-white text-center py-4 px-6 rounded-xl hover:bg-indigo-600"
        >View Books
      </Link>
    </section>
  )
}

export default ViewAllJobs