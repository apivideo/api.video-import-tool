export default interface VideoSource {
    id: string;
    name: string;
    url: string;
    thumbnail?: string;
    duration?: number;
    size: number;
}