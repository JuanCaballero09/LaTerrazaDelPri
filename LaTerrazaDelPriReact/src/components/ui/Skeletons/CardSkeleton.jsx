import "./Skeleton.css"

export default function CardSkeleton() {
    return (
        <div className="card-skeleton">
            <div className="image-skeleton skeleton"></div>
            <div className="title-skeleton skeleton"></div>
            <div className="text-skeleton skeleton short"></div>
        </div>
    )
}