import "./Skeleton.css"

export default function PageSkeleton() {
    return (
        <div className="page-skeleton">
            <div className="page-skeleton-img-container">
                <div className="banner-skeleton page-skeleton-img"></div>
            </div>
            <div className="page-skeleton-content skeleton"></div>
        </div>
        
    )
}