import MainLayout from "../../layouts/MainLayout"

import useMenu from "../../hooks/Productos/useMenu"
import LoadingDots from "../../components/ui/LoadingDots";

import "./Menu.css"
import MenuPage from "../../components/productos/MenuPage";

export default function Menu() {
    const { productos, loading, error } = useMenu();
    
    if (error) {
        return (
            <MainLayout>
                <section className="page-content menu-error">
                    <p>Hubo un error al cargar el menú</p>
                    <LoadingDots text="Reintentando" color="var(--primary-color)" />
                </section>
            </MainLayout>
        )
    }

    if (loading) {
        return (
            <MainLayout>
                <section className="page-content menu-loading">
                    <MenuPage loading />
                </section>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <section className="page-content">
                <MenuPage productos={productos} />
            </section>
        </MainLayout>
    )
}