export interface PhotoUploadResult {
    url: string;
    fileName: string;
}
declare global {
    interface Window {
        gapi: any;
    }
}
