export class RaspistillDefaultError extends Error {
    constructor(message: string) {
        super('Raspistill failed: ' + message);
        this.name = 'RaspistillDefaultError';

        // NOTE https://github.com/Microsoft/TypeScript-wiki/blob
        // /master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        (this as any).__proto__ = RaspistillDefaultError.prototype;

    }
}