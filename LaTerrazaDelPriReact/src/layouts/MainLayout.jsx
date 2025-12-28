import Footer from '../components/ui/Footer/Footer'
import Navbar from '../components/ui/Navbar/Navbar'
import Toast from '../components/ui/Toast/Toast'

export default function MainLayout ({ children }) {
    return (
        <main>
            <Navbar />
            <Toast />
            <section>{children}</section>
            <Footer />
        </main>
    )
}
