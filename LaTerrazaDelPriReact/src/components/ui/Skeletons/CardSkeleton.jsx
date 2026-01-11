import "./Skeleton.css"

export default function CardSkeleton({btn = true}) {
    return (
        <div className="card-skeleton">
            <div className="image-skeleton skeleton"></div>
            <div className="text-skeleton skeleton short"></div>
            <div className="title-skeleton skeleton"></div>
            {btn && <div className="btn-skeleton skeleton"></div>}
        </div>
    )
}