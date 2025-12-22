import Footer from '../components/ui/Footer/Footer'
import Navbar from '../components/ui/Navbar/Navbar'

export default function MainLayout ({ children }) {
    return (
        <>
            <Navbar />
            <main>{children}</main>
            <Footer />
        </>
    )
}
