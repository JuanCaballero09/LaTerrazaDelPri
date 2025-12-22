import BannerSlider from '../BannerSlider/BannerSlider'
import BannerSkeleton from '../Skeletons/BannerSkeleton'
import './Header.css'

export default function Header ({ banners, loading, error }) {
    return (
        <header className='header'>
            {loading
                ? <BannerSkeleton />
                : <BannerSlider banners={banners} error={error}/>
            }
        </header>
    )
}