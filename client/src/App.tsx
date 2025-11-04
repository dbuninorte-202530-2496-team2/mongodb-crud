import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider, Outlet } from 'react-router-dom'
import { Toaster } from 'sonner';

import BooksPage from './pages/BooksPage'
import { CreateBookPage } from './pages/CreateBookPage'
        import { BookPage } from './pages/BookPage'
import { UsersPage } from './pages/UsersPage';
import UserDetailPage from './pages/UserDetailPage';
import { CopiasPage } from './pages/CopiasPage';

function Layout() {
  return (
    <>
      <Toaster position='top-right' richColors />
      <Outlet />
    </>
  )
}

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<Layout />}>
        <Route index element={<BooksPage />} />
        <Route path='book/create' element={<CreateBookPage />} />
        <Route path='book/:id' element={<BookPage/>} /> 
        <Route path='users' element={<UsersPage/>}/>
        <Route path='user/:id' element={<UserDetailPage/>}/>
        <Route path='copias' element={<CopiasPage/>}/>
      </Route>
    )
  )

  return <RouterProvider router={router} />;
}

export default App